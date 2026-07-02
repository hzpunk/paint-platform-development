import type { CartItem, Packaging, Product } from './types'
import { bonusFor } from './data'

/** Собирает позицию корзины из товара, выбранной расфасовки и цвета. */
export function buildCartItem(
  product: Product,
  packaging: Packaging,
  quantity: number,
  color?: string,
): CartItem {
  return {
    productId: product.id,
    slug: product.slug,
    name: product.name,
    brand: product.brand,
    image: product.images[0] ?? product.colors[0]?.hex ?? '#E5E5E0',
    sku: packaging.sku,
    volume: packaging.volume,
    price: packaging.price,
    color,
    quantity,
    bonusPoints: bonusFor(packaging.price),
  }
}
