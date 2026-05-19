from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.agent_run import AgentRun
from app.models.agent_evidence_ref import AgentEvidenceRef
from app.models.agent_state_update_proposal import AgentStateUpdateProposal
from app.models.agent_step import AgentStep
from app.models.agent_tool_call import AgentToolCall
from app.models.chat_message import ChatMessage
from app.models.chat_session import ChatSession
from app.models.user import UserProfile
from app.runtime.advisor_agent import AdvisorAgentRuntime
from app.runtime.toolchains.base import AdvisorUserContext
from app.runtime.v2 import AdvisorOrchestrator
from app.runtime.v2.orchestrator import ORCHESTRATOR_VERSION
from app.schemas.assistant import (
    AgentRunTraceEvidenceRef,
    AgentRunTraceResponse,
    AgentRunTraceRun,
    AgentRunTraceStateUpdateProposal,
    AgentRunTraceStep,
    AgentRunTraceToolCall,
    AdvisorResponse,
    AssistantConversationMessage,
    AssistantConversationResponse,
    AssistantMessageRequest,
    AssistantSessionListResponse,
    AssistantSessionSummary,
)
from app.services.behavior import get_behavior_profile
from app.services.behavior import get_behavior_training_plan
from app.services.learning import get_learning_overview
from app.services.news import get_news_overview
from app.services.portfolio import get_portfolio_overview
from app.services.profile import get_effective_llm_config
from app.services.simulation import get_latest_simulation_overview

COACH_CONTEXT_TYPE = "coach"


def build_advisor_user_context(
    db: Session,
    *,
    user: UserProfile,
) -> AdvisorUserContext:
    behavior_profile = get_behavior_profile(db, user_id=user.id)
    behavior_training_plan = get_behavior_training_plan(db, user=user)
    learning_overview = get_learning_overview(db, user_id=user.id)
    portfolio_overview = get_portfolio_overview(db, user_id=user.id)
    simulation_overview = get_latest_simulation_overview(db, user_id=user.id)
    news_overview = get_news_overview(db, user_id=user.id)
    return AdvisorUserContext(
        user_id=user.id,
        display_name=user.display_name,
        investing_experience=user.investing_experience,
        primary_goal=user.primary_goal,
        risk_level=behavior_profile.risk_level if behavior_profile else None,
        bias_tags=behavior_profile.bias_tags if behavior_profile else [],
        learning_progress_percentage=learning_overview.overall_progress_percentage,
        learning_completed_courses_count=learning_overview.completed_courses_count,
        learning_total_courses=learning_overview.total_courses,
        learning_recommended_course_slug=learning_overview.recommended_course_slug,
        learning_recommended_course_title=learning_overview.recommended_course_title,
        portfolio_has_report=portfolio_overview.has_report,
        portfolio_latest_summary=portfolio_overview.summary,
        portfolio_latest_snapshot_date=portfolio_overview.latest_snapshot_date,
        behavior_training_focus=behavior_training_plan.focus_title,
        behavior_training_guidance=behavior_training_plan.guidance,
        simulation_recommended_scenario_slug=behavior_training_plan.recommended_scenario_slug,
        simulation_recommended_scenario_title=simulation_overview.recommended_scenario_title,
        simulation_completed_sessions_count=simulation_overview.completed_sessions_count,
        simulation_latest_review_summary=simulation_overview.latest_review_summary,
        news_has_analysis=news_overview.has_analysis,
        news_latest_analysis_id=news_overview.latest_analysis_id,
        news_latest_title=news_overview.latest_title,
        news_latest_source_name=news_overview.source_name,
        news_latest_beginner_translation=news_overview.beginner_translation,
        news_latest_recommended_action=news_overview.recommended_action,
    )


def _build_topic(message: str) -> str:
    normalized = " ".join(message.strip().split())
    if len(normalized) <= 40:
        return normalized
    return f"{normalized[:40].rstrip()}..."


def _serialize_message(message: ChatMessage) -> AssistantConversationMessage:
    payload = (
        AdvisorResponse.model_validate(message.structured_payload)
        if message.structured_payload
        else None
    )
    return AssistantConversationMessage(
        id=message.id,
        role=message.role,
        content=message.content,
        message_type=message.message_type,
        created_at=message.created_at,
        agent_run_id=message.agent_run_id,
        advisor_response=payload,
    )


