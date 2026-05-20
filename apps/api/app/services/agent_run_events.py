from datetime import datetime, timezone
from typing import Any

from sqlalchemy.orm import Session

from app.models.agent_run_event import AgentRunEventRecord
from app.runtime.v2.events import AgentRunEventSink
from app.schemas.assistant import AgentRunEvent


class DurableAgentRunEventSink:
    def __init__(
        self,
        db: Session,
        *,
        downstream: AgentRunEventSink | None = None,
    ) -> None:
        self.db = db
        self.downstream = downstream
        self._sequences: dict[str, int] = {}

    def emit_existing(self, event: AgentRunEvent) -> None:
        self._sequences[event.run_id] = max(
            self._sequences.get(event.run_id, 0),
            event.sequence,
        )
        self._persist(event)
        if self.downstream is not None:
            self.downstream.emit_existing(event)

    def emit(
        self,
        *,
        run_id: str,
        event_type: str,
        phase: str,
        title: str,
        status: str,
        at: datetime | None = None,
        duration_ms: int | None = None,
        payload: dict[str, Any] | None = None,
    ) -> AgentRunEvent:
        sequence = self._sequences.get(run_id, 0) + 1
        self._sequences[run_id] = sequence
        event = AgentRunEvent(
            id=f"{run_id}:{sequence:04d}",
            run_id=run_id,
            sequence=sequence,
            event_type=event_type,
            phase=phase,
            title=title,
            status=status,
            at=at,
            duration_ms=duration_ms,
            payload=payload or {},
        )
        self._persist(event)
        if self.downstream is not None:
            self.downstream.emit_existing(event)
        return event

    def _persist(self, event: AgentRunEvent) -> None:
        self.db.add(
            AgentRunEventRecord(
                id=event.id,
                run_id=event.run_id,
                sequence=event.sequence,
                event_type=event.event_type,
                phase=event.phase,
                title=event.title,
                status=event.status,
                at=event.at,
                duration_ms=event.duration_ms,
                payload=event.payload,
                created_at=event.at or datetime.now(timezone.utc),
            )
        )


def serialize_agent_run_event_record(record: AgentRunEventRecord) -> AgentRunEvent:
    return AgentRunEvent(
        id=record.id,
        run_id=record.run_id,
        sequence=record.sequence,
        event_type=record.event_type,
        phase=record.phase,
        title=record.title,
        status=record.status,
        at=record.at,
        duration_ms=record.duration_ms,
        payload=record.payload or {},
    )
