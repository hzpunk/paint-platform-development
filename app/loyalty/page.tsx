import Link from 'next/link'
import { Star, Gift, ArrowRight, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { loyaltyTiers } from '@/lib/data'
import type { Metadata } from 'next'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Программа лояльности',
  description: 'Бонусная программа КраскаПроф: 4 уровня, до 10% баллами с каждой покупки, реферальная программа.',
}

export default function LoyaltyPage() {
  return (
    <div className="mx-auto max-w-[1280px] px-4 py-12 md:px-6">
      {/* Hero */}
      <div className="text-center mb-14">
        <span className="inline-flex items-center gap-2 rounded-full bg-accent/15 px-4 py-1.5 text-sm font-medium text-accent">
          <Star className="size-4" />
          Программа лояльности
        </span>
        <h1 className="mt-4 font-heading text-4xl font-extrabold md:text-5xl">
          Зарабатывайте с каждой покупки
        </h1>
        <p className="mt-4 max-w-xl mx-auto text-lg text-muted-foreground leading-relaxed">
          Четыре уровня привилегий: от Стандарта до Платины. Баллы не сгорают, если покупаете
          хотя бы раз в год.
        </p>
        <div className="mt-6 flex flex-wrap gap-3 justify-center">
          <Button size="lg" render={<Link href="/account" />}>
            Зарегистрироваться
            <ArrowRight className="ml-2 size-4" />
          </Button>
          <Button size="lg" variant="outline" render={<Link href="/loyalty-terms" />}>
            Условия программы
          </Button>
        </div>
      </div>

      {/* Уровни */}
      <section className="mb-14">
        <h2 className="font-heading text-2xl font-bold mb-6 text-center">Уровни программы</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {loyaltyTiers.map((tier, i) => (
            <div
              key={tier.name}
              className={cn(
                'rounded-xl border-2 p-6 flex flex-col gap-4',
                i === 2 ? 'border-accent shadow-lg' : 'border-border',
              )}
            >
              <div>
                <div
                  className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-bold"
                  style={{ backgroundColor: `${tier.color}20`, color: tier.color }}
                >
                  <Star className="size-3.5" />
                  {tier.name}
                </div>
                <p className="mt-2 text-2xl font-extrabold">{tier.rate}%</p>
                <p className="text-xs text-muted-foreground">бонусами с каждой покупки</p>
              </div>

              <div className="text-sm text-muted-foreground">
                {tier.threshold === 0
                  ? 'Сразу после регистрации'
                  : `Покупки от ${tier.threshold.toLocaleString('ru')} ₽ за 12 мес.`}
              </div>

              <ul className="flex flex-col gap-2">
                {tier.perks.map((perk) => (
                  <li key={perk} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="size-4 shrink-0 text-success mt-0.5" />
                    {perk}
                  </li>
                ))}
              </ul>

              {i === 2 && (
                <span className="absolute top-4 right-4 rounded-full bg-accent px-2 py-0.5 text-xs font-bold text-accent-foreground">
                  Популярный
                </span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Как тратить баллы */}
      <section className="mb-14 rounded-xl border border-border bg-card p-8">
        <h2 className="font-heading text-2xl font-bold mb-6">Как тратить баллы</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { n: '1', title: 'При оформлении заказа', desc: 'Применяйте баллы на шаге корзины. Можно использовать частично или полностью.' },
            { n: '2', title: '1 балл = 1 рубль', desc: 'Баллы напрямую снижают стоимость заказа без ограничений на категории товаров.' },
            { n: '3', title: 'Накапливайте на больших объёмах', desc: 'Чем крупнее заказ — тем больше баллов. Уровень Золото и Платина дают приоритет.' },
          ].map(({ n, title, desc }) => (
            <div key={n} className="flex gap-4">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                {n}
              </span>
              <div>
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Реферальная программа */}
      <section className="rounded-xl bg-primary text-primary-foreground p-8 md:p-12">
        <div className="flex items-center gap-3 mb-4">
          <Gift className="size-8 text-accent" />
          <h2 className="font-heading text-2xl font-bold">Реферальная программа</h2>
        </div>
        <p className="max-w-xl text-primary-foreground/80 leading-relaxed mb-6">
          Приглашайте коллег и друзей — зарабатывайте баллы за каждого нового клиента.
          Особые условия для профессиональных мастеров и строительных бригад.
        </p>
        <div className="grid gap-4 sm:grid-cols-3 mb-8">
          {[
            { label: 'За регистрацию друга', value: '+500 баллов' },
            { label: 'За первый заказ друга', value: '+2% от суммы' },
            { label: 'Для бригад (опт)', value: 'Условия с менеджером' },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-lg bg-primary-foreground/10 p-4">
              <p className="text-xl font-bold text-accent">{value}</p>
              <p className="text-sm text-primary-foreground/70 mt-1">{label}</p>
            </div>
          ))}
        </div>
        <Button
          className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2"
          render={<Link href="/account" />}
        >
          Войти и получить свой код
          <ArrowRight className="size-4" />
        </Button>
      </section>
    </div>
  )
}
