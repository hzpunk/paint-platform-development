import { Product as PrismaProduct, Category as PrismaCategory, Brand as PrismaBrand, Review as PrismaReview, Order as PrismaOrder } from '@prisma/client'

/** Тип краски по составу — используется в фильтрах каталога. */
export type PaintType =
  | "водоэмульсионная"
  | "алкидная"
  | "акриловая"
  | "эпоксидная";

/** Бейджи на карточке товара. */
export type ProductBadge = "Хит" | "Новинка" | "Акция" | "Колеровка";

/** Вариант расфасовки товара (объём + своя цена и артикул). */
export interface Packaging {
  /** Объём в литрах. */
  volume: number;
  /** Цена за данную расфасовку, ₽. */
  price: number;
  /** Артикул конкретной расфасовки. */
  sku: string;
}

/** Характеристики ЛКМ (обязательны по ГОСТ для полноты витрины). */
export interface ProductSpecs {
  /** Состав / основа. */
  composition: string;
  /** Расход, м²/л. */
  consumption: number;
  /** Время высыхания. */
  dryingTime: string;
  /** Укрывистость. */
  coverage: string;
  /** Количество слоёв. */
  layers: string;
  /** Условия хранения. */
  storage: string;
}

export interface Product extends Omit<PrismaProduct, 'reviews' | 'specs' | 'packaging' | 'colors'> {
  categoryId: string;
  brandId: string;
  category: Omit<PrismaCategory, 'products'>;
  brand: Omit<PrismaBrand, 'products'> | string;
  inStock: boolean;
  packaging: Packaging[];
  colors: { hex: string; name: string }[];
  specs: ProductSpecs;
  reviews?: Review[] | null;
  badges?: ProductBadge[];
  oldPrice?: number | null;
  application?: string | null;
  colorable?: boolean;
}

export interface Category extends PrismaCategory {
  products?: Product[] | null
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  text?: string | null;
  createdAt: Date | string;
  author?: string | null;
  date?: string | null;
  user?: {
    name?: string | null;
    email?: string | null;
  } | null;
  product?: {
    name?: string;
    slug?: string;
    images?: string[];
  } | null;
}

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  brand: string | { name?: string | null } | null;
  image: string;
  sku: string;
  volume: number;
  price: number;
  color?: string | null;
  quantity: number;
  bonusPoints: number;
}