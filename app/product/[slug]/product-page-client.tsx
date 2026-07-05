'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Star, Minus, Plus, Heart, ChevronRight } from 'lucide-react'
import { Product, Review, Packaging } from '@/lib/types'
import { ProductCard } from '@/components/product/product-card'
import { AddToCartButton } from '@/components/product/add-to-cart-button'
import { useFavorites } from '@/components/favorites/favorites-provider'
import { bonusFor } from '@/lib/data'
import { cn, formatDate } from '@/lib/utils'

interface ProductPageClientProps {
  product: Product
  related: Product[]
  reviews: Review[]
  accessories: Product[]
}

/** Человекочитаемые подписи технических характеристик. */
const SPEC_LABELS: Record<string, string> = {
  composition: 'Состав',
  consumption: 'Расход, м²/л',
  dryingTime: 'Время высыхания',
  coverage: 'Укрывистость',
  layers: 'Количество слоёв',
  storage: 'Хранение',
}

export function ProductPageClient({
  product,
  related,
  reviews,
  accessories,
}: ProductPageClientProps) {
  // JSON-поля из Prisma могут прийти как null — приводим к безопасным массивам.
  const packaging = useMemo<Packaging[]>(
    () => (Array.isArray(product.packaging) ? product.packaging : []),
    [product.packaging],
  )
  const colors = Array.isArray(product.colors) ? product.colors : []
  const specs = product.specs && typeof product.specs === 'object' ? product.specs : null

  const [quantity, setQuantity] = useState(1)
  const [selectedPackaging, setSelectedPackaging] = useState<Packaging | null>(
    packaging[0] ?? null,
  )
  const [selectedColor, setSelectedColor] = useState(colors[0]?.hex ?? null)

  const { isFavorite, toggle } = useFavorites()
  const liked = isFavorite(product.slug)

  const brandName =
    typeof product.brand === 'string' ? product.brand : product.brand?.name || 'Бренд'
  const primaryImage = Array.isArray(product.images) ? product.images[0] : null

  // Итоговая цена зависит от выбранной фасовки (если есть) либо базовой цены товара.
  const unitPrice = selectedPackaging?.price ?? product.price
  const totalPrice = unitPrice * quantity
  const bonus = bonusFor(totalPrice)

  const hasDiscount =
    typeof product.oldPrice === 'number' && product.oldPrice > product.price
  const discountPercent = hasDiscount
    ? Math.round((1 - product.price / (product.oldPrice as number)) * 100)
    : 0

  return (
    <div className="container py-6 md:py-8">
      {/* Хлебные крошки */}
      <nav className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/" className="transition-colors hover:text-foreground">
          Главная
        </Link>
        <ChevronRight className="size-4" />
        <Link href="/catalog" className="transition-colors hover:text-foreground">
          Каталог
        </Link>
        <ChevronRight className="size-4" />
        <span className="truncate text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-8 md:grid-cols-2 lg:gap-12">
        {/* Изображение */}
        <div className="md:sticky md:top-24 md:self-start">
          <div className="relative aspect-square overflow-hidden rounded-xl border bg-muted/50">
            {primaryImage ? (
              <img
                src={primaryImage || '/placeholder.svg'}
                alt={product.name}
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <div
                className="absolute inset-0"
                style={{ backgroundColor: selectedColor || '#f1f5f9' }}
              />
            )}

            <button
              type="button"
              onClick={() => toggle(product.slug)}
              aria-label={liked ? 'Убрать из избранного' : 'Добавить в избранное'}
              aria-pressed={liked}
              className={cn(
                'absolute right-3 top-3 flex size-11 items-center justify-center rounded-full border border-border/60 bg-card/90 text-muted-foreground shadow-sm backdrop-blur transition-all hover:scale-105 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                liked && 'text-destructive',
              )}
            >
              <Heart className={cn('size-6 transition-all', liked && 'fill-destructive')} />
            </button>

            {hasDiscount && (
              <Badge variant="destructive" className="absolute left-3 top-3 shadow-sm">
                {'−'}
                {discountPercent}%
              </Badge>
            )}
          </div>
        </div>

        {/* Информация о товаре */}
        <div className="space-y-5">
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
              {brandName}
            </p>
            <h1 className="text-balance text-2xl font-bold md:text-3xl">{product.name}</h1>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Star className="size-5 fill-primary text-primary" />
                <span className="font-bold">{product.rating ?? 0}</span>
              </div>
              <a
                href="#reviews"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground hover:underline"
              >
                ({product.reviewsCount ?? 0} отзывов)
              </a>
            </div>
          </div>

          {product.shortSpec && <p className="text-pretty text-muted-foreground">{product.shortSpec}</p>}

          {/* Выбор цвета */}
          {colors.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">
                Цвет{selectedColor ? `: ${colors.find((c) => c.hex === selectedColor)?.name ?? ''}` : ''}
              </h3>
              <div className="flex flex-wrap gap-2">
                {colors.map((c, i) => (
                  <button
                    key={`${c.hex}-${i}`}
                    type="button"
                    title={c.name}
                    aria-label={c.name}
                    aria-pressed={selectedColor === c.hex}
                    onClick={() => setSelectedColor(c.hex)}
                    className={cn(
                      'size-9 rounded-full border shadow-sm transition-all hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      selectedColor === c.hex
                        ? 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                        : 'border-border/70',
                    )}
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Выбор фасовки */}
          {packaging.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Фасовка</h3>
              <RadioGroup
                value={selectedPackaging?.sku ?? ''}
                onValueChange={(sku) =>
                  setSelectedPackaging(packaging.find((p) => p.sku === sku) ?? null)
                }
                className="flex flex-wrap gap-2"
              >
                {packaging.map((p) => (
                  <Label
                    key={p.sku}
                    htmlFor={p.sku}
                    className={cn(
                      'flex cursor-pointer flex-col rounded-lg border px-4 py-2 text-center transition-colors',
                      selectedPackaging?.sku === p.sku
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'hover:bg-muted/50',
                    )}
                  >
                    <RadioGroupItem value={p.sku} id={p.sku} className="sr-only" />
                    <span className="font-semibold">{p.volume} л</span>
                    <span className="text-xs text-muted-foreground">
                      {p.price.toLocaleString('ru-RU')} ₽
                    </span>
                  </Label>
                ))}
              </RadioGroup>
            </div>
          )}

          {/* Цена и количество */}
          <div className="flex items-center justify-between gap-4 rounded-xl border bg-muted/30 p-4">
            <div className="min-w-0">
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold md:text-3xl">
                  {totalPrice.toLocaleString('ru-RU')} ₽
                </p>
                {hasDiscount && quantity === 1 && !selectedPackaging && (
                  <p className="text-base text-muted-foreground line-through">
                    {(product.oldPrice as number).toLocaleString('ru-RU')} ₽
                  </p>
                )}
              </div>
              <p className="text-sm text-primary">+ {bonus} баллов</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                aria-label="Уменьшить количество"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                <Minus className="size-4" />
              </Button>
              <span className="w-8 text-center font-bold tabular-nums">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                aria-label="Увеличить количество"
                onClick={() => setQuantity((q) => q + 1)}
              >
                <Plus className="size-4" />
              </Button>
            </div>
          </div>

          <div className="flex gap-3">
            <AddToCartButton
              product={product}
              quantity={quantity}
              selectedPackaging={selectedPackaging ?? undefined}
            />
            <Button
              variant="outline"
              size="icon"
              aria-label={liked ? 'Убрать из избранного' : 'Добавить в избранное'}
              aria-pressed={liked}
              onClick={() => toggle(product.slug)}
              className={cn('size-10 shrink-0', liked && 'border-destructive text-destructive')}
            >
              <Heart className={cn('size-5', liked && 'fill-destructive')} />
            </Button>
          </div>

          {/* Описание */}
          {(product.description || product.application) && (
            <div className="space-y-4 border-t pt-5">
              {product.description && (
                <div className="space-y-1">
                  <h3 className="font-semibold">Описание</h3>
                  <p className="text-pretty leading-relaxed text-muted-foreground">
                    {product.description}
                  </p>
                </div>
              )}
              {product.application && (
                <div className="space-y-1">
                  <h3 className="font-semibold">Применение</h3>
                  <p className="text-pretty leading-relaxed text-muted-foreground">
                    {product.application}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Характеристики */}
      {specs && (
        <div className="mt-12">
          <h2 className="mb-4 text-2xl font-bold">Характеристики</h2>
          <div className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(specs).map(([key, value]) => (
              <div key={key} className="bg-card p-4">
                <p className="text-sm text-muted-foreground">{SPEC_LABELS[key] ?? key}</p>
                <p className="font-medium">{String(value)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Похожие товары */}
      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 text-2xl font-bold">Похожие товары</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* С этим покупают */}
      {accessories.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 text-2xl font-bold">С этим покупают</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {accessories.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Отзывы */}
      <section id="reviews" className="mt-12 scroll-mt-24">
        <h2 className="mb-4 text-2xl font-bold">Отзывы</h2>
        {reviews.length === 0 ? (
          <p className="text-muted-foreground">Пока нет отзывов. Станьте первым!</p>
        ) : (
          <div className="space-y-6">
            {reviews.map((r) => (
              <div key={r.id} className="rounded-xl border p-4">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          'size-4',
                          i < r.rating ? 'fill-primary text-primary' : 'text-muted-foreground/40',
                        )}
                      />
                    ))}
                  </div>
                  <p className="text-sm font-semibold">
                    {r.author || r.user?.name || 'Покупатель'}
                    {' · '}
                    <span className="font-normal text-muted-foreground">
                      {formatDate(r.date || (typeof r.createdAt === 'string' ? r.createdAt : r.createdAt?.toISOString?.() ?? ''))}
                    </span>
                  </p>
                </div>
                {r.text && <p className="mt-2 text-pretty text-muted-foreground">{r.text}</p>}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
