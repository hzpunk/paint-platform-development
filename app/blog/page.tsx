'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Calendar, Clock } from 'lucide-react'
import { blogPosts } from '@/lib/data'
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'

const CATEGORIES = ['Все', 'Как выбрать краску', 'Инструкции', 'Цветовые тренды', 'Обзоры брендов', 'FAQ']

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState('Все')

  const filteredPosts = blogPosts.filter(
    (post) => selectedCategory === 'Все' || post.category === selectedCategory
  )

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-12 md:px-6">
      {/* Шапка блога */}
      <div className="mb-10 text-center">
        <h1 className="font-heading text-4xl font-extrabold tracking-tight md:text-5xl text-primary">
          Блог КраскиУНАС
        </h1>
        <p className="mt-4 max-w-xl mx-auto text-lg text-muted-foreground leading-relaxed">
          Полезные советы, инструкции по нанесению, обзоры материалов и свежие тренды в дизайне интерьеров.
        </p>
      </div>

      {/* Категории/Рубрики */}
      <div className="mb-8 flex flex-wrap gap-2 justify-center border-b border-border pb-6">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={cn(
              'rounded-full px-4 py-2 text-sm font-medium transition-all duration-200',
              selectedCategory === cat
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'bg-muted hover:bg-muted-foreground/15 text-muted-foreground hover:text-foreground'
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Сетка статей */}
      {filteredPosts.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-lg font-medium text-muted-foreground">В этой категории пока нет статей.</p>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredPosts.map((post) => (
            <article
              key={post.slug}
              className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1"
            >
              {/* Обложка */}
              <div
                className="aspect-video w-full transition-transform duration-300 group-hover:scale-[1.02]"
                style={{ backgroundColor: post.cover }}
              />
              <div className="flex flex-1 flex-col p-6">
                <span className="w-fit rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent-foreground">
                  {post.category}
                </span>
                <h2 className="mt-4 font-heading text-xl font-bold leading-snug group-hover:text-primary transition-colors">
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </h2>
                <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                  {post.excerpt}
                </p>
                <div className="mt-auto pt-6 flex items-center justify-between text-xs text-muted-foreground border-t border-border">
                  <span className="flex items-center gap-1">
                    <Calendar className="size-3.5" />
                    {formatDate(post.date)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="size-3.5" />
                    {post.readingTime} мин.
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
