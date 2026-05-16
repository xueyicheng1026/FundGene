from fastapi.testclient import TestClient
from sqlalchemy import func, select
from sqlalchemy.orm import Session, sessionmaker

from app.models.agent_evidence_ref import AgentEvidenceRef
from app.models.agent_run import AgentRun
from app.models.agent_step import AgentStep
from app.models.agent_tool_call import AgentToolCall
from app.runtime.v2.features import build_runtime_capabilities
from app.runtime.v2.orchestrator import AdvisorOrchestrator
from app.runtime.v2.planner import AgentPlanner
from app.runtime.v2.schemas import (
    AgentPlan,
    EvidenceRef,
    PlannedToolCall,
    ToolSelectionSignal,
    WorkerOutput,
)
from app.runtime.v2.tools.registry import ToolRegistry
from app.schemas.assistant import AdvisorResponse


def _onboard(client: TestClient, *, email: str = "agent-v2@example.com") -> None:
    response = client.post(
        "/api/auth/register",
        json={"email": email, "password": "supersecure123"},
    )
    assert response.status_code == 201

    response = client.post(
        "/api/onboarding/profile",
        json={
            "display_name": "Ava",
            "investing_experience": "beginner",
            "monthly_contribution_band": "under_3000",
            "primary_goal": "建立长期基金投资纪律。",
        },
    )
    assert response.status_code == 200

    response = client.post(
        "/api/behavior/questionnaires",
        json={
            "questionnaire_version": "v1",
            "answers": {
                "volatility_comfort": 4,
                "drawdown_reaction": 3,
                "investment_horizon": 4,
                "panic_sell_impulse": 2,
                "chase_hot_funds": 4,
                "diversification_habit": 3,
            },
        },
    )
    assert response.status_code == 200


def test_agent_runtime_v2_persists_trace_and_exposes_owned_trace(
    client: TestClient,
    session_factory: sessionmaker[Session],
) -> None:
    _onboard(client)

    response = client.post(
        "/api/assistant/messages",
        json={"message": "我想理解基金回撤和风险等级。"},
    )
    assert response.status_code == 200
    payload = response.json()
    assistant_message = payload["messages"][-1]
    run_id = assistant_message["agent_run_id"]
    assert run_id is not None
    assert assistant_message["advisor_response"]["intent"] == "learning"

    trace_response = client.get(f"/api/assistant/runs/{run_id}/trace")
    assert trace_response.status_code == 200
    trace_payload = trace_response.json()
    assert trace_payload["run"]["id"] == run_id
    assert trace_payload["run"]["orchestrator_version"] == "agent_runtime_v2"
    assert trace_payload["run"]["policy_status"] == "allow"
    assert trace_payload["context_snapshot"]["display_name"] == "Ava"
    assert [step["step_name"] for step in trace_payload["steps"]] == [
        "input_guard",
        "classify_intent",
        "build_agent_plan",
        "load_context_snapshot",
        "validate_plan",
        "select_tools",
        "execute_tools",
        "execute_workers",
        "validate_worker_output",
        "policy_guard",
        "compose_response",
        "validate_final_response",
    ]
    plan_step = next(
        step
        for step in trace_payload["steps"]
        if step["step_name"] == "build_agent_plan"
    )
    assert plan_step["output_payload"]["schema_version"] == "agent_plan_v1"
    assert plan_step["output_payload"]["primary_intent"] == "learning"
    assert "LearningWorker" in plan_step["output_payload"]["worker_names"]
    selected_skills = plan_step["output_payload"]["selected_skills"]
    assert selected_skills[0]["skill_name"] == "fund_basics_explainer_v1"
    assert selected_skills[0]["skill_version"] == "2026-05-16"
    assert "learning.evidence_search" in selected_skills[0]["required_tools"]
    assert {
        item["tool_name"] for item in plan_step["output_payload"]["planned_tools"]
    } >= {"learning.concept_map", "learning.evidence_search"}
    concept_signal = next(
        signal
        for signal in plan_step["output_payload"]["tool_selection_signals"]
        if signal["tool_name"] == "learning.concept_map"
    )
    assert concept_signal["source"] in {"required", "scored_search"}
    if concept_signal["source"] == "scored_search":
        assert {"回撤", "风险等级"} & set(concept_signal["matched_terms"])
    validate_plan_step = next(
        step for step in trace_payload["steps"] if step["step_name"] == "validate_plan"
    )
    assert validate_plan_step["output_payload"]["status"] == "pass"
    final_validation_step = next(
        step
        for step in trace_payload["steps"]
        if step["step_name"] == "validate_final_response"
    )
    assert final_validation_step["output_payload"]["schema_version"] == (
        "final_response_validation_v1"
    )
    assert final_validation_step["output_payload"]["status"] == "pass"
    assert {call["tool_name"] for call in trace_payload["tool_calls"]} >= {
        "profile.current",
        "learning.path",
        "learning.concept_map",
    }
    assert trace_payload["evidence_refs"]
    worker_step = next(
        step
        for step in trace_payload["steps"]
        if step["step_name"] == "execute_workers"
    )
    worker_output = worker_step["output_payload"]
    assert worker_output["schema_version"] == "worker_output_v2"
    assert "fund_basics_explainer_v1" in worker_output["skill_names"]
    assert worker_output["learning_outcome"]
    assert worker_output["structured_findings"]
    structured_finding = worker_output["structured_findings"][0]
    assert structured_finding["claim"] in worker_output["findings"]
    assert structured_finding["support_level"] == "direct"
    assert structured_finding["evidence_refs"]
    assert "收益承诺" in structured_finding["safety_boundary"]

    with session_factory() as session:
        run = session.get(AgentRun, run_id)
        assert run is not None
        assert run.intent == "learning"
        assert run.policy_status == "allow"
        assert run.tool_trace["composer"]["composer_mode"] == "deterministic"
        assert run.tool_trace["agent_plan"]["primary_intent"] == "learning"
        assert run.tool_trace["selected_skill_versions"] == [
            "fund_basics_explainer_v1@2026-05-16"
        ]
        assert run.tool_trace["runtime_capabilities"]["schema_version"] == (
            "agent_runtime_capabilities_v1"
        )
        assert {event["name"] for event in run.tool_trace["trace_events"]} >= {
            "agent.plan",
            "agent.skills",
            "agent.tools",
            "agent.guardrails",
        }
        assert run.context_snapshot_version == "context_snapshot_v1"
        assert session.scalar(select(func.count()).select_from(AgentStep)) == 12
        assert session.scalar(select(func.count()).select_from(AgentToolCall)) >= 2
        assert session.scalar(select(func.count()).select_from(AgentEvidenceRef)) >= 2


