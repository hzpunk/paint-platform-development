'use client'

import { useState, useEffect } from 'react'
import { PlusCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import type { Product } from '@/lib/types'
import type { Category, Brand } from '@prisma/client'
import { formatPrice } from '@/lib/format'
import { ProductForm } from './product-form'

interface ProductWithRelations extends Omit<Product, 'categorySlug' | 'brand'> {
  category: Category | null
  brand: Brand | null
}

export function ProductsTable() {
  const [products, setProducts] = useState<ProductWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/products')
      if (!response.ok) throw new Error('Ошибка загрузки товаров')
      const data = await response.json()
      setProducts(data)
    } catch {
      setError('Не удалось загрузить товары')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (productData: Partial<Product>) => {
    const method = selectedProduct ? 'PATCH' : 'POST'
    const url = selectedProduct ? `/api/admin/products/${selectedProduct.id}` : '/api/admin/products'

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      })

      if (!response.ok) {
        throw new Error(selectedProduct ? 'Ошибка обновления товара' : 'Ошибка создания товара')
      }

      await fetchProducts()
      setIsFormOpen(false)
      setSelectedProduct(null)
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleDelete = async (productId: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот товар?')) return

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Ошибка удаления товара')
      }

      await fetchProducts()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleDeleteAll = async () => {
    if (!products.length) return
    if (!confirm(`Удалить все ${products.length} товаров?`)) return

    try {
      for (const product of products) {
        const response = await fetch(`/api/admin/products/${product.id}`, { method: 'DELETE' })
        if (!response.ok) throw new Error('Ошибка удаления товара')
      }
      await fetchProducts()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const isRenderableImage = (value?: string | null) => {
    if (!value) return false
    if (value.startsWith('#') && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value)) return false
    return value.startsWith('data:image/') || value.startsWith('http://') || value.startsWith('https://') || value.startsWith('/')
  }

  const openForm = (product: ProductWithRelations | null = null) => {
    if (product) {
      const productForForm: Product = {
        ...product,
        categorySlug: product.category?.slug || '',
        brand: product.brand?.slug || '',
        inStock: product.stock > 0,
        packaging: product.packaging || [],
        colors: product.colors || [],
        specs: product.specs || ({} as any),
      }
      setSelectedProduct(productForForm)
      setSelectedProductId(product.id)
    } else {
      setSelectedProduct(null)
      setSelectedProductId(null)
    }
    setIsFormOpen(true)
  }

  if (loading) return <div>Загрузка...</div>
  if (error) return <div className="text-destructive">{error}</div>

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold">Товары</h2>
        <div className="flex flex-wrap gap-2">
          <Button variant="destructive" onClick={handleDeleteAll} disabled={!products.length}>
            Удалить все
          </Button>
          <Button onClick={() => openForm()} className="gap-2">
            <PlusCircle className="size-4" />
            Добавить товар
          </Button>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          Товары пока не добавлены.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => {
            const primaryImage = Array.isArray(product.images) ? product.images[0] : null
            const firstColor = Array.isArray(product.colors) ? product.colors[0]?.hex : null
            const isInStock = product.stock > 0

            return (
              <Card
                key={product.id}
                className={`group flex h-full flex-col overflow-hidden bg-card shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:ring-2 hover:ring-primary/20 ${selectedProductId === product.id ? 'border-primary/60 shadow-lg ring-2 ring-primary/20' : 'border-border/60'}`}
                onClick={() => setSelectedProductId(product.id)}
              >
                <CardHeader className="p-0">
                  <div className="relative aspect-[4/3] overflow-hidden bg-muted/60">
                    {isRenderableImage(primaryImage) ? (
                      <img
                        src={primaryImage}
                        alt={product.name}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : firstColor ? (
                      <div
                        className="absolute inset-0 transition-transform duration-300 group-hover:scale-105"
                        style={{ backgroundColor: firstColor }}
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted/70" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" />
                    <div className="absolute left-2 top-2">
                      <Badge variant={isInStock ? 'outline' : 'destructive'}>
                        {isInStock ? 'В наличии' : 'Под заказ'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="flex flex-1 flex-col gap-2 p-4">
                  <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                    {product.brand?.name || 'Бренд'}
                  </p>
                  <h3 className="line-clamp-2 text-base font-semibold leading-tight text-foreground">
                    {product.name}
                  </h3>
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {product.shortSpec || product.description || 'Качественное покрытие для любых задач.'}
                  </p>
                  <div className="mt-auto flex items-center justify-between gap-3 pt-2">
                    <div>
                      <p className="text-lg font-semibold">{formatPrice(product.price)}</p>
                      <p className="text-xs text-muted-foreground">{product.category?.name || 'Категория'}</p>
                    </div>
                    <Badge variant="secondary">Остаток {product.stock}</Badge>
                  </div>
                </CardContent>

                <CardFooter className="flex items-center justify-between gap-2 border-t bg-muted/20 p-4">
                  <Button variant="outline" size="sm" onClick={() => openForm(product)}>
                    Редактировать
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(product.id)}>
                    Удалить
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}

      {isFormOpen && (
        <ProductForm
          product={selectedProduct}
          onSave={handleSave}
          onCancel={() => {
            setIsFormOpen(false)
            setSelectedProduct(null)
            setSelectedProductId(null)
          }}
        />
      )}
    </>
  )
}
