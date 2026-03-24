import apiClient from "../lib/apiClient";

// Create Merchant API Endpoint
// merchant is expected to be a json object with ff. fields:
// {
//   name: string
//   latitude: number
//   longitude: number
//   start_operating_time: time
//   end_operating_time: time
//   operating_days: array containing one or more of the ff: "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
//   location: string
// }
const createMerchant = async (email, merchant) => {
  return await apiClient.post(`/admin/create`, {
    email: email,
    merchant: merchant,
  });
};

export { createMerchant };
