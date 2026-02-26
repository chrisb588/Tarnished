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

export { createListing };
