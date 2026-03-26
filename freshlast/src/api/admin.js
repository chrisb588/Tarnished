import apiClient from "../lib/apiClient";

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
  const formData = new FormData();
  formData.append("email", email);
  formData.append("name", name);
  formData.append("latitude", latitude);
  formData.append("longitude", longitude);
  formData.append("location_photo", location_photo);
  formData.append("start_operating_time", start_operating_time);
  formData.append("end_operating_time", end_operating_time);
  formData.append("operating_days", JSON.stringify(operating_days));
  formData.append("location", location);

  return await apiClient.post(`/admin/create`, formData);
};

const deleteMerchant = async (id) => {
  return await apiClient.delete(`/admin/delete/${id}`);
};

export { createMerchant, deleteMerchant };
