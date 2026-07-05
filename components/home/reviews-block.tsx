'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Review } from '@/lib/types'

/**
 * Компонент блока отзывов
 * Загружает последние отзывы с сервера через API
 */
export default function ReviewsBlock() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch('/api/reviews')
        if (!response.ok) {
          throw new Error('Ошибка загрузки отзывов')
        }
        const data = await response.json()
        setReviews(data)
      } catch (err) {
        console.error('Ошибка при загрузке отзывов:', err)
        setError('Не удалось загрузить отзывы')
      } finally {
        setLoading(false)
      }
    }

    fetchReviews()
  }, [])

  if (loading) {
    return (
      <section className="border-t border-border bg-muted/40">
        <div className="mx-auto max-w-[1280px] px-4 py-14 md:px-6">
          <h2 className="mb-8 text-center font-heading text-2xl font-bold md:text-3xl">Отзывы</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-48 rounded-lg bg-muted"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="border-t border-border bg-muted/40">
        <div className="mx-auto max-w-[1280px] px-4 py-14 md:px-6">
          <div className="text-center text-destructive">
            <p>{error}</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="border-t border-border bg-muted/40">
      <div className="mx-auto max-w-[1280px] px-4 py-14 md:px-6">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-heading text-2xl font-bold md:text-3xl">Отзывы</h2>
            <p className="mt-1 text-muted-foreground">Что говорят наши покупатели</p>
          </div>
          <Link href="/reviews" className="hidden text-sm font-medium text-primary hover:underline sm:block">
            Все отзывы
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review) => (
            <div key={review.id} className="rounded-lg border border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <div className="font-semibold">{review.user?.name || review.author || 'Покупатель'}</div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        'size-4',
                        i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'
                      )}
                    />
                  ))}
                </div>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{review.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}