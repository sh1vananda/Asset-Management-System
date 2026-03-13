import { createContext, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEYS = {
  currentUser: "am_current_user",
  assets: "am_assets",
  users: "am_users",
};

const defaultAssets = [
  {
    id: 1,
    name: "Laptop",
    category: "Electronics",
    brand: "Dell",
    model: "XPS 13",
    status: "Available",
  },
  {
    id: 2,
    name: "Printer",
    category: "Hardware",
    brand: "HP",
    model: "LaserJet Pro",
    status: "Assigned",
  },
];

const defaultUsers = [
  {
    id: 1,
    name: "Test User",
    email: "test@example.com",
    password: "password123",
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

  useEffect(() => {
    writeToStorage(STORAGE_KEYS.assets, assets);
  }, [assets]);

  useEffect(() => {
    writeToStorage(STORAGE_KEYS.users, users);
  }, [users]);

  useEffect(() => {
    if (user) {
      writeToStorage(STORAGE_KEYS.currentUser, user);
    } else {
      localStorage.removeItem(STORAGE_KEYS.currentUser);
    }
  }, [user]);

  const login = (email, password) => {
    const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!existing) {
      return { success: false, message: "No user found with that email." };
    }
    if (existing.password !== password) {
      return { success: false, message: "Invalid password." };
    }
    setUser({ id: existing.id, name: existing.name, email: existing.email });
    return { success: true };
  };

  const register = (name, email, password) => {
    const normalizedEmail = email.toLowerCase().trim();
    if (users.some((u) => u.email.toLowerCase() === normalizedEmail)) {
      return { success: false, message: "An account with that email already exists." };
    }
    const nextId = Math.max(0, ...users.map((u) => u.id)) + 1;
    const newUser = { id: nextId, name: name.trim(), email: normalizedEmail, password };
    const nextUsers = [...users, newUser];
    setUsers(nextUsers);
    setUser({ id: newUser.id, name: newUser.name, email: newUser.email });
    return { success: true };
  };

  const logout = () => {
    setUser(null);
  };

  const addAsset = (asset) => {
    const nextId = Math.max(0, ...assets.map((a) => a.id)) + 1;
    const nextAssets = [...assets, { ...asset, id: nextId }];
    setAssets(nextAssets);
    return nextAssets;
  };

  const updateAsset = (updated) => {
    setAssets((prev) => prev.map((a) => (a.id === updated.id ? { ...a, ...updated } : a)));
  };

  const deleteAsset = (id) => {
    setAssets((prev) => prev.filter((a) => a.id !== id));
  };

  const value = useMemo(
    () => ({
      user,
      assets,
      login,
      register,
      logout,
      addAsset,
      updateAsset,
      deleteAsset,
    }),
    [user, assets]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useApp must be used within AppProvider");
  }
  return ctx;
}
