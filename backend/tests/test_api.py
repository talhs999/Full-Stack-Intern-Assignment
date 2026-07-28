import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.database import engine, Base, AsyncSessionLocal
from app.services.crud import seed_initial_data

@pytest_asyncio.fixture(autouse=True)
async def init_test_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    async with AsyncSessionLocal() as db:
        await seed_initial_data(db)
    yield

@pytest.mark.asyncio
async def test_health_check():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.get("/health")
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "ok"
        assert "Cyber Nuts" in data["service"]

@pytest.mark.asyncio
async def test_list_categories():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.get("/api/v1/categories")
        assert res.status_code == 200
        data = res.json()
        assert data["success"] is True
        assert len(data["data"]) >= 5  # seeded categories

@pytest.mark.asyncio
async def test_ai_chat_fallback():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.post("/api/v1/agent/chat", json={"message": "What is my Profit & Loss summary for this month?"})
        assert res.status_code == 200
        data = res.json()
        assert data["success"] is True
        assert "financial summary" in data["data"]["reply"].lower()
