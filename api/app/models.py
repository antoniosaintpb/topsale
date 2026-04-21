from datetime import datetime
from enum import Enum
from uuid import uuid4

from sqlalchemy import DateTime, Enum as SqlEnum, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class LeadStatus(str, Enum):
    NEW = "new"
    CONTEXT_COLLECTING = "context_collecting"
    DIAGNOSIS_READY = "diagnosis_ready"
    CONTACTED = "contacted"
    IN_WORK = "in_work"


class Lead(Base):
    __tablename__ = "leads"

    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    niche: Mapped[str] = mapped_column(String(200), nullable=False)
    team_size: Mapped[int] = mapped_column(Integer, nullable=False)
    problem: Mapped[str] = mapped_column(Text, nullable=False)
    telegram_username: Mapped[str | None] = mapped_column(String(64), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(32), nullable=True)
    status: Mapped[LeadStatus] = mapped_column(SqlEnum(LeadStatus), default=LeadStatus.NEW, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    context_entries: Mapped[list["LeadContext"]] = relationship(back_populates="lead", cascade="all, delete-orphan")
    reports: Mapped[list["AgentReport"]] = relationship(back_populates="lead", cascade="all, delete-orphan")


class LeadContext(Base):
    __tablename__ = "lead_context"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    lead_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("leads.id"), nullable=False)
    source: Mapped[str] = mapped_column(String(32), default="telegram", nullable=False)
    payload: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    lead: Mapped[Lead] = relationship(back_populates="context_entries")


class AgentReport(Base):
    __tablename__ = "agent_reports"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    lead_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("leads.id"), nullable=False)
    report_payload: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    lead: Mapped[Lead] = relationship(back_populates="reports")


class OwnerNotification(Base):
    __tablename__ = "owner_notifications"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    lead_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("leads.id"), nullable=False)
    sent_to_chat_id: Mapped[int] = mapped_column(nullable=False)
    sent_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)


class ConsultationRequest(Base):
    __tablename__ = "consultation_requests"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    lead_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("leads.id"), nullable=False)
    preferred_time: Mapped[str] = mapped_column(String(128), nullable=False)
    comment: Mapped[str] = mapped_column(Text, default="", nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
