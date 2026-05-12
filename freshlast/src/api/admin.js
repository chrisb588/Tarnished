import apiClient from "../lib/apiClient";

const adminLogin = async (username, password) => {
  const response = await apiClient.post("/admin/auth/login", {
    username: username,
    password: password,
  });

  if (response.status != 200) {
    return response.data.detail;
  }

  sessionStorage.setItem("adminToken", response.data.access_token);
};

const getAdminToken = () => sessionStorage.getItem("adminToken");

const verifyAdminToken = async () => {
  const headers = {
    Authorization: `Bearer ${getAdminToken()}`,
  };

  const response = await apiClient.get("/admin/auth/verify", {
    headers: headers,
  });

  return response.status === 200;
};

const adminLogout = () => sessionStorage.removeItem("adminToken");

const createMerchant = async (
  email,
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
  formData.append("email", email);
  formData.append("name", name);
  formData.append("phone_number", phone_number);
  formData.append("latitude", latitude);
  formData.append("longitude", longitude);
  formData.append("location_photo", location_photo);
  formData.append("operating_days", JSON.stringify(operating_days)); // this should contain a list of days ("Mon", "Tue", "Wed", etc), then for each day, it contains an object with "start_time" and "end_time" fields
  formData.append("location", location);
  formData.append("category", category);

  const headers = {
    Authorization: `Bearer ${getAdminToken()}`,
  };

  return await apiClient.post(`/admin/create`, formData, {
    headers: headers,
  });
};

const getAllMerchants = async () => {
  const headers = {
    Authorization: `Bearer ${getAdminToken()}`,
  };

  const response = await apiClient.get(`/admin/merchants`, {
    headers: headers,
  });
  return response.data;
};

const deleteMerchant = async (id) => {
  const headers = {
    Authorization: `Bearer ${getAdminToken()}`,
  };

  return await apiClient.delete(`/admin/delete/${id}`, {
    headers: headers,
  });
};

export {
  adminLogin,
  getAdminToken,
  verifyAdminToken,
  adminLogout,
  createMerchant,
  getAllMerchants,
  deleteMerchant,
};
