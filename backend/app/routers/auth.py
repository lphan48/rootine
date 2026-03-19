from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..db import get_db
from .. import models, auth as auth_utils
from pydantic import BaseModel, EmailStr

router = APIRouter()
STARTER_PLANT_KEY = "sunflower"

class RegisterRequest(BaseModel):
    username: str
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/register")
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    if db.query(models.User).filter(models.User.email == body.email).first():
        raise HTTPException(400, "Email already registered")

    starter_plant_type = db.query(models.PlantType).filter_by(key=STARTER_PLANT_KEY).first()
    if not starter_plant_type:
        raise HTTPException(500, "Starter plant type is not configured")

    user = models.User(
        username=body.username,
        email=body.email,
        hashed_password=auth_utils.hash_password(body.password)
    )
    db.add(user)

    db.flush()

    starter_plant = models.Plant(
        user_id=user.id,
        plant_type_id=starter_plant_type.id,
        stage=models.PlantStage.seed,
        plant_xp=0,
        is_active=True,
    )
    db.add(starter_plant)

    db.commit()
    db.refresh(user)
    token = auth_utils.create_token({"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer", "username": user.username}

@router.post("/login")
def login(body: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == body.email).first()
    if not user or not auth_utils.verify_password(body.password, user.hashed_password):
        raise HTTPException(401, "Invalid credentials")
    token = auth_utils.create_token({"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer", "username": user.username}