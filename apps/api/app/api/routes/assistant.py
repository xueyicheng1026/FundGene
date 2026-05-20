import asyncio
import json
from collections.abc import AsyncIterator
from typing import Annotated

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db_session
from app.models.user import UserProfile
from app.runtime.deps import get_advisor_runtime
from app.runtime.v2.active_runs import get_active_agent_run_registry
from app.runtime.v2.events import QueueAgentRunEventSink
from app.schemas.assistant import (
    AgentRunCancelResponse,
    AgentRunEvent,
    AgentRunEventsResponse,
    AgentRunTraceResponse,
    AssistantConversationResponse,
    AssistantMessageRequest,
    AssistantSessionListResponse,
)
from app.services.assistant import (
    get_conversation_by_id,
    get_current_conversation as get_current_assistant_conversation,
)
from app.services.assistant import get_agent_run_events
from app.services.assistant import get_agent_run_trace
from app.services.assistant import list_conversations
from app.services.assistant import send_message

router = APIRouter(prefix="/assistant", tags=["assistant"])


@router.get("/session", response_model=AssistantConversationResponse)
def read_current_conversation(
    db: Annotated[Session, Depends(get_db_session)],
    user: Annotated[UserProfile, Depends(get_current_user)],
) -> AssistantConversationResponse:
    return get_current_assistant_conversation(db, user=user)


@router.get("/sessions", response_model=AssistantSessionListResponse)
def read_conversations(
    db: Annotated[Session, Depends(get_db_session)],
    user: Annotated[UserProfile, Depends(get_current_user)],
) -> AssistantSessionListResponse:
    return list_conversations(db, user=user)


@router.get("/sessions/{session_id}", response_model=AssistantConversationResponse)
def read_conversation(
    session_id: str,
    db: Annotated[Session, Depends(get_db_session)],
    user: Annotated[UserProfile, Depends(get_current_user)],
) -> AssistantConversationResponse:
    return get_conversation_by_id(db, user=user, session_id=session_id)


@router.post("/messages", response_model=AssistantConversationResponse)
async def post_message(
    payload: AssistantMessageRequest,
    db: Annotated[Session, Depends(get_db_session)],
    user: Annotated[UserProfile, Depends(get_current_user)],
) -> AssistantConversationResponse:
    runtime = get_advisor_runtime()
    return await send_message(db, user=user, payload=payload, runtime=runtime)


@router.post("/messages/stream")
async def stream_message(
    payload: AssistantMessageRequest,
    db: Annotated[Session, Depends(get_db_session)],
    user: Annotated[UserProfile, Depends(get_current_user)],
) -> StreamingResponse:
    runtime = get_advisor_runtime()
    queue: asyncio.Queue[AgentRunEvent] = asyncio.Queue()
    event_sink = QueueAgentRunEventSink(queue)

    async def event_stream() -> AsyncIterator[str]:
        task = asyncio.create_task(
            send_message(
                db,
                user=user,
                payload=payload,
                runtime=runtime,
                event_sink=event_sink,
            )
        )

        while True:
            if task.done() and queue.empty():
                break
            try:
                event = await asyncio.wait_for(queue.get(), timeout=0.2)
            except TimeoutError:
                continue
            yield _format_sse("agent_event", event.model_dump(mode="json"))

        try:
            conversation = await task
        except Exception as exc:
            yield _format_sse("error", {"message": str(exc)})
            return

        yield _format_sse("conversation", conversation.model_dump(mode="json"))

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )


@router.get("/runs/{run_id}/trace", response_model=AgentRunTraceResponse)
def read_agent_run_trace(
    run_id: str,
    db: Annotated[Session, Depends(get_db_session)],
    user: Annotated[UserProfile, Depends(get_current_user)],
) -> AgentRunTraceResponse:
    return get_agent_run_trace(db, user=user, run_id=run_id)


@router.get("/runs/{run_id}/events", response_model=AgentRunEventsResponse)
def read_agent_run_events(
    run_id: str,
    db: Annotated[Session, Depends(get_db_session)],
    user: Annotated[UserProfile, Depends(get_current_user)],
) -> AgentRunEventsResponse:
    return get_agent_run_events(db, user=user, run_id=run_id)


@router.post("/runs/{run_id}/cancel", response_model=AgentRunCancelResponse)
async def cancel_agent_run(
    run_id: str,
    db: Annotated[Session, Depends(get_db_session)],
    user: Annotated[UserProfile, Depends(get_current_user)],
) -> AgentRunCancelResponse:
    registry = get_active_agent_run_registry()
    snapshot = registry.request_cancel(run_id=run_id, user_id=user.id)
    if snapshot is None:
        agent_run = get_agent_run_events(db, user=user, run_id=run_id)
        return AgentRunCancelResponse(
            run_id=agent_run.run_id,
            status="not_active",
            cancel_requested=False,
            message="这次整理已经结束或不在当前进程中运行。",
        )

    return AgentRunCancelResponse(
        run_id=run_id,
        status="cancelling",
        cancel_requested=True,
        message="已请求停止本次整理。",
    )


def _format_sse(event: str, data: dict) -> str:
    return (
        f"event: {event}\n"
        f"data: {json.dumps(data, ensure_ascii=False, separators=(',', ':'))}\n\n"
    )
