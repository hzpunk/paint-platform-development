import Link from 'next/link'
import { Star, Gift, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { loyaltyTiers } from '@/lib/data'

/** Блок программы лояльности и реферальной программы на главной. */
export function LoyaltyBlock() {
  return (
    <section className="border-y border-border bg-primary text-primary-foreground">
      <div className="mx-auto max-w-[1280px] px-4 py-14 md:px-6">
        <div className="grid gap-10 md:grid-cols-2">
          {/* Лояльность */}
          <div>
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-lg bg-accent/20 text-accent">
                <Star className="size-5" />
              </span>
              <span className="text-sm font-medium uppercase tracking-wide text-primary-foreground/70">
                Программа лояльности
              </span>
            </div>
            <h2 className="mt-4 font-heading text-2xl font-bold md:text-3xl">
              До 10% бонусами с каждой покупки
            </h2>
            <p className="mt-3 max-w-md text-pretty leading-relaxed text-primary-foreground/70">
              Накапливайте баллы и тратьте их на следующие заказы. Четыре уровня привилегий —
              от Стандарта до Платины с персональным менеджером.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {loyaltyTiers.map((tier) => (
                <span
                  key={tier.name}
                  className="rounded-full px-3 py-1 text-xs font-semibold"
                  style={{ backgroundColor: `${tier.color}30`, color: tier.color === '#1B2D5B' ? '#fff' : tier.color }}
                >
                  {tier.name} · {tier.rate}%
                </span>
              ))}
            </div>
            <Button
              className="mt-6 gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
              render={<Link href="/loyalty" />}
            >
              Узнать подробнее
              <ArrowRight className="size-4" />
            </Button>
          </div>

          {/* Реферальная программа */}
          <div>
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-lg bg-accent/20 text-accent">
                <Gift className="size-5" />
              </span>
              <span className="text-sm font-medium uppercase tracking-wide text-primary-foreground/70">
                Реферальная программа
              </span>
            </div>
            <h2 className="mt-4 font-heading text-2xl font-bold md:text-3xl">
              Приглашайте друзей — зарабатывайте вместе
            </h2>
            <p className="mt-3 max-w-md text-pretty leading-relaxed text-primary-foreground/70">
              Поделитесь своим кодом с коллегой или другом. После его первого заказа вы оба
              получите бонусные баллы. Особые условия для мастеров и строительных бригад.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-primary-foreground/80">
              <li className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-accent" />
                Друг зарегистрировался — вам +500 баллов
              </li>
              <li className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-accent" />
                Друг сделал заказ — вам +2% от суммы его покупки
              </li>
              <li className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-accent" />
                Для мастеров: повышенный бонус за оптовые заказы
              </li>
            </ul>
            <Button
              variant="outline"
              className="mt-6 gap-2 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
              render={<Link href="/account" />}
            >
              Зарегистрироваться
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
