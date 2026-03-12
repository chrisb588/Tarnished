import apiClient from "../lib/apiClient";
import { supabase } from "../lib/supabaseClient";

const createListing = async (
  merchantId,
  name,
  price,
  image, // Assume for now that this is an image file
  unit,
  quantity,
  expirationDetails,
) => {
  const relativePath = `listings/${crypto.randomUUID()}`;
  const imagePath = `${merchantId}/${relativePath}`;

  // This assumes that image is a single file
  // TODO: Modify upload function to handle multiple images
  const { error } = await supabase.storage
    .from("media")
    .upload(imagePath, image);

  if (error) {
    throw error;
  }

  return apiClient.post("/listing", {
    merchant_id: merchantId,
    name: name,
    price: price,
    image: relativePath,
    unit: unit,
    quantity: quantity,
    expiration_details: expirationDetails,
  });
};

const getListingsByMerchant = async (merchantId) => {
  const response = await apiClient.get(`/listings?merchant_id=${merchantId}`);
  return response.data;
};

const getListingById = async (listingId) => {
  const response = await apiClient.get(`/listing/${listingId}`);
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
    const relativePath = `listings/${crypto.randomUUID()}`;
    const fullPath = `${merchantId}/${relativePath}`;
    const { error } = await supabase.storage.from("media").upload(fullPath, image);
    if (error) throw error;
    imagePath = relativePath;
  }

  return apiClient.put(`/listing/${listingId}`, {
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
  return apiClient.delete(`/listing/${listingId}`);
};

export { createListing, getListingsByMerchant, getListingById, updateListing, deleteListing };
