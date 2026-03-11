from unittest.mock import MagicMock, patch


@patch("api.listings.supabase")
def test_create_listing(mock_supabase, client):
    mock_response = MagicMock()
    mock_response.data = []

    mock_supabase.table.return_value.insert.return_value.execute.return_value = (
        mock_response
    )

    payload = {
        "merchant_id": "a1b2c3d4-e5f6-7890-1234-56789abcdef0",
        "name": "Test Listing",
        "original_price": 100,
        "image": "",
        "unit": "kg",
        "quantity": 10,
        "discounted_price": 60,
    }

    response = client.post("/api/listing", json=payload)

    assert response.status_code == 200
    # assert response.json() ==
    mock_supabase.table.assert_called_with("listing")
    mock_supabase.table().insert.assert_called_once()
    mock_supabase.table().insert().execute.assert_called_once()
