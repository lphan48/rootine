from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..db import get_db
from .. import models, auth as auth_utils
from pydantic import BaseModel, EmailStr

router = APIRouter()

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
    user = models.User(
        username=body.username,
        email=body.email,
        hashed_password=auth_utils.hash_password(body.password)
    )
    db.add(user)
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