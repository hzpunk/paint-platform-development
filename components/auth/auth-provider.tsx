"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

/**
 * Тип пользователя на клиенте — соответствует тому, что отдаёт GET /api/me (без пароля).
 */
export type User = {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  role: string;
  bonusBalance: number;
  totalSpent: number;
  lastLoginAt?: string | null;
};

type AuthContext = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; name?: string; phone?: string; password: string; referredByCode?: string }) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const Ctx = createContext<AuthContext | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  /** Загрузить профиль текущего пользователя из /api/me (JWT в httpOnly cookie) */
  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get("ref");
      if (ref) {
        localStorage.setItem("kraskaprof.referred_by_code", ref);
      }
    }
  }, []);

  async function login(email: string, password: string) {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || "Ошибка входа");
    }

    await refresh();
  }

  async function register(data: {
    email: string;
    name?: string;
    phone?: string;
    password: string;
    referredByCode?: string;
  }) {
    const refCode = data.referredByCode || (typeof window !== "undefined" ? localStorage.getItem("kraskaprof.referred_by_code") : null);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, referredByCode: refCode }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.message || "Ошибка регистрации");
    }

    if (typeof window !== "undefined") {
      localStorage.removeItem("kraskaprof.referred_by_code");
    }

    await refresh();
  }

  async function logout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    setUser(null);
  }

  return (
    <Ctx.Provider value={{ user, loading, login, register, logout, refresh }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be used within AuthProvider");
  return c;
}
