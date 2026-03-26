import io
import json


def test_create_merchant_success(client):
    response = client.post(
        "/api/admin/create",
        data={
            "email": "merchant@example.com",
            "name": "Test Merchant",
            "latitude": 10.3157,
            "longitude": 123.8854,
            "start_operating_time": "08:00:00",
            "end_operating_time": "17:00:00",
            "operating_days": json.dumps(["Monday", "Wednesday", "Friday"]),
            "location": "Cebu City",
        },
        files={
            "location_photo": (
                "test.jpg",
                io.BytesIO(b"fake-image-bytes"),
                "image/jpeg",
            ),
        },
    )

    assert response.status_code == 200
    data = response.json()
    assert "uuid" in data
    assert data["email"] == "merchant@example.com"
    assert "temp_password" in data


def test_create_merchant_invalid_email(client):
    response = client.post(
        "/api/admin/create",
        data={
            "email": "not-an-email",
            "name": "Test Merchant",
            "latitude": 10.3157,
            "longitude": 123.8854,
            "start_operating_time": "08:00:00",
            "end_operating_time": "17:00:00",
            "operating_days": json.dumps(["Monday"]),
            "location": "Cebu City",
        },
        files={
            "location_photo": (
                "test.jpg",
                io.BytesIO(b"fake-image-bytes"),
                "image/jpeg",
            ),
        },
    )

    assert response.status_code == 422


def test_create_merchant_duplicate_email(client):
    data = {
        "email": "duplicate@example.com",
        "name": "Test Merchant",
        "latitude": 10.3157,
        "longitude": 123.8854,
        "start_operating_time": "08:00:00",
        "end_operating_time": "17:00:00",
        "operating_days": json.dumps(["Monday"]),
        "location": "Cebu City",
    }
    files = {
        "location_photo": ("test.jpg", io.BytesIO(b"fake-image-bytes"), "image/jpeg")
    }

    client.post("/api/admin/create", data=data, files=files)

    files = {
        "location_photo": ("test.jpg", io.BytesIO(b"fake-image-bytes"), "image/jpeg")
    }
    response = client.post("/api/admin/create", data=data, files=files)

    assert response.status_code == 400
