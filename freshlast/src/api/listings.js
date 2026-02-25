import apiClient from "../lib/apiClient";
import { supabase } from "../lib/supabaseClient";
import { v4 as uuidv4 } from "uuid";

const createListing = (
  merchantId,
  name,
  price,
  image, // Assume for now that this is an image file
  unit,
  quantity,
  expirationDetails,
) => {
  const imagePath = `${merchantId}/listings/${uuidv4()}`;

  // This assumes that image is a single file
  // TODO: Modify upload function to handle multiple images
  const { error } = supabase.storage.from("media").upload(imagePath, image);

  if (error) {
    throw error;
  }

  // Retrieve the image's public link
  const { data } = supabase.storage.from("media").getPublicUrl(imagePath);

  return apiClient.post("/listing", {
    merchant_id: merchantId,
    name: name,
    price: price,
    image: data.publicUrl,
    unit: unit,
    quantity: quantity,
    expiration_details: expirationDetails,
  });
};

export { createListing };
