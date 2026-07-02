'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react'

// ponytail: избранное хранится в localStorage (клиентский стор).
const STORAGE_KEY = 'kraskaprof.favorites.v1'

interface FavoritesContextValue {
  favorites: string[]
  isFavorite: (slug: string) => boolean
  toggle: (slug: string) => void
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null)

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) setFavorites(parsed)
      }
    } catch {
      // игнорируем ошибку чтения
    }
  }, [])

  const toggle = useCallback(
    (slug: string) => {
      setFavorites((prev) => {
        const next = prev.includes(slug)
          ? prev.filter((s) => s !== slug)
          : [...prev, slug]
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
        } catch {
          // игнорируем
        }
        return next
      })
    },
    [],
  )

  const value = useMemo<FavoritesContextValue>(
    () => ({
      favorites,
      isFavorite: (slug: string) => favorites.includes(slug),
      toggle,
    }),
    [favorites, toggle],
  )

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
}

export function useFavorites(): FavoritesContextValue {
  const ctx = useContext(FavoritesContext)
  if (!ctx) throw new Error('useFavorites должен использоваться внутри <FavoritesProvider>')
  return ctx
}
