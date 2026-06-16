import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "@/lib/types";
import { setToken } from "@/lib/api/client";
import { authService } from "@/lib/api/services";

interface AuthState {
  user: User | null;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string, role?: string) => Promise<User>;
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
    const data = await authService.login(email, password);
    setToken(data.token);
    persist(data.user);
    return data.user;
  };

  const register = async (name: string, email: string, password: string, role?: string) => {
    const data = await authService.register(name, email, password, role);
    setToken(data.token);
    // Overwrite the name field if the backend doesn't store it
    const updatedUser = { ...data.user, name };
    persist(updatedUser);
    return updatedUser;
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
