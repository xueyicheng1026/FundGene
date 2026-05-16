from fastapi.testclient import TestClient
from sqlalchemy import func, select
from sqlalchemy.orm import Session, sessionmaker

from app.models.agent_citation import AgentCitation
from app.models.news_analysis import NewsAnalysis
from app.models.policy_item import PolicyItem
from app.services.news import ingest_feed_document


def _complete_onboarding(
    client: TestClient,
    *,
    email: str = "news-flow@example.com",
) -> None:
    register_response = client.post(
        "/api/auth/register",
        json={
            "email": email,
            "password": "supersecure123",
        },
    )
    assert register_response.status_code == 201

    profile_response = client.post(
        "/api/onboarding/profile",
        json={
            "display_name": "Ava",
            "investing_experience": "beginner",
            "monthly_contribution_band": "under_3000",
            "primary_goal": "先学会把政策新闻和自己的基金组合分开判断。",
        },
    )
    assert profile_response.status_code == 200

    questionnaire_response = client.post(
        "/api/behavior/questionnaires",
        json={
            "questionnaire_version": "v1",
            "answers": {
                "volatility_comfort": 3,
                "drawdown_reaction": 3,
                "investment_horizon": 4,
                "panic_sell_impulse": 2,
                "chase_hot_funds": 2,
                "diversification_habit": 3,
            },
        },
    )
    assert questionnaire_response.status_code == 200


def test_news_policy_analysis_updates_dashboard_and_coach_context(
    client: TestClient,
    session_factory: sessionmaker[Session],
) -> None:
    _complete_onboarding(client)

    feed_document = """
    <feed xmlns="http://www.w3.org/2005/Atom">
      <title>Federal Reserve Policy Feed</title>
      <entry>
        <id>tag:example.com,2026:policy-rate-guidance</id>
        <title>Federal Reserve issues policy rate guidance</title>
        <link href="https://example.com/policy-rate-guidance" />
        <updated>2026-04-25T12:00:00Z</updated>
        <summary>Policy guidance discusses the interest rate path and uncertainty for markets.</summary>
      </entry>
    </feed>
    """
    with session_factory() as session:
        ingest_feed_document(
            session,
            feed_url="https://example.com/feed.xml",
            content=feed_document,
        )

    list_response = client.get("/api/news")
    assert list_response.status_code == 200
    list_payload = list_response.json()
    assert len(list_payload["items"]) == 1
    item = list_payload["items"][0]
    assert item["item_type"] == "policy"
    assert item["latest_analysis_id"] is None

    detail_response = client.get(f"/api/news/{item['id']}")
    assert detail_response.status_code == 200
    assert detail_response.json()["item"]["title"] == item["title"]

    analysis_response = client.post(
        "/api/news/analyze",
        json={"item_id": item["id"]},
    )
    assert analysis_response.status_code == 200
    analysis_payload = analysis_response.json()
    analysis_id = analysis_payload["id"]
    assert analysis_payload["item"]["item_type"] == "policy"
    assert len(analysis_payload["facts"]) >= 3
    assert len(analysis_payload["impact_paths"]) >= 2
    assert len(analysis_payload["uncertainty_notes"]) == 3
    assert "不构成收益承诺" in analysis_payload["risk_notice"]
    assert len(analysis_payload["citations"]) == 1

    persisted_analysis_response = client.get(f"/api/news/analyses/{analysis_id}")
    assert persisted_analysis_response.status_code == 200
    assert persisted_analysis_response.json()["id"] == analysis_id

    refreshed_list_response = client.get("/api/news")
    assert refreshed_list_response.status_code == 200
    assert refreshed_list_response.json()["items"][0]["latest_analysis_id"] == analysis_id

    dashboard_response = client.get("/api/dashboard")
    assert dashboard_response.status_code == 200
    dashboard_payload = dashboard_response.json()
    assert dashboard_payload["news_status"]["has_analysis"] is True
    assert dashboard_payload["news_status"]["latest_analysis_id"] == analysis_id
    assert any(
        card["label"] == "新闻政策" and card["value"] == "已有解读"
        for card in dashboard_payload["summary_cards"]
    )

    coach_response = client.post(
        "/api/assistant/messages",
        json={"message": "这条政策新闻会影响我的基金吗？"},
    )
    assert coach_response.status_code == 200
    coach_payload = coach_response.json()
    advisor_response = coach_payload["messages"][1]["advisor_response"]
    assert advisor_response["intent"] == "news"
    assert "最近一条真实新闻/政策分析" in advisor_response["answer"]
    assert advisor_response["citations"] == [f"news_analysis:{analysis_id}"]

    with session_factory() as session:
        assert session.scalar(select(func.count()).select_from(PolicyItem)) == 1
        assert session.scalar(select(func.count()).select_from(NewsAnalysis)) == 1
        assert session.scalar(select(func.count()).select_from(AgentCitation)) == 1


def test_manual_news_analysis_is_visible_only_to_current_user(
    client: TestClient,
) -> None:
    _complete_onboarding(client, email="manual-news-owner@example.com")

    analysis_response = client.post(
        "/api/news/analyze",
        json={
            "headline": "长期资金入市政策继续推进",
            "body": "政策强调长期资金和资本市场稳定，但具体节奏、落地方式与基金组合影响仍需要进一步观察。",
        },
    )
    assert analysis_response.status_code == 200
    owner_payload = analysis_response.json()
    assert owner_payload["item"]["source_name"] == "用户粘贴内容"
    assert owner_payload["item"]["url"] == ""

    owner_list_response = client.get("/api/news")
    assert owner_list_response.status_code == 200
    owner_item_ids = {item["id"] for item in owner_list_response.json()["items"]}
    assert owner_payload["item"]["id"] in owner_item_ids

    logout_response = client.post("/api/auth/logout")
    assert logout_response.status_code == 200

    _complete_onboarding(client, email="manual-news-other@example.com")
    other_list_response = client.get("/api/news")
    assert other_list_response.status_code == 200
    other_item_ids = {item["id"] for item in other_list_response.json()["items"]}
    assert owner_payload["item"]["id"] not in other_item_ids
