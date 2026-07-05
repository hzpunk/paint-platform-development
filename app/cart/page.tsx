'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Trash2, Heart, ArrowRight, ShoppingCart, Tag, Gift } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PaintCan } from '@/components/product/paint-can'
import { useCart } from '@/components/cart/cart-provider'
import { formatPrice } from '@/lib/format'
import { cn } from '@/lib/utils'
import { useFavorites } from '@/components/favorites/favorites-provider'
import { products } from '@/lib/data'

// Промокоды-заглушки (на проде заменить API)
const PROMO_CODES: Record<string, number> = {
  'PROF10': 10,
  'PAINT15': 15,
}

export default function CartPage() {
  const { items, subtotal, totalBonus, removeItem, setQuantity, keyOf } = useCart()
  const { toggle } = useFavorites()
  const [promo, setPromo] = useState('')
  const [promoApplied, setPromoApplied] = useState<number | null>(null)
  const [promoError, setPromoError] = useState('')
  const [bonusToUse, setBonusToUse] = useState(0)
  const userBonusBalance = 1250 // заглушка — на проде из сессии

  const discount = promoApplied ? Math.round(subtotal * promoApplied / 100) : 0
  const bonusDiscount = Math.min(bonusToUse, subtotal - discount)
  const total = subtotal - discount - bonusDiscount

  function applyPromo() {
    const code = promo.trim().toUpperCase()
    const pct = PROMO_CODES[code]
    if (pct) {
      setPromoApplied(pct)
      setPromoError('')
    } else {
      setPromoApplied(null)
      setPromoError('Промокод не найден или уже использован')
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-[1280px] px-4 py-20 text-center md:px-6">
        <ShoppingCart className="mx-auto mb-4 size-16 text-muted-foreground" />
        <h1 className="font-heading text-2xl font-bold mb-2">Корзина пуста</h1>
        <p className="text-muted-foreground mb-6">Добавьте товары из каталога</p>
        <Button render={<Link href="/catalog" />}>Перейти в каталог</Button>
      </div>
    )
  }

  // Рекомендуемые (не в корзине)
  const cartSlugs = new Set(items.map((i) => i.slug))
  const recommended = products.filter((p) => !cartSlugs.has(p.slug)).slice(0, 4)

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-8 md:px-6">
      <h1 className="mb-6 font-heading text-2xl font-bold md:text-3xl">Корзина</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Список товаров */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {items.map((item) => {
            const key = keyOf(item)
            return (
              <div
                key={key}
                className="flex gap-4 rounded-lg border border-border bg-card p-4"
              >
                {/* Изображение */}
                <div className="shrink-0 w-20 h-20 rounded-md overflow-hidden bg-muted/30">
                  <PaintCan color={item.image} className="w-20 h-20" />
                </div>

                {/* Инфо */}
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/product/${item.slug}`}
                    className="font-medium hover:text-primary line-clamp-2 text-sm leading-snug"
                  >
                    {item.name}
                  </Link>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {item.brand} · {item.volume} л
                    {item.color ? ` · ${item.color}` : ''}
                  </p>
                  <p className="mt-0.5 font-mono text-xs text-muted-foreground">{item.sku}</p>

                  <div className="mt-3 flex items-center justify-between gap-3 flex-wrap">
                    {/* Количество */}
                    <div className="flex items-center rounded-md border border-border">
                      <button
                        onClick={() => {
                          if (item.quantity === 1) removeItem(key)
                          else setQuantity(key, item.quantity - 1)
                        }}
                        className="flex size-8 items-center justify-center hover:bg-muted"
                        aria-label="Уменьшить"
                      >
                        −
                      </button>
                      <span className="w-10 text-center text-sm tabular-nums">{item.quantity}</span>
                      <button
                        onClick={() => setQuantity(key, item.quantity + 1)}
                        className="flex size-8 items-center justify-center hover:bg-muted"
                        aria-label="Увеличить"
                      >
                        +
                      </button>
                    </div>

                    {/* Цена */}
                    <span className="font-bold">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                </div>

                {/* Действия */}
                <div className="flex flex-col gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-muted-foreground hover:text-destructive"
                    onClick={() => removeItem(key)}
                    aria-label="Удалить"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-muted-foreground hover:text-primary"
                    onClick={() => toggle(item.productId)}
                    aria-label="В избранное"
                  >
                    <Heart className="size-4" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Итого */}
        <div className="flex flex-col gap-4">
          <div className="rounded-lg border border-border bg-card p-5 flex flex-col gap-4">
            <h2 className="font-heading font-bold text-lg">Итого</h2>

            {/* Промокод */}
            <div>
              <p className="mb-2 text-sm font-medium flex items-center gap-2">
                <Tag className="size-4" /> Промокод
              </p>
              <div className="flex gap-2">
                <Input
                  value={promo}
                  onChange={(e) => setPromo(e.target.value)}
                  placeholder="Введите промокод"
                  className="flex-1"
                />
                <Button variant="outline" onClick={applyPromo} size="sm">
                  Применить
                </Button>
              </div>
              {promoError && <p className="mt-1 text-xs text-destructive">{promoError}</p>}
              {promoApplied && (
                <p className="mt-1 text-xs text-success">
                  ✓ Скидка {promoApplied}% применена
                </p>
              )}
            </div>

            {/* Бонусные баллы */}
            <div>
              <p className="mb-2 text-sm font-medium flex items-center gap-2">
                <Gift className="size-4" /> Бонусные баллы
                <span className="ml-auto text-xs text-muted-foreground">Баланс: {userBonusBalance}</span>
              </p>
              <input
                type="range"
                min={0}
                max={userBonusBalance}
                step={50}
                value={bonusToUse}
                onChange={(e) => setBonusToUse(Number(e.target.value))}
                className="w-full accent-primary"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Применить: {bonusToUse} баллов (−{formatPrice(bonusToUse)})
              </p>
            </div>

            <div className="flex flex-col gap-2 text-sm border-t border-border pt-4">
              <Row label="Товары" value={formatPrice(subtotal)} />
              {discount > 0 && <Row label={`Скидка (${promoApplied}%)`} value={`−${formatPrice(discount)}`} className="text-success" />}
              {bonusDiscount > 0 && <Row label="Бонусы" value={`−${formatPrice(bonusDiscount)}`} className="text-success" />}
              <Row label="Получение" value="Самовывоз (Бесплатно)" />
            </div>

            <div className="flex items-center justify-between border-t border-border pt-4">
              <span className="font-bold text-lg">Итого</span>
              <span className="font-bold text-2xl">{formatPrice(total)}</span>
            </div>

            <p className="text-xs text-success">
              +{totalBonus} баллов за этот заказ
            </p>

            <Button
              size="lg"
              className="w-full gap-2"
              render={<Link href="/checkout" />}
            >
              Оформить заказ
              <ArrowRight className="size-4" />
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              Оплата при получении · Удобный самовывоз
            </p>
          </div>
        </div>
      </div>

      {/* Не забудьте докупить */}
      {recommended.length > 0 && (
        <div className="mt-14">
          <h2 className="font-heading text-xl font-bold mb-4">Не забудьте докупить</h2>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
            {recommended.map((p) => (
              <Link
                key={p.id}
                href={`/product/${p.slug}`}
                className="flex gap-3 rounded-lg border border-border bg-card p-3 hover:border-primary transition-colors"
              >
                <div className="w-14 h-14 shrink-0">
                  <PaintCan color={p.images[0]} className="w-14 h-14" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium line-clamp-2 leading-tight">{p.name}</p>
                  <p className="mt-1 text-sm font-bold text-primary">{formatPrice(p.price)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function Row({ label, value, className, note }: {
  label: string; value: string; className?: string; note?: string
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <span>{label}</span>
        {note && <p className="text-xs text-muted-foreground">{note}</p>}
      </div>
      <span className={cn('font-medium', className)}>{value}</span>
    </div>
  )
}
