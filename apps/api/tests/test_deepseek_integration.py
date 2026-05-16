import asyncio
import json

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session, sessionmaker

import app.services.ai_enhancement as ai_enhancement
from app.core.config import get_settings
from app.runtime.deps import get_advisor_runtime
from app.runtime.v2.composer import ResponseComposer
from app.runtime.v2.orchestrator import RISK_NOTICE
from app.runtime.v2.schemas import PolicyResult, WorkerOutput
from app.schemas.assistant import AdvisorResponse


def _deterministic_response() -> AdvisorResponse:
    return AdvisorResponse(
        answer="规则回答：先理解风险和回撤，再讨论组合结构。",
        intent="learning",
        citations=["agent_runtime_v2"],
        risk_notice=RISK_NOTICE,
        recommended_actions=["先完成一节风险课程。"],
        follow_up_questions=["你想先看回撤例子吗？"],
    )


def _worker_output() -> WorkerOutput:
    return WorkerOutput(
        worker_name="LearningWorker",
        intent="learning",
        findings=["新手应先把风险等级和回撤理解清楚。"],
        recommended_actions=["先完成一节风险课程。"],
        confidence=0.9,
    )


def _onboard(client: TestClient, *, email: str = "deepseek@example.com") -> None:
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


def _clear_runtime_caches() -> None:
    get_settings.cache_clear()
    get_advisor_runtime.cache_clear()


def test_deepseek_hybrid_without_key_uses_deterministic_fallback(monkeypatch) -> None:
    monkeypatch.delenv("FUNDGENE_DEEPSEEK_API_KEY", raising=False)
    monkeypatch.delenv("DEEPSEEK_API_KEY", raising=False)
    _clear_runtime_caches()

    composer = ResponseComposer(
        model_name="deepseek:deepseek-v4-pro",
        agent_mode="hybrid",
        timeout_ms=1000,
        risk_notice=RISK_NOTICE,
    )
    result = asyncio.run(
        composer.compose(
            intent="learning",
            worker_output=_worker_output(),
            input_policy=PolicyResult(status="allow", reason="test"),
            deterministic_response=_deterministic_response(),
        )
    )

    assert result.response.answer.startswith("规则回答")
    assert result.metadata["composer_mode"] == "deterministic_fallback"
    assert result.metadata["provider"] == "deepseek"
    assert result.metadata["model_name"] == "deepseek:deepseek-v4-pro"
    assert result.metadata["fallback_reason"] == "model_not_configured"
    assert result.fallback_reason == "model_not_configured"


def test_deepseek_model_failure_keeps_deterministic_response(monkeypatch) -> None:
    monkeypatch.setenv("FUNDGENE_DEEPSEEK_API_KEY", "test-key")
    _clear_runtime_caches()

    async def fail_model(self, **kwargs):  # noqa: ANN001
        raise TimeoutError("mock timeout")

    monkeypatch.setattr(ResponseComposer, "_run_model_composer", fail_model)
    composer = ResponseComposer(
        model_name="deepseek:deepseek-v4-pro",
        agent_mode="model",
        timeout_ms=1000,
        risk_notice=RISK_NOTICE,
    )
    result = asyncio.run(
        composer.compose(
            intent="learning",
            worker_output=_worker_output(),
            input_policy=PolicyResult(status="allow", reason="test"),
            deterministic_response=_deterministic_response(),
        )
    )

    assert result.response.answer.startswith("规则回答")
    assert result.metadata["composer_mode"] == "deterministic_fallback"
    assert result.metadata["fallback_reason"] == "mock timeout"
    assert result.metadata["provider"] == "deepseek"


