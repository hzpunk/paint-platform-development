import type {
  Product,
  Category,
  Brand,
  Review,
  BlogPost,
  Order,
  LoyaltyTier,
  OrderItem,
} from "./types";

export const categories: Omit<Category, "products">[] = [
  {
    id: "clx12d01q000008l2h2g3f8y9",
    slug: "interior",
    name: "Интерьерные краски",
    icon: "Home",
    description: "Для стен и потолков внутри помещений",
  },
  {
    id: "clx12d01q000108l2a2g3h4j5",
    slug: "facade",
    name: "Фасадные краски",
    icon: "Building2",
    description: "Атмосферостойкие покрытия для наружных работ",
  },
  {
    id: "clx12d01q000208l2b2g3i4k6",
    slug: "primer",
    name: "Грунтовки",
    icon: "Layers",
    description: "Подготовка поверхности перед окраской",
  },
  {
    id: "clx12d01q000308l2c2g3j4l7",
    slug: "enamel",
    name: "Эмали и лаки",
    icon: "Paintbrush",
    description: "Декоративная и защитная отделка",
  },
  {
    id: "clx12d01q000408l2d2g3k4m8",
    slug: "anticor",
    name: "Антикоррозийные",
    icon: "ShieldCheck",
    description: "Защита металла от ржавчины",
  },
  {
    id: "clx12d01q000508l2e2g3l4n9",
    slug: "special",
    name: "Спецсоставы",
    icon: "FlaskConical",
    description: "Огнезащита, гидроизоляция, антисептики",
  },
];

export const brands: Omit<Brand, "products">[] = [
  { id: "clx12d01q000608l2f2g3m4o0", slug: "tikkurila", name: "Tikkurila" },
  { id: "clx12d01q000708l2g2g3n4p1", slug: "dulux", name: "Dulux" },
  { id: "clx12d01q000808l2h2g3o4q2", slug: "caparol", name: "Caparol" },
  { id: "clx12d01q000908l2i2g3p4r3", slug: "tex", name: "ТЕКС" },
  { id: "clx12d01q000a08l2j2g3q4s4", slug: "lakra", name: "Lakra" },
  { id: "clx12d01q000b08l2k2g3r4t5", slug: "olki", name: "Ольки" },
];

export const surfaces = [
  "Стены",
  "Потолок",
  "Дерево",
  "Металл",
  "Бетон",
  "Кирпич",
  "Штукатурка",
];

export const paintTypes = [
  "водоэмульсионная",
  "алкидная",
  "акриловая",
  "эпоксидная",
] as const;

// Ставка начисления бонусов: 1 балл ≈ 1 ₽ на каждые 100 ₽ покупки (базовый уровень 3%).
export const BASE_BONUS_RATE = 0.03;

/** Расчёт базовых бонусных баллов за товар. */
export function bonusFor(price: number, rate = BASE_BONUS_RATE): number {
  return Math.round(price * rate);
}

const WHITE = { hex: "#F4F4F0", name: "Белый" };
const PALETTE = [
  { hex: "#F4F4F0", name: "Белый" },
  { hex: "#D9C7A3", name: "Бежевый" },
  { hex: "#9DB4C0", name: "Серо-голубой" },
  { hex: "#7C8B4F", name: "Оливковый" },
  { hex: "#C05746", name: "Терракота" },
  { hex: "#3A4A6B", name: "Индиго" },
  { hex: "#6B7280", name: "Графит" },
];

export const blogPosts: BlogPost[] = [
  {
    slug: "kak-vybrat-krasku-dlya-sten",
    title: "Как выбрать краску для стен: полный гид",
    category: "Как выбрать краску",
    excerpt:
      "Разбираемся, чем отличаются водоэмульсионные, акриловые и алкидные краски и что выбрать для разных комнат.",
    cover: "#9DB4C0",
    date: "2026-06-05",
    readingTime: 7,
    content:
      "Выбор краски начинается с типа помещения и поверхности. Для сухих жилых комнат подойдёт водоэмульсионная матовая краска — она безопасна и легко наносится. Для кухни и ванной нужна влагостойкая акриловая краска с защитой от плесени. Для деревянных и металлических поверхностей используют алкидные эмали.\n\nОбращайте внимание на расход: качественная краска перекрывает основание за два слоя, что в итоге экономнее дешёвых аналогов. Не забудьте про грунтовку — она укрепляет основание и снижает расход финишного покрытия.",
    relatedProductSlugs: ["interior-matt-premium", "interior-kitchen-bath"],
  },
  {
    slug: "cvetovye-trendy-2026",
    title: "Цветовые тренды 2026 года в интерьере",
    category: "Цветовые тренды",
    excerpt:
      "Тёплые землистые оттенки, приглушённый индиго и природная зелень — что в моде в этом сезоне.",
    cover: "#7C8B4F",
    date: "2026-05-20",
    readingTime: 5,
    content:
      "В 2026 году дизайнеры делают ставку на природные и спокойные оттенки. Землистая терракота, оливковый и приглушённый индиго создают уютную и одновременно современную атмосферу.\n\nСоветуем использовать колеровку, чтобы точно попасть в модный оттенок по каталогам RAL и NCS. Комбинируйте насыщенный акцентный цвет на одной стене с нейтральным фоном на остальных.",
    relatedProductSlugs: ["interior-matt-premium", "enamel-alkyd-universal"],
  },
  {
    slug: "podgotovka-fasada-k-pokraske",
    title: "Подготовка фасада к покраске: пошаговая инструкция",
    category: "Инструкции",
    excerpt:
      "Правильная подготовка — половина успеха. Рассказываем, как подготовить фасад, чтобы краска держалась годами.",
    cover: "#C05746",
    date: "2026-04-15",
    readingTime: 6,
    content:
      "Перед покраской фасада поверхность нужно очистить от грязи, старой отслаивающейся краски и высолов. Трещины расшить и заделать, поверхность выровнять.\n\nОбязательный этап — грунтование. Оно укрепляет основание и улучшает адгезию краски. Красить лучше в сухую погоду при температуре не ниже +5 °C, избегая прямого солнца.",
    relatedProductSlugs: [
      "facade-acryl-fasad",
      "facade-silicone",
      "primer-deep-grunt",
    ],
  },
];

