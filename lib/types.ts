// Доменные типы платформы продажи ЛКМ.
// Единый источник истины для товаров, заказов и программы лояльности.

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

export interface Product {
  id: string;
  slug: string;
  name: string;
  brand: string;
  categorySlug: string;
  type: PaintType;
  /** Поверхности применения. */
  surfaces: string[];
  /** Базовая цена (для минимальной расфасовки), ₽. */
  price: number;
  /** Старая цена для товаров по акции, ₽. */
  oldPrice?: number;
  packaging: Packaging[];
  /** Доступные цвета (HEX + название). */
  colors: { hex: string; name: string }[];
  images: string[];
  badges: ProductBadge[];
  rating: number;
  reviewsCount: number;
  inStock: boolean;
  /** Можно ли заказать колеровку. */
  colorable: boolean;
  shortSpec: string;
  description: string;
  specs: ProductSpecs;
  application: string;
}

export interface Category {
  slug: string;
  name: string;
  icon: string;
  description: string;
}

export interface Brand {
  slug: string;
  name: string;
}

export interface Review {
  id: string;
  productSlug?: string;
  author: string;
  rating: number;
  date: string;
  text: string;
  /** Подтверждённый покупатель. */
  verified: boolean;
}

export interface BlogPost {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  cover: string;
  date: string;
  readingTime: number;
  content: string;
  relatedProductSlugs: string[];
}

/** Позиция в корзине: товар + выбранная расфасовка/цвет + количество. */
export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  brand: string;
  image: string;
  sku: string;
  volume: number;
  price: number;
  color?: string;
  quantity: number;
  bonusPoints: number;
}

/** Статусы заказа для трекинга в личном кабинете. */
export type OrderStatus =
  | "Оформлен"
  | "Собирается"
  | "В пути"
  | "Доставлен"
  | "Отменён";

export interface Order {
  id: string;
  date: string;
  status: OrderStatus;
  items: { name: string; volume: number; quantity: number; price: number }[];
  total: number;
  bonusEarned: number;
  tracking?: string;
}

/** Уровни программы лояльности. */
export interface LoyaltyTier {
  name: "Стандарт" | "Серебро" | "Золото" | "Платина";
  /** Порог суммы покупок за 12 мес., ₽. */
  threshold: number;
  /** Процент начисления баллов. */
  rate: number;
  perks: string[];
  color: string;
}
