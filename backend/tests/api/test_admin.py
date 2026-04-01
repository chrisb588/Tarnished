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
    )

    assert response.status_code == 200
    data = response.json()
    assert "uuid" in data
    assert data["email"] == "merchant@example.com"
    assert "temp_password" in data


def test_create_merchant_unprocessable_payload(client):
    # Test invalid email
    response = client.post(
        "/api/admin/create",
        data={
            "email": "not-an-email",
            "name": "Test Merchant",
            "latitude": 10.3157,
            "longitude": 123.8854,
            "start_operating_time": "08:00:00",
            "end_operating_time": "17:00:00",
            "operating_days": json.dumps(["Mon"]),
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

    # Test invalid latitude
    response = client.post(
        "/api/admin/create",
        data={
            "email": "not-an-email",
            "name": "Test Merchant",
            "latitude": "not-a-coordinate",
            "longitude": 123.8854,
            "start_operating_time": "08:00:00",
            "end_operating_time": "17:00:00",
            "operating_days": json.dumps(["Mon"]),
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

    # Test invalid longitude
    response = client.post(
        "/api/admin/create",
        data={
            "email": "not-an-email",
            "name": "Test Merchant",
            "latitude": 10.3157,
            "longitude": "not-a-coordinate",
            "start_operating_time": "08:00:00",
            "end_operating_time": "17:00:00",
            "operating_days": json.dumps(["Mon"]),
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

    # Test invalid start operating time
    response = client.post(
        "/api/admin/create",
        data={
            "email": "not-an-email",
            "name": "Test Merchant",
            "latitude": 10.3157,
            "longitude": 123.8854,
            "start_operating_time": "08:0:0",
            "end_operating_time": "17:00:00",
            "operating_days": json.dumps(["Mon"]),
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

    # Test invalid end operating time
    response = client.post(
        "/api/admin/create",
        data={
            "email": "not-an-email",
            "name": "Test Merchant",
            "latitude": 10.3157,
            "longitude": 123.8854,
            "start_operating_time": "08:00:00",
            "end_operating_time": "17:0:0",
            "operating_days": json.dumps(["Mon"]),
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

    # Test invalid operating days
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

    # Test invalid location photo
    response = client.post(
        "/api/admin/create",
        data={
            "email": "not-an-email",
            "name": "Test Merchant",
            "latitude": 10.3157,
            "longitude": 123.8854,
            "start_operating_time": "08:00:00",
            "end_operating_time": "17:00:00",
            "operating_days": json.dumps(["Mon"]),
            "location": "Cebu City",
        },
        files={"location_photo": "invalid-photo"},
    )
    assert response.status_code == 422


def test_create_merchant_user_already_exists(client):
    data = {
        "email": "duplicate@example.com",
        "name": "Test Merchant",
        "latitude": 10.3157,
        "longitude": 123.8854,
        "start_operating_time": "08:00:00",
        "end_operating_time": "17:00:00",
        "operating_days": json.dumps(["Mon"]),
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


def test_create_merchant_incomplete_payload(client):
    # No email
    response = client.post(
        "/api/admin/create",
        data={
            "name": "Test Merchant",
            "latitude": 10.3157,
            "longitude": 123.8854,
            "start_operating_time": "08:00:00",
            "end_operating_time": "17:00:00",
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
    )
    assert response.status_code == 422

    # No name
    response = client.post(
        "/api/admin/create",
        data={
            "email": "merchant@example.com",
            "latitude": 10.3157,
            "longitude": 123.8854,
            "start_operating_time": "08:00:00",
            "end_operating_time": "17:00:00",
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
    )
    assert response.status_code == 422

    # No latitude
    response = client.post(
        "/api/admin/create",
        data={
            "email": "merchant@example.com",
            "name": "Test Merchant",
            "longitude": 123.8854,
            "start_operating_time": "08:00:00",
            "end_operating_time": "17:00:00",
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
    )
    assert response.status_code == 422

    # No longitude
    response = client.post(
        "/api/admin/create",
        data={
            "email": "merchant@example.com",
            "name": "Test Merchant",
            "latitude": 10.3157,
            "start_operating_time": "08:00:00",
            "end_operating_time": "17:00:00",
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
    )
    assert response.status_code == 422

    # No start operating time
    response = client.post(
        "/api/admin/create",
        data={
            "email": "merchant@example.com",
            "name": "Test Merchant",
            "latitude": 10.3157,
            "longitude": 123.8854,
            "end_operating_time": "17:00:00",
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
    )
    assert response.status_code == 422

    # No end operating time
    response = client.post(
        "/api/admin/create",
        data={
            "email": "merchant@example.com",
            "name": "Test Merchant",
            "latitude": 10.3157,
            "longitude": 123.8854,
            "start_operating_time": "08:00:00",
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
    )
    assert response.status_code == 422

    # No location
    response = client.post(
        "/api/admin/create",
        data={
            "email": "merchant@example.com",
            "name": "Test Merchant",
            "latitude": 10.3157,
            "longitude": 123.8854,
            "start_operating_time": "08:00:00",
            "operating_days": json.dumps(["Mon", "Wed", "Fri"]),
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

    # No location photo
    response = client.post(
        "/api/admin/create",
        data={
            "email": "merchant@example.com",
            "name": "Test Merchant",
            "latitude": 10.3157,
            "longitude": 123.8854,
            "start_operating_time": "08:00:00",
            "operating_days": json.dumps(["Mon", "Wed", "Fri"]),
        },
    )
    assert response.status_code == 422


def test_delete_merchant_success(client):
    # Create the user first
    user = client.post(
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
        },
        files={
            "location_photo": (
                "test.jpg",
                io.BytesIO(b"fake-image-bytes"),
                "image/jpeg",
            ),
        },
    )
    user = json.loads(user.content)

    response = client.delete(f"/api/admin/delete/{user['uuid']}")
    assert response.status_code == 200


def test_delete_merchant_when_not_found(client):
    from uuid import uuid4

    response = client.delete(f"/api/admin/delete/{uuid4()}")
    assert response.status_code == 400