export const loyaltyTiers: LoyaltyTier[] = [
  {
    name: "Стандарт",
    threshold: 0,
    rate: 3,
    perks: ["3% бонусами с каждой покупки", "Доступ к акциям"],
    color: "#9CA3AF",
  },
  {
    name: "Серебро",
    threshold: 30000,
    rate: 5,
    perks: ["5% бонусами", "Скидка 5% на колеровку", "Приоритетная поддержка"],
    color: "#94A3B8",
  },
  {
    name: "Золото",
    threshold: 100000,
    rate: 7,
    perks: [
      "7% бонусами",
      "Скидка 10% на колеровку",
      "Приоритетная обработка заказа",
      "Персональные предложения",
    ],
    color: "#F5A623",
  },
  {
    name: "Платина",
    threshold: 300000,
    rate: 10,
    perks: [
      "10% бонусами",
      "Бесплатная колеровка",
      "Персональный менеджер",
      "Ранний доступ к новинкам",
    ],
    color: "#1B2D5B",
  },
];

export { products, getProductBySlug } from "./data.js";

// Демонстрационные заказы для личного кабинета.
export const demoOrders: (Omit<Order, "items"> & {
  items: Omit<OrderItem, "id">[];
})[] = [
  {
    id: "2026-004821",
    createdAt: new Date("2026-06-18"),
    updatedAt: new Date("2026-06-18"),
    date: new Date("2026-06-18"),
    status: "В пути",
    items: [
      {
        name: "Краска интерьерная матовая Premium",
        volume: 5,
        quantity: 2,
        price: 5490,
      },
      {
        name: "Грунтовка глубокого проникновения",
        volume: 10,
        quantity: 1,
        price: 990,
      },
    ],
    total: 11970,
    bonusEarned: 359,
    tracking: "CDEK1234567890",
    customerId: "demo-user-1",
    customerName: "Demo User",
    customerEmail: "demo@example.com",
    customerPhone: "+7 (999) 123-45-67",
    deliveryMethod: "Курьер",
    deliveryAddress: "ул. Примерная, д. 1",
    paymentMethod: "Картой",
    promoCode: null,
    managerId: null,
  },
  {
    id: "2026-004102",
    createdAt: new Date("2026-05-30"),
    updatedAt: new Date("2026-05-30"),
    date: new Date("2026-05-30"),
    status: "Доставлен",
    items: [
      {
        name: "Эмаль алкидная универсальная ПФ-115",
        volume: 1,
        quantity: 3,
        price: 780,
      },
    ],
    total: 2340,
    bonusEarned: 70,
    tracking: "CDEK1234567891",
    customerId: "demo-user-2",
    customerName: "Demo User 2",
    customerEmail: "demo2@example.com",
    customerPhone: "+7 (999) 234-56-78",
    deliveryMethod: "Самовывоз",
    deliveryAddress: "ул. Примерная, д. 2",
    paymentMethod: "Наличные",
    promoCode: null,
    managerId: null,
  },
  {
    id: "2026-003544",
    createdAt: new Date("2026-04-11"),
    updatedAt: new Date("2026-04-11"),
    date: new Date("2026-04-11"),
    status: "Доставлен",
    items: [
      {
        name: "Фасадная краска акриловая Fasad",
        volume: 20,
        quantity: 1,
        price: 7490,
      },
    ],
    total: 7490,
    bonusEarned: 225,
    tracking: "CDEK1234567892",
    customerId: "demo-user-3",
    customerName: "Demo User 3",
    customerEmail: "demo3@example.com",
    customerPhone: "+7 (999) 345-67-89",
    deliveryMethod: "Курьер",
    deliveryAddress: "ул. Примерная, д. 3",
    paymentMethod: "Картой",
    promoCode: null,
    managerId: null,
  },
];
