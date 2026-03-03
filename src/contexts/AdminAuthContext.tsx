"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";

// ─── Types ───

interface AdminUser {
  id: number;
  username: string;
}

interface AdminAuthContextType {
  admin: AdminUser | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(
  undefined
);

// ─── Storage helpers ───

const TOKEN_KEY = "admin_token";
const ADMIN_KEY = "admin_user";

function getStoredAdmin(): AdminUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(ADMIN_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

function storeAdmin(admin: AdminUser | null, token: string | null) {
  if (typeof window === "undefined") return;
  if (admin && token) {
    localStorage.setItem(ADMIN_KEY, JSON.stringify(admin));
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(ADMIN_KEY);
    localStorage.removeItem(TOKEN_KEY);
  }
}

// ─── Mock Admin Auth Provider ───

function MockAdminAuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedAdmin = getStoredAdmin();
    const storedToken = getStoredToken();
    if (storedAdmin && storedToken) {
      setAdmin(storedAdmin);
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    if (username === "admin" && password === "admin123") {
      const adminUser: AdminUser = { id: 99, username: "admin" };
      setAdmin(adminUser);
      storeAdmin(adminUser, "mock-admin-jwt-token");
    } else {
      throw new Error("Invalid credentials");
    }
  }, []);

  const logout = useCallback(() => {
    setAdmin(null);
    storeAdmin(null, null);
  }, []);

  return (
    <AdminAuthContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

// ─── Real Admin Auth Provider ───

function RealAdminAuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedAdmin = getStoredAdmin();
    const storedToken = getStoredToken();
    if (storedAdmin && storedToken) {
      setAdmin(storedAdmin);
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const axios = (await import("axios")).default;
    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/admin/login`,
      { username, password }
    );

    // Handle both snake_case and camelCase response
    const token: string =
      res.data.access_token ?? res.data.accessToken;
    const adminData = res.data.admin;

    if (!token) {
      throw new Error("No access token in response");
    }

    const adminUser: AdminUser = {
      id: adminData?.id,
      username: adminData?.username ?? username,
    };

    // Store token in localStorage and state
    storeAdmin(adminUser, token);
    setAdmin(adminUser);
  }, []);

  const logout = useCallback(() => {
    setAdmin(null);
    storeAdmin(null, null);
  }, []);

  return (
    <AdminAuthContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

// ─── Exports ───

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  if (USE_MOCK) return <MockAdminAuthProvider>{children}</MockAdminAuthProvider>;
  return <RealAdminAuthProvider>{children}</RealAdminAuthProvider>;
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context)
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return context;
}
