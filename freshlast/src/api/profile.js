import apiClient from "../lib/apiClient";
import { supabase } from "../lib/supabaseClient";

const getProfile = async (id) => {
  const response = await apiClient.get(`/profile/${id}`);
  return response.data.data;
};

const updateProfile = async (
  id,
  name,
  phone_number,
  latitude,
  longitude,
  location_photo,
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
  let operatingDays = {};
  for (const sched of operating_days) {
    operatingDays[sched["day"]] = {
      start_time: sched["start_time"],
      end_time: sched["end_time"],
    };
  }
  formData.append("operating_days", JSON.stringify(operatingDays)); // this should contain a list of days ("Mon", "Tue", "Wed", etc), then for each day, it contains an object with "start_time" and "end_time" fields
  formData.append("location", location);
  formData.append("category", JSON.stringify(category));
  return await apiClient.put(`/profile/${id}`, formData);
};

const getAllMerchants = async () => {
  const response = await apiClient.get(`/profile/all`);
  console.log(response.data);
  return response.data;
};

export { getProfile, updateProfile, getAllMerchants };
