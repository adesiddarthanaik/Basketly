import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  config.headers = config.headers || {};
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    // If wrapped in { success: true, data: ... }, extract data smoothly while preserving full response
    return response;
  },
  (error) => {
    // Extract standardized error message from backend
    const customMessage =
      error.response?.data?.error?.message ||
      error.response?.data?.message ||
      error.message ||
      "An unexpected error occurred.";

    error.extractedMessage = customMessage;
    return Promise.reject(error);
  }
);

export default api;
