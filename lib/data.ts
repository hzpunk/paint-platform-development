import type {
  Product,
  Category,
  Brand,
  Review,
  BlogPost,
  Order,
  LoyaltyTier,
} from './types'

export const categories: Category[] = [
  {
    slug: 'interior',
    name: 'Интерьерные краски',
    icon: 'Home',
    description: 'Для стен и потолков внутри помещений',
  },
  {
    slug: 'facade',
    name: 'Фасадные краски',
    icon: 'Building2',
    description: 'Атмосферостойкие покрытия для наружных работ',
  },
  {
    slug: 'primer',
    name: 'Грунтовки',
    icon: 'Layers',
    description: 'Подготовка поверхности перед окраской',
  },
  {
    slug: 'enamel',
    name: 'Эмали и лаки',
    icon: 'Paintbrush',
    description: 'Декоративная и защитная отделка',
  },
  {
    slug: 'anticor',
    name: 'Антикоррозийные',
    icon: 'ShieldCheck',
    description: 'Защита металла от ржавчины',
  },
  {
    slug: 'special',
    name: 'Спецсоставы',
    icon: 'FlaskConical',
    description: 'Огнезащита, гидроизоляция, антисептики',
  },
]

export const brands: Brand[] = [
  { slug: 'tikkurila', name: 'Tikkurila' },
  { slug: 'dulux', name: 'Dulux' },
  { slug: 'caparol', name: 'Caparol' },
  { slug: 'tex', name: 'ТЕКС' },
  { slug: 'lakra', name: 'Lakra' },
  { slug: 'olki', name: 'Ольки' },
]

export const surfaces = [
  'Стены',
  'Потолок',
  'Дерево',
  'Металл',
  'Бетон',
  'Кирпич',
  'Штукатурка',
]

export const paintTypes = [
  'водоэмульсионная',
  'алкидная',
  'акриловая',
  'эпоксидная',
] as const

// Ставка начисления бонусов: 1 балл ≈ 1 ₽ на каждые 100 ₽ покупки (базовый уровень 3%).
export const BASE_BONUS_RATE = 0.03

/** Расчёт базовых бонусных баллов за товар. */
export function bonusFor(price: number, rate = BASE_BONUS_RATE): number {
  return Math.round(price * rate)
}

const WHITE = { hex: '#F4F4F0', name: 'Белый' }
const PALETTE = [
  { hex: '#F4F4F0', name: 'Белый' },
  { hex: '#D9C7A3', name: 'Бежевый' },
  { hex: '#9DB4C0', name: 'Серо-голубой' },
  { hex: '#7C8B4F', name: 'Оливковый' },
  { hex: '#C05746', name: 'Терракота' },
  { hex: '#3A4A6B', name: 'Индиго' },
  { hex: '#6B7280', name: 'Графит' },
]

