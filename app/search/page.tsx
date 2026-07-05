'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { ProductCard } from '@/components/product/product-card'
import type { Product } from '@/lib/types'

function SearchPageContent() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [loading, setLoading] = useState(Boolean(query))

  useEffect(() => {
    if (!query) {
      setSearchResults([])
      setLoading(false)
      return
    }

    let mounted = true
    setLoading(true)

    fetch(`/api/products?search=${encodeURIComponent(query)}`)
      .then((res) => res.json())
      .then((data) => {
        if (!mounted) return
        setSearchResults(data.products || [])
      })
      .catch(() => {
        if (!mounted) return
        setSearchResults([])
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [query])

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-2">
        Результаты поиска: <span className="text-primary">{query}</span>
      </h1>
      <p className="text-muted-foreground mb-6">
        {loading ? 'Идёт поиск…' : `Найдено ${searchResults.length} товаров`}
      </p>

      {!loading && searchResults.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {searchResults.map(p => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-lg text-muted-foreground">По вашему запросу ничего не найдено.</p>
        </div>
      )}
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="container py-8">Загрузка поиска…</div>}>
      <SearchPageContent />
    </Suspense>
  )
}
