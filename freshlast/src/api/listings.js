import apiClient from "../lib/apiClient";

const createListing = (
  merchantId,
  name,
  price,
  image,
  unit,
  quantity,
  expirationDetails,
) =>
  apiClient.post("/listing", {
    merchant_id: merchantId,
    name: name,
    price: price,
    image: image,
    unit: unit,
    quantity: quantity,
    expiration_details: expirationDetails,
  });

export { createListing };
