import apiClient from "../lib/apiClient";
import { supabase } from "../lib/supabaseClient";

const getProfile = async (id) => {
  const response = await apiClient.get(`/profile/${id}`);
  return response.data;
};

const updateProfile = async (
  id,
  name,
  phone_number,
  latitude,
  longitude,
  location_photo,
  start_operating_time,
  end_operating_time,
  operating_days,
  location,
  category,
) => {
  const formData = new FormData();
  formData.append("id", id);
  formData.append("name", name);
  formData.append("phone_number", phone_number);
  formData.append("latitude", latitude);
  formData.append("longitude", longitude);
  if (location_photo instanceof File) {
    formData.append("location_photo", location_photo);
  }
  formData.append("start_operating_time", start_operating_time);
  formData.append("end_operating_time", end_operating_time);
  formData.append("operating_days", JSON.stringify(operating_days));
  formData.append("location", location);
  formData.append("category", JSON.stringify(category));
  return await apiClient.put(`/profile/${id}`, formData);
};

export { getProfile, updateProfile };
