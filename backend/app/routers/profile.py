from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..db import get_db
from .. import models, auth as auth_utils

router = APIRouter()


@router.get("/stats")
def get_profile_stats(
    db: Session = Depends(get_db),
    user: models.User = Depends(auth_utils.get_current_user),
):
    sessions_completed = (
        db.query(models.PomodoroSession)
        .filter(
            models.PomodoroSession.user_id == user.id,
            models.PomodoroSession.completed_at.isnot(None),
            models.PomodoroSession.session_type == models.SessionType.focus,
        )
        .count()
    )

    return {
        "username": user.username,
        "total_xp": user.account_xp,
        "sessions_completed": sessions_completed,
    }
