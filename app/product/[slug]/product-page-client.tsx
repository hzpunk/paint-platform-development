'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Star, Minus, Plus } from 'lucide-react'
import { Product, Review, Packaging } from '@/lib/types'
import { ProductCard } from '@/components/product/product-card'
import { Separator } from '@/components/ui/separator'
import { AddToCartButton } from '@/components/product/add-to-cart-button'
import { bonusFor } from '@/lib/data'
import { cn, formatDate } from '@/lib/utils'

interface ProductPageClientProps {
  product: Product
  related: Product[]
  reviews: Review[]
  accessories: Product[]
}

export function ProductPageClient({
  product,
  related,
  reviews,
  accessories,
}: ProductPageClientProps) {
  const [quantity, setQuantity] = useState(1)
  const [selectedPackaging, setSelectedPackaging] = useState<Packaging>(
    product.packaging[0]
  )

  const bonus = bonusFor(selectedPackaging.price * quantity)

  return (
    <div className="container py-8">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Изображение */}
        <div>
          <div
            className="aspect-square rounded-lg bg-muted flex items-center justify-center"
            style={{ backgroundColor: product.colors[0]?.hex || '#f1f5f9' }}
          >
            {/* Placeholder for image */}
          </div>
        </div>

        {/* Информация о товаре */}
        <div className="space-y-4">
          <div>
            <p className="text-sm uppercase tracking-wide text-muted-foreground">
              {product.brand}
            </p>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-1">
                <Star className="size-5 fill-primary text-primary" />
                <span className="font-bold">{product.rating}</span>
              </div>
              <a href="#reviews" className="text-sm text-muted-foreground hover:underline">
                ({product.reviewsCount} отзывов)
              </a>
            </div>
          </div>

          <p className="text-lg">{product.shortSpec}</p>

          {/* Выбор фасовки */}
          <div className="space-y-2">
            <h3 className="font-semibold">Фасовка</h3>
            <RadioGroup
              value={selectedPackaging.sku}
              onValueChange={(sku) =>
                setSelectedPackaging(
                  product.packaging.find((p) => p.sku === sku)!
                )
              }
              className="flex flex-wrap gap-2"
            >
              {product.packaging.map((p) => (
                <Label
                  key={p.sku}
                  htmlFor={p.sku}
                  className={cn(
                    'cursor-pointer rounded-md border px-4 py-2 transition-colors',
                    {
                      'border-primary text-primary bg-primary/10':
                        selectedPackaging.sku === p.sku,
                      'hover:bg-muted/50': selectedPackaging.sku !== p.sku,
                    }
                  )}
                >
                  <RadioGroupItem value={p.sku} id={p.sku} className="sr-only" />
                  <span>{p.volume} л</span>
                </Label>
              ))}
            </RadioGroup>
          </div>

          {/* Цена и количество */}
          <div className="flex items-center justify-between rounded-lg bg-muted p-4">
            <div>
              <p className="text-3xl font-bold">
                {selectedPackaging.price * quantity} ₽
              </p>
              <p className="text-sm text-primary">+ {bonus} баллов</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Minus className="size-4" />
              </Button>
              <span className="w-10 text-center font-bold">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(quantity + 1)}
              >
                <Plus className="size-4" />
              </Button>
            </div>
          </div>

          <AddToCartButton
            product={product}
            quantity={quantity}
            selectedPackaging={selectedPackaging}
          />

          {/* Описание */}
          <div className="prose max-w-none">
            <h3>Описание</h3>
            <p>{product.description}</p>
            <h3>Применение</h3>
            <p>{product.application}</p>
          </div>
        </div>
      </div>

      {/* Характеристики */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">Характеристики</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 rounded-lg border p-4">
          {Object.entries(product.specs).map(([key, value]) => (
            <div key={key}>
              <p className="text-sm text-muted-foreground">{key}</p>
              <p className="font-medium">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Похожие товары */}
      {related.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-4">Похожие товары</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      {/* С этим покупают */}
      {accessories.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-4">С этим покупают</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {accessories.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      {/* Отзывы */}
      <div id="reviews" className="mt-12">
        <h2 className="text-2xl font-bold mb-4">Отзывы</h2>
        <div className="space-y-6">
          {reviews.map((r) => (
            <div key={r.id}>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        'size-5',
                        i < r.rating ? 'fill-primary text-primary' : 'text-muted-foreground'
                      )}
                    />
                  ))}
                </div>
                <p className="font-semibold">
                  {(r as any).author || (r as any).user?.name || 'Покупатель'} · {formatDate((r as any).date || (r as any).createdAt || '')}
                </p>
              </div>
              <p className="mt-2 text-muted-foreground">{r.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
