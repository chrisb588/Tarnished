import io
import json
import os
from datetime import datetime, timedelta, timezone

import jwt
from dotenv import load_dotenv

load_dotenv(
    dotenv_path=os.path.join(os.path.dirname(__file__), ".env.test"), override=True
)


def test_login_admin_success(client):
    response = client.post(
        "/api/admin/auth/login",
        json={
            "username": os.getenv("ADMIN_USERNAME", ""),
            "password": os.getenv("ADMIN_PASSWORD", ""),
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data


def test_login_admin_invalid_credentials(client):
    response = client.post(
        "/api/admin/auth/login",
        json={
            "username": "not the correct username",
            "password": "not the correct password",
        },
    )
    assert response.status_code == 401


def test_login_admin_incomplete_payload(client):
    # No username
    response = client.post(
        "/api/admin/auth/login",
        json={
            "password": os.getenv("ADMIN_PASSWORD", ""),
        },
    )
    assert response.status_code == 422

    # No password
    response = client.post(
        "/api/admin/auth/login",
        json={
            "username": os.getenv("ADMIN_USERNAME", ""),
        },
    )
    assert response.status_code == 422


def test_is_admin_authenticated_success(client):
    response = client.get(
        "/api/admin/auth/verify",
        headers={"Authorization": f"Bearer {generate_test_admin_token()}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["valid"]


def test_is_admin_authenticated_invalid_token(client):
    response = client.get(
        "/api/admin/auth/verify",
        headers={"Authorization": "Bearer not-the-correct-token"},
    )
    assert response.status_code == 401
    data = response.json()
    assert data["detail"] == "Invalid token"


def test_is_admin_authenticated_invalid_header(client):
    response = client.get(
        "/api/admin/auth/verify",
        headers={"Some-Header": f"Bearer {generate_test_admin_token()}"},
    )
    assert response.status_code == 401
    data = response.json()
    assert data["detail"] == "Not authenticated"


def test_is_admin_authenticated_no_bearer_prefix(client):
    response = client.get(
        "/api/admin/auth/verify",
        headers={"Authorization": generate_test_admin_token()},
    )
    assert response.status_code == 401
    data = response.json()
    assert data["detail"] == "Not authenticated"


def test_is_admin_authenticated_no_token(client):
    response = client.get(
        "/api/admin/auth/verify",
    )
    assert response.status_code == 401
    data = response.json()
    assert data["detail"] == "Not authenticated"


def test_is_admin_authenticated_expired_token(client):
    response = client.get(
        "/api/admin/auth/verify",
        headers={
            "Authorization": f"Bearer {generate_test_admin_token(exp_timedelta=timedelta(seconds=-1))}"
        },
    )
    assert response.status_code == 401
    data = response.json()
    assert data["detail"] == "Token expired"


def test_create_merchant_success(client):
    response = client.post(
        "/api/admin/create",
        data={
            "email": "email@example.com",
            "name": "Test Merchant",
            "phone_number": "+639123456789",
            "latitude": 10.3157,
            "longitude": 123.8854,
            "start_operating_time": "08:00:00",
            "end_operating_time": "17:00:00",
            "operating_days": json.dumps(["Mon", "Wed", "Fri"]),
            "location": "Cebu City",
            "category": json.dumps(["vegetable"]),
        },
        files={
            "location_photo": (
                "test.jpg",
                io.BytesIO(b"fake-image-bytes"),
                "image/jpeg",
            ),
        },
        headers={"Authorization": f"Bearer {generate_test_admin_token()}"},
    )

    assert response.status_code == 200
    data = response.json()
    assert "uuid" in data
    assert data["email"] == "email@example.com"
    assert "temp_password" in data


def test_create_merchant_unprocessable_payload(client):
    # Test invalid email
    response = client.post(
        "/api/admin/create",
        data={
            "email": "not-an-email",
            "name": "Test Merchant",
            "phone_number": "+639123456789",
            "latitude": 10.3157,
            "longitude": 123.8854,
            "start_operating_time": "08:00:00",
            "end_operating_time": "17:00:00",
            "operating_days": json.dumps(["Mon"]),
            "location": "Cebu City",
            "category": json.dumps(["vegetable"]),
        },
        files={
            "location_photo": (
                "test.jpg",
                io.BytesIO(b"fake-image-bytes"),
                "image/jpeg",
            ),
        },
        headers={"Authorization": f"Bearer {generate_test_admin_token()}"},
    )
    assert response.status_code == 422

    # Test invalid phone number
    response = client.post(
        "/api/admin/create",
        data={
            "email": "merchant@example.com",
            "name": "Test Merchant",
            "phone_number": "67",
            "latitude": 10.3157,
            "longitude": 123.8854,
            "start_operating_time": "08:00:00",
            "end_operating_time": "17:00:00",
            "operating_days": json.dumps(["Mon"]),
            "location": "Cebu City",
            "category": json.dumps(["vegetable"]),
        },
        files={
            "location_photo": (
                "test.jpg",
                io.BytesIO(b"fake-image-bytes"),
                "image/jpeg",
            ),
        },
        headers={"Authorization": f"Bearer {generate_test_admin_token()}"},
    )
    assert response.status_code == 422

    # Test invalid latitude
    response = client.post(
        "/api/admin/create",
        data={
            "email": "merchant@example.com",
            "name": "Test Merchant",
            "phone_number": "+639123456789",
            "latitude": "not-a-coordinate",
            "longitude": 123.8854,
            "start_operating_time": "08:00:00",
            "end_operating_time": "17:00:00",
            "operating_days": json.dumps(["Mon"]),
            "location": "Cebu City",
            "category": json.dumps(["vegetable"]),
        },
        files={
            "location_photo": (
                "test.jpg",
                io.BytesIO(b"fake-image-bytes"),
                "image/jpeg",
            ),
        },
        headers={"Authorization": f"Bearer {generate_test_admin_token()}"},
    )
    assert response.status_code == 422

    # Test invalid longitude
    response = client.post(
        "/api/admin/create",
        data={
            "email": "merchant@example.com",
            "name": "Test Merchant",
            "phone_number": "+639123456789",
            "latitude": 10.3157,
            "longitude": "not-a-coordinate",
            "start_operating_time": "08:00:00",
            "end_operating_time": "17:00:00",
            "operating_days": json.dumps(["Mon"]),
            "location": "Cebu City",
            "category": json.dumps(["vegetable"]),
        },
        files={
            "location_photo": (
                "test.jpg",
                io.BytesIO(b"fake-image-bytes"),
                "image/jpeg",
            ),
        },
        headers={"Authorization": f"Bearer {generate_test_admin_token()}"},
    )
    assert response.status_code == 422

    # Test invalid start operating time
    response = client.post(
        "/api/admin/create",
        data={
            "email": "merchant@example.com",
            "name": "Test Merchant",
            "phone_number": "+639123456789",
            "latitude": 10.3157,
            "longitude": 123.8854,
            "start_operating_time": "08:0:0",
            "end_operating_time": "17:00:00",
            "operating_days": json.dumps(["Mon"]),
            "location": "Cebu City",
            "category": json.dumps(["vegetable"]),
        },
        files={
            "location_photo": (
                "test.jpg",
                io.BytesIO(b"fake-image-bytes"),
                "image/jpeg",
            ),
        },
        headers={"Authorization": f"Bearer {generate_test_admin_token()}"},
    )
    assert response.status_code == 422

    # Test invalid end operating time
    response = client.post(
        "/api/admin/create",
        data={
            "email": "merchant@example.com",
            "name": "Test Merchant",
            "phone_number": "+639123456789",
            "latitude": 10.3157,
            "longitude": 123.8854,
            "start_operating_time": "08:00:00",
            "end_operating_time": "17:0:0",
            "operating_days": json.dumps(["Mon"]),
            "location": "Cebu City",
            "category": json.dumps(["vegetable"]),
        },
        files={
            "location_photo": (
                "test.jpg",
                io.BytesIO(b"fake-image-bytes"),
                "image/jpeg",
            ),
        },
        headers={"Authorization": f"Bearer {generate_test_admin_token()}"},
    )
    assert response.status_code == 422

    # Test invalid operating days
    response = client.post(
        "/api/admin/create",
        data={
            "email": "merchant@example.com",
            "name": "Test Merchant",
            "phone_number": "+639123456789",
            "latitude": 10.3157,
            "longitude": 123.8854,
            "start_operating_time": "08:00:00",
            "end_operating_time": "17:00:00",
            "operating_days": json.dumps(["Monday"]),
            "location": "Cebu City",
            "category": json.dumps(["vegetable"]),
        },
        files={
            "location_photo": (
                "test.jpg",
                io.BytesIO(b"fake-image-bytes"),
                "image/jpeg",
            ),
        },
        headers={"Authorization": f"Bearer {generate_test_admin_token()}"},
    )
    assert response.status_code == 422

    # Test invalid location photo
    response = client.post(
        "/api/admin/create",
        data={
            "email": "merchant@example.com",
            "name": "Test Merchant",
            "phone_number": "+639123456789",
            "latitude": 10.3157,
            "longitude": 123.8854,
            "start_operating_time": "08:00:00",
            "end_operating_time": "17:00:00",
            "operating_days": json.dumps(["Mon"]),
            "location": "Cebu City",
            "category": json.dumps(["vegetable"]),
        },
        files={"location_photo": "invalid-photo"},
        headers={"Authorization": f"Bearer {generate_test_admin_token()}"},
    )
    assert response.status_code == 422

    # Test invalid category
    response = client.post(
        "/api/admin/create",
        data={
            "email": "merchant@example.com",
            "name": "Test Merchant",
            "phone_number": "+639123456789",
            "latitude": 10.3157,
            "longitude": 123.8854,
            "start_operating_time": "08:00:00",
            "end_operating_time": "17:00:00",
            "operating_days": json.dumps(["Mon"]),
            "location": "Cebu City",
            "category": json.dumps(["veggies"]),
        },
        files={
            "location_photo": (
                "test.jpg",
                io.BytesIO(b"fake-image-bytes"),
                "image/jpeg",
            ),
        },
        headers={"Authorization": f"Bearer {generate_test_admin_token()}"},
    )
    assert response.status_code == 422


def test_create_merchant_user_already_exists(client):
    data = {
        "email": "duplicate@example.com",
        "name": "Test Merchant",
        "phone_number": "+639123456789",
        "latitude": 10.3157,
        "longitude": 123.8854,
        "start_operating_time": "08:00:00",
        "end_operating_time": "17:00:00",
        "operating_days": json.dumps(["Mon"]),
        "location": "Cebu City",
        "category": json.dumps(["vegetable"]),
    }
    files = {
        "location_photo": ("test.jpg", io.BytesIO(b"fake-image-bytes"), "image/jpeg")
    }
    headers = {"Authorization": f"Bearer {generate_test_admin_token()}"}

    client.post("/api/admin/create", data=data, files=files, headers=headers)

    files = {
        "location_photo": ("test.jpg", io.BytesIO(b"fake-image-bytes"), "image/jpeg")
    }
    response = client.post("/api/admin/create", data=data, files=files, headers=headers)

    assert response.status_code == 400


def test_create_merchant_incomplete_payload(client):
    # No email
    response = client.post(
        "/api/admin/create",
        data={
            "name": "Test Merchant",
            "phone_number": "+639123456789",
            "latitude": 10.3157,
            "longitude": 123.8854,
            "start_operating_time": "08:00:00",
            "end_operating_time": "17:00:00",
            "operating_days": json.dumps(["Mon", "Wed", "Fri"]),
            "location": "Cebu City",
            "category": json.dumps(["vegetable"]),
        },
        files={
            "location_photo": (
                "test.jpg",
                io.BytesIO(b"fake-image-bytes"),
                "image/jpeg",
            ),
        },
        headers={"Authorization": f"Bearer {generate_test_admin_token()}"},
    )
    assert response.status_code == 422

    # No name
    response = client.post(
        "/api/admin/create",
        data={
            "email": "merchant@example.com",
            "phone_number": "+639123456789",
            "latitude": 10.3157,
            "longitude": 123.8854,
            "start_operating_time": "08:00:00",
            "end_operating_time": "17:00:00",
            "operating_days": json.dumps(["Mon", "Wed", "Fri"]),
            "location": "Cebu City",
            "category": json.dumps(["vegetable"]),
        },
        files={
            "location_photo": (
                "test.jpg",
                io.BytesIO(b"fake-image-bytes"),
                "image/jpeg",
            ),
        },
        headers={"Authorization": f"Bearer {generate_test_admin_token()}"},
    )
    assert response.status_code == 422

    # No phone number
    response = client.post(
        "/api/admin/create",
        data={
            "email": "merchant@example.com",
            "name": "Test Merchant",
            "latitude": 10.3157,
            "longitude": 123.8854,
            "start_operating_time": "08:00:00",
            "end_operating_time": "17:00:00",
            "operating_days": json.dumps(["Mon", "Wed", "Fri"]),
            "location": "Cebu City",
            "category": json.dumps(["vegetable"]),
        },
        files={
            "location_photo": (
                "test.jpg",
                io.BytesIO(b"fake-image-bytes"),
                "image/jpeg",
            ),
        },
        headers={"Authorization": f"Bearer {generate_test_admin_token()}"},
    )
    assert response.status_code == 422

    # No latitude
    response = client.post(
        "/api/admin/create",
        data={
            "email": "merchant@example.com",
            "name": "Test Merchant",
            "phone_number": "+639123456789",
            "longitude": 123.8854,
            "start_operating_time": "08:00:00",
            "end_operating_time": "17:00:00",
            "operating_days": json.dumps(["Mon", "Wed", "Fri"]),
            "location": "Cebu City",
            "category": json.dumps(["vegetable"]),
        },
        files={
            "location_photo": (
                "test.jpg",
                io.BytesIO(b"fake-image-bytes"),
                "image/jpeg",
            ),
        },
        headers={"Authorization": f"Bearer {generate_test_admin_token()}"},
    )
    assert response.status_code == 422

    # No longitude
    response = client.post(
        "/api/admin/create",
        data={
            "email": "merchant@example.com",
            "name": "Test Merchant",
            "phone_number": "+639123456789",
            "latitude": 10.3157,
            "start_operating_time": "08:00:00",
            "end_operating_time": "17:00:00",
            "operating_days": json.dumps(["Mon", "Wed", "Fri"]),
            "location": "Cebu City",
            "category": json.dumps(["vegetable"]),
        },
        files={
            "location_photo": (
                "test.jpg",
                io.BytesIO(b"fake-image-bytes"),
                "image/jpeg",
            ),
        },
        headers={"Authorization": f"Bearer {generate_test_admin_token()}"},
    )
    assert response.status_code == 422

    # No start operating time
    response = client.post(
        "/api/admin/create",
        data={
            "email": "merchant@example.com",
            "name": "Test Merchant",
            "phone_number": "+639123456789",
            "latitude": 10.3157,
            "longitude": 123.8854,
            "end_operating_time": "17:00:00",
            "operating_days": json.dumps(["Mon", "Wed", "Fri"]),
            "location": "Cebu City",
            "category": json.dumps(["vegetable"]),
        },
        files={
            "location_photo": (
                "test.jpg",
                io.BytesIO(b"fake-image-bytes"),
                "image/jpeg",
            ),
        },
        headers={"Authorization": f"Bearer {generate_test_admin_token()}"},
    )
    assert response.status_code == 422

    # No end operating time
    response = client.post(
        "/api/admin/create",
        data={
            "email": "merchant@example.com",
            "name": "Test Merchant",
            "phone_number": "+639123456789",
            "latitude": 10.3157,
            "longitude": 123.8854,
            "start_operating_time": "08:00:00",
            "operating_days": json.dumps(["Mon", "Wed", "Fri"]),
            "location": "Cebu City",
            "category": json.dumps(["vegetable"]),
        },
        files={
            "location_photo": (
                "test.jpg",
                io.BytesIO(b"fake-image-bytes"),
                "image/jpeg",
            ),
        },
        headers={"Authorization": f"Bearer {generate_test_admin_token()}"},
    )
    assert response.status_code == 422

    # No location
    response = client.post(
        "/api/admin/create",
        data={
            "email": "merchant@example.com",
            "name": "Test Merchant",
            "phone_number": "+639123456789",
            "latitude": 10.3157,
            "longitude": 123.8854,
            "start_operating_time": "08:00:00",
            "end_operating_time": "18:00:00",
            "operating_days": json.dumps(["Mon", "Wed", "Fri"]),
            "category": json.dumps(["vegetable"]),
        },
        files={
            "location_photo": (
                "test.jpg",
                io.BytesIO(b"fake-image-bytes"),
                "image/jpeg",
            ),
        },
        headers={"Authorization": f"Bearer {generate_test_admin_token()}"},
    )
    assert response.status_code == 422

    # No location photo
    response = client.post(
        "/api/admin/create",
        data={
            "email": "merchant@example.com",
            "name": "Test Merchant",
            "phone_number": "+639123456789",
            "latitude": 10.3157,
            "longitude": 123.8854,
            "start_operating_time": "08:00:00",
            "operating_days": json.dumps(["Mon", "Wed", "Fri"]),
            "location": "Cebu City",
            "category": json.dumps(["vegetable"]),
        },
        headers={"Authorization": f"Bearer {generate_test_admin_token()}"},
    )
    assert response.status_code == 422

    # No operating days
    response = client.post(
        "/api/admin/create",
        data={
            "email": "merchant@example.com",
            "name": "Test Merchant",
            "phone_number": "+639123456789",
            "latitude": 10.3157,
            "longitude": 123.8854,
            "start_operating_time": "08:00:00",
            "end_operating_time": "18:00:00",
            "location": "Cebu City",
            "category": json.dumps(["vegetable"]),
        },
        files={
            "location_photo": (
                "test.jpg",
                io.BytesIO(b"fake-image-bytes"),
                "image/jpeg",
            ),
        },
        headers={"Authorization": f"Bearer {generate_test_admin_token()}"},
    )
    assert response.status_code == 422

    # No category
    response = client.post(
        "/api/admin/create",
        data={
            "email": "merchant@example.com",
            "name": "Test Merchant",
            "phone_number": "+639123456789",
            "latitude": 10.3157,
            "longitude": 123.8854,
            "start_operating_time": "08:00:00",
            "end_operating_time": "18:00:00",
            "operating_days": json.dumps(["Mon", "Wed", "Fri"]),
            "location": "Cebu City",
        },
        files={
            "location_photo": (
                "test.jpg",
                io.BytesIO(b"fake-image-bytes"),
                "image/jpeg",
            ),
        },
        headers={"Authorization": f"Bearer {generate_test_admin_token()}"},
    )
    assert response.status_code == 422


def test_create_merchant_no_headers(client):
    response = client.post(
        "/api/admin/create",
        data={
            "email": "email@example.com",
            "name": "Test Merchant",
            "phone_number": "+639123456789",
            "latitude": 10.3157,
            "longitude": 123.8854,
            "start_operating_time": "08:00:00",
            "end_operating_time": "17:00:00",
            "operating_days": json.dumps(["Mon", "Wed", "Fri"]),
            "location": "Cebu City",
            "category": json.dumps(["vegetable"]),
        },
        files={
            "location_photo": (
                "test.jpg",
                io.BytesIO(b"fake-image-bytes"),
                "image/jpeg",
            ),
        },
    )
    assert response.status_code == 401
    data = response.json()
    assert data["detail"] == "Not authenticated"


def test_create_merchant_invalid_headers(client):
    # Invalid authorization header label
    response = client.post(
        "/api/admin/create",
        data={
            "email": "email@example.com",
            "name": "Test Merchant",
            "phone_number": "+639123456789",
            "latitude": 10.3157,
            "longitude": 123.8854,
            "start_operating_time": "08:00:00",
            "end_operating_time": "17:00:00",
            "operating_days": json.dumps(["Mon", "Wed", "Fri"]),
            "location": "Cebu City",
            "category": json.dumps(["vegetable"]),
        },
        files={
            "location_photo": (
                "test.jpg",
                io.BytesIO(b"fake-image-bytes"),
                "image/jpeg",
            ),
        },
        headers={"Some-Header": f"Bearer {generate_test_admin_token()}"},
    )
    assert response.status_code == 401
    data = response.json()
    assert data["detail"] == "Not authenticated"

    # No bearer prefix
    response = client.post(
        "/api/admin/create",
        data={
            "email": "email@example.com",
            "name": "Test Merchant",
            "phone_number": "+639123456789",
            "latitude": 10.3157,
            "longitude": 123.8854,
            "start_operating_time": "08:00:00",
            "end_operating_time": "17:00:00",
            "operating_days": json.dumps(["Mon", "Wed", "Fri"]),
            "location": "Cebu City",
            "category": json.dumps(["vegetable"]),
        },
        files={
            "location_photo": (
                "test.jpg",
                io.BytesIO(b"fake-image-bytes"),
                "image/jpeg",
            ),
        },
        headers={"Authorization": generate_test_admin_token()},
    )
    assert response.status_code == 401
    data = response.json()
    assert data["detail"] == "Not authenticated"


def test_create_merchant_invalid_token(client):
    response = client.post(
        "/api/admin/create",
        data={
            "email": "email@example.com",
            "name": "Test Merchant",
            "phone_number": "+639123456789",
            "latitude": 10.3157,
            "longitude": 123.8854,
            "start_operating_time": "08:00:00",
            "end_operating_time": "17:00:00",
            "operating_days": json.dumps(["Mon", "Wed", "Fri"]),
            "location": "Cebu City",
            "category": json.dumps(["vegetable"]),
        },
        files={
            "location_photo": (
                "test.jpg",
                io.BytesIO(b"fake-image-bytes"),
                "image/jpeg",
            ),
        },
        headers={"Authorization": "Bearer not-the-correct-token"},
    )
    assert response.status_code == 401
    data = response.json()
    assert data["detail"] == "Invalid token"


def test_create_merchant_expired_token(client):
    response = client.post(
        "/api/admin/create",
        data={
            "email": "email@example.com",
            "name": "Test Merchant",
            "phone_number": "+639123456789",
            "latitude": 10.3157,
            "longitude": 123.8854,
            "start_operating_time": "08:00:00",
            "end_operating_time": "17:00:00",
            "operating_days": json.dumps(["Mon", "Wed", "Fri"]),
            "location": "Cebu City",
            "category": json.dumps(["vegetable"]),
        },
        files={
            "location_photo": (
                "test.jpg",
                io.BytesIO(b"fake-image-bytes"),
                "image/jpeg",
            ),
        },
        headers={
            "Authorization": f"Bearer {generate_test_admin_token(exp_timedelta=timedelta(seconds=-1))}"
        },
    )
    assert response.status_code == 401
    data = response.json()
    assert data["detail"] == "Token expired"


def test_delete_merchant_success(client):
    # Create the user first
    response = client.post(
        "/api/admin/create",
        data={
            "email": "email@example.com",
            "name": "Test Merchant",
            "phone_number": "+639123456789",
            "latitude": 10.3157,
            "longitude": 123.8854,
            "start_operating_time": "08:00:00",
            "end_operating_time": "17:00:00",
            "operating_days": json.dumps(["Mon", "Wed", "Fri"]),
            "location": "Cebu City",
            "category": json.dumps(["vegetable"]),
        },
        files={
            "location_photo": (
                "test.jpg",
                io.BytesIO(b"fake-image-bytes"),
                "image/jpeg",
            ),
        },
        headers={"Authorization": f"Bearer {generate_test_admin_token()}"},
    )
    assert response.status_code == 200
    user = response.json()

    response = client.delete(
        f"/api/admin/delete/{user['uuid']}",
        headers={"Authorization": f"Bearer {generate_test_admin_token()}"},
    )
    assert response.status_code == 200


def test_delete_merchant_when_not_found(client):
    from uuid import uuid4

    response = client.delete(
        f"/api/admin/delete/{uuid4()}",
        headers={"Authorization": f"Bearer {generate_test_admin_token()}"},
    )
    assert response.status_code == 400


def test_delete_merchant_no_headers(client):
    # Create the user first
    response = client.post(
        "/api/admin/create",
        data={
            "email": "email@example.com",
            "name": "Test Merchant",
            "phone_number": "+639123456789",
            "latitude": 10.3157,
            "longitude": 123.8854,
            "start_operating_time": "08:00:00",
            "end_operating_time": "17:00:00",
            "operating_days": json.dumps(["Mon", "Wed", "Fri"]),
            "location": "Cebu City",
            "category": json.dumps(["vegetable"]),
        },
        files={
            "location_photo": (
                "test.jpg",
                io.BytesIO(b"fake-image-bytes"),
                "image/jpeg",
            ),
        },
        headers={"Authorization": f"Bearer {generate_test_admin_token()}"},
    )
    assert response.status_code == 200
    user = response.json()

    response = client.delete(
        f"/api/admin/delete/{user['uuid']}",
    )
    assert response.status_code == 401
    data = response.json()
    assert data["detail"] == "Not authenticated"


def test_delete_merchant_invalid_headers(client):
    # Create the user first
    response = client.post(
        "/api/admin/create",
        data={
            "email": "email@example.com",
            "name": "Test Merchant",
            "phone_number": "+639123456789",
            "latitude": 10.3157,
            "longitude": 123.8854,
            "start_operating_time": "08:00:00",
            "end_operating_time": "17:00:00",
            "operating_days": json.dumps(["Mon", "Wed", "Fri"]),
            "location": "Cebu City",
            "category": json.dumps(["vegetable"]),
        },
        files={
            "location_photo": (
                "test.jpg",
                io.BytesIO(b"fake-image-bytes"),
                "image/jpeg",
            ),
        },
        headers={"Authorization": f"Bearer {generate_test_admin_token()}"},
    )
    assert response.status_code == 200
    user = response.json()

    # Invalid authorization header label
    response = client.delete(
        f"/api/admin/delete/{user['uuid']}",
        headers={"Some-Header": f"Bearer {generate_test_admin_token()}"},
    )
    assert response.status_code == 401
    data = response.json()
    assert data["detail"] == "Not authenticated"

    # No bearer prefix
    response = client.delete(
        f"/api/admin/delete/{user['uuid']}",
        headers={"Authorization": generate_test_admin_token()},
    )
    assert response.status_code == 401
    data = response.json()
    assert data["detail"] == "Not authenticated"


def test_delete_merchant_invalid_token(client):
    # Create the user first
    response = client.post(
        "/api/admin/create",
        data={
            "email": "email@example.com",
            "name": "Test Merchant",
            "phone_number": "+639123456789",
            "latitude": 10.3157,
            "longitude": 123.8854,
            "start_operating_time": "08:00:00",
            "end_operating_time": "17:00:00",
            "operating_days": json.dumps(["Mon", "Wed", "Fri"]),
            "location": "Cebu City",
            "category": json.dumps(["vegetable"]),
        },
        files={
            "location_photo": (
                "test.jpg",
                io.BytesIO(b"fake-image-bytes"),
                "image/jpeg",
            ),
        },
        headers={"Authorization": f"Bearer {generate_test_admin_token()}"},
    )
    assert response.status_code == 200
    user = response.json()

    response = client.delete(
        f"/api/admin/delete/{user['uuid']}",
        headers={"Authorization": "Bearer not-the-correct-token"},
    )
    assert response.status_code == 401
    data = response.json()
    assert data["detail"] == "Invalid token"


def test_delete_merchant_expired_token(client):
    # Create the user first
    response = client.post(
        "/api/admin/create",
        data={
            "email": "email@example.com",
            "name": "Test Merchant",
            "phone_number": "+639123456789",
            "latitude": 10.3157,
            "longitude": 123.8854,
            "start_operating_time": "08:00:00",
            "end_operating_time": "17:00:00",
            "operating_days": json.dumps(["Mon", "Wed", "Fri"]),
            "location": "Cebu City",
            "category": json.dumps(["vegetable"]),
        },
        files={
            "location_photo": (
                "test.jpg",
                io.BytesIO(b"fake-image-bytes"),
                "image/jpeg",
            ),
        },
        headers={"Authorization": f"Bearer {generate_test_admin_token()}"},
    )
    assert response.status_code == 200
    user = response.json()

    response = client.delete(
        f"/api/admin/delete/{user['uuid']}",
        headers={
            "Authorization": f"Bearer {generate_test_admin_token(exp_timedelta=timedelta(seconds=-1))}"
        },
    )
    assert response.status_code == 401
    data = response.json()
    assert data["detail"] == "Token expired"


def test_get_all_merchants_success(client):
    response = client.get(
        "/api/admin/merchants",
        headers={"Authorization": f"Bearer {generate_test_admin_token()}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    data = data[0]
    assert data["id"] == "11111111-1111-1111-1111-111111111111"
    assert data["name"] == "Sample Merchant"
    assert data["phone_number"] == "+639123456789"
    assert data["latitude"] == 10.3157
    assert data["longitude"] == 123.8854
    assert data["start_operating_time"] == "08:00:00"
    assert data["end_operating_time"] == "18:00:00"
    assert data["operating_days"] == ["Mon", "Wed", "Fri"]
    assert data["location"] == "Cebu City, Philippines"
    assert (
        data["location_photo"]
        == "http://127.0.0.1:54321/storage/v1/object/public/media/11111111-1111-1111-1111-111111111111/profile/22222222-2222-2222-2222-222222222222"
    )
    assert data["category"] == ["vegetable"]


def test_get_all_merchants_no_headers(client):
    response = client.get(
        "/api/admin/merchants",
    )
    assert response.status_code == 401
    data = response.json()
    assert data["detail"] == "Not authenticated"


def test_get_all_merchants_invalid_headers(client):
    # Invalid authorization header label
    response = client.get(
        "/api/admin/merchants",
        headers={"Some-Header": f"Bearer {generate_test_admin_token()}"},
    )
    assert response.status_code == 401
    data = response.json()
    assert data["detail"] == "Not authenticated"

    # No bearer prefix
    response = client.get(
        "/api/admin/merchants",
        headers={"Authorization": generate_test_admin_token()},
    )
    assert response.status_code == 401
    data = response.json()
    assert data["detail"] == "Not authenticated"


def test_get_all_merchants_invalid_token(client):
    response = client.get(
        "/api/admin/merchants",
        headers={"Authorization": "Bearer not-the-correct-token"},
    )
    assert response.status_code == 401
    data = response.json()
    assert data["detail"] == "Invalid token"


def test_get_all_merchants_expired_token(client):
    response = client.get(
        "/api/admin/merchants",
        headers={
            "Authorization": f"Bearer {generate_test_admin_token(exp_timedelta=timedelta(seconds=-1))}"
        },
    )
    assert response.status_code == 401
    data = response.json()
    assert data["detail"] == "Token expired"


def generate_test_admin_token(exp_timedelta: timedelta = timedelta(hours=1)):
    return jwt.encode(
        {"sub": "admin", "exp": datetime.now(timezone.utc) + exp_timedelta},
        os.getenv("ADMIN_JWT_SECRET", ""),
        algorithm="HS256",
    )
