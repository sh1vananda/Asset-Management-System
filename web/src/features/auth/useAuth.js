import { useState } from "react";
import api from "../../core/api";
import { useApp } from "../../core/useApp";

export const useAuth = () => {
  const { setUser, logout: contextLogout } = useApp();
  const [loading, setLoading] = useState(false);

  // 🔥 ROLE → PERMISSIONS MAPPING
  const getPermissionsFromRole = (role) => {
    if (role === "admin" || role === "it_manager") {
      return [
        "VIEW_DASHBOARD",
        "VIEW_ALL_ASSETS",
        "ASSIGN_ASSET",
        "REPORT_ISSUE",
        "UPDATE_ISSUE_STATUS",
      ];
    }

    // employee
    return [
      "REPORT_ISSUE",
    ];
  };

  // ✅ LOGIN
  const login = async (username, password) => {
    setLoading(true);
    try {
      const res = await api.post("/auth/login", {
        username,
        password,
      });

      const { access_token, user } = res.data;

      const permissions = getPermissionsFromRole(user.role);

      localStorage.setItem("access_token", access_token);

      setUser({
        ...user,
        permissions, // 🔥 attach permissions
      });

      return { success: true };
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

  // ✅ REGISTER (keep admin for now)
  const register = async (username, email, password) => {
    setLoading(true);
    try {
      await api.post("/auth/register", {
        username,
        email,
        password,
        role: "admin",
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
    localStorage.removeItem("access_token");
    contextLogout();
  };

  return { login, register, logout, loading };
};