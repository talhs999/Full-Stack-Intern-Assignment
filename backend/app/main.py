from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import engine, Base, AsyncSessionLocal
from app.services.crud import seed_initial_data
from app.routers import transactions, reports, audit, agent

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create tables if not present and seed initial accounts/categories
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    async with AsyncSessionLocal() as db:
        await seed_initial_data(db)
    
    yield
    # Shutdown: dispose engine
    await engine.dispose()

app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    description="Spec-Driven AI Accounting Assistant API for Cyber Nuts",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact Vercel frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(transactions.router, prefix=settings.API_V1_STR, tags=["Transactions & Chart of Accounts"])
app.include_router(reports.router, prefix=settings.API_V1_STR, tags=["Financial Reports"])
app.include_router(audit.router, prefix=settings.API_V1_STR, tags=["Audit & Anomaly Review"])
app.include_router(agent.router, prefix=settings.API_V1_STR, tags=["AI Assistant"])

@app.get("/", tags=["Health"])
@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "ok",
        "service": settings.APP_NAME,
        "version": "1.0.0",
        "docs": "/docs"
    }
