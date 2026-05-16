from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field, field_validator


SimulationSessionStatus = Literal["in_progress", "completed"]


class ScenarioSummary(BaseModel):
    slug: str
    title: str
    summary: str
    bias_focus: str
    difficulty: int
    estimated_duration_minutes: int
    event_count: int
    status: Literal["not_started", "in_progress", "completed"]
    active_session_id: str | None = None
    last_completed_at: datetime | None = None


class ScenarioCatalogResponse(BaseModel):
    recommended_scenario_slug: str | None = None
    recommended_scenario_title: str | None = None
    items: list[ScenarioSummary]


class ScenarioChoice(BaseModel):
    key: str
    label: str
    description: str


class ActiveScenarioEvent(BaseModel):
    event_id: str
    step_index: int
    date_label: str
    title: str
    narrative: str
    prompt: str
    choices: list[ScenarioChoice]


class SimulationActionSummary(BaseModel):
    event_id: str
    step_index: int
    choice_key: str
    choice_label: str
    reflection: str | None = None
    is_recommended: bool
    created_at: datetime


class SimulationReviewResponse(BaseModel):
    session_id: str
    scenario_slug: str
    scenario_title: str
    bias_focus: str
    decision_summary: str
    bias_observations: list[str]
    coach_feedback: str
    recommended_next_actions: list[str]
    generated_at: datetime
    actions: list[SimulationActionSummary]


class SimulationSessionResponse(BaseModel):
    session_id: str
    scenario_slug: str
    scenario_title: str
    bias_focus: str
    status: SimulationSessionStatus
    current_step: int
    total_steps: int
    active_event: ActiveScenarioEvent | None = None
    actions: list[SimulationActionSummary]
    completed_at: datetime | None = None
    review: SimulationReviewResponse | None = None


class SimulationSessionStartRequest(BaseModel):
    scenario_slug: str = Field(min_length=1, max_length=64)

    @field_validator("scenario_slug")
    @classmethod
    def normalize_slug(cls, value: str) -> str:
        normalized = value.strip()
        if not normalized:
            raise ValueError("Scenario slug cannot be empty.")
        return normalized


class SimulationActionSubmitRequest(BaseModel):
    session_id: str = Field(min_length=1, max_length=36)
    event_id: str = Field(min_length=1, max_length=36)
    choice_key: str = Field(min_length=1, max_length=64)
    reflection: str | None = Field(default=None, max_length=500)

    @field_validator("session_id", "event_id", "choice_key")
    @classmethod
    def normalize_required_text(cls, value: str) -> str:
        normalized = value.strip()
        if not normalized:
            raise ValueError("Field cannot be empty.")
        return normalized

    @field_validator("reflection")
    @classmethod
    def normalize_reflection(cls, value: str | None) -> str | None:
        if value is None:
            return None
        normalized = value.strip()
        return normalized or None
