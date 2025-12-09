// Axios instance used across the app to call the backend API.
// It automatically injects the JWT token (if present) and keeps the base URL consistent.
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Attach Authorization header when a token exists in localStorage.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Optionally handle 401 errors globally.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("Unauthorized: you may need to log in again.");
    }
    return Promise.reject(error);
  }
);

export default api;
