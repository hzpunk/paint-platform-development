import type { Metadata } from 'next'
import { loyaltyTiers } from '@/lib/data'

export const metadata: Metadata = {
  title: 'Условия программы лояльности',
  description: 'Правила начисления и списания бонусных баллов, уровни программы, реферальная программа КраскиУНАС.',
}

export default function LoyaltyTermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:px-6">
      <h1 className="font-heading text-3xl font-bold mb-2">Условия программы лояльности</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Редакция от 1 июня 2026 г.
      </p>

      <div className="flex flex-col gap-6 text-foreground leading-relaxed text-sm">
        <section>
          <h2 className="font-heading text-xl font-bold mb-3">1. Общие положения</h2>
          <p>
            Программа лояльности КраскиУНАС — система накопительных бонусных баллов для
            зарегистрированных пользователей сайта. Участие в программе добровольное и бесплатное.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl font-bold mb-3">2. Начисление баллов</h2>
          <ul className="list-disc pl-5 flex flex-col gap-1.5">
            <li>Баллы начисляются за каждую оплаченную покупку</li>
            <li>Базовая ставка: 3% от суммы заказа (1 балл = 1 ₽)</li>
            <li>Ставка зависит от уровня программы (см. таблицу ниже)</li>
            <li>Баллы начисляются после подтверждения получения заказа</li>
            <li>Баллы за отменённые или возвращённые заказы аннулируются</li>
          </ul>
        </section>

        <section>
          <h2 className="font-heading text-xl font-bold mb-3">3. Уровни программы</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 pr-4 font-semibold">Уровень</th>
                  <th className="text-left py-3 pr-4 font-semibold">Порог (за 12 мес.)</th>
                  <th className="text-left py-3 pr-4 font-semibold">Начисление</th>
                  <th className="text-left py-3 font-semibold">Привилегии</th>
                </tr>
              </thead>
              <tbody>
                {loyaltyTiers.map((tier) => (
                  <tr key={tier.name} className="border-b border-border">
                    <td className="py-3 pr-4 font-medium" style={{ color: tier.color }}>{tier.name}</td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {tier.threshold === 0 ? 'Без порога' : `от ${tier.threshold.toLocaleString('ru')} ₽`}
                    </td>
                    <td className="py-3 pr-4">{tier.rate}%</td>
                    <td className="py-3 text-muted-foreground">{tier.perks.join(' · ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="font-heading text-xl font-bold mb-3">4. Списание баллов</h2>
          <ul className="list-disc pl-5 flex flex-col gap-1.5">
            <li>Баллы можно тратить при оформлении заказа частично или полностью</li>
            <li>Максимальное покрытие заказа баллами — 100% (за исключением доставки)</li>
            <li>1 балл = 1 рубль скидки</li>
            <li>При использовании баллов новые баллы начисляются только с оплаченной денежными средствами суммы</li>
          </ul>
        </section>

        <section>
          <h2 className="font-heading text-xl font-bold mb-3">5. Срок действия баллов</h2>
          <p>
            Баллы сгорают через 12 месяцев без совершения покупки. При любой покупке
            срок действия всех баллов обновляется автоматически.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl font-bold mb-3">6. Реферальная программа</h2>
          <ul className="list-disc pl-5 flex flex-col gap-1.5">
            <li>После регистрации каждый пользователь получает персональный реферальный код</li>
            <li>Пригласили друга → он зарегистрировался → вам +500 баллов</li>
            <li>Пригласили друга → он сделал первый заказ → вам +2% от суммы его заказа</li>
            <li>Друг-реферал также получает приветственные баллы при первом заказе</li>
            <li>Повышенные условия для профессиональных мастеров (обсуждается с менеджером)</li>
            <li>Реферальные баллы подчиняются тем же правилам начисления и сгорания</li>
          </ul>
        </section>

        <section>
          <h2 className="font-heading text-xl font-bold mb-3">7. Изменение условий</h2>
          <p>
            Оператор оставляет за собой право изменять условия программы. Уведомление
            об изменениях публикуется на сайте не менее чем за 14 дней до вступления в силу.
          </p>
        </section>
      </div>
    </div>
  )
}
