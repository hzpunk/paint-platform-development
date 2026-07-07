import type { CartItem, Packaging, Product } from "./types";
import { bonusFor } from "./data";

export function isRenderableImage(value: string | null | undefined): boolean {
  if (!value) return false;
  if (/^(#|rgb|hsl|rgba|hsla)/i.test(value)) return false;
  if (value.startsWith("data:image/")) return true;
  return (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("/")
  );
}

function getBrandName(product: Product): string {
  if (typeof product.brand === "string") return product.brand;
  return product.brand?.name || "";
}

function getCartImage(product: Product): string {
  const firstImage = Array.isArray(product.images) ? product.images[0] : null;
  if (isRenderableImage(firstImage)) return firstImage as string;
  return product.colors?.[0]?.hex ?? "#E5E5E0";
}

/** Собирает позицию корзины из товара, выбранной расфасовки и цвета. */
export function buildCartItem(
  product: Product,
  packaging: Packaging,
  quantity: number,
  color?: string,
  stock?: number | null,
): CartItem {
  return {
    productId: product.id,
    slug: product.slug,
    name: product.name,
    brand: getBrandName(product),
    image: getCartImage(product),
    sku: packaging.sku,
    volume: packaging.volume,
    price: packaging.price,
    color: color ?? product.colors?.[0]?.hex ?? null,
    quantity,
    stock: typeof stock === "number" && Number.isFinite(stock) ? stock : null,
    bonusPoints: bonusFor(packaging.price),
  };
}
