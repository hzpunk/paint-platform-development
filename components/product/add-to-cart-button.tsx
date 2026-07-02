'use client'

import { useState } from 'react'
import { Minus, Plus, ShoppingCart, Check } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { useCart } from '@/components/cart/cart-provider'
import { buildCartItem } from '@/lib/cart'
import type { Packaging, Product } from '@/lib/types'
import { cn } from '@/lib/utils'

interface AddToCartButtonProps {
  product: Product
  /** Выбранная расфасовка; по умолчанию первая. */
  packaging?: Packaging
  /** Выбранный цвет (название). */
  color?: string
  className?: string
  withQuantity?: boolean
  size?: 'default' | 'lg'
}

export function AddToCartButton({
  product,
  packaging,
  color,
  className,
  withQuantity = false,
  size = 'default',
}: AddToCartButtonProps) {
  const { addItem } = useCart()
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  const pack = packaging ?? product.packaging[0]

  function handleAdd() {
    addItem(buildCartItem(product, pack, qty, color))
    setAdded(true)
    toast.success(`«${product.name}» в корзине`, {
      description: `${pack.volume} л${qty > 1 ? ` × ${qty}` : ''}${color ? `, ${color}` : ''}`,
    })
    setTimeout(() => setAdded(false), 1500)
  }

  if (!withQuantity) {
    return (
      <Button
        onClick={handleAdd}
        disabled={!product.inStock}
        size={size}
        className={cn('gap-2', className)}
      >
        {added ? <Check className="size-4" /> : <ShoppingCart className="size-4" />}
        {product.inStock ? 'В корзину' : 'Нет в наличии'}
      </Button>
    )
  }

  return (
    <div className={cn('flex flex-wrap items-center gap-3', className)}>
      <div className="flex items-center rounded-md border border-border">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-11 rounded-r-none"
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          aria-label="Уменьшить количество"
        >
          <Minus className="size-4" />
        </Button>
        <span
          className="w-10 text-center font-mono text-sm tabular-nums"
          aria-live="polite"
        >
          {qty}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-11 rounded-l-none"
          onClick={() => setQty((q) => q + 1)}
          aria-label="Увеличить количество"
        >
          <Plus className="size-4" />
        </Button>
      </div>
      <Button
        onClick={handleAdd}
        disabled={!product.inStock}
        size="lg"
        className="flex-1 gap-2"
      >
        {added ? <Check className="size-5" /> : <ShoppingCart className="size-5" />}
        {product.inStock ? 'Добавить в корзину' : 'Нет в наличии'}
      </Button>
    </div>
  )
}