def _serialize_session(
    session: ChatSession | None,
    *,
    messages: list[ChatMessage] | None = None,
) -> AssistantSessionSummary | None:
    if session is None:
        return None

    latest_intent = None
    last_question = None
    last_answer_preview = None
    last_recommended_action = None
    message_count = 0

    if messages is not None:
        message_count = len(messages)
        for message in reversed(messages):
            if message.role == "user" and last_question is None:
                last_question = message.content
            if message.role == "assistant" and last_answer_preview is None:
                last_answer_preview = message.content[:120]
                if message.structured_payload:
                    advisor = AdvisorResponse.model_validate(message.structured_payload)
                    latest_intent = advisor.intent
                    last_recommended_action = (
                        advisor.recommended_actions[0]
                        if advisor.recommended_actions
                        else None
                    )
            if last_question and last_answer_preview:
                break

    return AssistantSessionSummary(
        id=session.id,
        topic=session.topic,
        context_type=session.context_type,
        created_at=session.created_at,
        updated_at=session.updated_at,
        latest_intent=latest_intent,
        last_question=last_question,
        last_answer_preview=last_answer_preview,
        last_recommended_action=last_recommended_action,
        message_count=message_count,
    )


def _list_session_messages(db: Session, *, session_id: str) -> list[ChatMessage]:
    return list(
        db.scalars(
            select(ChatMessage)
            .where(ChatMessage.session_id == session_id)
            .order_by(ChatMessage.created_at.asc(), ChatMessage.id.asc())
        )
    )


def _get_latest_session(db: Session, *, user_id: str) -> ChatSession | None:
    return db.scalar(
        select(ChatSession)
        .where(
            ChatSession.user_id == user_id,
            ChatSession.context_type == COACH_CONTEXT_TYPE,
        )
        .order_by(ChatSession.updated_at.desc(), ChatSession.created_at.desc())
    )


def _get_owned_session(
    db: Session, *, user_id: str, session_id: str | None
) -> ChatSession | None:
    if session_id is None:
        return _get_latest_session(db, user_id=user_id)

    session = db.scalar(
        select(ChatSession).where(
            ChatSession.id == session_id,
            ChatSession.user_id == user_id,
            ChatSession.context_type == COACH_CONTEXT_TYPE,
        )
    )
    if session is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Requested coach session does not exist for the current user.",
        )
    return session


def _list_owned_sessions(db: Session, *, user_id: str) -> list[ChatSession]:
    return list(
        db.scalars(
            select(ChatSession)
            .where(
                ChatSession.user_id == user_id,
                ChatSession.context_type == COACH_CONTEXT_TYPE,
            )
            .order_by(ChatSession.updated_at.desc(), ChatSession.created_at.desc())
            .limit(50)
        )
    )


def _build_user_context_payload(
    user_context: AdvisorUserContext,
) -> dict[str, object]:
    return {
        "display_name": user_context.display_name,
        "investing_experience": user_context.investing_experience,
        "primary_goal": user_context.primary_goal,
        "risk_level": user_context.risk_level,
        "bias_tags": user_context.bias_tags,
        "learning_progress_percentage": user_context.learning_progress_percentage,
        "learning_completed_courses_count": user_context.learning_completed_courses_count,
        "learning_total_courses": user_context.learning_total_courses,
        "learning_recommended_course_slug": user_context.learning_recommended_course_slug,
        "learning_recommended_course_title": user_context.learning_recommended_course_title,
        "portfolio_has_report": user_context.portfolio_has_report,
        "portfolio_latest_summary": user_context.portfolio_latest_summary,
        "portfolio_latest_snapshot_date": (
            user_context.portfolio_latest_snapshot_date.isoformat()
            if user_context.portfolio_latest_snapshot_date
            else None
        ),
        "behavior_training_focus": user_context.behavior_training_focus,
        "behavior_training_guidance": user_context.behavior_training_guidance,
        "simulation_recommended_scenario_slug": user_context.simulation_recommended_scenario_slug,
        "simulation_recommended_scenario_title": user_context.simulation_recommended_scenario_title,
        "simulation_completed_sessions_count": user_context.simulation_completed_sessions_count,
        "simulation_latest_review_summary": user_context.simulation_latest_review_summary,
        "news_has_analysis": user_context.news_has_analysis,
        "news_latest_analysis_id": user_context.news_latest_analysis_id,
        "news_latest_title": user_context.news_latest_title,
        "news_latest_source_name": user_context.news_latest_source_name,
        "news_latest_beginner_translation": user_context.news_latest_beginner_translation,
        "news_latest_recommended_action": user_context.news_latest_recommended_action,
    }


