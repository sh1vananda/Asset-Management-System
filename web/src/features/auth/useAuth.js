import { useState } from "react";
import api from "../../core/api";
import { useApp } from "../../core/useApp";
import { normalizeRole, STORAGE_KEYS } from "../../core/constants";

export const useAuth = () => {
  const { setUser, logout: contextLogout } = useApp();
  const [loading, setLoading] = useState(false);

  // ✅ LOGIN
  const login = async (username, password) => {
    setLoading(true);
    try {
      const res = await api.post("/auth/login", {
        username,
        password,
      });

      const { access_token, user } = res.data;

      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, access_token);

      setUser({
        ...user,
        role: normalizeRole(user.role),
        name: user.username,
      });

      return { success: true, role: normalizeRole(user.role) };
    } catch (err) {
      console.error(err.response?.data);
      return {
        success: false,
        message: err.response?.data?.error || "Login failed",
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (username, email, password, role) => {
    setLoading(true);
    try {
      await api.post("/auth/register", {
        username,
        email,
        password,
        role: normalizeRole(role || "employee"),
      });

      return { success: true };
    } catch (err) {
      console.error(err.response?.data);
      return {
        success: false,
        message: err.response?.data?.error || "Registration failed",
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    contextLogout();
  };

  return { login, register, logout, loading };
};