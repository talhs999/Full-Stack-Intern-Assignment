import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.pool import StaticPool
from app.database import Base, get_db
from app.services.crud import seed_initial_data

# Isolated in-memory async SQLite engine for robust, fast unit testing
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"
test_engine = create_async_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestSessionLocal = async_sessionmaker(test_engine, class_=AsyncSession, expire_on_commit=False)

async def override_get_db():
    async with TestSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

app.dependency_overrides[get_db] = override_get_db

@pytest_asyncio.fixture(autouse=True)
async def init_test_db():
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    async with TestSessionLocal() as db:
        await seed_initial_data(db)
    yield
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


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

@pytest.mark.asyncio
async def test_download_pdf_statement():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        cats_res = await client.get("/api/v1/categories")
        cat_id = cats_res.json()["data"][0]["id"]
        accts_res = await client.get("/api/v1/accounts")
        acct_id = accts_res.json()["data"][0]["id"]
        await client.post("/api/v1/transactions", json={
            "date": "2026-07-28",
            "amount": 50000,
            "type": "expense",
            "description": "Office rent payment",
            "account_id": acct_id,
            "category_id": cat_id
        })
        res = await client.get("/api/v1/reports/statement/pdf?period=month")
        assert res.status_code == 200
        assert res.headers["content-type"] == "application/pdf"
        assert len(res.content) > 500  # valid PDF bytes generated

@pytest.mark.asyncio
async def test_download_csv_statement():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        cats_res = await client.get("/api/v1/categories")
        cat_id = cats_res.json()["data"][0]["id"]
        accts_res = await client.get("/api/v1/accounts")
        acct_id = accts_res.json()["data"][0]["id"]
        await client.post("/api/v1/transactions", json={
            "date": "2026-07-28",
            "amount": 50000,
            "type": "expense",
            "description": "Office rent payment",
            "account_id": acct_id,
            "category_id": cat_id
        })
        res = await client.get("/api/v1/reports/statement/csv?period=all")
        assert res.status_code == 200
        assert res.headers["content-type"] == "text/csv; charset=utf-8" or "text/csv" in res.headers["content-type"]
        assert "EXECUTIVE SUMMARY" in res.text
        assert "50000.00" in res.text

@pytest.mark.asyncio
async def test_complete_report_query():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.post("/api/v1/agent/chat", json={"message": "complete report of the month"})
        assert res.status_code == 200
        data = res.json()
        assert data["success"] is True
        assert data["data"]["tool_used"] == "generate_pnl"
        assert "complete financial summary" in data["data"]["reply"].lower()

@pytest.mark.asyncio
async def test_download_statement_query():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.post("/api/v1/agent/chat", json={"message": "complete pdf bhi genrate karo download"})
        assert res.status_code == 200
        data = res.json()
        assert data["success"] is True
        assert data["data"]["tool_used"] == "generate_statement"
        assert "download" in data["data"]["reply"].lower()