def _build_page_context_payload(
    payload: AssistantMessageRequest,
) -> dict[str, object] | None:
    if payload.context is None:
        return None
    context_payload = payload.context.model_dump(mode="json")
    return (
        context_payload
        if any(value for value in context_payload.values())
        else None
    )


def get_current_conversation(
    db: Session, *, user: UserProfile
) -> AssistantConversationResponse:
    session = _get_latest_session(db, user_id=user.id)
    if session is None:
        return AssistantConversationResponse()

    messages = _list_session_messages(db, session_id=session.id)
    return AssistantConversationResponse(
        session=_serialize_session(session, messages=messages),
        messages=[_serialize_message(message) for message in messages],
    )


def list_conversations(
    db: Session, *, user: UserProfile
) -> AssistantSessionListResponse:
    sessions = _list_owned_sessions(db, user_id=user.id)
    summaries: list[AssistantSessionSummary] = []
    for session in sessions:
        messages = _list_session_messages(db, session_id=session.id)
        summary = _serialize_session(session, messages=messages)
        if summary is not None:
            summaries.append(summary)

    return AssistantSessionListResponse(sessions=summaries)


def get_conversation_by_id(
    db: Session, *, user: UserProfile, session_id: str
) -> AssistantConversationResponse:
    session = _get_owned_session(db, user_id=user.id, session_id=session_id)
    if session is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Requested coach session does not exist for the current user.",
        )

    messages = _list_session_messages(db, session_id=session.id)
    return AssistantConversationResponse(
        session=_serialize_session(session, messages=messages),
        messages=[_serialize_message(message) for message in messages],
    )


async def send_message(
    db: Session,
    *,
    user: UserProfile,
    payload: AssistantMessageRequest,
    runtime: AdvisorAgentRuntime,
) -> AssistantConversationResponse:
    started_at = datetime.now(timezone.utc)
    user_context = build_advisor_user_context(db, user=user)
    page_context = _build_page_context_payload(payload)
    session = (
        None
        if payload.start_new_session
        else _get_owned_session(db, user_id=user.id, session_id=payload.session_id)
    )

    if session is None:
        session = ChatSession(
            user_id=user.id,
            topic=_build_topic(payload.message),
            context_type=COACH_CONTEXT_TYPE,
            created_at=started_at,
            updated_at=started_at,
        )
        db.add(session)
        db.flush()

    user_message = ChatMessage(
        session_id=session.id,
        role="user",
        content=payload.message,
        message_type="user_prompt",
        created_at=started_at,
    )
    db.add(user_message)
    db.flush()

    effective_model_name, deepseek_api_key_override, llm_settings_source = (
        get_effective_llm_config(db, user=user)
    )
    agent_run = AgentRun(
        session_id=session.id,
        user_id=user.id,
        model_name=effective_model_name,
        schema_version="assistant_message_v1",
        run_status="running",
        run_type="advisor_orchestrator",
        orchestrator_version=ORCHESTRATOR_VERSION,
        input_payload={
            "message": payload.message,
            "session_id": session.id,
            "start_new_session": payload.start_new_session,
            "context_type": COACH_CONTEXT_TYPE,
            "page_context": page_context,
            "user_message_id": user_message.id,
            "user_context": _build_user_context_payload(user_context),
            "llm_settings": {
                "source": llm_settings_source,
                "model_name": effective_model_name,
                "configured": llm_settings_source != "none",
            },
        },
        output_payload={},
        tool_trace={"user_message_id": user_message.id, "page_context": page_context},
        started_at=started_at,
        created_at=started_at,
    )
    db.add(agent_run)
    db.flush()

    orchestrator = AdvisorOrchestrator(
        model_name=effective_model_name,
        agent_mode=runtime.agent_mode,
        model_timeout_ms=runtime.model_timeout_ms,
        runtime_flags=runtime.runtime_flags,
        max_tool_calls=runtime.max_tool_calls,
        max_workers=runtime.max_workers,
        deepseek_api_key_override=deepseek_api_key_override,
    )
    run_result = await orchestrator.run(
        db=db,
        agent_run=agent_run,
        session_id=session.id,
        message=payload.message,
        user_context=user_context,
        page_context=page_context,
    )
    completed_at = datetime.now(timezone.utc)

    agent_run.run_status = run_result.run_status
    agent_run.intent = run_result.intent
    agent_run.policy_status = run_result.policy_status
    agent_run.latency_ms = run_result.latency_ms
    agent_run.context_snapshot = run_result.context_snapshot.model_dump(mode="json")
    agent_run.context_snapshot_version = run_result.context_snapshot.schema_version
    agent_run.output_payload = run_result.response.model_dump(mode="json")
    agent_run.tool_trace = {
        **(run_result.tool_trace or {}),
        "user_message_id": user_message.id,
        "page_context": page_context,
    }
    agent_run.fallback_reason = run_result.fallback_reason
    agent_run.completed_at = completed_at

    assistant_message = ChatMessage(
        session_id=session.id,
        role="assistant",
        content=run_result.response.answer,
        message_type="advisor_response",
        structured_payload=run_result.response.model_dump(mode="json"),
        agent_run_id=agent_run.id,
        created_at=completed_at,
    )
    db.add(assistant_message)
    db.flush()

    agent_run.tool_trace = {
        **(agent_run.tool_trace or {}),
        "assistant_message_id": assistant_message.id,
    }
    session.topic = _build_topic(payload.message)
    session.updated_at = completed_at
    db.add(session)
    db.add(agent_run)
    db.commit()

    return get_current_conversation(db, user=user)


