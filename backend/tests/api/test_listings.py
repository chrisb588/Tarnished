import io

def test_patch_listing_success(client):
    response = client.patch(
        "/api/listings/11111111-1111-1111-1111-111111111112",
        json={"is_sold_out": True},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["is_sold_out"] == True


def test_patch_listing_unprocessable_payload(client):
    # is_sold_out must be True (Literal[True]) — False should be rejected
    response = client.patch(
        "/api/listings/11111111-1111-1111-1111-111111111112",
        json={"is_sold_out": False},
    )
    assert response.status_code == 422

def test_patch_listing_not_found(client):
      response = client.patch(
          "/api/listings/11111111-1111-1111-1111-111111111113",
          json={"is_sold_out": True},
      )
      assert response.status_code == 404


def test_create_listing_success(client):
    response = client.post(
        "/api/listings",
        data={
            "merchant_id": "11111111-1111-1111-1111-111111111111",
            "name": "Test Listing",
            "original_price": 100,
            "discounted_price": 80,
            "unit": "kg",
            "quantity": 67,
            "type": "vegetable",
            "expires_at": "2026-12-31T00:00:00",
        },
        files={
            "image": (
                "test.jpg",
                io.BytesIO(b"fake-image-bytes"),
                "image/jpeg",
            ),
        },
    )

    assert response.status_code == 200
    data = response.json()
    assert "id" in data
    assert data["merchant_id"] == "11111111-1111-1111-1111-111111111111"
    assert data["name"] == "Test Listing"
    assert data["original_price"] == 100
    assert data["discounted_price"] == 80
    assert data["unit"] == "kg"
    assert data["quantity"] == 67
    assert data["type"] == "vegetable"
    assert "image" in data
    assert data["expires_at"] == "2026-12-31T00:00:00"
    assert data["is_sold_out"] == False


def test_create_listing_unprocessable_payload(client):
    # Test invalid expires_at
    response = client.post(
        "/api/listings",
        data={
            "merchant_id": "11111111-1111-1111-1111-111111111111",
            "name": "Test Listing",
            "original_price": 100,
            "discounted_price": 80,
            "unit": "kg",
            "quantity": 67,
            "type": "vegetable",
            "expires_at": "not-a-date",
        },
        files={
            "image": (
                "test.jpg",
                io.BytesIO(b"fake-image-bytes"),
                "image/jpeg",
            ),
        },
    )
    assert response.status_code == 422

    # Test invalid original price
    response = client.post(
        "/api/listings",
        data={
            "merchant_id": "11111111-1111-1111-1111-111111111111",
            "name": "Test Listing",
            "original_price": "invalid-float",
            "discounted_price": 80,
            "unit": "kg",
            "quantity": 67,
            "type": "vegetable",
        },
        files={
            "image": (
                "test.jpg",
                io.BytesIO(b"fake-image-bytes"),
                "image/jpeg",
            ),
        },
    )
    assert response.status_code == 422

    # Test invalid discounted price
    response = client.post(
        "/api/listings",
        data={
            "merchant_id": "11111111-1111-1111-1111-111111111111",
            "name": "Test Listing",
            "original_price": 100,
            "discounted_price": "invalid-float",
            "unit": "kg",
            "quantity": 67,
            "type": "vegetable",
        },
        files={
            "image": (
                "test.jpg",
                io.BytesIO(b"fake-image-bytes"),
                "image/jpeg",
            ),
        },
    )
    assert response.status_code == 422

    # Test invalid quantity
    response = client.post(
        "/api/listings",
        data={
            "merchant_id": "11111111-1111-1111-1111-111111111111",
            "name": "Test Listing",
            "original_price": 100,
            "discounted_price": 80,
            "unit": "kg",
            "quantity": "invalid-int",
            "type": "vegetable",
        },
        files={
            "image": (
                "test.jpg",
                io.BytesIO(b"fake-image-bytes"),
                "image/jpeg",
            ),
        },
    )
    assert response.status_code == 422

    # Test invalid type
    response = client.post(
        "/api/listings",
        data={
            "merchant_id": "11111111-1111-1111-1111-111111111111",
            "name": "Test Listing",
            "original_price": 100,
            "discounted_price": 80,
            "unit": "kg",
            "quantity": 67,
            "type": "veggies",
        },
        files={
            "image": (
                "test.jpg",
                io.BytesIO(b"fake-image-bytes"),
                "image/jpeg",
            ),
        },
    )
    assert response.status_code == 422

    # Test invalid image
    response = client.post(
        "/api/listings",
        data={
            "merchant_id": "11111111-1111-1111-1111-111111111111",
            "name": "Test Listing",
            "original_price": 100,
            "discounted_price": 80,
            "unit": "kg",
            "quantity": 67,
            "type": "vegetable",
        },
        files={"image": "invalid-image"},
    )
    print(response.json())
    assert response.status_code == 422


def test_create_listing_incomplete_payload(client):
    # No merchant id
    response = client.post(
        "/api/listings",
        data={
            "name": "Test Listing",
            "original_price": 100,
            "discounted_price": 80,
            "unit": "kg",
            "quantity": 67,
            "type": "vegetable",
        },
        files={
            "image": (
                "test.jpg",
                io.BytesIO(b"fake-image-bytes"),
                "image/jpeg",
            ),
        },
    )
    assert response.status_code == 422

    # No name
    response = client.post(
        "/api/listings",
        data={
            "merchant_id": "11111111-1111-1111-1111-111111111111",
            "original_price": 100,
            "discounted_price": 80,
            "unit": "kg",
            "quantity": 67,
            "type": "vegetable",
        },
        files={
            "image": (
                "test.jpg",
                io.BytesIO(b"fake-image-bytes"),
                "image/jpeg",
            ),
        },
    )
    assert response.status_code == 422

    # No original price
    response = client.post(
        "/api/listings",
        data={
            "merchant_id": "11111111-1111-1111-1111-111111111111",
            "name": "Test Listing",
            "discounted_price": 80,
            "unit": "kg",
            "quantity": 67,
            "type": "vegetable",
        },
        files={
            "image": (
                "test.jpg",
                io.BytesIO(b"fake-image-bytes"),
                "image/jpeg",
            ),
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["original_price"] == 0

    # No discounted price
    response = client.post(
        "/api/listings",
        data={
            "merchant_id": "11111111-1111-1111-1111-111111111111",
            "name": "Test Listing",
            "original_price": 100,
            "unit": "kg",
            "quantity": 67,
            "type": "vegetable",
        },
        files={
            "image": (
                "test.jpg",
                io.BytesIO(b"fake-image-bytes"),
                "image/jpeg",
            ),
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["discounted_price"] == 0

    # No unit
    response = client.post(
        "/api/listings",
        data={
            "merchant_id": "11111111-1111-1111-1111-111111111111",
            "name": "Test Listing",
            "original_price": 100,
            "discounted_price": 80,
            "quantity": 67,
            "type": "vegetable",
        },
        files={
            "image": (
                "test.jpg",
                io.BytesIO(b"fake-image-bytes"),
                "image/jpeg",
            ),
        },
    )
    assert response.status_code == 422

    # No quantity
    response = client.post(
        "/api/listings",
        data={
            "merchant_id": "11111111-1111-1111-1111-111111111111",
            "name": "Test Listing",
            "original_price": 100,
            "discounted_price": 80,
            "unit": "kg",
            "type": "vegetable",
        },
        files={
            "image": (
                "test.jpg",
                io.BytesIO(b"fake-image-bytes"),
                "image/jpeg",
            ),
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["quantity"] == 0

    # No type
    response = client.post(
        "/api/listings",
        data={
            "merchant_id": "11111111-1111-1111-1111-111111111111",
            "name": "Test Listing",
            "original_price": 100,
            "discounted_price": 80,
            "unit": "kg",
            "quantity": 67,
        },
        files={
            "image": (
                "test.jpg",
                io.BytesIO(b"fake-image-bytes"),
                "image/jpeg",
            ),
        },
    )
    assert response.status_code == 422

    # No expires_at (optional, defaults to None)
    response = client.post(
        "/api/listings",
        data={
            "merchant_id": "11111111-1111-1111-1111-111111111111",
            "name": "Test Listing",
            "original_price": 100,
            "discounted_price": 80,
            "unit": "kg",
            "quantity": 67,
            "type": "vegetable",
        },
        files={
            "image": (
                "test.jpg",
                io.BytesIO(b"fake-image-bytes"),
                "image/jpeg",
            ),
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["expires_at"] is None

    # No image
    response = client.post(
        "/api/listings",
        data={
            "merchant_id": "11111111-1111-1111-1111-111111111111",
            "name": "Test Listing",
            "original_price": 100,
            "discounted_price": 80,
            "unit": "kg",
            "quantity": 67,
            "type": "vegetable",
        },
    )
    assert response.status_code == 422


def test_get_listing_success(client):
    response = client.get("/api/listings/11111111-1111-1111-1111-111111111112")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == "11111111-1111-1111-1111-111111111112"
    assert data["merchant_id"] == "11111111-1111-1111-1111-111111111111"
    assert data["name"] == "Sample Listing"
    assert data["original_price"] == 200
    assert data["discounted_price"] == 150
    assert (
        data["image"]
        == "http://127.0.0.1:54321/storage/v1/object/public/media/11111111-1111-1111-1111-111111111111/listings/22222222-2222-2222-2222-222222222221"
    )
    assert data["unit"] == "kg"
    assert data["quantity"] == 10
    assert data["type"] == "vegetable"
    assert data["expires_at"] is None
    assert data["is_sold_out"] == False


def test_get_listing_when_not_found(client):
    response = client.get("/api/listings/11111111-1111-1111-1111-111111111113")
    assert response.status_code == 400


def test_get_listings_by_merchant_success(client):
    response = client.get(
        "/api/listings?merchant_id=11111111-1111-1111-1111-111111111111",
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    data = data[0]
    assert data["id"] == "11111111-1111-1111-1111-111111111112"
    assert data["merchant_id"] == "11111111-1111-1111-1111-111111111111"
    assert data["name"] == "Sample Listing"
    assert data["original_price"] == 200
    assert data["discounted_price"] == 150
    assert (
        data["image"]
        == "http://127.0.0.1:54321/storage/v1/object/public/media/11111111-1111-1111-1111-111111111111/listings/22222222-2222-2222-2222-222222222221"
    )
    assert data["unit"] == "kg"
    assert data["quantity"] == 10
    assert data["type"] == "vegetable"
    assert data["expires_at"] is None
    assert data["is_sold_out"] == False


def test_get_listings_by_merchant_when_not_found(client):
    response = client.get(
        "/api/listings?merchant_id=11111111-1111-1111-1111-111111111119",
    )
    assert response.status_code == 404


def test_get_listings_by_merchant_unprocessable_payload(client):
    response = client.get(
        "/api/listings?merchant_id=invalid-uuid",
    )
    assert response.status_code == 422


def test_get_listings_by_merchant_no_merchant_id(client):
    response = client.get(
        "/api/listings",
    )
    assert response.status_code == 422


def test_get_all_listings_success(client):
    response = client.get("/api/listings/all")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    data = data[0]
    assert data["id"] == "11111111-1111-1111-1111-111111111112"
    assert data["merchant_id"] == "11111111-1111-1111-1111-111111111111"
    assert data["name"] == "Sample Listing"
    assert data["original_price"] == 200
    assert data["discounted_price"] == 150
    assert (
        data["image"]
        == "http://127.0.0.1:54321/storage/v1/object/public/media/11111111-1111-1111-1111-111111111111/listings/22222222-2222-2222-2222-222222222221"
    )
    assert data["unit"] == "kg"
    assert data["quantity"] == 10
    assert data["type"] == "vegetable"
    assert data["expires_at"] is None
    assert data["is_sold_out"] == False


def test_update_listing_success(client):
    response = client.put(
        "/api/listings/11111111-1111-1111-1111-111111111112",
        data={
            "merchant_id": "11111111-1111-1111-1111-111111111111",
            "name": "Sample Listing",
            "original_price": 200,
            "discounted_price": 150,
            "unit": "kg",
            "quantity": 10,
            "type": "vegetable",
        },
        files={
            "image": (
                "test.jpg",
                io.BytesIO(b"fake-image-bytes"),
                "image/jpeg",
            ),
        },
    )

    assert response.status_code == 200
    data = response.json()
    assert "id" in data
    assert data["merchant_id"] == "11111111-1111-1111-1111-111111111111"
    assert data["name"] == "Sample Listing"
    assert data["original_price"] == 200
    assert data["discounted_price"] == 150
    assert data["unit"] == "kg"
    assert data["quantity"] == 10
    assert data["type"] == "vegetable"
    assert "image" in data
    assert data["expires_at"] is None
    assert data["is_sold_out"] == False


def test_update_listing_unprocessable_payload(client):
    # Test invalid expires_at
    response = client.put(
        "/api/listings/11111111-1111-1111-1111-111111111112",
        data={
            "merchant_id": "11111111-1111-1111-1111-111111111111",
            "name": "Test Listing",
            "original_price": 100,
            "discounted_price": 80,
            "unit": "kg",
            "quantity": 67,
            "type": "vegetable",
            "expires_at": "not-a-date",
        },
        files={
            "image": (
                "test.jpg",
                io.BytesIO(b"fake-image-bytes"),
                "image/jpeg",
            ),
        },
    )
    assert response.status_code == 422

    # Test invalid original price
    response = client.put(
        "/api/listings/11111111-1111-1111-1111-111111111112",
        data={
            "merchant_id": "11111111-1111-1111-1111-111111111111",
            "name": "Test Listing",
            "original_price": "invalid-float",
            "discounted_price": 80,
            "unit": "kg",
            "quantity": 67,
            "type": "vegetable",
        },
        files={
            "image": (
                "test.jpg",
                io.BytesIO(b"fake-image-bytes"),
                "image/jpeg",
            ),
        },
    )
    assert response.status_code == 422

    # Test invalid discounted price
    response = client.put(
        "/api/listings/11111111-1111-1111-1111-111111111112",
        data={
            "merchant_id": "11111111-1111-1111-1111-111111111111",
            "name": "Test Listing",
            "original_price": 100,
            "discounted_price": "invalid-float",
            "unit": "kg",
            "quantity": 67,
            "type": "vegetable",
        },
        files={
            "image": (
                "test.jpg",
                io.BytesIO(b"fake-image-bytes"),
                "image/jpeg",
            ),
        },
    )
    assert response.status_code == 422

    # Test invalid quantity
    response = client.put(
        "/api/listings/11111111-1111-1111-1111-111111111112",
        data={
            "merchant_id": "11111111-1111-1111-1111-111111111111",
            "name": "Test Listing",
            "original_price": 100,
            "discounted_price": 80,
            "unit": "kg",
            "quantity": "invalid-int",
            "type": "vegetable",
        },
        files={
            "image": (
                "test.jpg",
                io.BytesIO(b"fake-image-bytes"),
                "image/jpeg",
            ),
        },
    )
    assert response.status_code == 422

    # Test invalid type
    response = client.put(
        "/api/listings/11111111-1111-1111-1111-111111111112",
        data={
            "merchant_id": "11111111-1111-1111-1111-111111111111",
            "name": "Test Listing",
            "original_price": 100,
            "discounted_price": 80,
            "unit": "kg",
            "quantity": 67,
            "type": "veggies",
        },
        files={
            "image": (
                "test.jpg",
                io.BytesIO(b"fake-image-bytes"),
                "image/jpeg",
            ),
        },
    )
    assert response.status_code == 422

    # Test invalid image
    response = client.put(
        "/api/listings/11111111-1111-1111-1111-111111111112",
        data={
            "merchant_id": "11111111-1111-1111-1111-111111111111",
            "name": "Test Listing",
            "original_price": 100,
            "discounted_price": 80,
            "unit": "kg",
            "quantity": 67,
            "type": "vegetable",
        },
        files={
            "image": "invalid_image",
        },
    )
    assert response.status_code == 422


def test_update_listing_incomplete_payload(client):
    # No merchant id
    response = client.put(
        "/api/listings/11111111-1111-1111-1111-111111111112",
        data={
            "name": "Test Listing",
            "original_price": 100,
            "discounted_price": 80,
            "unit": "kg",
            "quantity": 67,
            "type": "vegetable",
        },
        files={
            "image": (
                "test.jpg",
                io.BytesIO(b"fake-image-bytes"),
                "image/jpeg",
            ),
        },
    )
    assert response.status_code == 422

    # No name
    response = client.put(
        "/api/listings/11111111-1111-1111-1111-111111111112",
        data={
            "merchant_id": "11111111-1111-1111-1111-111111111111",
            "original_price": 100,
            "discounted_price": 80,
            "unit": "kg",
            "quantity": 67,
            "type": "vegetable",
        },
        files={
            "image": (
                "test.jpg",
                io.BytesIO(b"fake-image-bytes"),
                "image/jpeg",
            ),
        },
    )
    assert response.status_code == 422

    # No original price
    response = client.put(
        "/api/listings/11111111-1111-1111-1111-111111111112",
        data={
            "merchant_id": "11111111-1111-1111-1111-111111111111",
            "name": "Test Listing",
            "discounted_price": 80,
            "unit": "kg",
            "quantity": 67,
            "type": "vegetable",
        },
        files={
            "image": (
                "test.jpg",
                io.BytesIO(b"fake-image-bytes"),
                "image/jpeg",
            ),
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["original_price"] == 0

    # No discounted price
    response = client.put(
        "/api/listings/11111111-1111-1111-1111-111111111112",
        data={
            "merchant_id": "11111111-1111-1111-1111-111111111111",
            "name": "Test Listing",
            "original_price": 100,
            "unit": "kg",
            "quantity": 67,
            "type": "vegetable",
        },
        files={
            "image": (
                "test.jpg",
                io.BytesIO(b"fake-image-bytes"),
                "image/jpeg",
            ),
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["discounted_price"] == 0

    # No unit
    response = client.put(
        "/api/listings/11111111-1111-1111-1111-111111111112",
        data={
            "merchant_id": "11111111-1111-1111-1111-111111111111",
            "name": "Test Listing",
            "original_price": 100,
            "discounted_price": 80,
            "quantity": 67,
            "type": "vegetable",
        },
        files={
            "image": (
                "test.jpg",
                io.BytesIO(b"fake-image-bytes"),
                "image/jpeg",
            ),
        },
    )
    assert response.status_code == 422

    # No quantity
    response = client.put(
        "/api/listings/11111111-1111-1111-1111-111111111112",
        data={
            "merchant_id": "11111111-1111-1111-1111-111111111111",
            "name": "Test Listing",
            "original_price": 100,
            "discounted_price": 80,
            "unit": "kg",
            "type": "vegetable",
        },
        files={
            "image": (
                "test.jpg",
                io.BytesIO(b"fake-image-bytes"),
                "image/jpeg",
            ),
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["quantity"] == 0

    # No type
    response = client.put(
        "/api/listings/11111111-1111-1111-1111-111111111112",
        data={
            "merchant_id": "11111111-1111-1111-1111-111111111111",
            "name": "Test Listing",
            "original_price": 100,
            "discounted_price": 80,
            "unit": "kg",
            "quantity": 67,
        },
        files={
            "image": (
                "test.jpg",
                io.BytesIO(b"fake-image-bytes"),
                "image/jpeg",
            ),
        },
    )
    assert response.status_code == 422

    # No expires_at (optional, defaults to None)
    response = client.put(
        "/api/listings/11111111-1111-1111-1111-111111111112",
        data={
            "merchant_id": "11111111-1111-1111-1111-111111111111",
            "name": "Test Listing",
            "original_price": 100,
            "discounted_price": 80,
            "unit": "kg",
            "quantity": 67,
            "type": "vegetable",
        },
        files={
            "image": (
                "test.jpg",
                io.BytesIO(b"fake-image-bytes"),
                "image/jpeg",
            ),
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["expires_at"] is None

    # No image
    response = client.put(
        "/api/listings/11111111-1111-1111-1111-111111111112",
        data={
            "merchant_id": "11111111-1111-1111-1111-111111111111",
            "name": "Test Listing",
            "original_price": 100,
            "discounted_price": 80,
            "unit": "kg",
            "quantity": 67,
            "type": "vegetable",
        },
    )
    assert response.status_code == 200


def test_delete_listing_success(client):
    response = client.delete("/api/listings/11111111-1111-1111-1111-111111111112")
    assert response.status_code == 200


def test_delete_listing_when_not_found(client):
    response = client.delete("/api/listings/11111111-1111-1111-1111-111111111111")
    assert response.status_code == 400
