from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base
from sqlalchemy.pool import NullPool
from app.config import settings

# Adjust connection string if Supabase or Postgres pooler URL is provided without asyncpg
db_url = settings.DATABASE_URL
if db_url.startswith("postgresql://") or db_url.startswith("postgres://"):
    db_url = db_url.replace("postgresql://", "postgresql+asyncpg://").replace("postgres://", "postgres+asyncpg://")

connect_args = {}
engine_kwargs = {"echo": settings.DEBUG}

if "sqlite" in db_url:
    connect_args = {"check_same_thread": False}
    engine_kwargs["connect_args"] = connect_args
else:
    connect_args = {"ssl": "require"}
    engine_kwargs["connect_args"] = connect_args
    # Crucial for Vercel + Supabase connection pooler (Session Mode: max 15 clients)
    engine_kwargs["poolclass"] = NullPool
    engine_kwargs["pool_pre_ping"] = True

engine = create_async_engine(db_url, **engine_kwargs)
AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

Base = declarative_base()

_db_initialized = False

async def get_db():
    global _db_initialized
    if not _db_initialized:
        try:
            # Check if we need to run init on Vercel cold start
            async with engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
            
            # Lazy load seed data
            from app.services.crud import seed_initial_data
            async with AsyncSessionLocal() as db_session:
                await seed_initial_data(db_session)
        except Exception as e:
            print(f"DB initialization warning (ignored): {e}")
        finally:
            _db_initialized = True

    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
