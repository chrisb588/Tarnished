import apiClient from "../lib/apiClient";
import { supabase } from "../lib/supabaseClient";

const getProfile = async (id) => {
  const response = await apiClient.get(`/profile/${id}`);
  return response.data;
};

const updateProfile = async (
  id,
  name,
  latitude,
  longitude,
  location_photo,
  start_operating_time,
  end_operating_time,
  operating_days,
  location,
) => {
  let imagePath = location_photo;

  if (location_photo instanceof File) {
    const imagePath = `${id}/profile/${crypto.randomUUID()}`;
    const { error } = await supabase.storage
      .from("media")
      .upload(imagePath, location_photo);
    if (error) throw error;
  }

  return apiClient.put(`/profile/${id}`, {
    id,
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

export { getProfile, updateProfile };
