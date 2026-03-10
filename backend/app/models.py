from sqlalchemy import Column, String, Integer, DateTime, Enum, ForeignKey, Date
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from .db import Base
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
    level = Column(Integer, default=1)
    xp = Column(Integer, default=0)
    streak_current = Column(Integer, default=0)
    streak_longest = Column(Integer, default=0)
    last_session_date = Column(Date, nullable=True)
    sessions = relationship("PomodoroSession", back_populates="user")

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