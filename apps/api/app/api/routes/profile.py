from typing import Annotated

from fastapi import APIRouter, Body, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db_session
from app.models.user import UserProfile
from app.schemas.profile import (
    ProfileContextResponse,
    ProfilePendingProposalsResponse,
    ProfileProposalDecisionRequest,
    ProfileProposalDecisionResponse,
)
from app.services.profile import (
    accept_profile_pending_proposal,
    get_profile_context,
    get_profile_pending_proposals,
    reject_profile_pending_proposal,
)

router = APIRouter(prefix="/profile", tags=["profile"])


@router.get("/context", response_model=ProfileContextResponse)
def read_profile_context(
    db: Annotated[Session, Depends(get_db_session)],
    user: Annotated[UserProfile, Depends(get_current_user)],
) -> ProfileContextResponse:
    return get_profile_context(db, user=user)


@router.get("/pending-proposals", response_model=ProfilePendingProposalsResponse)
def read_profile_pending_proposals(
    db: Annotated[Session, Depends(get_db_session)],
    user: Annotated[UserProfile, Depends(get_current_user)],
) -> ProfilePendingProposalsResponse:
    return get_profile_pending_proposals(db, user=user)


@router.post(
    "/pending-proposals/{proposal_id}/accept",
    response_model=ProfileProposalDecisionResponse,
)
def accept_profile_proposal(
    proposal_id: str,
    db: Annotated[Session, Depends(get_db_session)],
    user: Annotated[UserProfile, Depends(get_current_user)],
    payload: Annotated[ProfileProposalDecisionRequest | None, Body()] = None,
) -> ProfileProposalDecisionResponse:
    return accept_profile_pending_proposal(
        db,
        user=user,
        proposal_id=proposal_id,
        decision_note=payload.reason if payload else None,
    )


@router.post(
    "/pending-proposals/{proposal_id}/reject",
    response_model=ProfileProposalDecisionResponse,
)
def reject_profile_proposal(
    proposal_id: str,
    db: Annotated[Session, Depends(get_db_session)],
    user: Annotated[UserProfile, Depends(get_current_user)],
    payload: Annotated[ProfileProposalDecisionRequest | None, Body()] = None,
) -> ProfileProposalDecisionResponse:
    return reject_profile_pending_proposal(
        db,
        user=user,
        proposal_id=proposal_id,
        decision_note=payload.reason if payload else None,
    )
