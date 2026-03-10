from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime, date
from ..db import get_db
from .. import models, auth as auth_utils
from pydantic import BaseModel

router = APIRouter()

class StartSessionRequest(BaseModel):
    session_type: str = "focus"
    duration_minutes: int = 25

@router.post("/start")
def start_session(body: StartSessionRequest, db: Session = Depends(get_db),
                  user: models.User = Depends(auth_utils.get_current_user)):
    session = models.PomodoroSession(
        user_id=user.id,
        started_at=datetime.utcnow(),
        duration_minutes=body.duration_minutes,
        session_type=body.session_type,
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return {"session_id": str(session.id)}

@router.patch("/{session_id}/complete")
def complete_session(session_id: str, db: Session = Depends(get_db),
                     user: models.User = Depends(auth_utils.get_current_user)):
    session = db.query(models.PomodoroSession).filter_by(id=session_id, user_id=user.id).first()
    if not session:
        raise HTTPException(404, "Session not found")

    session.completed_at = datetime.utcnow()

    # Award XP
    xp = 10 if session.session_type == "focus" else 0
    session.xp_earned = xp
    user.xp += xp

    # Level up (every 100 XP)
    user.level = (user.xp // 100) + 1

    # Streak logic
    today = date.today()
    if user.last_session_date == today:
        pass  # already counted today
    elif user.last_session_date and (today - user.last_session_date).days == 1:
        user.streak_current += 1
        user.streak_longest = max(user.streak_longest, user.streak_current)
    else:
        user.streak_current = 1  # reset streak
    user.last_session_date = today

    db.commit()
    return {"xp_earned": xp, "total_xp": user.xp, "level": user.level, "streak": user.streak_current}