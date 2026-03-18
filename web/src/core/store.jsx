import { createContext, useState, useMemo, useCallback } from "react";
import { PERMISSIONS, ROLE_PERMISSIONS } from "./constants";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);

  const [assets, setAssets] = useState([]);
  const [issues, setIssues] = useState([]);
  const [users, setUsers] = useState([
    { id: 1, name: "Admin User" }, // temp mock
  ]);

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

  // ✅ REPORT ISSUE
  const reportIssue = (assetId, title, description, priority) => {
    const newIssue = {
      id: Date.now(),
      assetId: Number(assetId),
      title,
      description,
      priority,
      status: "Open",
      reportedBy: user?.id || 1,
      createdAt: new Date().toISOString(),
    };

    setIssues((prev) => [...prev, newIssue]);
  };

  // ✅ UPDATE ISSUE STATUS
  const updateIssueStatus = (id, status) => {
    setIssues((prev) =>
      prev.map((issue) =>
        issue.id === id ? { ...issue, status } : issue
      )
    );
  };

  const value = useMemo(
    () => ({
      user,
      setUser,
      logout,
      hasPermission,
      PERMISSIONS,

      assets,
      setAssets,
      issues,
      setIssues,
      users,
      setUsers,

      reportIssue,
      updateIssueStatus,
    }),
    [user, assets, issues, users]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export { AppContext };