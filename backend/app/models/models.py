import uuid
from datetime import datetime, date
from decimal import Decimal
from sqlalchemy import String, Boolean, DateTime, Date, Numeric, ForeignKey, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

def gen_uuid() -> str:
    return str(uuid.uuid4())

class Account(Base):
    __tablename__ = "accounts"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    name: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    type: Mapped[str] = mapped_column(String(20))  # asset, liability, equity, revenue, expense
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    transactions: Mapped[list["Transaction"]] = relationship("Transaction", back_populates="account")

class Category(Base):
    __tablename__ = "categories"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    name: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    type: Mapped[str] = mapped_column(String(10))  # income, expense
    color: Mapped[str | None] = mapped_column(String(7), default="#1E88E5")
    icon: Mapped[str | None] = mapped_column(String(50), nullable=True)
    is_system: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    transactions: Mapped[list["Transaction"]] = relationship("Transaction", back_populates="category")

class Transaction(Base):
    __tablename__ = "transactions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    date: Mapped[date] = mapped_column(Date, index=True)
    amount: Mapped[Decimal] = mapped_column(Numeric(15, 2))
    type: Mapped[str] = mapped_column(String(10), index=True)  # income, expense
    description: Mapped[str] = mapped_column(Text)
    account_id: Mapped[str] = mapped_column(String(36), ForeignKey("accounts.id"), index=True)
    category_id: Mapped[str] = mapped_column(String(36), ForeignKey("categories.id"), index=True)
    reference_no: Mapped[str | None] = mapped_column(String(100), nullable=True)
    is_recurring: Mapped[bool] = mapped_column(Boolean, default=False)
    recurrence_type: Mapped[str | None] = mapped_column(String(20), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    account: Mapped["Account"] = relationship("Account", back_populates="transactions")
    category: Mapped["Category"] = relationship("Category", back_populates="transactions")
    audit_logs: Mapped[list["AuditLog"]] = relationship("AuditLog", back_populates="transaction")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    transaction_id: Mapped[str] = mapped_column(String(36), ForeignKey("transactions.id"), index=True)
    action: Mapped[str] = mapped_column(String(10))  # CREATE, UPDATE, DELETE
    changed_fields: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    performed_by: Mapped[str | None] = mapped_column(String(100), default="AI_AGENT")
    performed_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)

    transaction: Mapped["Transaction"] = relationship("Transaction", back_populates="audit_logs")
