'use client'

import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star } from 'lucide-react'
import type { Product } from '@/lib/types'
import { bonusFor } from '@/lib/data'
import { AddToCartButton } from './add-to-cart-button'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const primaryImage = Array.isArray(product.images) ? product.images[0] : null
  const firstColor = Array.isArray(product.colors) ? product.colors[0]?.hex : null
  const bonus = bonusFor(product.price)
  const brandName = typeof product.brand === 'string' ? product.brand : product.brand?.name || 'Бренд'
  const isInStock = product.inStock ?? product.stock > 0

  return (
    <Card className="group flex h-full flex-col overflow-hidden border-border/60 bg-card shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
      <CardHeader className="p-0">
        <Link href={`/product/${product.slug}`} className="block">
          <div className="relative aspect-square overflow-hidden bg-muted/60">
            {primaryImage ? (
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
            <div className="absolute left-2 top-2 flex flex-col gap-1">
              {product.badges?.map((b: string) => (
                <Badge key={b} variant={b === 'Хит' ? 'default' : 'secondary'}>
                  {b}
                </Badge>
              ))}
            </div>
          </div>
        </Link>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-3 p-4">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
          {brandName}
        </p>
        <Link
          href={`/product/${product.slug}`}
          className="line-clamp-2 text-base font-semibold leading-tight text-foreground transition-colors hover:text-primary"
        >
          {product.name}
        </Link>
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {product.shortSpec || product.description || 'Качественное покрытие для любых задач.'}
        </p>
        <div className="mt-auto flex items-center gap-1 pt-1">
          <Star className="size-4 fill-primary text-primary" />
          <span className="text-sm font-bold">{product.rating ?? 0}</span>
          <span className="text-sm text-muted-foreground">({product.reviewsCount ?? 0})</span>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col items-stretch gap-3 border-t bg-muted/20 p-4 pt-3">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-lg font-bold">{product.price.toLocaleString('ru-RU')} ₽</p>
            <p className="text-xs text-primary">+ {bonus} баллов</p>
          </div>
          <div className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
            {isInStock ? 'В наличии' : 'Под заказ'}
          </div>
        </div>
        <AddToCartButton product={product} />
      </CardFooter>
    </Card>
  )
}