'use client'

import { useEffect, useState } from 'react'
import { Star, Quote } from 'lucide-react'
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

  // Не показываем пустую секцию, если отзывов нет или произошла ошибка
  if (!loading && (error || reviews.length === 0)) {
    return null
  }

  return (
    <section className="border-t border-border bg-secondary/50">
      <div className="section-shell py-14 md:py-20">
        <div className="mb-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-foreground/60">
            Нам доверяют
          </p>
          <h2 className="mt-1 font-heading text-2xl font-bold text-balance md:text-3xl">
            Отзывы покупателей
          </h2>
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-48 rounded-xl bg-muted" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review) => {
              const name = review.user?.name || review.author || 'Покупатель'
              const initial = name.trim().charAt(0).toUpperCase() || 'П'
              return (
                <figure
                  key={review.id}
                  className="relative flex flex-col rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-card-hover)]"
                >
                  <Quote
                    aria-hidden="true"
                    className="absolute top-5 right-5 size-6 text-secondary-foreground/15"
                  />
                  <div
                    className="flex items-center gap-1"
                    role="img"
                    aria-label={`Оценка: ${review.rating} из 5`}
                  >
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          'size-4',
                          i < review.rating
                            ? 'fill-accent text-accent'
                            : 'text-border',
                        )}
                      />
                    ))}
                  </div>
                  <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-foreground/85">
                    {review.text}
                  </blockquote>
                  <figcaption className="mt-5 flex items-center gap-3 border-t border-border pt-4">
                    <span className="flex size-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                      {initial}
                    </span>
                    <span className="text-sm font-semibold">{name}</span>
                  </figcaption>
                </figure>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
