from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from ..db import get_db
from .. import models, auth as auth_utils
from pydantic import BaseModel

router = APIRouter()

XP_PER_COMPLETED_POMODORO = 50


def get_plant_stage(plant_xp: int, growth_target_xp: int) -> models.PlantStage:
    if plant_xp >= growth_target_xp:
        return models.PlantStage.mature_plant
    if plant_xp >= 250:
        return models.PlantStage.small_plant
    if plant_xp >= 100:
        return models.PlantStage.sprout
    return models.PlantStage.seed

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

    if session.completed_at is not None:
        return {
            "xp_earned": session.xp_earned,
            "total_xp": user.account_xp,
            "already_completed": True,
        }

    session.completed_at = datetime.utcnow()

    xp = 0
    if session.session_type == models.SessionType.focus and session.duration_minutes == 25:
        xp = XP_PER_COMPLETED_POMODORO

    session.xp_earned = xp
    user.account_xp += xp

    if xp > 0:
        active_plant = (
            db.query(models.Plant)
            .filter_by(user_id=user.id, is_active=True)
            .first()
        )

        if active_plant:
            growth_target = active_plant.plant_type.growth_target_xp
            next_plant_xp = min(active_plant.plant_xp + xp, growth_target)
            active_plant.plant_xp = next_plant_xp
            active_plant.stage = get_plant_stage(next_plant_xp, growth_target)
            if next_plant_xp >= growth_target and active_plant.completed_at is None:
                active_plant.completed_at = datetime.utcnow()

    db.commit()
    return {"xp_earned": xp, "total_xp": user.account_xp}