def test_coach_mock_deepseek_success_records_model_trace(
    monkeypatch,
    client: TestClient,
    session_factory: sessionmaker[Session],
) -> None:
    monkeypatch.setenv("FUNDGENE_AGENT_MODE", "hybrid")
    monkeypatch.setenv("FUNDGENE_DEEPSEEK_API_KEY", "test-key")
    _clear_runtime_caches()

    async def fake_model(self, **kwargs):  # noqa: ANN001
        deterministic = kwargs["deterministic_response"]
        return deterministic.model_copy(
            update={"answer": "模型增强回答：先把回撤看成风险承受力测试。"}
        )

    monkeypatch.setattr(ResponseComposer, "_run_model_composer", fake_model)
    _onboard(client, email="trace-model@example.com")

    response = client.post(
        "/api/assistant/messages",
        json={"message": "基金回撤是什么意思？"},
    )
    assert response.status_code == 200
    run_id = response.json()["messages"][-1]["agent_run_id"]
    trace_response = client.get(f"/api/assistant/runs/{run_id}/trace")
    assert trace_response.status_code == 200
    composer = trace_response.json()["run"]["tool_trace"]["composer"]
    assert composer["composer_mode"] == "model"
    assert composer["provider"] == "deepseek"
    assert composer["model_name"] == "deepseek:deepseek-v4-pro"

    with session_factory() as session:
        from app.models.agent_run import AgentRun

        run = session.get(AgentRun, run_id)
        assert run is not None
        assert run.fallback_reason is None


def test_news_unsafe_model_enhancement_falls_back_to_rule_payload(
    monkeypatch,
    client: TestClient,
) -> None:
    monkeypatch.setenv("FUNDGENE_AGENT_MODE", "hybrid")
    monkeypatch.setenv("FUNDGENE_DEEPSEEK_API_KEY", "test-key")
    _clear_runtime_caches()

    def unsafe_model(**kwargs):  # noqa: ANN003
        return ai_enhancement.NewsAnalysisEnhancement(
            facts=["模型声称保证收益。", "标题已经足够判断。"],
            impact_paths=["可以直接买入。", "不需要再看组合。"],
            uncertainty_notes=["没有不确定性。", "短期确定上涨。"],
            beginner_translation="这是一段包含保证收益和直接买入的错误模型文本。",
            recommended_next_actions=["直接买入相关基金。", "满仓等待上涨。"],
        )

    monkeypatch.setattr(ai_enhancement, "_run_model_enhancement", unsafe_model)
    _onboard(client, email="unsafe-news@example.com")

    response = client.post(
        "/api/news/analyze",
        json={
            "headline": "长期资金入市政策继续推进",
            "body": "政策强调长期资金和资本市场稳定，但具体节奏、落地方式与基金组合影响仍需要进一步观察。",
        },
    )
    assert response.status_code == 200
    payload = response.json()
    serialized = json.dumps(payload, ensure_ascii=False)
    assert "模型声称保证收益" not in serialized
    assert "直接买入相关基金" not in serialized
    assert "不构成收益承诺" in payload["risk_notice"]
    assert payload["facts"][0].endswith("发布或更新了一条新闻信息。")


def test_portfolio_unsafe_model_enhancement_falls_back_to_rule_payload(
    monkeypatch,
    client: TestClient,
) -> None:
    monkeypatch.setenv("FUNDGENE_AGENT_MODE", "hybrid")
    monkeypatch.setenv("FUNDGENE_DEEPSEEK_API_KEY", "test-key")
    _clear_runtime_caches()

    def unsafe_model(**kwargs):  # noqa: ANN003
        return ai_enhancement.PortfolioAnalysisEnhancement(
            summary="模型错误总结：这份组合保证收益，应该直接买入并满仓。",
            risk_exposure=["保证收益。"],
            concentration_flags=["直接买入第一大持仓。"],
            allocation_balance=["清仓其他资产。"],
            recommended_next_actions=["满仓。", "自动交易。"],
        )

    monkeypatch.setattr(ai_enhancement, "_run_model_enhancement", unsafe_model)
    _onboard(client, email="unsafe-portfolio@example.com")

    response = client.post(
        "/api/portfolio/snapshots",
        json={
            "snapshot_date": "2026-04-30",
            "cash_value": 5000,
            "holdings": [
                {
                    "fund_code": "161725",
                    "fund_name": "白酒指数",
                    "fund_type": "equity",
                    "market_value": 12000,
                },
                {
                    "fund_code": "006327",
                    "fund_name": "中短债基金",
                    "fund_type": "bond",
                    "market_value": 8000,
                },
            ],
        },
    )
    assert response.status_code == 200
    payload = response.json()
    serialized = json.dumps(payload, ensure_ascii=False)
    assert "保证收益" not in serialized
    assert "直接买入第一大持仓" not in serialized
    assert "这份快照总资产约为 25000.00 元" in payload["summary"]
