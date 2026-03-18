import axios from "axios";
import { STORAGE_KEYS } from "./constants";

const configuredBaseUrl =
  import.meta.env.VITE_API_BASE_URL ||
  "https://asset-management-system-production-fe3c.up.railway.app";

const useDirectApi = import.meta.env.VITE_USE_DIRECT_API === "true";

// Use same-origin proxy by default to prevent browser CORS issues.
const resolvedBaseUrl = useDirectApi
  ? configuredBaseUrl.replace(/\/+$/, "")
  : "/api/proxy";

const api = axios.create({
  baseURL: resolvedBaseUrl,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Attach JWT automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

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
    if (error.response?.status === 401) {
      const requestUrl = String(error.config?.url || "");
      const isAuthRequest = requestUrl.includes("/auth/login") || requestUrl.includes("/auth/register");

      if (!isAuthRequest) {
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);

        if (window.location.pathname !== "/") {
          window.location.href = "/";
        }
      }
    }

    console.error("API ERROR:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;