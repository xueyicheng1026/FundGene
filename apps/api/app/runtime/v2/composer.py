from __future__ import annotations

import asyncio
import json
from dataclasses import dataclass, field
from typing import Any

from app.runtime.model_factory import (
    build_model,
    get_model_runtime_info,
    model_credentials_available,
)
from app.runtime.v2.schemas import PolicyResult, WorkerOutput
from app.schemas.assistant import AdvisorResponse

try:
    from pydantic_ai import Agent, PromptedOutput
except Exception:  # pragma: no cover - optional dependency bootstrap
    Agent = None
    PromptedOutput = None


@dataclass(slots=True)
class ComposeResult:
    response: AdvisorResponse
    metadata: dict[str, Any] = field(default_factory=dict)
    fallback_reason: str | None = None


class ResponseComposer:
    def __init__(
        self,
        *,
        model_name: str,
        agent_mode: str,
        timeout_ms: int,
        risk_notice: str,
    ) -> None:
        self.model_name = model_name
        self.agent_mode = agent_mode.strip().lower()
        self.timeout_ms = max(1000, timeout_ms)
        self.risk_notice = risk_notice
        self.model_info = get_model_runtime_info(model_name)

    async def compose(
        self,
        *,
        intent: str,
        worker_output: WorkerOutput,
        input_policy: PolicyResult,
        deterministic_response: AdvisorResponse,
    ) -> ComposeResult:
        if input_policy.status in {"block_with_guidance", "runtime_repair"}:
            return ComposeResult(
                response=deterministic_response,
                metadata={
                    "composer_mode": "deterministic",
                    "reason": input_policy.status,
                    **self.model_info.metadata(),
                },
            )

        if self.agent_mode == "deterministic":
            return ComposeResult(
                response=deterministic_response,
                metadata={
                    "composer_mode": "deterministic",
                    "reason": "configured",
                    **self.model_info.metadata(),
                },
            )

        if self.agent_mode not in {"hybrid", "model"}:
            return ComposeResult(
                response=deterministic_response,
                metadata={
                    "composer_mode": "deterministic_fallback",
                    "reason": f"unsupported_agent_mode:{self.agent_mode}",
                    "fallback_reason": f"unsupported_agent_mode:{self.agent_mode}",
                    **self.model_info.metadata(),
                },
                fallback_reason=f"unsupported_agent_mode:{self.agent_mode}",
            )

        if Agent is None or PromptedOutput is None:
            return ComposeResult(
                response=deterministic_response,
                metadata={
                    "composer_mode": "deterministic_fallback",
                    "reason": "pydantic_ai_unavailable",
                    "fallback_reason": "pydantic_ai_unavailable",
                    **self.model_info.metadata(),
                },
                fallback_reason="pydantic_ai_unavailable",
            )

        if self.agent_mode == "hybrid" and not model_credentials_available(
            self.model_name,
        ):
            return ComposeResult(
                response=deterministic_response,
                metadata={
                    "composer_mode": "deterministic_fallback",
                    "reason": "model_not_configured",
                    "fallback_reason": "model_not_configured",
                    **self.model_info.metadata(),
                },
                fallback_reason="model_not_configured",
            )

        try:
            response = await self._run_model_composer(
                intent=intent,
                worker_output=worker_output,
                deterministic_response=deterministic_response,
            )
        except Exception as exc:
            return ComposeResult(
                response=deterministic_response,
                metadata={
                    "composer_mode": "deterministic_fallback",
                    "reason": exc.__class__.__name__,
                    "fallback_reason": str(exc),
                    **self.model_info.metadata(),
                },
                fallback_reason=str(exc),
            )

        return ComposeResult(
            response=response,
            metadata={
                "composer_mode": "model",
                "schema_version": "assistant_message_v1",
                **self.model_info.metadata(),
            },
        )

    async def _run_model_composer(
        self,
        *,
        intent: str,
        worker_output: WorkerOutput,
        deterministic_response: AdvisorResponse,
    ) -> AdvisorResponse:
        if Agent is None or PromptedOutput is None:  # pragma: no cover - guarded above
            raise RuntimeError("pydantic_ai_unavailable")

        model, _info = build_model(self.model_name)
        agent = Agent(
            model,
            output_type=PromptedOutput(
                AdvisorResponse,
                template=(
                    "Always respond with one valid JSON object compatible with this schema. "
                    "Do not include Markdown fences, comments, or surrounding prose.\n\n{schema}"
                ),
            ),
            instructions=(
                "You are FundGene's final response composer for beginner fund-investing education. "
                "Use only the provided worker findings and evidence. Do not add trade execution, "
                "return promises, broker/account connection instructions, or unsupported facts. "
                "Keep Chinese answers beginner-friendly, concise, and action-oriented."
            ),
        )
        prompt = json.dumps(
            {
                "intent": intent,
                "worker_output": worker_output.model_dump(mode="json"),
                "required_risk_notice": self.risk_notice,
                "fallback_response": deterministic_response.model_dump(mode="json"),
                "output_contract": {
                    "answer": "Chinese beginner-facing explanation grounded in worker findings",
                    "intent": intent,
                    "citations": "reuse evidence citation keys where possible",
                    "risk_notice": self.risk_notice,
                    "recommended_actions": "safe in-product actions only",
                    "follow_up_questions": "1-2 useful beginner follow-ups",
                },
            },
            ensure_ascii=False,
        )
        result = await asyncio.wait_for(
            agent.run(
                prompt,
                output_type=PromptedOutput(
                    AdvisorResponse,
                    template=(
                        "Always respond with one valid JSON object compatible with this schema. "
                        "Do not include Markdown fences, comments, or surrounding prose.\n\n{schema}"
                    ),
                ),
            ),
            timeout=self.timeout_ms / 1000,
        )
        raw_output = getattr(result, "output", None)
        if raw_output is None:
            raw_output = getattr(result, "data", None)
        response = AdvisorResponse.model_validate(raw_output)

        citations = response.citations or deterministic_response.citations
        recommended_actions = (
            response.recommended_actions or deterministic_response.recommended_actions
        )
        follow_up_questions = (
            response.follow_up_questions or deterministic_response.follow_up_questions
        )
        return response.model_copy(
            update={
                "intent": intent,
                "citations": citations,
                "risk_notice": self.risk_notice,
                "recommended_actions": recommended_actions,
                "follow_up_questions": follow_up_questions,
            }
        )
