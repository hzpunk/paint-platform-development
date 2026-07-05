'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Star, CheckCircle, MapPin, ChevronRight, Calculator, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { PaintCan } from '@/components/product/paint-can'
import { AddToCartButton } from '@/components/product/add-to-cart-button'
import { ProductCard } from '@/components/product/product-card'
import { formatPrice, formatDate, pluralize } from '@/lib/format'
import { bonusFor } from '@/lib/data'
import type { Product, Review } from '@/lib/types'
import { cn } from '@/lib/utils'

interface Props {
  product: Product
  related: Product[]
  reviews: Review[]
  accessories: Product[]
}

export function ProductPageClient({ product, related, reviews, accessories }: Props) {
  const [selectedPack, setSelectedPack] = useState(product.packaging[0])
  const [selectedColor, setSelectedColor] = useState(product.colors[0]?.name ?? '')
  const [area, setArea] = useState(30)

  const bonus = bonusFor(selectedPack.price)
  const liters = Math.ceil((area * 2) / product.specs.consumption)
  const cans = Math.ceil(liters / selectedPack.volume)
  const calcPrice = cans * selectedPack.price

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6 md:px-6">
      {/* Хлебные крошки */}
      <nav aria-label="Хлебные крошки" className="mb-6 flex items-center gap-1 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Главная</Link>
        <ChevronRight className="size-3.5" />
        <Link href="/catalog" className="hover:text-foreground">Каталог</Link>
        <ChevronRight className="size-3.5" />
        <Link href={`/catalog?category=${product.categorySlug}`} className="hover:text-foreground">
          {product.categorySlug}
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="truncate text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Галерея */}
        <div className="flex flex-col gap-3">
          <div className="overflow-hidden rounded-xl border border-border bg-muted/30">
            <PaintCan
              color={product.colors.find((c) => c.name === selectedColor)?.hex ?? product.images[0]}
              label={product.name}
              className="h-80 w-full"
            />
          </div>
          {/* Миниатюры цветов */}
          {product.colors.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {product.colors.map((c) => (
                <button
                  key={c.hex}
                  title={c.name}
                  onClick={() => setSelectedColor(c.name)}
                  className={cn(
                    'size-8 rounded-full border-2 transition-transform hover:scale-110',
                    selectedColor === c.name ? 'border-primary ring-2 ring-primary/30' : 'border-border',
                  )}
                  style={{ backgroundColor: c.hex }}
                  aria-label={`Цвет: ${c.name}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Правый блок */}
        <div className="flex flex-col gap-5">
          {/* Бейджи */}
          <div className="flex flex-wrap gap-2">
            {product.badges.map((b) => (
              <Badge key={b} variant={b === 'Акция' ? 'destructive' : b === 'Новинка' ? 'secondary' : 'default'}>
                {b}
              </Badge>
            ))}
            {!product.inStock && <Badge variant="destructive">Нет в наличии</Badge>}
          </div>

          {/* Название и артикул */}
          <div>
            <h1 className="font-heading text-2xl font-bold leading-tight md:text-3xl">{product.name}</h1>
            <p className="mt-1 font-mono text-sm text-muted-foreground">
              Артикул: {selectedPack.sku}
            </p>
          </div>

          {/* Рейтинг */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn('size-4', i < Math.round(product.rating) ? 'fill-accent text-accent' : 'text-muted-foreground')}
                />
              ))}
            </div>
            <span className="font-medium">{product.rating.toFixed(1)}</span>
            <span className="text-sm text-muted-foreground">
              ({product.reviewsCount} {pluralize(product.reviewsCount, ['отзыв', 'отзыва', 'отзывов'])})
            </span>
          </div>

          {/* Цена */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold">{formatPrice(selectedPack.price)}</span>
            {product.oldPrice && (
              <span className="text-lg text-muted-foreground line-through">
                {formatPrice(product.oldPrice)}
              </span>
            )}
            <span className="text-sm text-muted-foreground">
              / {selectedPack.volume} л ≈ {formatPrice(Math.round(selectedPack.price / selectedPack.volume))} за л
            </span>
          </div>

          {/* Расфасовки */}
          <div>
            <p className="mb-2 text-sm font-semibold">Объём</p>
            <div className="flex flex-wrap gap-2">
              {product.packaging.map((pack) => (
                <button
                  key={pack.sku}
                  onClick={() => setSelectedPack(pack)}
                  className={cn(
                    'rounded-md border px-4 py-2 text-sm font-medium transition-colors',
                    selectedPack.sku === pack.sku
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border hover:border-primary',
                  )}
                >
                  {pack.volume} л
                  <span className="ml-1 text-xs opacity-70">{formatPrice(pack.price)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Цвет */}
          {product.colorable && (
            <div>
              <p className="mb-2 text-sm font-semibold">Цвет: <span className="font-normal">{selectedColor}</span></p>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((c) => (
                  <button
                    key={c.hex}
                    onClick={() => setSelectedColor(c.name)}
                    title={c.name}
                    className={cn(
                      'size-8 rounded-full border-2 transition-transform hover:scale-110',
                      selectedColor === c.name ? 'border-primary ring-2 ring-primary/30' : 'border-border',
                    )}
                    style={{ backgroundColor: c.hex }}
                    aria-label={`Цвет: ${c.name}`}
                  />
                ))}
                <Link href="/colormixing" className="flex items-center rounded-full border border-dashed border-primary px-3 py-1 text-xs font-medium text-primary hover:bg-primary/5">
                  Заказать колеровку
                </Link>
              </div>
            </div>
          )}

          {/* Кнопки */}
          <AddToCartButton
            product={product}
            packaging={selectedPack}
            color={selectedColor}
            withQuantity
          />

          {/* Бонусы */}
          <div className="flex items-center gap-2 rounded-md bg-accent/10 px-4 py-2.5 text-sm">
            <Package className="size-4 text-accent" />
            <span>За этот товар начислится <strong>{bonus} баллов</strong></span>
          </div>

          {/* Наличие и самовывоз */}
          <div className="flex flex-col gap-2 rounded-lg border border-border p-4">
            <div className="flex items-center gap-2 text-sm">
              {product.inStock ? (
                <>
                  <CheckCircle className="size-4 text-success" />
                  <span className="text-success font-medium">В наличии</span>
                  <span className="text-muted-foreground">· Готов к выдаче за 2 часа</span>
                </>
              ) : (
                <>
                  <span className="size-4 rounded-full bg-destructive" />
                  <span className="text-destructive font-medium">Нет в наличии</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="size-4" />
              Самовывоз: Москва, ул. Красочная, д. 15, стр. 2 · Оплата при получении
            </div>
          </div>
        </div>
      </div>

      {/* Табы */}
      <div className="mt-12">
        <Tabs defaultValue="description">
          <TabsList className="flex-wrap h-auto gap-1">
            <TabsTrigger value="description">Описание</TabsTrigger>
            <TabsTrigger value="specs">Характеристики</TabsTrigger>
            <TabsTrigger value="application">Инструкция</TabsTrigger>
            <TabsTrigger value="certs">Документы</TabsTrigger>
            <TabsTrigger value="reviews">
              Отзывы ({reviews.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="mt-6 prose max-w-none">
            <p className="leading-relaxed text-foreground">{product.description}</p>
          </TabsContent>

          <TabsContent value="specs" className="mt-6">
            <table className="w-full text-sm">
              <tbody>
                {[
                  ['Состав / основа', product.specs.composition],
                  ['Расход', `${product.specs.consumption} м²/л`],
                  ['Время высыхания', product.specs.dryingTime],
                  ['Укрывистость', product.specs.coverage],
                  ['Количество слоёв', product.specs.layers],
                  ['Условия хранения', product.specs.storage],
                  ['Поверхности', product.surfaces.join(', ')],
                  ['Тип', product.type],
                ].map(([label, value]) => (
                  <tr key={label} className="border-b border-border">
                    <td className="py-3 pr-4 font-medium text-muted-foreground w-48">{label}</td>
                    <td className="py-3">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TabsContent>

          <TabsContent value="application" className="mt-6">
            <p className="leading-relaxed text-foreground">{product.application}</p>
          </TabsContent>

          <TabsContent value="certs" className="mt-6">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 rounded-lg border border-border p-4">
                <span className="flex size-10 items-center justify-center rounded-md bg-muted text-muted-foreground font-bold text-xs">PDF</span>
                <div>
                  <p className="font-medium text-sm">Сертификат соответствия</p>
                  <p className="text-xs text-muted-foreground">ГОСТ Р — документ о качестве ЛКМ</p>
                </div>
                <span className="ml-auto text-xs text-muted-foreground">По запросу</span>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-border p-4">
                <span className="flex size-10 items-center justify-center rounded-md bg-muted text-muted-foreground font-bold text-xs">PDF</span>
                <div>
                  <p className="font-medium text-sm">Паспорт безопасности</p>
                  <p className="text-xs text-muted-foreground">Согласно требованиям ГОСТ 30333</p>
                </div>
                <span className="ml-auto text-xs text-muted-foreground">По запросу</span>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            {reviews.length === 0 ? (
              <p className="text-muted-foreground">Пока нет отзывов для этого товара.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {reviews.map((r) => (
                  <div key={r.id} className="rounded-lg border border-border p-4">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={cn('size-4', i < r.rating ? 'fill-accent text-accent' : 'text-muted-foreground')} />
                        ))}
                      </div>
                      {r.verified && (
                        <span className="text-xs text-success font-medium">✓ Подтверждённый покупатель</span>
                      )}
                    </div>
                    <p className="mt-2 text-sm leading-relaxed">"{r.text}"</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {r.author} · {formatDate(r.date)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Калькулятор расхода */}
      <div className="mt-12 rounded-xl border border-border bg-card p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <Calculator className="size-6 text-primary" />
          <h2 className="font-heading text-xl font-bold">Калькулятор расхода</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Площадь покраски: <strong>{area} м²</strong>
            </label>
            <input
              type="range"
              min={5}
              max={500}
              step={5}
              value={area}
              onChange={(e) => setArea(Number(e.target.value))}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>5 м²</span>
              <span>500 м²</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Литров', value: liters, unit: 'л' },
              { label: 'Банок', value: cans, unit: `× ${selectedPack.volume}л` },
              { label: 'Итого', value: calcPrice.toLocaleString('ru'), unit: '₽' },
            ].map(({ label, value, unit }) => (
              <div key={label} className="rounded-lg bg-muted/50 p-3 text-center">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-xl font-bold">{value}</p>
                <p className="text-xs text-muted-foreground">{unit}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          * Расчёт для 2 слоёв. Расход: {product.specs.consumption} м²/л.
        </p>
      </div>

      {/* Похожие товары */}
      {related.length > 0 && (
        <div className="mt-14">
          <h2 className="font-heading text-xl font-bold mb-6">Похожие товары</h2>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}

      {/* С этим покупают */}
      {accessories.length > 0 && (
        <div className="mt-14">
          <h2 className="font-heading text-xl font-bold mb-6">С этим покупают</h2>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {accessories.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  )
}
