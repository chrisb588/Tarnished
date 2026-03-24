import apiClient from "../lib/apiClient";
import { supabase } from "../lib/supabaseClient";

const createMerchant = async (
  email,
  name,
  latitude,
  longitude,
  location_photo,
  start_operating_time, // should be only time
  end_operating_time, // should be only time
  operating_days, // should be an array consisting of exclusively "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
  location,
) => {
  const response = await apiClient.post(`/admin/create`, {
    email,
    name,
    latitude,
    longitude,
    start_operating_time,
    end_operating_time,
    operating_days,
    location,
  });

  const imagePath = `${response["uuid"]}/profile/${crypto.randomUUID()}`;

  // This assumes that image is a single file
  // TODO: Modify upload function to handle multiple images
  const { error } = await supabase.storage
    .from("media")
    .upload(imagePath, location_photo);

  if (error) {
    throw error;
  }

  return apiClient.put(`/profile/${response["uuid"]}`, {
    id: response["uuid"],
    name,
    latitude,
    longitude,
    location_photo: imagePath,
    start_operating_time,
    end_operating_time,
    operating_days,
    location,
  });
};

const deleteMerchant = async (id) => {
  return await apiClient.delete(`/admin/delete/${id}`);
};

export { createMerchant, deleteMerchant };
