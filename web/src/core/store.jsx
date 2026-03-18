import { createContext, useState, useMemo, useCallback, useEffect } from "react";
import { PERMISSIONS, ROLE_PERMISSIONS, STORAGE_KEYS, normalizeRole } from "./constants";
import api from "./api";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [user, setUserState] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.USER);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const [assets, setAssets] = useState([]);
  const [issues, setIssues] = useState([]);
  const [users, setUsers] = useState([
    { id: 1, name: "Admin User" }, // temp mock
  ]);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const hydrateSession = async () => {
      const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

      if (!token) {
        setAuthReady(true);
        return;
      }

      if (user) {
        setAuthReady(true);
        return;
      }

      try {
        const res = await api.get("/auth/me");
        const fetchedUser = res.data;
        setUserState({
          ...fetchedUser,
          role: normalizeRole(fetchedUser.role),
          name: fetchedUser.username,
        });
      } catch {
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
      } finally {
        setAuthReady(true);
      }
    };

    hydrateSession();
  }, [user]);

  const hasPermission = useCallback(
    (permission) => {
      if (!user) return false;
      const normalizedRole = normalizeRole(user.role);
      return (ROLE_PERMISSIONS[normalizedRole] || []).includes(permission);
    },
    [user]
  );

  const setUser = useCallback((nextUser) => {
    setUserState(nextUser);

    if (nextUser) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(nextUser));
      return;
    }

    localStorage.removeItem(STORAGE_KEYS.USER);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  }, [setUser]);

  // ✅ REPORT ISSUE
  const reportIssue = useCallback((assetId, title, description, priority) => {
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
  }, [user?.id]);

  // ✅ UPDATE ISSUE STATUS
  const updateIssueStatus = useCallback((id, status) => {
    setIssues((prev) =>
      prev.map((issue) =>
        issue.id === id ? { ...issue, status } : issue
      )
    );
  }, []);

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
      authReady,

      reportIssue,
      updateIssueStatus,
    }),
    [
      user,
      setUser,
      logout,
      hasPermission,
      assets,
      issues,
      users,
      authReady,
      reportIssue,
      updateIssueStatus,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export { AppContext };