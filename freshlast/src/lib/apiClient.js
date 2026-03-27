import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL;

const apiClient = axios.create({
  baseURL: `${baseURL}/api`,
  headers: {
    Accept: "application/json",
  },
});

export default apiClient;
