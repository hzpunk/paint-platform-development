'use client'

import Link from 'next/link'
import { Heart, Star } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PaintCan } from '@/components/product/paint-can'
import { AddToCartButton } from '@/components/product/add-to-cart-button'
import { useFavorites } from '@/components/favorites/favorites-provider'
import { formatPrice } from '@/lib/format'
import type { Product } from '@/lib/types'
import { cn } from '@/lib/utils'

function badgeVariant(badge: Product['badges'][number]) {
  switch (badge) {
    case 'Акция':
      return 'destructive' as const
    case 'Новинка':
      return 'secondary' as const
    default:
      return 'default' as const
  }
}

export function ProductCard({ product }: { product: Product }) {
  const { isFavorite, toggle } = useFavorites()
  const fav = isFavorite(product.id)
  const discount =
    product.oldPrice && product.oldPrice > product.price
      ? Math.round((1 - product.price / product.oldPrice) * 100)
      : 0
  const swatch = product.images[0] ?? product.colors[0]?.hex ?? '#E5E5E0'

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-shadow hover:shadow-md">
      <div className="relative flex items-center justify-center bg-muted/40 p-6">
        <div className="absolute left-3 top-3 z-10 flex flex-col gap-1">
          {product.badges
            .filter((b) => b !== 'Колеровка')
            .map((b) => (
              <Badge key={b} variant={badgeVariant(b)}>
                {b}
              </Badge>
            ))}
          {discount > 0 && <Badge variant="destructive">−{discount}%</Badge>}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 z-10 size-9 rounded-full bg-background/70 backdrop-blur hover:bg-background"
          onClick={() => toggle(product.id)}
          aria-label={fav ? 'Убрать из избранного' : 'Добавить в избранное'}
          aria-pressed={fav}
        >
          <Heart className={cn('size-4', fav && 'fill-destructive text-destructive')} />
        </Button>
        <Link href={`/product/${product.slug}`} className="block">
          <PaintCan
            color={swatch}
            className="h-40 w-32 transition-transform duration-300 group-hover:scale-105"
          />
          <span className="sr-only">{product.name}</span>
        </Link>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{product.brand}</p>
        <Link
          href={`/product/${product.slug}`}
          className="line-clamp-2 font-medium leading-snug hover:text-primary"
        >
          {product.name}
        </Link>
        <p className="line-clamp-1 text-sm text-muted-foreground">{product.shortSpec}</p>

        <div className="flex items-center gap-1 text-sm">
          <Star className="size-4 fill-secondary text-secondary" />
          <span className="font-medium">{product.rating.toFixed(1)}</span>
          <span className="text-muted-foreground">({product.reviewsCount})</span>
          {product.colorable && (
            <span className="ml-auto text-xs text-primary">Колеровка</span>
          )}
        </div>

        <div className="mt-auto pt-2">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-foreground">{formatPrice(product.price)}</span>
            {product.oldPrice && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(product.oldPrice)}
              </span>
            )}
          </div>
          <span className="text-xs text-muted-foreground">
            от {product.packaging[0]?.volume} л
          </span>
        </div>

        <AddToCartButton product={product} className="mt-2 w-full" />
      </div>
    </article>
  )
}
