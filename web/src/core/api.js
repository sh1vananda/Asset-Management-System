import axios from "axios";

const api = axios.create({
  baseURL: "https://asset-management-system-production-fe3c.up.railway.app",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Attach JWT automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Add response error logging (VERY USEFUL)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API ERROR:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;