from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base
from app.config import settings

# Adjust connection string if Supabase or Postgres pooler URL is provided without asyncpg
db_url = settings.DATABASE_URL
if db_url.startswith("postgresql://") or db_url.startswith("postgres://"):
    db_url = db_url.replace("postgresql://", "postgresql+asyncpg://").replace("postgres://", "postgresql+asyncpg://")

connect_args = {}
if "sqlite" in db_url:
    connect_args = {"check_same_thread": False}
elif "postgresql" in db_url or "postgres" in db_url:
    connect_args = {"ssl": "require"}

engine = create_async_engine(db_url, echo=settings.DEBUG, connect_args=connect_args)
AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

Base = declarative_base()

import os

_db_initialized = False

async def get_db():
    global _db_initialized
    if not _db_initialized:
        # Check if we need to run init on Vercel cold start
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        
        # Lazy load seed data
        from app.services.crud import seed_initial_data
        async with AsyncSessionLocal() as db_session:
            await seed_initial_data(db_session)
            
        _db_initialized = True

    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