def get_agent_run_trace(
    db: Session,
    *,
    user: UserProfile,
    run_id: str,
) -> AgentRunTraceResponse:
    agent_run = db.get(AgentRun, run_id)
    if agent_run is None or agent_run.user_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Requested agent run trace does not exist for the current user.",
        )

    steps = list(
        db.scalars(
            select(AgentStep)
            .where(AgentStep.run_id == run_id)
            .order_by(AgentStep.sequence.asc(), AgentStep.created_at.asc())
        )
    )
    tool_calls = list(
        db.scalars(
            select(AgentToolCall)
            .where(AgentToolCall.run_id == run_id)
            .order_by(AgentToolCall.created_at.asc(), AgentToolCall.id.asc())
        )
    )
    evidence_refs = list(
        db.scalars(
            select(AgentEvidenceRef)
            .where(AgentEvidenceRef.run_id == run_id)
            .order_by(AgentEvidenceRef.created_at.asc(), AgentEvidenceRef.id.asc())
        )
    )
    proposals = list(
        db.scalars(
            select(AgentStateUpdateProposal)
            .where(AgentStateUpdateProposal.run_id == run_id)
            .order_by(
                AgentStateUpdateProposal.created_at.asc(),
                AgentStateUpdateProposal.id.asc(),
            )
        )
    )

    return AgentRunTraceResponse(
        run=AgentRunTraceRun(
            id=agent_run.id,
            intent=agent_run.intent,
            run_status=agent_run.run_status,
            policy_status=agent_run.policy_status,
            orchestrator_version=agent_run.orchestrator_version,
            started_at=agent_run.started_at,
            completed_at=agent_run.completed_at,
            latency_ms=agent_run.latency_ms,
            fallback_reason=agent_run.fallback_reason,
            tool_trace=agent_run.tool_trace,
        ),
        context_snapshot=agent_run.context_snapshot,
        steps=[
            AgentRunTraceStep(
                id=step.id,
                step_name=step.step_name,
                sequence=step.sequence,
                status=step.status,
                latency_ms=step.latency_ms,
                input_payload=step.input_payload,
                output_payload=step.output_payload,
                error=step.error,
            )
            for step in steps
        ],
        tool_calls=[
            AgentRunTraceToolCall(
                id=tool_call.id,
                step_id=tool_call.step_id,
                tool_name=tool_call.tool_name,
                permission_level=tool_call.permission_level,
                status=tool_call.status,
                latency_ms=tool_call.latency_ms,
                input_payload=tool_call.input_payload,
                output_payload=tool_call.output_payload,
                error=tool_call.error,
            )
            for tool_call in tool_calls
        ],
        evidence_refs=[
            AgentRunTraceEvidenceRef(
                id=evidence.id,
                step_id=evidence.step_id,
                worker_name=evidence.worker_name,
                source_type=evidence.source_type,
                source_id=evidence.source_id,
                source_version=evidence.source_version,
                quote_or_summary=evidence.quote_or_summary,
                claim=evidence.claim,
                support_summary=evidence.support_summary,
            )
            for evidence in evidence_refs
        ],
        state_update_proposals=[
            AgentRunTraceStateUpdateProposal(
                id=proposal.id,
                target_type=proposal.target_type,
                target_id=proposal.target_id,
                patch_payload=proposal.patch_payload,
                reason=proposal.reason,
                validator_status=proposal.validator_status,
                validator_message=proposal.validator_message,
            )
            for proposal in proposals
        ],
    )