def test_agent_policy_guard_blocks_trade_execution_request(
    client: TestClient,
    session_factory: sessionmaker[Session],
) -> None:
    _onboard(client, email="policy-guard@example.com")

    response = client.post(
        "/api/assistant/messages",
        json={"message": "请直接告诉我今天应该买入哪只基金，并保证收益。"},
    )
    assert response.status_code == 200
    payload = response.json()
    assistant_message = payload["messages"][-1]
    advisor_response = assistant_message["advisor_response"]
    assert advisor_response["intent"] == "learning"
    assert "不能给出买卖" in advisor_response["answer"]

    run_id = assistant_message["agent_run_id"]
    trace_response = client.get(f"/api/assistant/runs/{run_id}/trace")
    assert trace_response.status_code == 200
    trace_payload = trace_response.json()
    assert trace_payload["run"]["policy_status"] == "block_with_guidance"
    worker_step = next(
        step
        for step in trace_payload["steps"]
        if step["step_name"] == "execute_workers"
    )
    structured_finding = worker_step["output_payload"]["structured_findings"][0]
    assert structured_finding["support_level"] == "contextual"
    assert "不提供买卖" in structured_finding["safety_boundary"]
    plan_step = next(
        step
        for step in trace_payload["steps"]
        if step["step_name"] == "build_agent_plan"
    )
    assert {
        item["tool_name"] for item in plan_step["output_payload"]["planned_tools"]
    } == {"profile.current", "safety.boundary_rules"}
    assert plan_step["output_payload"]["selected_skills"] == []

    with session_factory() as session:
        run = session.get(AgentRun, run_id)
        assert run is not None
        assert run.policy_status == "block_with_guidance"


def test_assistant_contract_remains_stable(client: TestClient) -> None:
    _onboard(client, email="contract@example.com")

    response = client.post(
        "/api/assistant/messages",
        json={"message": "基金风险等级是什么意思？"},
    )
    assert response.status_code == 200
    payload = response.json()
    assert set(payload.keys()) == {"session", "messages"}
    assert payload["session"]["context_type"] == "coach"

    assistant_message = payload["messages"][-1]
    assert set(assistant_message.keys()) == {
        "id",
        "role",
        "content",
        "message_type",
        "created_at",
        "agent_run_id",
        "advisor_response",
    }
    assert set(assistant_message["advisor_response"].keys()) == {
        "answer",
        "intent",
        "citations",
        "risk_notice",
        "recommended_actions",
        "follow_up_questions",
    }


