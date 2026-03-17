import { createContext, useState, useMemo, useCallback } from "react";
import { PERMISSIONS, ROLE_PERMISSIONS } from "./constants";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);

  // 🔥 GLOBAL STATES (NO MOCK HERE)
  const [assets, setAssets] = useState([]);
  const [issues, setIssues] = useState([]);
  const [users, setUsers] = useState([]);

  const hasPermission = useCallback(
    (permission) => {
      if (!user) return false;
      return (ROLE_PERMISSIONS[user.role] || []).includes(permission);
    },
    [user]
  );

  const logout = () => {
    setUser(null);
    localStorage.clear();
  };

  const value = useMemo(
    () => ({
      user,
      setUser,
      logout,
      hasPermission,
      PERMISSIONS,

      // 🔥 STATE
      assets,
      setAssets,
      issues,
      setIssues,
      users,
      setUsers,
    }),
    [user, assets, issues, users]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export { AppContext };