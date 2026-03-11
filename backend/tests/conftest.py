import pytest
from dotenv import load_dotenv

# Load test credentials before importing the app
load_dotenv(".env.test", override=True)

from app.main import app
from fastapi.testclient import TestClient


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c