export const products: Product[] = [
  {
    id: 'p1',
    slug: 'interior-matt-premium',
    name: 'Краска интерьерная матовая Premium',
    brand: 'Tikkurila',
    categorySlug: 'interior',
    type: 'водоэмульсионная',
    surfaces: ['Стены', 'Потолок', 'Штукатурка'],
    price: 1290,
    packaging: [
      { volume: 1, price: 1290, sku: 'TK-INT-01' },
      { volume: 5, price: 5490, sku: 'TK-INT-05' },
      { volume: 10, price: 9990, sku: 'TK-INT-10' },
    ],
    colors: PALETTE,
    images: ['#F4F4F0'],
    badges: ['Хит', 'Колеровка'],
    rating: 4.8,
    reviewsCount: 214,
    inStock: true,
    colorable: true,
    shortSpec: 'Матовая, моющаяся, без запаха',
    description:
      'Высококачественная водоэмульсионная краска для стен и потолков. Создаёт ровное матовое покрытие, устойчивое к влажной уборке. Не содержит растворителей и практически без запаха, что делает её безопасной для жилых помещений.',
    specs: {
      composition: 'Акрилатная дисперсия, пигменты, вода',
      consumption: 8,
      dryingTime: '1–2 ч на отлип, 24 ч полное',
      coverage: 'Высокая, 1–2 слоя',
      layers: '2 слоя',
      storage: 'От +5 до +30 °C, не замораживать',
    },
    application:
      'Поверхность очистить от пыли и загрязнений, при необходимости загрунтовать. Краску тщательно перемешать. Наносить валиком или кистью в 1–2 слоя с интервалом 2–4 часа.',
  },
  {
    id: 'p2',
    slug: 'facade-acryl-fasad',
    name: 'Фасадная краска акриловая Fasad',
    brand: 'Caparol',
    categorySlug: 'facade',
    type: 'акриловая',
    surfaces: ['Бетон', 'Кирпич', 'Штукатурка'],
    price: 2190,
    oldPrice: 2690,
    packaging: [
      { volume: 5, price: 2190, sku: 'CP-FAS-05' },
      { volume: 10, price: 3990, sku: 'CP-FAS-10' },
      { volume: 20, price: 7490, sku: 'CP-FAS-20' },
    ],
    colors: PALETTE,
    images: ['#E8E4DC'],
    badges: ['Акция', 'Колеровка'],
    rating: 4.7,
    reviewsCount: 128,
    inStock: true,
    colorable: true,
    shortSpec: 'Атмосферостойкая, паропроницаемая',
    description:
      'Акриловая фасадная краска для наружных работ. Устойчива к УФ-излучению, осадкам и перепадам температур. Паропроницаемое покрытие защищает фасад и сохраняет цвет до 10 лет.',
    specs: {
      composition: 'Акриловая дисперсия, минеральные наполнители',
      consumption: 6,
      dryingTime: '2 ч на отлип, 24 ч полное',
      coverage: 'Высокая',
      layers: '2 слоя',
      storage: 'От +5 до +30 °C',
    },
    application:
      'Наносить на сухую очищенную поверхность при температуре не ниже +5 °C. Рекомендуется предварительное грунтование. Два слоя с интервалом 4–6 часов.',
  },
  {
    id: 'p3',
    slug: 'primer-deep-grunt',
    name: 'Грунтовка глубокого проникновения',
    brand: 'ТЕКС',
    categorySlug: 'primer',
    type: 'акриловая',
    surfaces: ['Бетон', 'Кирпич', 'Штукатурка', 'Стены'],
    price: 590,
    packaging: [
      { volume: 5, price: 590, sku: 'TX-PR-05' },
      { volume: 10, price: 990, sku: 'TX-PR-10' },
    ],
    colors: [{ hex: '#DCE6EC', name: 'Бесцветная' }],
    images: ['#DCE6EC'],
    badges: ['Хит'],
    rating: 4.6,
    reviewsCount: 96,
    inStock: true,
    colorable: false,
    shortSpec: 'Укрепляет основание, снижает расход краски',
    description:
      'Грунтовка глубокого проникновения укрепляет рыхлые и пористые основания, улучшает адгезию и снижает расход финишных покрытий. Подходит для внутренних и наружных работ.',
    specs: {
      composition: 'Водная акрилатная дисперсия',
      consumption: 10,
      dryingTime: '1 ч',
      coverage: 'Прозрачная',
      layers: '1–2 слоя',
      storage: 'От +5 до +30 °C, не замораживать',
    },
    application:
      'Наносить кистью, валиком или распылителем на очищенную поверхность. При сильно впитывающих основаниях нанести повторно.',
  },
  {
    id: 'p4',
    slug: 'enamel-alkyd-universal',
    name: 'Эмаль алкидная универсальная ПФ-115',
    brand: 'Lakra',
    categorySlug: 'enamel',
    type: 'алкидная',
    surfaces: ['Металл', 'Дерево'],
    price: 780,
    packaging: [
      { volume: 1, price: 780, sku: 'LK-EN-01' },
      { volume: 5, price: 3490, sku: 'LK-EN-05' },
    ],
    colors: PALETTE,
    images: ['#3A4A6B'],
    badges: ['Колеровка'],
    rating: 4.5,
    reviewsCount: 187,
    inStock: true,
    colorable: true,
    shortSpec: 'Глянцевая, для дерева и металла',
    description:
      'Универсальная алкидная эмаль для наружных и внутренних работ по металлу и дереву. Образует прочное глянцевое покрытие, устойчивое к атмосферным воздействиям.',
    specs: {
      composition: 'Алкидный лак, пигменты, растворитель',
      consumption: 10,
      dryingTime: '24 ч между слоями',
      coverage: 'Средняя',
      layers: '2 слоя',
      storage: 'От −20 до +30 °C, беречь от огня',
    },
    application:
      'Поверхность очистить и обезжирить. Металл предварительно загрунтовать. Наносить кистью или распылителем в 2 слоя.',
  },
  {
    id: 'p5',
    slug: 'anticor-3in1',
    name: 'Грунт-эмаль по ржавчине 3 в 1',
    brand: 'Dulux',
    categorySlug: 'anticor',
    type: 'алкидная',
    surfaces: ['Металл'],
    price: 990,
    packaging: [
      { volume: 1, price: 990, sku: 'DX-AC-01' },
      { volume: 3, price: 2590, sku: 'DX-AC-03' },
    ],
    colors: [
      { hex: '#6B7280', name: 'Серый' },
      { hex: '#1A1A2E', name: 'Чёрный' },
      { hex: '#C05746', name: 'Красно-коричневый' },
    ],
    images: ['#6B7280'],
    badges: ['Новинка'],
    rating: 4.7,
    reviewsCount: 74,
    inStock: true,
    colorable: false,
    shortSpec: 'Наносится прямо на ржавчину',
    description:
      'Грунт-эмаль 3 в 1 совмещает функции преобразователя ржавчины, грунта и декоративного покрытия. Наносится прямо на очищенную ржавую поверхность без дополнительной подготовки.',
    specs: {
      composition: 'Алкидно-уретановая основа, ингибиторы коррозии',
      consumption: 8,
      dryingTime: '3 ч на отлип',
      coverage: 'Высокая',
      layers: '2–3 слоя',
      storage: 'От −20 до +30 °C',
    },
    application:
      'Удалить рыхлую ржавчину металлической щёткой, обезжирить. Наносить в 2–3 слоя с интервалом 3–4 часа.',
  },
  {
    id: 'p6',
    slug: 'special-fire-protect',
    name: 'Огнезащитный состав для дерева',
    brand: 'Ольки',
    categorySlug: 'special',
    type: 'акриловая',
    surfaces: ['Дерево'],
    price: 1650,
    packaging: [
      { volume: 5, price: 1650, sku: 'OL-FP-05' },
      { volume: 10, price: 3090, sku: 'OL-FP-10' },
    ],
    colors: [{ hex: '#D9C7A3', name: 'Полупрозрачный' }],
    images: ['#D9C7A3'],
    badges: ['Новинка'],
    rating: 4.4,
    reviewsCount: 41,
    inStock: false,
    colorable: false,
    shortSpec: 'I группа огнезащитной эффективности',
    description:
      'Огнебиозащитный состав для древесины обеспечивает I группу огнезащитной эффективности и защиту от плесени, грибка и насекомых. Не изменяет структуру древесины.',
    specs: {
      composition: 'Антипирены, антисептики, водная основа',
      consumption: 4,
      dryingTime: '12 ч',
      coverage: 'Полупрозрачная',
      layers: '2–3 слоя',
      storage: 'От +5 до +30 °C, не замораживать',
    },
    application:
      'Наносить на сухую очищенную древесину при влажности не более 20%. 2–3 слоя с интервалом 30–60 минут.',
  },
  {
    id: 'p7',
    slug: 'interior-kitchen-bath',
    name: 'Краска для кухни и ванной влагостойкая',
    brand: 'Dulux',
    categorySlug: 'interior',
    type: 'акриловая',
    surfaces: ['Стены', 'Потолок'],
    price: 1890,
    packaging: [
      { volume: 1, price: 1890, sku: 'DX-KB-01' },
      { volume: 2.5, price: 3990, sku: 'DX-KB-02' },
      { volume: 5, price: 6990, sku: 'DX-KB-05' },
    ],
    colors: PALETTE,
    images: ['#EAF0EC'],
    badges: ['Хит', 'Колеровка'],
    rating: 4.9,
    reviewsCount: 302,
    inStock: true,
    colorable: true,
    shortSpec: 'Влагостойкая, защита от плесени',
    description:
      'Специальная краска для помещений с повышенной влажностью. Образует покрытие с защитой от плесени и грибка, выдерживает частую влажную уборку.',
    specs: {
      composition: 'Акрилатная дисперсия, антигрибковые добавки',
      consumption: 9,
      dryingTime: '1–2 ч',
      coverage: 'Высокая',
      layers: '2 слоя',
      storage: 'От +5 до +30 °C, не замораживать',
    },
    application:
      'Наносить на подготовленную загрунтованную поверхность в 2 слоя валиком или кистью.',
  },
  {
    id: 'p8',
    slug: 'lacquer-parquet',
    name: 'Лак паркетный полуматовый',
    brand: 'Tikkurila',
    categorySlug: 'enamel',
    type: 'акриловая',
    surfaces: ['Дерево'],
    price: 2450,
    packaging: [
      { volume: 1, price: 2450, sku: 'TK-LC-01' },
      { volume: 5, price: 10990, sku: 'TK-LC-05' },
    ],
    colors: [{ hex: '#C9A876', name: 'Бесцветный' }],
    images: ['#C9A876'],
    badges: ['Хит'],
    rating: 4.8,
    reviewsCount: 156,
    inStock: true,
    colorable: false,
    shortSpec: 'Износостойкий, на водной основе',
    description:
      'Паркетный лак на водной основе для деревянных полов с высокой проходимостью. Создаёт износостойкое полуматовое покрытие, не желтеет со временем.',
    specs: {
      composition: 'Полиуретан-акрилатная дисперсия',
      consumption: 12,
      dryingTime: '2–3 ч между слоями',
      coverage: 'Прозрачная',
      layers: '2–3 слоя',
      storage: 'От +5 до +30 °C, не замораживать',
    },
    application:
      'Наносить на очищенную отшлифованную древесину кистью или валиком в 2–3 слоя с промежуточной шлифовкой.',
  },
  {
    id: 'p9',
    slug: 'facade-silicone',
    name: 'Фасадная краска силиконовая',
    brand: 'Caparol',
    categorySlug: 'facade',
    type: 'акриловая',
    surfaces: ['Бетон', 'Штукатурка', 'Кирпич'],
    price: 3290,
    packaging: [
      { volume: 5, price: 3290, sku: 'CP-SL-05' },
      { volume: 10, price: 5990, sku: 'CP-SL-10' },
    ],
    colors: PALETTE,
    images: ['#EFE9DF'],
    badges: ['Колеровка'],
    rating: 4.6,
    reviewsCount: 63,
    inStock: true,
    colorable: true,
    shortSpec: 'Самоочищающаяся, грязеотталкивающая',
    description:
      'Силиконовая фасадная краска с грязеотталкивающим эффектом. Высокая паропроницаемость и водоотталкивающие свойства обеспечивают длительную защиту фасада.',
    specs: {
      composition: 'Силиконовая эмульсия, акрилат',
      consumption: 6,
      dryingTime: '3 ч',
      coverage: 'Высокая',
      layers: '2 слоя',
      storage: 'От +5 до +30 °C',
    },
    application:
      'Наносить на сухую загрунтованную поверхность в 2 слоя при температуре +5…+30 °C.',
  },
  {
    id: 'p10',
    slug: 'primer-concrete-contact',
    name: 'Грунт «Бетонконтакт»',
    brand: 'ТЕКС',
    categorySlug: 'primer',
    type: 'акриловая',
    surfaces: ['Бетон', 'Штукатурка'],
    price: 890,
    packaging: [
      { volume: 6, price: 890, sku: 'TX-BC-06' },
      { volume: 12, price: 1590, sku: 'TX-BC-12' },
    ],
    colors: [{ hex: '#E7B7A0', name: 'Розовый' }],
    images: ['#E7B7A0'],
    badges: [],
    rating: 4.5,
    reviewsCount: 52,
    inStock: true,
    colorable: false,
    shortSpec: 'Адгезионный грунт для гладких оснований',
    description:
      'Адгезионный грунт с кварцевым наполнителем для создания шероховатой основы на гладких плотных поверхностях перед штукатуркой или плиткой.',
    specs: {
      composition: 'Акрилатная дисперсия, кварцевый песок',
      consumption: 3,
      dryingTime: '3–4 ч',
      coverage: 'Розовая',
      layers: '1 слой',
      storage: 'От +5 до +30 °C, не замораживать',
    },
    application:
      'Тщательно перемешать. Наносить кистью или валиком одним слоем. Последующие работы через 3–4 часа.',
  },
  {
    id: 'p11',
    slug: 'enamel-radiator',
    name: 'Эмаль для радиаторов термостойкая',
    brand: 'Lakra',
    categorySlug: 'enamel',
    type: 'алкидная',
    surfaces: ['Металл'],
    price: 650,
    packaging: [{ volume: 0.9, price: 650, sku: 'LK-RD-09' }],
    colors: [{ hex: '#F4F4F0', name: 'Белый' }],
    images: ['#F4F4F0'],
    badges: [],
    rating: 4.4,
    reviewsCount: 88,
    inStock: true,
    colorable: false,
    shortSpec: 'До +90 °C, не желтеет',
    description:
      'Термостойкая эмаль для отопительных приборов. Выдерживает нагрев до +90 °C, сохраняет белизну и не желтеет при эксплуатации.',
    specs: {
      composition: 'Алкидная основа, термостойкие пигменты',
      consumption: 10,
      dryingTime: '24 ч',
      coverage: 'Высокая',
      layers: '2 слоя',
      storage: 'От −20 до +30 °C, беречь от огня',
    },
    application:
      'Радиатор очистить, обезжирить. Наносить на холодную поверхность в 2 слоя.',
  },
  {
    id: 'p12',
    slug: 'special-waterproof',
    name: 'Гидроизоляционная мастика',
    brand: 'Ольки',
    categorySlug: 'special',
    type: 'эпоксидная',
    surfaces: ['Бетон', 'Металл'],
    price: 2890,
    packaging: [
      { volume: 5, price: 2890, sku: 'OL-WP-05' },
      { volume: 20, price: 9990, sku: 'OL-WP-20' },
    ],
    colors: [{ hex: '#2E2E38', name: 'Чёрный' }],
    images: ['#2E2E38'],
    badges: ['Акция'],
    oldPrice: 3490,
    rating: 4.3,
    reviewsCount: 29,
    inStock: true,
    colorable: false,
    shortSpec: 'Для кровли, фундамента, подвалов',
    description:
      'Битумно-полимерная гидроизоляционная мастика для защиты фундаментов, кровли и подвалов от влаги. Образует бесшовное эластичное покрытие.',
    specs: {
      composition: 'Битум, полимерные модификаторы',
      consumption: 2,
      dryingTime: '24 ч',
      coverage: 'Чёрная',
      layers: '2 слоя',
      storage: 'От −20 до +30 °C',
    },
    application:
      'Основание очистить и просушить. Наносить кистью или шпателем в 2 слоя с промежуточной сушкой.',
  },
]

