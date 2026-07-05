'use client'

import { useState, useMemo, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search as SearchIcon, FileText, Package, AlertCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ProductCard } from '@/components/product/product-card'
import { products, blogPosts, HITS } from '@/lib/data'
import { formatDate } from '@/lib/format'

function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialQuery = searchParams.get('q') ?? ''

  const [query, setQuery] = useState(initialQuery)
  const [activeTab, setActiveTab] = useState<'products' | 'articles'>('products')

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = query.trim()
    router.push(trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : '/search')
  }

  // Фильтруем товары
  const matchedProducts = useMemo(() => {
    if (!initialQuery.trim()) return []
    const q = initialQuery.toLowerCase()
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.shortSpec.toLowerCase().includes(q) ||
        p.type.toLowerCase().includes(q)
    )
  }, [initialQuery])

  // Фильтруем статьи
  const matchedArticles = useMemo(() => {
    if (!initialQuery.trim()) return []
    const q = initialQuery.toLowerCase()
    return blogPosts.filter(
      (post) =>
        post.title.toLowerCase().includes(q) ||
        post.excerpt.toLowerCase().includes(q) ||
        post.content.toLowerCase().includes(q) ||
        post.category.toLowerCase().includes(q)
    )
  }, [initialQuery])

  const totalResults = matchedProducts.length + matchedArticles.length

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-8 md:px-6">
      {/* Форма поиска на странице */}
      <div className="mb-8 max-w-xl">
        <h1 className="font-heading text-2xl font-bold mb-4 md:text-3xl text-primary">Поиск по сайту</h1>
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Поиск красок, статей..."
              className="pl-9"
            />
          </div>
          <Button type="submit">Найти</Button>
        </form>
      </div>

      {initialQuery.trim() === '' ? (
        // Пустой запрос
        <div>
          <div className="rounded-lg border border-border bg-card p-8 text-center text-muted-foreground mb-8">
            Введите поисковый запрос, чтобы начать поиск.
          </div>
          <div>
            <h2 className="font-heading text-xl font-bold mb-4">Популярные товары</h2>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {HITS.slice(0, 4).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </div>
      ) : totalResults === 0 ? (
        // Ничего не найдено
        <div>
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-8 text-center text-muted-foreground mb-8 flex flex-col items-center gap-3">
            <AlertCircle className="size-8 text-destructive" />
            <p className="text-lg font-medium text-foreground">По запросу «{initialQuery}» ничего не найдено</p>
            <p className="text-sm">Попробуйте использовать другие ключевые слова или проверьте опечатки.</p>
          </div>
          <div>
            <h2 className="font-heading text-xl font-bold mb-4">Популярные товары</h2>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {HITS.slice(0, 4).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </div>
      ) : (
        // Результаты найдены
        <div>
          <p className="text-sm text-muted-foreground mb-6">
            Найдено {totalResults} результатов по запросу «{initialQuery}»
          </p>

          {/* Табы */}
          <div className="mb-6 flex gap-2 border-b border-border pb-px">
            <button
              onClick={() => setActiveTab('products')}
              className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                activeTab === 'products'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Package className="size-4" />
              Товары ({matchedProducts.length})
            </button>
            <button
              onClick={() => setActiveTab('articles')}
              className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                activeTab === 'articles'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <FileText className="size-4" />
              Статьи ({matchedArticles.length})
            </button>
          </div>

          {/* Контент табов */}
          {activeTab === 'products' && (
            <div>
              {matchedProducts.length === 0 ? (
                <p className="text-muted-foreground py-8">Товары не найдены.</p>
              ) : (
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {matchedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'articles' && (
            <div>
              {matchedArticles.length === 0 ? (
                <p className="text-muted-foreground py-8">Статьи не найдены.</p>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {matchedArticles.map((post) => (
                    <article
                      key={post.slug}
                      className="flex flex-col overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <span className="w-fit rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-semibold text-accent-foreground">
                        {post.category}
                      </span>
                      <h2 className="mt-4 font-heading text-lg font-bold hover:text-primary">
                        <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                      </h2>
                      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                        {post.excerpt}
                      </p>
                      <span className="mt-4 text-xs text-muted-foreground">
                        {formatDate(post.date)}
                      </span>
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-[1280px] px-4 py-8 md:px-6">Загрузка результатов поиска...</div>}>
      <SearchContent />
    </Suspense>
  )
}
