import { MapPin, Palette, BadgePercent, Headphones, ShieldCheck, CreditCard } from 'lucide-react'

const ITEMS = [
  {
    icon: MapPin,
    title: 'Удобный самовывоз',
    text: 'Забирайте заказы бесплатно из нашего фирменного магазина-склада в Москве.',
  },
  {
    icon: Palette,
    title: 'Профессиональная колеровка',
    text: 'Подберём и заколеруем краску в любой оттенок по каталогам RAL, NCS и образцу.',
  },
  {
    icon: CreditCard,
    title: 'Оплата при получении',
    text: 'Платите картой или наличными при получении. Для бизнеса — безналичный расчёт с НДС.',
  },
  {
    icon: BadgePercent,
    title: 'Бонусная программа',
    text: 'До 10% бонусами с каждой покупки и персональные скидки постоянным клиентам.',
  },
  {
    icon: ShieldCheck,
    title: 'Только сертификат',
    text: 'Продаём оригинальную продукцию с сертификатами качества и гарантией производителя.',
  },
  {
    icon: Headphones,
    title: 'Консультация специалиста',
    text: 'Поможем рассчитать расход и подобрать материал под конкретную поверхность.',
  },
]

export function Advantages() {
  return (
    <section className="border-y border-border bg-secondary/50">
      <div className="section-shell py-14 md:py-20">
        <div className="mb-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-foreground/60">
            Наши преимущества
          </p>
          <h2 className="mt-1 font-heading text-2xl font-bold text-balance md:text-3xl">
            Почему покупают у нас
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ITEMS.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="group flex gap-4 rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-card)] transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-[var(--shadow-card-hover)]"
            >
              <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-accent/15 transition-colors duration-200 group-hover:bg-accent">
                <Icon className="size-5 text-accent transition-colors duration-200 group-hover:text-accent-foreground" />
              </span>
              <div>
                <h3 className="font-heading font-bold">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
