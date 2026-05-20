from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
from threading import Event, Lock

from app.runtime.v2.events import AgentRunEventSink


class AgentRunCancelled(Exception):
    """Raised when a user asks to stop the active advisor run."""


class AgentRunCancellationToken:
    def __init__(self) -> None:
        self._cancel_requested = Event()

    def request_cancel(self) -> None:
        self._cancel_requested.set()

    @property
    def cancel_requested(self) -> bool:
        return self._cancel_requested.is_set()


@dataclass(slots=True)
class ActiveAgentRun:
    run_id: str
    session_id: str
    user_id: str
    started_at: datetime
    event_sink: AgentRunEventSink
    cancellation_token: AgentRunCancellationToken


@dataclass(slots=True)
class ActiveAgentRunSnapshot:
    run_id: str
    session_id: str
    user_id: str
    started_at: datetime
    cancel_requested: bool


class ActiveAgentRunRegistry:
    def __init__(self) -> None:
        self._runs: dict[str, ActiveAgentRun] = {}
        self._lock = Lock()

    def register(
        self,
        *,
        run_id: str,
        session_id: str,
        user_id: str,
        event_sink: AgentRunEventSink,
    ) -> ActiveAgentRun:
        active_run = ActiveAgentRun(
            run_id=run_id,
            session_id=session_id,
            user_id=user_id,
            started_at=datetime.now(timezone.utc),
            event_sink=event_sink,
            cancellation_token=AgentRunCancellationToken(),
        )
        with self._lock:
            self._runs[run_id] = active_run
        return active_run

    def request_cancel(
        self,
        *,
        run_id: str,
        user_id: str,
    ) -> ActiveAgentRunSnapshot | None:
        with self._lock:
            active_run = self._runs.get(run_id)
            if active_run is None or active_run.user_id != user_id:
                return None
            active_run.cancellation_token.request_cancel()
            active_run.event_sink.emit(
                run_id=run_id,
                event_type="turn_cancel_requested",
                phase="turn",
                title="正在停止本次整理",
                status="cancelling",
                at=datetime.now(timezone.utc),
                payload={"reason": "user_requested_cancel"},
            )
            return self._snapshot(active_run)

    def unregister(self, *, run_id: str) -> None:
        with self._lock:
            self._runs.pop(run_id, None)

    def get(self, *, run_id: str) -> ActiveAgentRunSnapshot | None:
        with self._lock:
            active_run = self._runs.get(run_id)
            return self._snapshot(active_run) if active_run is not None else None

    @staticmethod
    def _snapshot(active_run: ActiveAgentRun) -> ActiveAgentRunSnapshot:
        return ActiveAgentRunSnapshot(
            run_id=active_run.run_id,
            session_id=active_run.session_id,
            user_id=active_run.user_id,
            started_at=active_run.started_at,
            cancel_requested=active_run.cancellation_token.cancel_requested,
        )


_active_agent_run_registry = ActiveAgentRunRegistry()


def get_active_agent_run_registry() -> ActiveAgentRunRegistry:
    return _active_agent_run_registry
