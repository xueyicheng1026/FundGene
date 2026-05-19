from datetime import datetime
from typing import Any
from typing import Literal

from pydantic import BaseModel, Field, field_validator


class AssistantMessageContext(BaseModel):
    from_route: str | None = Field(default=None, max_length=80)
    focus: str | None = Field(default=None, max_length=80)
    source_ids: dict[str, str] = Field(default_factory=dict)
    daily_brief_id: str | None = Field(default=None, max_length=160)

    @field_validator("from_route", "focus", "daily_brief_id")
    @classmethod
    def normalize_optional_text(cls, value: str | None) -> str | None:
        if value is None:
            return None
        normalized = value.strip()
        return normalized or None

    @field_validator("source_ids")
    @classmethod
    def normalize_source_ids(cls, value: dict[str, str]) -> dict[str, str]:
        allowed_keys = {
            "portfolio_analysis_id",
            "portfolio_snapshot_id",
            "news_analysis_id",
            "news_item_id",
            "course_slug",
            "section_slug",
            "simulation_session_id",
            "scenario_id",
        }
        normalized: dict[str, str] = {}
        for key, item in value.items():
            if key not in allowed_keys or not isinstance(item, str):
                continue
            cleaned = item.strip()
            if cleaned:
                normalized[key] = cleaned[:160]
        return normalized


class AssistantMessageRequest(BaseModel):
    session_id: str | None = Field(default=None, min_length=1, max_length=36)
    start_new_session: bool = False
    message: str = Field(min_length=1, max_length=4000)
    context: AssistantMessageContext | None = None

    @field_validator("session_id")
    @classmethod
    def normalize_session_id(cls, value: str | None) -> str | None:
        if value is None:
            return None
        normalized = value.strip()
        return normalized or None

    @field_validator("message")
    @classmethod
    def normalize_message(cls, value: str) -> str:
        normalized = value.strip()
        if not normalized:
            raise ValueError("Message cannot be empty.")
        return normalized


class AdvisorActionTarget(BaseModel):
    label: str
    href: str
    intent: str
    action_id: str | None = None
    reason: str | None = None
    target_params: dict[str, str] = Field(default_factory=dict)
    expected_writeback: str | None = None
    safety_note: str | None = None
    kind: Literal["internal_link"] = "internal_link"


class AdvisorResponse(BaseModel):
    answer: str
    intent: str
    citations: list[str] = Field(default_factory=list)
    risk_notice: str
    recommended_actions: list[str] = Field(default_factory=list)
    recommended_action_targets: list[AdvisorActionTarget] = Field(default_factory=list)
    follow_up_questions: list[str] = Field(default_factory=list)


class AssistantSessionSummary(BaseModel):
    id: str
    topic: str
    context_type: str
    created_at: datetime
    updated_at: datetime
    latest_intent: str | None = None
    last_question: str | None = None
    last_answer_preview: str | None = None
    last_recommended_action: str | None = None
    message_count: int = 0


class AssistantConversationMessage(BaseModel):
    id: str
    role: Literal["user", "assistant"]
    content: str
    message_type: str
    created_at: datetime
    agent_run_id: str | None = None
    advisor_response: AdvisorResponse | None = None


class AssistantConversationResponse(BaseModel):
    session: AssistantSessionSummary | None = None
    messages: list[AssistantConversationMessage] = Field(default_factory=list)


class AssistantSessionListResponse(BaseModel):
    sessions: list[AssistantSessionSummary] = Field(default_factory=list)


class AgentRunTraceRun(BaseModel):
    id: str
    intent: str | None = None
    run_status: str
    policy_status: str | None = None
    orchestrator_version: str
    started_at: datetime
    completed_at: datetime | None = None
    latency_ms: int | None = None
    fallback_reason: str | None = None
    tool_trace: dict[str, Any] | None = None


class AgentRunTraceStep(BaseModel):
    id: str
    step_name: str
    sequence: int
    status: str
    latency_ms: int | None = None
    input_payload: dict[str, Any] | None = None
    output_payload: dict[str, Any] | None = None
    error: str | None = None


class AgentRunTraceToolCall(BaseModel):
    id: str
    step_id: str | None = None
    tool_name: str
    permission_level: str
    status: str
    latency_ms: int | None = None
    input_payload: dict[str, Any] | None = None
    output_payload: dict[str, Any] | None = None
    error: str | None = None


class AgentRunTraceEvidenceRef(BaseModel):
    id: str
    step_id: str | None = None
    worker_name: str
    source_type: str
    source_id: str | None = None
    source_version: str | None = None
    quote_or_summary: str
    claim: str
    support_summary: str | None = None


class AgentRunTraceStateUpdateProposal(BaseModel):
    id: str
    target_type: str
    target_id: str | None = None
    patch_payload: dict[str, Any]
    reason: str
    validator_status: str
    validator_message: str | None = None


class AgentRunTraceResponse(BaseModel):
    run: AgentRunTraceRun
    context_snapshot: dict[str, Any] | None = None
    steps: list[AgentRunTraceStep] = Field(default_factory=list)
    tool_calls: list[AgentRunTraceToolCall] = Field(default_factory=list)
    evidence_refs: list[AgentRunTraceEvidenceRef] = Field(default_factory=list)
    state_update_proposals: list[AgentRunTraceStateUpdateProposal] = Field(
        default_factory=list
    )