export const reviews: Review[] = [
  {
    id: 'r1',
    productSlug: 'interior-matt-premium',
    author: 'Андрей М.',
    rating: 5,
    date: '2026-05-12',
    text: 'Красил спальню, краска ложится ровно, запаха почти нет. Укрывистость отличная — хватило двух слоёв.',
    verified: true,
  },
  {
    id: 'r2',
    productSlug: 'interior-matt-premium',
    author: 'Светлана К.',
    rating: 4,
    date: '2026-04-28',
    text: 'Хорошая краска, но колеровку заказывала отдельно. Цвет получился точь-в-точь как на палитре.',
    verified: true,
  },
  {
    id: 'r3',
    productSlug: 'facade-acryl-fasad',
    author: 'ООО «СтройДом»',
    rating: 5,
    date: '2026-06-01',
    text: 'Брали 200 литров на объект. Держится отлично, цвет не выгорел за сезон. Менеджер помог с колеровкой.',
    verified: true,
  },
  {
    id: 'r4',
    author: 'Дмитрий П.',
    rating: 5,
    date: '2026-05-30',
    text: 'Заказ приехал за 2 дня, оплатил курьеру. Всё как в описании, бонусы начислили.',
    verified: true,
  },
  {
    id: 'r5',
    author: 'Марина В.',
    rating: 5,
    date: '2026-06-10',
    text: 'Отличный магазин, консультанты реально разбираются в красках. Помогли подобрать под детскую.',
    verified: true,
  },
]

