from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session, joinedload

from ..db import get_db
from .. import models, auth as auth_utils

router = APIRouter()


def _default_stage_svg_path(plant_type_key: str, stage: models.PlantStage) -> str:
    return f"/static/plants/{plant_type_key}/{stage.value}.svg"


def _to_absolute_url(request: Request, path_or_url: str) -> str:
    if path_or_url.startswith("http://") or path_or_url.startswith("https://"):
        return path_or_url
    base = str(request.base_url).rstrip("/")
    if path_or_url.startswith("/"):
        return f"{base}{path_or_url}"
    return f"{base}/{path_or_url}"


def _stage_asset_path(plant_type: models.PlantType, stage: models.PlantStage) -> str:
    for asset in plant_type.stage_assets:
        if asset.stage == stage:
            return asset.image_path
    return _default_stage_svg_path(plant_type.key, stage)


@router.get("/active")
def get_user_plants(
    request: Request,
    db: Session = Depends(get_db),
    user: models.User = Depends(auth_utils.get_current_user),
):
    user_plants = (
        db.query(models.Plant)
        .options(joinedload(models.Plant.plant_type).joinedload(models.PlantType.stage_assets))
        .filter(models.Plant.user_id == user.id)
        .order_by(models.Plant.planted_at.asc())
        .all()
    )

    plants_payload = []
    active_payload = None
    for plant in user_plants:
        image_path = _stage_asset_path(plant.plant_type, plant.stage)
        plant_payload = {
            "plant_id": str(plant.id),
            "plant_type_id": str(plant.plant_type_id),
            "plant_type_key": plant.plant_type.key,
            "plant_type_name": plant.plant_type.name,
            "stage": plant.stage.value,
            "plant_xp": plant.plant_xp,
            "growth_target_xp": plant.plant_type.growth_target_xp,
            "is_active": plant.is_active,
            "unlocked_at": plant.planted_at.isoformat() if plant.planted_at else None,
            "image_path": image_path,
            "image_url": _to_absolute_url(request, image_path),
        }
        plants_payload.append(plant_payload)

        if plant.is_active and active_payload is None:
            active_payload = plant_payload

    return {
        "account_xp": user.account_xp,
        "plants": plants_payload,
        "active_plant": active_payload,
    }


@router.get("/types")
def list_plant_types(
    request: Request,
    db: Session = Depends(get_db),
    user: models.User = Depends(auth_utils.get_current_user),
):
    plant_types = (
        db.query(models.PlantType)
        .options(joinedload(models.PlantType.stage_assets))
        .order_by(models.PlantType.unlock_account_xp.asc(), models.PlantType.name.asc())
        .all()
    )

    payload = []
    for plant_type in plant_types:
        stage_assets = {}
        for stage in models.PlantStage:
            path = _stage_asset_path(plant_type, stage)
            stage_assets[stage.value] = {
                "image_path": path,
                "image_url": _to_absolute_url(request, path),
            }

        payload.append(
            {
                "plant_type_id": str(plant_type.id),
                "key": plant_type.key,
                "name": plant_type.name,
                "unlock_account_xp": plant_type.unlock_account_xp,
                "growth_target_xp": plant_type.growth_target_xp,
                "is_unlocked": user.account_xp >= plant_type.unlock_account_xp,
                "stage_assets": stage_assets,
            }
        )

    return {"plant_types": payload, "account_xp": user.account_xp}
