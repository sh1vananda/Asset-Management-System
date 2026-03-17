import { createContext, useEffect, useMemo, useState, useCallback } from "react";

const STORAGE_KEYS = {
  currentUser: "am_current_user",
  assets: "am_assets",
  users: "am_users",
  assignments: "am_assignments",
  issues: "am_issues",
};

import { ROLES, PERMISSIONS, ROLE_PERMISSIONS } from "./constants";
import { loginApi, registerApi } from "../features/auth/authService";

const defaultAssets = [
  {
    id: 1,
    name: "Laptop",
    category: "Electronics",
    brand: "Dell",
    model: "XPS 13",
    status: "Available",
    assignedTo: null,
    purchaseDate: "2023-01-15",
    location: "Office A",
  },
  {
    id: 2,
    name: "Printer",
    category: "Hardware",
    brand: "HP",
    model: "LaserJet Pro",
    status: "Assigned",
    assignedTo: 1,
    purchaseDate: "2023-02-20",
    location: "Office B",
  },
];

const defaultUsers = [
  {
    id: 1,
    name: "John Doe",
    email: "employee@example.com",
    password: "password123",
    role: ROLES.EMPLOYEE,
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "itmanager@example.com",
    password: "password123",
    role: ROLES.IT_MANAGER,
  },
  {
    id: 3,
    name: "Admin User",
    email: "admin@example.com",
    password: "password123",
    role: ROLES.ADMIN,
  },
];

const defaultAssignments = [
  {
    id: 1,
    assetId: 2,
    userId: 1,
    assignedDate: "2024-01-10",
    returnDate: null,
    notes: "Assigned for daily work",
  },
];

const defaultIssues = [
  {
    id: 1,
    assetId: 1,
    reportedBy: 1,
    title: "Screen flickering",
    description: "Laptop screen flickers intermittently",
    status: "Open",
    priority: "Medium",
    reportedDate: "2024-01-15",
    resolvedDate: null,
  },
];

const AppContext = createContext(null);

function readFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

export function AppProvider({ children }) {
  const [user, setUser] = useState(() => readFromStorage(STORAGE_KEYS.currentUser, null));
  const [assets, setAssets] = useState(() => readFromStorage(STORAGE_KEYS.assets, defaultAssets));
  const [users, setUsers] = useState(() => readFromStorage(STORAGE_KEYS.users, defaultUsers));
  const [assignments] = useState(() => readFromStorage(STORAGE_KEYS.assignments, defaultAssignments));
  const [issues, setIssues] = useState(() => readFromStorage(STORAGE_KEYS.issues, defaultIssues));

  useEffect(() => {
    writeToStorage(STORAGE_KEYS.assets, assets);
  }, [assets]);

  useEffect(() => {
    writeToStorage(STORAGE_KEYS.users, users);
  }, [users]);

  useEffect(() => {
    writeToStorage(STORAGE_KEYS.assignments, assignments);
  }, [assignments]);

  useEffect(() => {
    writeToStorage(STORAGE_KEYS.issues, issues);
  }, [issues]);

  useEffect(() => {
    if (user) {
      writeToStorage(STORAGE_KEYS.currentUser, user);
    } else {
      localStorage.removeItem(STORAGE_KEYS.currentUser);
    }
  }, [user]);

  // Permission checking utility
  const hasPermission = useCallback((permission) => {
    if (!user) return false;
    const userPermissions = ROLE_PERMISSIONS[user.role] || [];
    return userPermissions.includes(permission);
  }, [user]);

  const login = useCallback(async (email, password) => {
    const result = await loginApi(email, password);
    if (result.success) {
      const { access_token, user } = result.data;
      localStorage.setItem("access_token", access_token);
      setUser(user);
      return { success: true };
    } else {
      return { success: false, message: result.message };
    }
  }, []);

  const register = useCallback(async (name, email, password) => {
    const result = await registerApi(name, email, password);
    if (result.success) {
      const { access_token, user } = result.data;
      localStorage.setItem("access_token", access_token);
      setUser(user);
      return { success: true };
    } else {
      return { success: false, message: result.message };
    }
  }, []);

  const logout = () => {
    setUser(null);
  };

  // Asset operations
  const addAsset = useCallback((asset) => {
    const nextId = Math.max(0, ...assets.map((a) => a.id)) + 1;
    const newAsset = {
      ...asset,
      id: nextId,
      assignedTo: null,
      purchaseDate: new Date().toISOString().split("T")[0],
    };
    setAssets([...assets, newAsset]);
  }, [assets]);

  // Issue operations
  const reportIssue = useCallback((assetId, title, description, priority) => {
    const nextId = Math.max(0, ...issues.map((i) => i.id)) + 1;
    const newIssue = {
      id: nextId,
      assetId: parseInt(assetId),
      reportedBy: user.id,
      title: title.trim(),
      description: description.trim(),
      status: "Open",
      priority,
      reportedDate: new Date().toISOString().split("T")[0],
      resolvedDate: null,
    };
    setIssues([...issues, newIssue]);
  }, [issues, user]);

  const updateIssueStatus = useCallback((issueId, newStatus) => {
    setIssues(issues.map(issue =>
      issue.id === issueId
        ? {
            ...issue,
            status: newStatus,
            resolvedDate: newStatus === "Closed" ? new Date().toISOString().split("T")[0] : issue.resolvedDate
          }
        : issue
    ));
  }, [issues]);

  const returnAsset = useCallback((assignmentId) => {
    setAssignments(assignments.map(assignment =>
      assignment.id === assignmentId
        ? { ...assignment, returnDate: new Date().toISOString().split("T")[0] }
        : assignment
    ));
  }, [assignments]);

  const value = useMemo(
    () => ({
      user,
      assets,
      users,
      assignments,
      issues,
      login,
      register,
      logout,
      addAsset,
      reportIssue,
      updateIssueStatus,
      returnAsset,
      hasPermission,
      PERMISSIONS,
    }),
    [user, assets, users, assignments, issues, login, register, addAsset, reportIssue, updateIssueStatus, returnAsset, hasPermission]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export { AppContext };
