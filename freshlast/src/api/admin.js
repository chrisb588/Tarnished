import apiClient from "../lib/apiClient";

const createMerchant = async (
  email,
  name,
  latitude,
  longitude,
  start_operating_time, // should be only time
  end_operating_time, // should be only time
  operating_days, // should be an array consisting of exclusively "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
  location,
) => {
  return await apiClient.post(`/admin/create`, {
    email,
    name,
    latitude,
    longitude,
    start_operating_time,
    end_operating_time,
    operating_days,
    location,
  });
};

export { createMerchant };
