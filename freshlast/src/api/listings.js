import apiClient from "../lib/apiClient";

const createListing = async (
  merchantId,
  name,
  originalPrice,
  discountedPrice,
  image,
  unit,
  quantity,
  type,
  expiresAt,
) => {
  const formData = new FormData();
  formData.append("merchant_id", merchantId);
  formData.append("name", name);
  formData.append("original_price", originalPrice);
  formData.append("discounted_price", discountedPrice);
  if (image instanceof File) {
    formData.append("image", image);
  }
  formData.append("unit", unit);
  formData.append("quantity", quantity);
  if (type) formData.append("type", type);
  if (expiresAt) formData.append("expires_at", expiresAt);

  return apiClient.post("/listings", formData);
};

const getAllListings = async () => {
  const response = await apiClient.get('/listings/all');
  return response.data;
};

const getListingsByMerchant = async (merchantId) => {
  const response = await apiClient.get(`/listings?merchant_id=${merchantId}`);
  return response.data;
};

const getListingById = async (listingId) => {
  const response = await apiClient.get(`/listings/${listingId}`);
  return response.data;
};

const updateListing = async (
  listingId,
  merchantId,
  name,
  originalPrice,
  discountedPrice,
  image,
  unit,
  quantity,
  type,
  expiresAt,
) => {
  const formData = new FormData();
  formData.append("merchant_id", merchantId);
  formData.append("name", name);
  formData.append("original_price", originalPrice);
  formData.append("discounted_price", discountedPrice);
  if (image instanceof File) {
    formData.append("image", image);
  }
  formData.append("unit", unit);
  formData.append("quantity", quantity);
  if (type) formData.append("type", type);
  if (expiresAt) formData.append("expires_at", expiresAt);

  return apiClient.put(`/listings/${listingId}`, formData);
};

const deleteListing = async (listingId) => {
  return apiClient.delete(`/listings/${listingId}`);
};

export { getAllListings, createListing, getListingsByMerchant, getListingById, updateListing, deleteListing };