def test_agent_runtime_v2_fans_out_cross_domain_plan(client: TestClient) -> None:
    _onboard(client, email="cross-domain@example.com")

    response = client.post(
        "/api/assistant/messages",
        json={"message": "政策新闻会不会影响我的持仓配置和追涨冲动？"},
    )
    assert response.status_code == 200
    payload = response.json()
    assistant_message = payload["messages"][-1]
    assert assistant_message["advisor_response"]["intent"] == "portfolio"

    trace_response = client.get(
        f"/api/assistant/runs/{assistant_message['agent_run_id']}/trace"
    )
    assert trace_response.status_code == 200
    trace_payload = trace_response.json()
    plan_step = next(
        step
        for step in trace_payload["steps"]
        if step["step_name"] == "build_agent_plan"
    )
    assert plan_step["output_payload"]["detected_intents"] == [
        "portfolio",
        "behavior",
        "news",
    ]
    assert plan_step["output_payload"]["worker_names"] == [
        "PortfolioWorker",
        "BehaviorWorker",
        "NewsWorker",
    ]
    assert {
        skill["skill_name"] for skill in plan_step["output_payload"]["selected_skills"]
    } >= {
        "portfolio_concentration_review_v1",
        "behavior_bias_reflection_v1",
        "news_policy_impact_path_v1",
        "cross_domain_synthesis_v1",
    }
    assert {call["tool_name"] for call in trace_payload["tool_calls"]} >= {
        "portfolio.latest_report",
        "portfolio.risk_lens",
        "behavior.training_plan",
        "news.impact_lens",
    }
    worker_step = next(
        step
        for step in trace_payload["steps"]
        if step["step_name"] == "execute_workers"
    )
    assert worker_step["output_payload"]["worker_name"] == "AdvisorSynthesisWorker"
    assert len(worker_step["output_payload"]["worker_outputs"]) == 3
    validation_step = next(
        step
        for step in trace_payload["steps"]
        if step["step_name"] == "validate_worker_output"
    )
    assert validation_step["output_payload"]["status"] == "pass"


def test_simulation_intent_uses_simulation_worker(client: TestClient) -> None:
    _onboard(client, email="simulation-worker@example.com")

    response = client.post(
        "/api/assistant/messages",
        json={"message": "历史情境演练能训练什么？"},
    )
    assert response.status_code == 200
    payload = response.json()
    assistant_message = payload["messages"][-1]
    assert assistant_message["advisor_response"]["intent"] == "simulation"

    trace_response = client.get(
        f"/api/assistant/runs/{assistant_message['agent_run_id']}/trace"
    )
    assert trace_response.status_code == 200
    trace_payload = trace_response.json()
    plan_step = next(
        step
        for step in trace_payload["steps"]
        if step["step_name"] == "build_agent_plan"
    )
    assert "SimulationWorker" in plan_step["output_payload"]["worker_names"]
    assert {
        skill["skill_name"] for skill in plan_step["output_payload"]["selected_skills"]
    } >= {"simulation_review_coach_v1"}
    worker_step = next(
        step
        for step in trace_payload["steps"]
        if step["step_name"] == "execute_workers"
    )
    worker_names = {
        output["worker_name"]
        for output in worker_step["output_payload"]["worker_outputs"]
    }
    assert "SimulationWorker" in worker_names


def test_behavior_worker_persists_pending_state_proposal(client: TestClient) -> None:
    _onboard(client, email="behavior-proposal@example.com")

    response = client.post(
        "/api/assistant/messages",
        json={"message": "我总想追涨热门基金，这是什么偏差？"},
    )
    assert response.status_code == 200
    run_id = response.json()["messages"][-1]["agent_run_id"]

    trace_response = client.get(f"/api/assistant/runs/{run_id}/trace")
    assert trace_response.status_code == 200
    trace_payload = trace_response.json()
    proposals = trace_payload["state_update_proposals"]
    assert proposals
    assert proposals[0]["target_type"] == "behavior_profile_note"
    assert proposals[0]["validator_status"] == "pending"


