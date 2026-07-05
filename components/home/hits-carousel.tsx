'use client'

import { useEffect, useState, useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ProductCard } from '@/components/product/product-card'
import type { Product } from '@/lib/types'

/**
 * Компонент карусели хитов продаж
 * Загружает товары-хиты с сервера через API
 */
export function HitsCarousel() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchHits = async () => {
      try {
        const response = await fetch('/api/products?hit=true&limit=12')
        if (!response.ok) {
          throw new Error('Ошибка загрузки хитов продаж')
        }
        const data = await response.json()
        setProducts(data.products)
      } catch (err) {
        console.error('Ошибка при загрузке хитов продаж:', err)
        setError('Не удалось загрузить хиты продаж')
      } finally {
        setLoading(false)
      }
    }

    fetchHits()
  }, [])

  const scroll = (dir: 'left' | 'right') => {
    const el = ref.current
    if (!el) return
    el.scrollBy({ left: dir === 'left' ? -320 : 320, behavior: 'smooth' })
  }

  if (loading) {
    return (
      <section className="mx-auto max-w-[1280px] px-4 py-14 md:px-6">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-heading text-2xl font-bold md:text-3xl">Хиты продаж</h2>
            <p className="mt-1 text-muted-foreground">Самые востребованные товары месяца</p>
          </div>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="w-72 shrink-0 animate-pulse">
              <div className="h-96 rounded-lg bg-muted"></div>
            </div>
          ))}
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="mx-auto max-w-[1280px] px-4 py-14 md:px-6">
        <div className="text-center text-destructive">
          <p>{error}</p>
        </div>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-[1280px] px-4 py-14 md:px-6">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-bold md:text-3xl">Хиты продаж</h2>
          <p className="mt-1 text-muted-foreground">Самые востребованные товары месяца</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => scroll('left')}
            aria-label="Прокрутить влево"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => scroll('right')}
            aria-label="Прокрутить вправо"
          >
            <ChevronRight className="size-4" />
          </Button>
          <Link href="/catalog" className="hidden text-sm font-medium text-primary hover:underline sm:block ml-2">
            Весь каталог
          </Link>
        </div>
      </div>

      <div
        ref={ref}
        className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {products.map((product) => (
          <div
            key={product.id}
            className="w-72 shrink-0"
            style={{ scrollSnapAlign: 'start' }}
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  )
}