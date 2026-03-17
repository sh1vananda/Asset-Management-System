import { createContext, useEffect, useMemo, useState, useCallback } from "react";

const STORAGE_KEYS = {
  currentUser: "am_current_user",
  assets: "am_assets",
  users: "am_users",
  assignments: "am_assignments",
  issues: "am_issues",
};

import { ROLES, PERMISSIONS, ROLE_PERMISSIONS } from "./constants";

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
    assetId: 1,
    userId: 1,
    assignedDate: "2024-01-10",
    returnDate: null,
    notes: "Assigned for daily work",
  },
];

const defaultIssues = [
  {
    id: 1,
    assetId: 2,
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
  // const [assignments] = useState(() => readFromStorage(STORAGE_KEYS.assignments, defaultAssignments));
  const [assignments, setAssignments] = useState(() =>
  readFromStorage(STORAGE_KEYS.assignments, defaultAssignments)
);
  const [issues] = useState(() => readFromStorage(STORAGE_KEYS.issues, defaultIssues));

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

  const login = useCallback((email, password) => {
    const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!existing) {
      return { success: false, message: "No user found with that email." };
    }
    if (existing.password !== password) {
      return { success: false, message: "Invalid password." };
    }
    setUser({ id: existing.id, name: existing.name, email: existing.email, role: existing.role });
    return { success: true };
  }, [users]);

  const register = useCallback((name, email, password) => {
    const normalizedEmail = email.toLowerCase().trim();
    if (users.some((u) => u.email.toLowerCase() === normalizedEmail)) {
      return { success: false, message: "An account with that email already exists." };
    }
    const nextId = Math.max(0, ...users.map((u) => u.id)) + 1;
    const newUser = { id: nextId, name: name.trim(), email: normalizedEmail, password, role: ROLES.EMPLOYEE };
    const nextUsers = [...users, newUser];
    setUsers(nextUsers);
    setUser({ id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role });
    return { success: true };
  }, [users]);

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

  // Assign asset
  const assignAsset = useCallback((assetId, userId, notes) => {

  const asset = assets.find(a => a.id === Number(assetId));

  if (!asset) return;

  // prevent duplicate assignment
  const alreadyAssigned = assignments.find(
    a => a.assetId === Number(assetId) && !a.returnDate
  );

  if (alreadyAssigned) {
    alert("Asset already assigned");
    return;
  }

  const nextId = Math.max(0, ...assignments.map(a => a.id)) + 1;

  const newAssignment = {
    id: nextId,
    assetId: Number(assetId),
    userId: Number(userId),
    assignedBy: user?.id || 0,
    assignedDate: new Date().toISOString(),
    returnDate: null,
    notes
  };

  setAssignments([...assignments, newAssignment]);

  // update asset status
  const updatedAssets = assets.map(a =>
    a.id === Number(assetId)
      ? { ...a, status: "Assigned", assignedTo: Number(userId) }
      : a
  );

  setAssets(updatedAssets);

}, [assignments, assets, user]);

// Return asset
const returnAsset = useCallback((assignmentId) => {

  const assignment = assignments.find(a => a.id === assignmentId);

  if (!assignment) return;

  const updatedAssignments = assignments.map(a =>
    a.id === assignmentId
      ? { ...a, returnDate: new Date().toISOString() }
      : a
  );

  setAssignments(updatedAssignments);

  // update asset
  const updatedAssets = assets.map(a =>
    a.id === assignment.assetId
      ? { ...a, status: "Available", assignedTo: null }
      : a
  );

  setAssets(updatedAssets);

}, [assignments, assets]);

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
    assignAsset,
    returnAsset,
    hasPermission,
    PERMISSIONS,
    }),
    [user, assets, users, assignments, issues, login, register, addAsset, hasPermission]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export { AppContext };
