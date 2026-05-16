from datetime import date, datetime

from pydantic import BaseModel

from app.schemas.behavior import RiskLevel


class DashboardSummaryCard(BaseModel):
    label: str
    value: str
    detail: str


class DashboardCoachActivity(BaseModel):
    session_id: str
    topic: str
    intent: str | None
    question: str
    answer_focus: str
    recommended_action: str | None
    updated_at: datetime


class DashboardLearningStatus(BaseModel):
    overall_progress_percentage: int
    completed_courses_count: int
    total_courses: int
    recommended_course_slug: str | None = None
    recommended_course_title: str | None = None


class DashboardPortfolioStatus(BaseModel):
    has_report: bool
    latest_snapshot_id: str | None = None
    latest_snapshot_date: date | None = None
    total_value: float | None = None
    summary: str | None = None


class DashboardSimulationStatus(BaseModel):
    completed_sessions_count: int
    recommended_scenario_slug: str | None = None
    recommended_scenario_title: str | None = None
    latest_session_id: str | None = None
    latest_scenario_slug: str | None = None
    latest_scenario_title: str | None = None
    latest_review_summary: str | None = None
    latest_completed_at: datetime | None = None


class DashboardNewsStatus(BaseModel):
    has_analysis: bool
    latest_analysis_id: str | None = None
    latest_item_id: str | None = None
    latest_item_type: str | None = None
    latest_title: str | None = None
    source_name: str | None = None
    beginner_translation: str | None = None
    recommended_action: str | None = None
    generated_at: datetime | None = None


class DashboardResponse(BaseModel):
    user_id: str
    onboarding_completed: bool
    risk_level: RiskLevel | None
    bias_tags: list[str]
    latest_risk_score: int | None
    next_actions: list[str]
    summary_cards: list[DashboardSummaryCard]
    learning_status: DashboardLearningStatus | None = None
    portfolio_status: DashboardPortfolioStatus | None = None
    simulation_status: DashboardSimulationStatus | None = None
    news_status: DashboardNewsStatus | None = None
    latest_coach_activity: DashboardCoachActivity | None = None
