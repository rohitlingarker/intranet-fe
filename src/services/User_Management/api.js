// src/services/api.js
import axios from "axios";

// Create an instance of Axios
const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
  timeout: 10000,
});

// Request interceptor to attach token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Optional: Global response interceptor for handling errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Unauthorized: Redirect to login or clear session.");
      // Optionally dispatch logout or redirect to login
    }
    return Promise.reject(error);
  }
);

export default API;
