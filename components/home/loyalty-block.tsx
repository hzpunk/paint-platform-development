import Link from 'next/link'
import { Star, Gift, ArrowRight, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { loyaltyTiers } from '@/lib/data'

/** Блок программы лояльности и реферальной программы на главной. */
export function LoyaltyBlock() {
  return (
    <section className="relative overflow-hidden bg-primary text-primary-foreground">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(ellipse 60% 50% at 90% 10%, rgba(245, 166, 35, 0.1), transparent 60%)',
        }}
      />
      <div className="section-shell relative py-14 md:py-20">
        <div className="grid gap-8 md:grid-cols-2">
          {/* Лояльность */}
          <div className="flex flex-col rounded-2xl border border-primary-foreground/10 bg-primary-foreground/5 p-7 backdrop-blur-sm md:p-9">
            <div className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-xl bg-accent text-accent-foreground shadow-md">
                <Star className="size-5" />
              </span>
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-foreground/70">
                Программа лояльности
              </span>
            </div>
            <h2 className="mt-5 font-heading text-2xl font-bold text-balance md:text-3xl">
              До 10% бонусами с каждой покупки
            </h2>
            <p className="mt-3 max-w-md text-pretty leading-relaxed text-primary-foreground/70">
              Накапливайте баллы и тратьте их на следующие заказы. Четыре уровня привилегий —
              от Стандарта до Платины с персональным менеджером.
            </p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              {loyaltyTiers.map((tier) => (
                <span
                  key={tier.name}
                  className="rounded-full border border-primary-foreground/15 bg-primary-foreground/10 px-3.5 py-1.5 text-xs font-semibold"
                >
                  {tier.name} · {tier.rate}%
                </span>
              ))}
            </div>
            <div className="mt-auto pt-7">
              <Button
                className="w-fit gap-2 bg-accent font-semibold text-accent-foreground shadow-lg shadow-accent/20 hover:bg-accent/90"
                render={<Link href="/loyalty" />}
              >
                Узнать подробнее
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>

          {/* Реферальная программа */}
          <div className="flex flex-col rounded-2xl border border-primary-foreground/10 bg-primary-foreground/5 p-7 backdrop-blur-sm md:p-9">
            <div className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-xl bg-primary-foreground/15 text-accent">
                <Gift className="size-5" />
              </span>
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-foreground/70">
                Реферальная программа
              </span>
            </div>
            <h2 className="mt-5 font-heading text-2xl font-bold text-balance md:text-3xl">
              Приглашайте друзей — зарабатывайте вместе
            </h2>
            <p className="mt-3 max-w-md text-pretty leading-relaxed text-primary-foreground/70">
              Поделитесь своим кодом с коллегой или другом. После его первого заказа вы оба
              получите бонусные баллы. Особые условия для мастеров и строительных бригад.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-primary-foreground/85">
              <li className="flex items-start gap-2.5">
                <Check className="mt-0.5 size-4 shrink-0 text-accent" />
                Друг зарегистрировался — вам +500 баллов
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="mt-0.5 size-4 shrink-0 text-accent" />
                Друг сделал заказ — вам +2% от суммы его покупки
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="mt-0.5 size-4 shrink-0 text-accent" />
                Для мастеров: повышенный бонус за оптовые заказы
              </li>
            </ul>
            <div className="mt-auto pt-7">
              <Button
                variant="outline"
                className="w-fit gap-2 border-primary-foreground/30 bg-transparent font-semibold text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                render={<Link href="/register" />}
              >
                Зарегистрироваться
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
