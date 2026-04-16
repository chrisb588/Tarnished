import io
import json


def test_get_merchant_success(client):
    response = client.get("/api/profile/11111111-1111-1111-1111-111111111111")
    assert response.status_code == 200
    data = response.json()["data"]
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


def test_get_merchant_when_not_found(client):
    response = client.get("/api/profile/67676767-6767-6767-6767-676767676767")
    assert response.status_code == 400


def test_update_merchant_success(client):
    response = client.put(
        "/api/profile/11111111-1111-1111-1111-111111111111",
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
    )
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == "11111111-1111-1111-1111-111111111111"
    assert data["name"] == "Test Merchant"
    assert data["phone_number"] == "+639123456789"
    assert data["latitude"] == 10.3157
    assert data["longitude"] == 123.8854
    assert data["start_operating_time"] == "08:00:00"
    assert data["end_operating_time"] == "17:00:00"
    assert data["operating_days"] == ["Mon", "Wed", "Fri"]
    assert data["location"] == "Cebu City"
    assert "location_photo" in data
    assert data["category"] == ["vegetable"]


def test_update_merchant_when_not_found(client):
    response = client.put(
        "/api/profile/67676767-6767-6767-6767-676767676767",
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
    )
    assert response.status_code == 400


def test_update_merchant_unprocessable_payload(client):
    # Invalid phone number
    response = client.put(
        "/api/profile/11111111-1111-1111-1111-111111111111",
        data={
            "name": "Test Merchant",
            "phone_number": "67",
            "latitude": "not a latitude",
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
    assert response.status_code == 422

    # Invalid latitude
    response = client.put(
        "/api/profile/11111111-1111-1111-1111-111111111111",
        data={
            "name": "Test Merchant",
            "phone_number": "+639123456789",
            "latitude": "not a latitude",
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
    assert response.status_code == 422

    # Invalid longitude
    response = client.put(
        "/api/profile/11111111-1111-1111-1111-111111111111",
        data={
            "name": "Test Merchant",
            "phone_number": "+639123456789",
            "latitude": 10.3157,
            "longitude": "not a longitude",
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
    assert response.status_code == 422

    # Invalid start operating time
    response = client.put(
        "/api/profile/11111111-1111-1111-1111-111111111111",
        data={
            "name": "Test Merchant",
            "phone_number": "+639123456789",
            "latitude": 10.3157,
            "longitude": 123.8854,
            "start_operating_time": "08:0:0",
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
    assert response.status_code == 422

    # Invalid end operating time
    response = client.put(
        "/api/profile/11111111-1111-1111-1111-111111111111",
        data={
            "name": "Test Merchant",
            "phone_number": "+639123456789",
            "latitude": 10.3157,
            "longitude": 123.8854,
            "start_operating_time": "08:00:00",
            "end_operating_time": "17:0:0",
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
    assert response.status_code == 422

    # Invalid location photo
    response = client.put(
        "/api/profile/11111111-1111-1111-1111-111111111111",
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
        files={"location_photo": "invalid-photo"},
    )
    assert response.status_code == 422

    # Invalid operating days
    response = client.put(
        "/api/profile/11111111-1111-1111-1111-111111111111",
        data={
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
    )
    assert response.status_code == 422


def test_update_merchant_incomplete_payload(client):
    # No name
    response = client.put(
        "/api/profile/11111111-1111-1111-1111-111111111111",
        data={
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
    assert response.status_code == 422

    # No phone number
    response = client.put(
        "/api/profile/11111111-1111-1111-1111-111111111111",
        data={
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
    )
    assert response.status_code == 422

    # No latitude
    response = client.put(
        "/api/profile/11111111-1111-1111-1111-111111111111",
        data={
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
    )
    assert response.status_code == 422

    # No longitude
    response = client.put(
        "/api/profile/11111111-1111-1111-1111-111111111111",
        data={
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
    )
    assert response.status_code == 422

    # No start operating time
    response = client.put(
        "/api/profile/11111111-1111-1111-1111-111111111111",
        data={
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
    )
    assert response.status_code == 422

    # No end operating time
    response = client.put(
        "/api/profile/11111111-1111-1111-1111-111111111111",
        data={
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
    )
    assert response.status_code == 422

    # No operating days
    response = client.put(
        "/api/profile/11111111-1111-1111-1111-111111111111",
        data={
            "name": "Test Merchant",
            "phone_number": "+639123456789",
            "latitude": 10.3157,
            "longitude": 123.8854,
            "start_operating_time": "08:00:00",
            "end_operating_time": "17:00:00",
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
    assert response.status_code == 422

    # No location
    response = client.put(
        "/api/profile/11111111-1111-1111-1111-111111111111",
        data={
            "name": "Test Merchant",
            "phone_number": "+639123456789",
            "latitude": 10.3157,
            "longitude": 123.8854,
            "start_operating_time": "08:00:00",
            "end_operating_time": "17:00:00",
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
    )
    assert response.status_code == 422

    # No category
    response = client.put(
        "/api/profile/11111111-1111-1111-1111-111111111111",
        data={
            "name": "Test Merchant",
            "phone_number": "+639123456789",
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
