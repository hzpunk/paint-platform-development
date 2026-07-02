import { Truck, Palette, BadgePercent, Headphones, ShieldCheck, CreditCard } from 'lucide-react'

const ITEMS = [
  {
    icon: Truck,
    title: 'Доставка по РФ',
    text: 'Курьер, пункты выдачи и самовывоз. Отправляем транспортными компаниями по всей стране.',
  },
  {
    icon: Palette,
    title: 'Профессиональная колеровка',
    text: 'Подберём и заколеруем краску в любой оттенок по каталогам RAL, NCS и образцу.',
  },
  {
    icon: CreditCard,
    title: 'Оплата при получении',
    text: 'Платите картой или наличными курьеру. Для бизнеса — безналичный расчёт с НДС.',
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
    <section className="border-y border-border bg-muted/40">
      <div className="mx-auto max-w-[1280px] px-4 py-14 md:px-6">
        <h2 className="mb-8 text-center font-heading text-2xl font-bold md:text-3xl">
          Почему покупают у нас
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ITEMS.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex gap-4 rounded-lg border border-border bg-card p-5">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-accent/15 text-accent-foreground">
                <Icon className="size-5 text-accent" />
              </span>
              <div>
                <h3 className="font-heading font-semibold">{title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
