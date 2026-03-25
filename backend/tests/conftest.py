import os
from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient

from supabase import create_client

SUPABASE_URL = os.getenv("DATABASE_URL", "")
SUPABASE_SECRET_KEY = os.getenv("SECRET_KEY", "")


@pytest.fixture(scope="session")
def supabase_local():
    return create_client(SUPABASE_URL, SUPABASE_SECRET_KEY)


@pytest.fixture
def client(supabase_local):
    from app.main import app

    with patch("app.api.admin.supabase_admin", supabase_local):
        with TestClient(app) as c:
            yield c


@pytest.fixture(autouse=True)
def cleanup(supabase_local):
    yield
    merchants = supabase_local.table("merchant").select("id").execute()
    for merchant in merchants.data:
        # List all files under the merchant's folder, then delete them
        files = supabase_local.storage.from_("media").list(f"{merchant['id']}/profile")
        if files:
            paths = [f"{merchant['id']}/profile/{f['name']}" for f in files]
            supabase_local.storage.from_("media").remove(paths)
        supabase_local.auth.admin.delete_user(merchant["id"])
    supabase_local.table("merchant").delete().neq(
        "id", "00000000-0000-0000-0000-000000000000"
    ).execute()
