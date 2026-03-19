from sqlalchemy import Column, String, Integer, DateTime, Enum, ForeignKey, Boolean, Index, UniqueConstraint, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from .db import Base
from datetime import datetime
import uuid, enum

class SessionType(str, enum.Enum):
    focus = "focus"
    short_break = "short_break"
    long_break = "long_break"

class User(Base):
    __tablename__ = "users"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    account_xp = Column(Integer, default=0, nullable=False)
    sessions = relationship("PomodoroSession", back_populates="user")
    plants = relationship("Plant", back_populates="user")

class PomodoroSession(Base):
    __tablename__ = "sessions"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    started_at = Column(DateTime, nullable=False)
    completed_at = Column(DateTime, nullable=True)
    duration_minutes = Column(Integer, nullable=False)
    session_type = Column(Enum(SessionType), default=SessionType.focus)
    xp_earned = Column(Integer, default=0)
    user = relationship("User", back_populates="sessions")


class PlantStage(str, enum.Enum):
    seed = "seed"
    sprout = "sprout"
    small_plant = "small_plant"
    mature_plant = "mature_plant"

class PlantType(Base):
    __tablename__ = "plant_types"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    key = Column(String, unique=True, nullable=False)
    name = Column(String, unique=True, nullable=False)
    growth_target_xp = Column(Integer, default=500, nullable=False)
    unlock_account_xp = Column(Integer, default=0, nullable=False)
    plants = relationship("Plant", back_populates="plant_type")
    stage_assets = relationship("PlantStageAsset", back_populates="plant_type")


class PlantStageAsset(Base):
    __tablename__ = "plant_stage_assets"
    __table_args__ = (
        UniqueConstraint("plant_type_id", "stage", name="uq_plant_stage_assets_type_stage"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    plant_type_id = Column(UUID(as_uuid=True), ForeignKey("plant_types.id"), nullable=False)
    stage = Column(Enum(PlantStage), nullable=False)
    image_path = Column(String, nullable=False)

    plant_type = relationship("PlantType", back_populates="stage_assets")

class Plant(Base):
    __tablename__ = "plants"
    __table_args__ = (
        Index(
            "uq_plants_user_active",
            "user_id",
            unique=True,
            postgresql_where=text("is_active = true"),
        ),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    plant_type_id = Column(UUID(as_uuid=True), ForeignKey("plant_types.id"), nullable=False)
    stage = Column(Enum(PlantStage), default=PlantStage.seed, nullable=False)
    plant_xp = Column(Integer, default=0, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    planted_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    completed_at = Column(DateTime, nullable=True)
    user = relationship("User", back_populates="plants")
    plant_type = relationship("PlantType", back_populates="plants")
