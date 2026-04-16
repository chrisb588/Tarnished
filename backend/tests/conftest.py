import os

from dotenv import load_dotenv

load_dotenv(
    dotenv_path=os.path.join(os.path.dirname(__file__), ".env.test"), override=True
)

from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient

from supabase import create_client


@pytest.fixture(scope="session")
def supabase_local():
    SUPABASE_URL = os.getenv("DATABASE_URL", "")
    SUPABASE_SECRET_KEY = os.getenv("SECRET_KEY", "")
    return create_client(SUPABASE_URL, SUPABASE_SECRET_KEY)


@pytest.fixture
def client(supabase_local):
    from app.main import app

    with patch("app.api.admin.supabase_admin", supabase_local):
        with TestClient(app) as c:
            yield c


SEEDED_IDS = {"11111111-1111-1111-1111-111111111111"}

SEEDED_DATA = {
    "merchant": [
        {
            "id": "11111111-1111-1111-1111-111111111111",
            "name": "Sample Merchant",
            "phone_number": "+639123456789",
            "latitude": 10.3157,
            "longitude": 123.8854,
            "start_operating_time": "08:00:00",
            "end_operating_time": "18:00:00",
            "operating_days": ["Mon", "Wed", "Fri"],
            "location": "Cebu City, Philippines",
            "location_photo": "http://127.0.0.1:54321/storage/v1/object/public/media/11111111-1111-1111-1111-111111111111/profile/22222222-2222-2222-2222-222222222222",
            "category": ["vegetable"],
        }
    ],
    # "other_table": [ ... ]
}

TABLES = list(SEEDED_DATA.keys())


@pytest.fixture(autouse=True)
def cleanup(supabase_local):
    yield
    merchants = supabase_local.table("merchant").select("id").execute()
    for merchant in merchants.data:
        if merchant["id"] in SEEDED_IDS:
            continue
        files = supabase_local.storage.from_("media").list(f"{merchant['id']}/profile")
        if files:
            paths = [f"{merchant['id']}/profile/{f['name']}" for f in files]
            supabase_local.storage.from_("media").remove(paths)
        supabase_local.auth.admin.delete_user(merchant["id"])

    for table in reversed(TABLES):
        supabase_local.table(table).delete().neq(
            "id", "00000000-0000-0000-0000-000000000000"
        ).filter("id", "not.in", f"({','.join(SEEDED_IDS)})").execute()

    for table in TABLES:
        supabase_local.table(table).upsert(SEEDED_DATA[table]).execute()
