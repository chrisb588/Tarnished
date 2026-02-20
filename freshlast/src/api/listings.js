import { supabase } from "../lib/supabaseClient";

async function createListing(
  merchantId,
  name,
  price,
  image,
  unit,
  quantity,
  expirationDetails,
) {
  // Check if all types are correct since this is Javascript
  if (
    typeof merchantId != Number ||
    typeof name != String ||
    typeof price != Number ||
    !(typeof image == String || image == null) ||
    typeof unit != String ||
    typeof quantity != Number ||
    !(typeof expirationDetails == String || expirationDetails == null)
  ) {
    throw "Error when creating a new listing: Input values are invalid.";
  }

  // Check if there are null values
  if (
    merchantId == null ||
    name == null ||
    price == null ||
    unit == null ||
    quantity == null
  ) {
    throw "Error when creating a new listing: All fields must be filled up.";
  }

  const { error } = supabase.from("listing").insert({
    merchant_id: merchantId,
    name: name,
    price: price,
    image: image,
    unit: unit,
    quantity: quantity,
    expiration_details: expirationDetails,
  });

  if (error != null) {
    throw `Error when creating a new listing: ${error}.`;
  }
}

export { create };
