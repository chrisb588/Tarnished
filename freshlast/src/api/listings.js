import apiClient from "../lib/apiClient";
import { supabase } from "../lib/supabaseClient";

const createListing = async (
  merchantId,
  name,
  originalprice,
  discountedprice,
  image, // Assume for now that this is an image file
  unit,
  quantity,
) => {
  const imagePath = `${merchantId}/listings/${crypto.randomUUID()}`;

  // This assumes that image is a single file
  // TODO: Modify upload function to handle multiple images
  const { error } = await supabase.storage
    .from("media")
    .upload(imagePath, image);

  if (error) {
    throw error;
  }

  return apiClient.post("/listings", {
    merchant_id: merchantId,
    name: name,
    originalprice: originalprice,
    discountedprice: discountedprice,
    image: imagePath,
    unit: unit,
    quantity: quantity,
  });
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
) => {
  let imagePath = image;

  if (image instanceof File) {
    const imagePath = `${merchantId}/listings/${crypto.randomUUID()}`;
    const { error } = await supabase.storage
      .from("media")
      .upload(imagePath, image);
    if (error) throw error;
  }

  return apiClient.put(`/listings/${listingId}`, {
    merchant_id: merchantId,
    name,
    original_price: originalPrice,
    discounted_price: discountedPrice,
    image: imagePath,
    unit,
    quantity,
  });
};

const deleteListing = async (listingId) => {
  return apiClient.delete(`/listings/${listingId}`);
};

export {
  createListing,
  getListingsByMerchant,
  getListingById,
  updateListing,
  deleteListing,
};
