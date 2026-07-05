"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "kraskaprof.user.v1";

export type User = {
  name: string;
  email?: string;
  phone?: string;
  bonusBalance?: number;
  totalSpent?: number;
  referralCode?: string;
};

type AuthContext = {
  user: User | null;
  login: (email: string, phone: string) => Promise<User>;
  register: (u: User) => Promise<User>;
  logout: () => void;
};

const Ctx = createContext<AuthContext | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {}
  }, []);

  function persist(u: User | null) {
    try {
      if (u) localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
      else localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }

  async function login(email: string, phone: string) {
    // simplistic: if stored user matches email/phone, return it; else create a minimal user
    let u: User | null = null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (
          (parsed.email && parsed.email === email) ||
          (parsed.phone && parsed.phone === phone)
        )
          u = parsed;
      }
    } catch {}
    if (!u) {
      u = {
        name: email.split("@")[0] || phone,
        email,
        phone,
        bonusBalance: 0,
        totalSpent: 0,
        referralCode:
          "REF" + Math.random().toString(36).slice(2, 8).toUpperCase(),
      };
    }
    setUser(u);
    persist(u);
    return u;
  }

  async function register(u: User) {
    const toSave = {
      bonusBalance: 0,
      totalSpent: 0,
      referralCode:
        "REF" + Math.random().toString(36).slice(2, 8).toUpperCase(),
      ...u,
    };
    setUser(toSave);
    persist(toSave);
    return toSave;
  }

  function logout() {
    setUser(null);
    persist(null);
  }

  return (
    <Ctx.Provider value={{ user, login, register, logout }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be used within AuthProvider");
  return c;
}
