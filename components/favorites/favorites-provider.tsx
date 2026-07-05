"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { useAuth } from "@/components/auth/auth-provider";

// ponytail: избранное хранится в localStorage (клиентский стор).
const STORAGE_KEY = "kraskaprof.favorites.v1";

interface FavoritesContextValue {
  favorites: string[];
  isFavorite: (slug: string) => boolean;
  toggle: (slug: string) => void;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (user) {
        // load from server
        try {
          const res = await fetch("/api/favorites");
          if (res.ok) {
            const data = await res.json();
            if (mounted) setFavorites(data);
            return;
          }
        } catch {}
      }
      // fallback to localStorage
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && mounted) setFavorites(parsed);
        }
      } catch {}
    }
    load();
    return () => {
      mounted = false;
    };
  }, [user]);

  const toggle = useCallback((slug: string) => {
    setFavorites((prev) => {
      const next = prev.includes(slug)
        ? prev.filter((s) => s !== slug)
        : [...prev, slug];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {}
      // sync with server when logged in
      if (user) {
        if (prev.includes(slug)) {
          fetch("/api/favorites", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId: slug }),
          });
        } else {
          fetch("/api/favorites", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId: slug }),
          });
        }
      }
      return next;
    });
  }, []);

  const value = useMemo<FavoritesContextValue>(
    () => ({
      favorites,
      isFavorite: (slug: string) => favorites.includes(slug),
      toggle,
    }),
    [favorites, toggle],
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites(): FavoritesContextValue {
  const ctx = useContext(FavoritesContext);
  if (!ctx)
    throw new Error(
      "useFavorites должен использоваться внутри <FavoritesProvider>",
    );
  return ctx;
}
