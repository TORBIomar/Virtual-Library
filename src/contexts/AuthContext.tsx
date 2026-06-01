import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "@/lib/types";
import { MOCK_USERS } from "@/lib/mockData";
import { setToken } from "@/lib/api/client";

interface AuthState {
  user: User | null;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  logout: () => void;
}

const AuthCtx = createContext<AuthState | null>(null);
const STORAGE_KEY = "smartlib_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) setUser(JSON.parse(raw));
  }, []);

  const persist = (u: User | null) => {
    setUser(u);
    if (u) localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    else localStorage.removeItem(STORAGE_KEY);
  };

  const login = async (email: string, password: string) => {
    // Mock: any password works for known emails; "admin" keyword -> admin
    const known = MOCK_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
    const u: User = known ?? {
      id: crypto.randomUUID(),
      name: email.split("@")[0],
      email,
      role: email.toLowerCase().includes("admin") ? "ADMIN" : "READER",
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setToken(`mock.${u.id}.${Date.now()}`);
    persist(u);
    void password;
    return u;
  };

  const register = async (name: string, email: string, password: string) => {
    const u: User = {
      id: crypto.randomUUID(),
      name,
      email,
      role: "READER",
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setToken(`mock.${u.id}.${Date.now()}`);
    persist(u);
    void password;
    return u;
  };

  const logout = () => {
    setToken(null);
    persist(null);
  };

  return <AuthCtx.Provider value={{ user, login, register, logout }}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