export const blogPosts: BlogPost[] = [
  {
    slug: 'kak-vybrat-krasku-dlya-sten',
    title: 'Как выбрать краску для стен: полный гид',
    category: 'Как выбрать краску',
    excerpt:
      'Разбираемся, чем отличаются водоэмульсионные, акриловые и алкидные краски и что выбрать для разных комнат.',
    cover: '#9DB4C0',
    date: '2026-06-05',
    readingTime: 7,
    content:
      'Выбор краски начинается с типа помещения и поверхности. Для сухих жилых комнат подойдёт водоэмульсионная матовая краска — она безопасна и легко наносится. Для кухни и ванной нужна влагостойкая акриловая краска с защитой от плесени. Для деревянных и металлических поверхностей используют алкидные эмали.\n\nОбращайте внимание на расход: качественная краска перекрывает основание за два слоя, что в итоге экономнее дешёвых аналогов. Не забудьте про грунтовку — она укрепляет основание и снижает расход финишного покрытия.',
    relatedProductSlugs: ['interior-matt-premium', 'interior-kitchen-bath'],
  },
  {
    slug: 'cvetovye-trendy-2026',
    title: 'Цветовые тренды 2026 года в интерьере',
    category: 'Цветовые тренды',
    excerpt:
      'Тёплые землистые оттенки, приглушённый индиго и природная зелень — что в моде в этом сезоне.',
    cover: '#7C8B4F',
    date: '2026-05-20',
    readingTime: 5,
    content:
      'В 2026 году дизайнеры делают ставку на природные и спокойные оттенки. Землистая терракота, оливковый и приглушённый индиго создают уютную и одновременно современную атмосферу.\n\nСоветуем использовать колеровку, чтобы точно попасть в модный оттенок по каталогам RAL и NCS. Комбинируйте насыщенный акцентный цвет на одной стене с нейтральным фоном на остальных.',
    relatedProductSlugs: ['interior-matt-premium', 'enamel-alkyd-universal'],
  },
  {
    slug: 'podgotovka-fasada-k-pokraske',
    title: 'Подготовка фасада к покраске: пошаговая инструкция',
    category: 'Инструкции',
    excerpt:
      'Правильная подготовка — половина успеха. Рассказываем, как подготовить фасад, чтобы краска держалась годами.',
    cover: '#C05746',
    date: '2026-04-15',
    readingTime: 6,
    content:
      'Перед покраской фасада поверхность нужно очистить от грязи, старой отслаивающейся краски и высолов. Трещины расшить и заделать, поверхность выровнять.\n\nОбязательный этап — грунтование. Оно укрепляет основание и улучшает адгезию краски. Красить лучше в сухую погоду при температуре не ниже +5 °C, избегая прямого солнца.',
    relatedProductSlugs: ['facade-acryl-fasad', 'facade-silicone', 'primer-deep-grunt'],
  },
]

