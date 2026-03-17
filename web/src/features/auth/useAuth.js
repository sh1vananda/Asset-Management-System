import { useState } from "react";
import api from "../../core/api";
import { useApp } from "../../core/useApp";
import { ROLES } from "../../core/constants"; // ✅ IMPORTANT

export const useAuth = () => {
  const { logout: contextLogout } = useApp();
  const [loading, setLoading] = useState(false);

  // ✅ CORRECT ROLE VALUES (MATCH constants.js)
  const mockUsers = [
    {
      id: 1,
      name: "Admin User",
      email: "admin@gmail.com",
      password: "123456",
      role: ROLES.ADMIN,
    },
    {
      id: 2,
      name: "Employee User",
      email: "employee@gmail.com",
      password: "123456",
      role: ROLES.EMPLOYEE,
    },
    {
      id: 3,
      name: "IT Manager",
      email: "itmanager@gmail.com",
      password: "123456",
      role: ROLES.IT_MANAGER,
    },
  ];

  const login = async (email, password) => {
    setLoading(true);
    try {
      // 🔥 BACKEND READY
      /*
      const res = await api.post("/auth/login", { email, password });
      const { access_token, refresh_token, user } = res.data;

      localStorage.setItem("access_token", access_token);
      localStorage.setItem("refresh_token", refresh_token);

      return { success: true, user };
      */

      // ✅ MOCK LOGIN
      const user = mockUsers.find(
        (u) => u.email === email && u.password === password
      );

      if (!user) {
        return { success: false, message: "Invalid credentials" };
      }

      // store mock tokens
      localStorage.setItem("access_token", "mock_access_token");
      localStorage.setItem("refresh_token", "mock_refresh_token");

      return {
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role, // ✅ EXACT MATCH
        },
      };
    } catch (err) {
      return { success: false, message: "Login failed" };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    contextLogout();
  };

  return { login, logout, loading };
};