import { supabase } from "../lib/supabaseClient";

async function createListing(listing) {
  // Check if all types are correct since this is Javascript
  if (
    typeof listing.id != Number ||
    typeof listing.name != String ||
    typeof listing.price != Number ||
    !(typeof listing.image == String || listing.image == null) ||
    typeof listing.unit != String ||
    typeof listing.quantity != Number ||
    !(
      typeof listing.expiration_details == String ||
      listing.expiration_details == null
    )
  ) {
    // error
  }

  // Check if there are null values
  if (
    listing.id == null ||
    listing.name == null ||
    listing.price == null ||
    listing.unit == null ||
    listing.quantity == null
  ) {
    // error
  }

  const { error } = supabase.from("listing").insert(listing);
}

export { createListing };