export const loyaltyTiers: LoyaltyTier[] = [
  {
    name: 'Стандарт',
    threshold: 0,
    rate: 3,
    perks: ['3% бонусами с каждой покупки', 'Доступ к акциям'],
    color: '#9CA3AF',
  },
  {
    name: 'Серебро',
    threshold: 30000,
    rate: 5,
    perks: ['5% бонусами', 'Скидка 5% на колеровку', 'Приоритетная поддержка'],
    color: '#94A3B8',
  },
  {
    name: 'Золото',
    threshold: 100000,
    rate: 7,
    perks: [
      '7% бонусами',
      'Скидка 10% на колеровку',
      'Приоритетная обработка заказа',
      'Персональные предложения',
    ],
    color: '#F5A623',
  },
  {
    name: 'Платина',
    threshold: 300000,
    rate: 10,
    perks: [
      '10% бонусами',
      'Бесплатная колеровка',
      'Персональный менеджер',
      'Ранний доступ к новинкам',
    ],
    color: '#1B2D5B',
  },
]

// Демонстрационные заказы для личного кабинета.
export const demoOrders: Order[] = [
  {
    id: '2026-004821',
    date: '2026-06-18',
    status: 'В пути',
    items: [
      { name: 'Краска интерьерная матовая Premium', volume: 5, quantity: 2, price: 5490 },
      { name: 'Грунтовка глубокого проникновения', volume: 10, quantity: 1, price: 990 },
    ],
    total: 11970,
    bonusEarned: 359,
    deliveryType: 'Курьер',
    tracking: 'CDEK1234567890',
  },
  {
    id: '2026-004102',
    date: '2026-05-30',
    status: 'Доставлен',
    items: [
      { name: 'Эмаль алкидная универсальная ПФ-115', volume: 1, quantity: 3, price: 780 },
    ],
    total: 2340,
    bonusEarned: 70,
    deliveryType: 'ПВЗ СДЭК',
  },
  {
    id: '2026-003544',
    date: '2026-04-11',
    status: 'Доставлен',
    items: [
      { name: 'Фасадная краска акриловая Fasad', volume: 20, quantity: 1, price: 7490 },
    ],
    total: 7490,
    bonusEarned: 225,
    deliveryType: 'Самовывоз',
  },
]

// ——— Утилиты выборки ———

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug)
}

export function getProductsByCategory(categorySlug: string): Product[] {
  return products.filter((p) => p.categorySlug === categorySlug)
}

export function getReviewsForProduct(slug: string): Review[] {
  return reviews.filter((r) => r.productSlug === slug)
}

export function getRelatedProducts(product: Product, limit = 4): Product[] {
  return products
    .filter((p) => p.categorySlug === product.categorySlug && p.id !== product.id)
    .slice(0, limit)
}

export function getAccessories(limit = 4): Product[] {
  // ponytail: аксессуаров в каталоге нет — показываем грунтовки/спецсоставы как сопутствующие.
  return products
    .filter((p) => p.categorySlug === 'primer' || p.categorySlug === 'special')
    .slice(0, limit)
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug)
}

export const HITS = products.filter((p) => p.badges.includes('Хит'))
