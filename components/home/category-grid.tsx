'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Home,
  Building2,
  Layers,
  Paintbrush,
  ShieldCheck,
  FlaskConical,
  ArrowUpRight,
  type LucideIcon,
} from 'lucide-react'
import { categories as fallbackCategories } from '@/lib/data'

const ICONS: Record<string, LucideIcon> = {
  Home,
  Building2,
  Layers,
  Paintbrush,
  ShieldCheck,
  FlaskConical,
}

interface Category {
  id: string
  slug: string
  name: string
  icon?: string | null
  description?: string | null
  _count?: {
    products: number
  }
}

/**
 * Компонент сетки категорий
 * Загружает категории с сервера через API,
 * при недоступности API показывает статический список
 */
export function CategoryGrid() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories')
        if (!response.ok) {
          throw new Error('Ошибка загрузки категорий')
        }
        const data = await response.json()
        setCategories(Array.isArray(data) && data.length > 0 ? data : (fallbackCategories as Category[]))
      } catch (err) {
        console.error('Ошибка при загрузке категорий:', err)
        setCategories(fallbackCategories as Category[])
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  return (
    <section className="section-shell py-14 md:py-20">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-foreground/60">
            Каталог
          </p>
          <h2 className="mt-1 font-heading text-2xl font-bold text-balance md:text-3xl">
            Категории
          </h2>
          <p className="mt-1.5 text-muted-foreground">
            Выберите тип покрытия для вашей задачи
          </p>
        </div>
        <Link
          href="/catalog"
          className="hidden items-center gap-1 text-sm font-semibold text-primary transition-colors hover:text-primary/80 sm:flex"
        >
          Весь каталог
          <ArrowUpRight className="size-4" />
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-40 rounded-xl bg-muted" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {categories.map((c) => {
            const Icon = ICONS[c.icon ?? ''] ?? Layers
            return (
              <Link
                key={c.slug}
                href={`/catalog?category=${c.slug}`}
                className="group relative flex flex-col items-center gap-3 overflow-hidden rounded-xl border border-border bg-card p-5 text-center shadow-[var(--shadow-card)] transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[var(--shadow-card-hover)]"
              >
                <span className="flex size-13 items-center justify-center rounded-xl bg-secondary text-primary transition-all duration-200 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="size-6" />
                </span>
                <span className="text-sm font-semibold leading-tight">{c.name}</span>
                {c.description && (
                  <span className="line-clamp-2 text-xs leading-snug text-muted-foreground">
                    {c.description}
                  </span>
                )}
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-accent transition-transform duration-200 group-hover:scale-x-100"
                />
              </Link>
            )
          })}
        </div>
      )}
    </section>
  )
}
