"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { User } from "@/types/api";
import { mockUsers } from "@/lib/mock-data";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginAsMock: (role: "user" | "organizer" | "admin" | "staff") => void;
  register: (email: string, password: string, username: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── Storage helpers ───

const STORAGE_KEY = "vr_mock_user";

function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function storeUser(user: User | null) {
  if (typeof window === "undefined") return;
  if (user) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

// ─── Mock Auth Provider ───

function MockAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = getStoredUser();
    setUser(stored);
    setLoading(false);
  }, []);

  const loginAsMock = useCallback((role: "user" | "organizer" | "admin" | "staff") => {
    const u = mockUsers[role];
    setUser(u);
    storeUser(u);
  }, []);

  const login = useCallback(async () => {
    // For mock: email/password login just logs in as "user"
    loginAsMock("user");
  }, [loginAsMock]);

  const loginWithGoogle = useCallback(async () => {
    loginAsMock("user");
  }, [loginAsMock]);

  const register = useCallback(async (_email: string, _password: string, username: string) => {
    const u = { ...mockUsers.user, username };
    setUser(u);
    storeUser(u);
  }, []);

  const logout = useCallback(async () => {
    setUser(null);
    storeUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, login, loginWithGoogle, loginAsMock, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Real Firebase Auth Provider ───

function FirebaseAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const {
        auth,
        onAuthStateChanged,
      } = await import("@/lib/firebase");
      const axios = (await import("axios")).default;
      const authApi = axios.create({
        baseURL: process.env.NEXT_PUBLIC_API_URL,
        headers: { "Content-Type": "application/json" },
      });

      onAuthStateChanged(auth, async (fbUser) => {
        if (cancelled) return;
        if (fbUser) {
          try {
            const token = await fbUser.getIdToken();
            const res = await authApi.post("/auth/login", { idToken: token });
            setUser(res.data.user ?? res.data);
          } catch {
            setUser(null);
          }
        } else {
          setUser(null);
        }
        setLoading(false);
      });
    })();
    return () => { cancelled = true; };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { auth, signInWithEmailAndPassword } = await import("@/lib/firebase");
    const axios = (await import("axios")).default;
    const authApi = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL, headers: { "Content-Type": "application/json" } });
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const token = await cred.user.getIdToken();
    const res = await authApi.post("/auth/login", { idToken: token });
    setUser(res.data.user ?? res.data);
  }, []);

  const loginWithGoogle = useCallback(async () => {
    const { auth, googleProvider, signInWithPopup } = await import("@/lib/firebase");
    const axios = (await import("axios")).default;
    const authApi = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL, headers: { "Content-Type": "application/json" } });
    const cred = await signInWithPopup(auth, googleProvider);
    const token = await cred.user.getIdToken();
    try {
      const res = await authApi.post("/auth/login", { idToken: token });
      setUser(res.data.user ?? res.data);
    } catch {
      const res = await authApi.post("/auth/register", {
        idToken: token,
        username: cred.user.displayName || cred.user.email?.split("@")[0],
      });
      setUser(res.data.user ?? res.data);
    }
  }, []);

  const register = useCallback(async (email: string, password: string, username: string) => {
    const { auth, createUserWithEmailAndPassword } = await import("@/lib/firebase");
    const axios = (await import("axios")).default;
    const authApi = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL, headers: { "Content-Type": "application/json" } });
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const token = await cred.user.getIdToken();
    const res = await authApi.post("/auth/register", { idToken: token, username });
    setUser(res.data.user ?? res.data);
  }, []);

  const loginAsMock = useCallback(() => {
    // no-op in real mode
  }, []);

  const logout = useCallback(async () => {
    const { auth, signOut } = await import("@/lib/firebase");
    await signOut(auth);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, login, loginWithGoogle, loginAsMock, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Exports ───

export function AuthProvider({ children }: { children: ReactNode }) {
  if (USE_MOCK) return <MockAuthProvider>{children}</MockAuthProvider>;
  return <FirebaseAuthProvider>{children}</FirebaseAuthProvider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