def test_plan_validation_failure_falls_back_before_unknown_tool_execution(
    monkeypatch,
    client: TestClient,
) -> None:
    _onboard(client, email="bad-plan@example.com")

    def bad_plan(self, *, message: str, blocked: bool = False) -> AgentPlan:  # noqa: ARG001
        return AgentPlan(
            primary_intent="learning",
            detected_intents=["learning"],
            worker_names=["LearningWorker"],
            planned_tools=[
                PlannedToolCall(
                    tool_name="unknown.external_tool",
                    purpose="This tool must never execute.",
                )
            ],
            tool_selection_signals=[
                ToolSelectionSignal(
                    tool_name="unknown.external_tool",
                    score=100,
                    source="required",
                    reason="Injected invalid plan for test.",
                )
            ],
            rationale="Injected invalid plan for test.",
        )

    monkeypatch.setattr(AgentPlanner, "build_plan", bad_plan)

    response = client.post(
        "/api/assistant/messages",
        json={"message": "基金风险等级是什么意思？"},
    )
    assert response.status_code == 200
    run_id = response.json()["messages"][-1]["agent_run_id"]

    trace_response = client.get(f"/api/assistant/runs/{run_id}/trace")
    assert trace_response.status_code == 200
    trace_payload = trace_response.json()
    assert {call["tool_name"] for call in trace_payload["tool_calls"]} == {
        "profile.current",
        "safety.boundary_rules",
    }
    validate_plan_step = next(
        step for step in trace_payload["steps"] if step["step_name"] == "validate_plan"
    )
    assert validate_plan_step["output_payload"]["status"] == "fail"
    worker_step = next(
        step
        for step in trace_payload["steps"]
        if step["step_name"] == "execute_workers"
    )
    assert worker_step["output_payload"]["worker_name"] == "SafetyPolicyWorker"
    assert trace_payload["run"]["policy_status"] == "runtime_repair"


def test_plan_validation_fails_when_skill_required_tools_are_omitted() -> None:
    orchestrator = AdvisorOrchestrator(
        model_name="deepseek:deepseek-v4-pro",
        agent_mode="deterministic",
        max_tool_calls=2,
    )
    plan = orchestrator.planner.build_plan(message="基金回撤是什么意思？")
    assert "fund_basics_explainer_v1" in plan.skill_names
    assert set(plan.tool_names) < set(plan.selected_skills[0].required_tools)

    constraints = orchestrator._validate_plan(plan, blocked=False)

    required_tool_constraint = next(
        constraint
        for constraint in constraints
        if constraint.name == "skill_required_tools"
    )
    assert required_tool_constraint.status == "fail"


def test_agent_planner_capability_flags_disable_scored_fanout() -> None:
    planner = AgentPlanner(
        tool_registry=ToolRegistry(),
        capabilities=build_runtime_capabilities(
            flags="strict_final_validation,trace_observability",
            max_tool_calls=4,
            max_workers=1,
        ),
    )

    plan = planner.build_plan(message="政策新闻会不会影响我的持仓配置和追涨冲动？")

    assert plan.detected_intents == ["portfolio"]
    assert plan.worker_names == ["PortfolioWorker"]
    assert plan.max_tool_calls == 4
    assert {signal.source for signal in plan.tool_selection_signals} == {
        "intent_fallback"
    }


def test_final_response_validation_filters_unsupported_output() -> None:
    orchestrator = AdvisorOrchestrator(
        model_name="deepseek:deepseek-v4-pro",
        agent_mode="deterministic",
    )
    worker_output = WorkerOutput(
        worker_name="LearningWorker",
        intent="learning",
        findings=["先理解回撤，再看风险承受能力。"],
        evidence_refs=[
            EvidenceRef(
                worker_name="LearningWorker",
                source_type="course_section",
                source_id="lesson-1",
                quote_or_summary="回撤是阶段高点后的下跌幅度。",
                claim="回撤用于理解短期波动压力。",
            )
        ],
    )
    response = AdvisorResponse(
        answer="先理解回撤，再看风险承受能力。",
        intent="learning",
        citations=["made_up:1", "course_section:lesson-1"],
        risk_notice="FundGene 提供的是学习与决策支持，不是收益承诺、交易执行指令或自动下单系统。",
        recommended_actions=["今天买入这只基金。", "回到 Learning 继续学习回撤。"],
        follow_up_questions=["你想继续看风险等级吗？"],
    )

    normalized, validation = orchestrator._normalize_and_validate_final_response(
        response=response,
        worker_output=worker_output,
        policy_status="allow",
    )

    assert normalized.citations == ["course_section:lesson-1"]
    assert normalized.recommended_actions == ["回到 Learning 继续学习回撤。"]
    assert validation.status == "warn"
    assert validation.unsupported_citations == ["made_up:1"]
    assert validation.removed_unsafe_actions == ["今天买入这只基金。"]
