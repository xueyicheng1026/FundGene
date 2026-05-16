from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db_session
from app.models.user import UserProfile
from app.runtime.deps import get_advisor_runtime
from app.schemas.assistant import (
    AgentRunTraceResponse,
    AssistantConversationResponse,
    AssistantMessageRequest,
)
from app.services.assistant import (
    get_current_conversation as get_current_assistant_conversation,
)
from app.services.assistant import get_agent_run_trace
from app.services.assistant import send_message

router = APIRouter(prefix="/assistant", tags=["assistant"])


@router.get("/session", response_model=AssistantConversationResponse)
def read_current_conversation(
    db: Annotated[Session, Depends(get_db_session)],
    user: Annotated[UserProfile, Depends(get_current_user)],
) -> AssistantConversationResponse:
    return get_current_assistant_conversation(db, user=user)


@router.post("/messages", response_model=AssistantConversationResponse)
async def post_message(
    payload: AssistantMessageRequest,
    db: Annotated[Session, Depends(get_db_session)],
    user: Annotated[UserProfile, Depends(get_current_user)],
) -> AssistantConversationResponse:
    runtime = get_advisor_runtime()
    return await send_message(db, user=user, payload=payload, runtime=runtime)


@router.get("/runs/{run_id}/trace", response_model=AgentRunTraceResponse)
def read_agent_run_trace(
    run_id: str,
    db: Annotated[Session, Depends(get_db_session)],
    user: Annotated[UserProfile, Depends(get_current_user)],
) -> AgentRunTraceResponse:
    return get_agent_run_trace(db, user=user, run_id=run_id)
