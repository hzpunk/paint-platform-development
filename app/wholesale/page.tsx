'use client'

import { useState } from 'react'
import { Building2, FileText, Users, Percent, ArrowRight, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

const PERKS = [
  { icon: Percent, title: 'Скидки от объёма', desc: 'От 5% при заказе от 50 000 ₽, от 10% — от 200 000 ₽' },
  { icon: Users, title: 'Персональный менеджер', desc: 'Выделенный специалист для вашей компании' },
  { icon: FileText, title: 'Документы для бухгалтерии', desc: 'УПД, счёт-фактура, акт выполненных работ' },
  { icon: Building2, title: 'Отсрочка платежа', desc: 'Пост-оплата до 30 дней для надёжных партнёров' },
]

export default function WholesalePage() {
  const [inn, setInn] = useState('')
  const [company, setCompany] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [volume, setVolume] = useState('')
  const [comment, setComment] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!inn || !company || !phone) {
      toast.error('Заполните обязательные поля')
      return
    }
    // ponytail: заглушка — на проде POST /api/wholesale
    setSubmitted(true)
    toast.success('Заявка отправлена. Менеджер свяжется с вами в течение 1 рабочего дня.')
  }

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-12 md:px-6">
      {/* Hero */}
      <div className="mb-14">
        <span className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
          Для бизнеса
        </span>
        <h1 className="mt-3 font-heading text-4xl font-extrabold md:text-5xl">
          Оптовые поставки ЛКМ
        </h1>
        <p className="mt-4 max-w-xl text-lg text-muted-foreground leading-relaxed">
          Работаем со строительными компаниями, управляющими организациями, подрядчиками
          и розничными магазинами. Персональные условия для каждого партнёра.
        </p>
      </div>

      {/* Преимущества */}
      <section className="mb-14">
        <div className="grid gap-4 sm:grid-cols-2">
          {PERKS.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex gap-4 rounded-lg border border-border bg-card p-5">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Icon className="size-5" />
              </span>
              <div>
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Таблица скидок */}
      <section className="mb-14">
        <h2 className="font-heading text-xl font-bold mb-4">Оптовые скидки</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 pr-4 font-semibold">Объём заказа</th>
                <th className="text-left py-3 pr-4 font-semibold">Скидка</th>
                <th className="text-left py-3 font-semibold">Прочие условия</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['от 50 000 ₽', '5%', 'Базовая оптовая скидка'],
                ['от 100 000 ₽', '7%', 'Приоритетная обработка'],
                ['от 200 000 ₽', '10%', 'Персональный менеджер'],
                ['от 500 000 ₽', '12–15%', 'Индивидуальное согласование, отсрочка платежа'],
              ].map(([vol, disc, note]) => (
                <tr key={vol} className="border-b border-border">
                  <td className="py-3 pr-4 font-medium">{vol}</td>
                  <td className="py-3 pr-4 text-success font-bold">{disc}</td>
                  <td className="py-3 text-muted-foreground">{note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          * Скидки суммируются с бонусами программы лояльности. Уточняйте у менеджера.
        </p>
      </section>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* Форма */}
        <div>
          <h2 className="font-heading text-xl font-bold mb-6">Оставить заявку</h2>
          {submitted ? (
            <div className="flex flex-col items-center gap-4 rounded-lg border border-success/40 bg-success/5 p-10 text-center">
              <CheckCircle className="size-12 text-success" />
              <h3 className="font-heading font-bold text-xl">Заявка принята!</h3>
              <p className="text-muted-foreground">Менеджер свяжется с вами в течение 1 рабочего дня.</p>
            </div>
          ) : (
            <form onSubmit={submit} className="flex flex-col gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="winn">ИНН компании *</Label>
                  <Input id="winn" value={inn} onChange={(e) => setInn(e.target.value)} placeholder="7701234567" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="wcompany">Название компании *</Label>
                  <Input id="wcompany" value={company} onChange={(e) => setCompany(e.target.value)} placeholder='ООО "Стройпроект"' className="mt-1" />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="wname">Контактное лицо</Label>
                  <Input id="wname" value={name} onChange={(e) => setName(e.target.value)} placeholder="Иван Иванов" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="wphone">Телефон *</Label>
                  <Input id="wphone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+7 900 000-00-00" className="mt-1" />
                </div>
              </div>
              <div>
                <Label htmlFor="wvolume">Ожидаемый объём заказа</Label>
                <Input id="wvolume" value={volume} onChange={(e) => setVolume(e.target.value)} placeholder="например, 500 000 ₽ в месяц" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="wcomment">Комментарий</Label>
                <Textarea id="wcomment" rows={3} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Какие материалы нужны, регулярность поставок, пожелания..." className="mt-1" />
              </div>
              <p className="text-xs text-muted-foreground">
                Нажимая «Отправить», вы даёте согласие на{' '}
                <a href="/privacy" className="text-primary hover:underline">обработку персональных данных</a>.
              </p>
              <Button size="lg" type="submit" className="self-start gap-2">
                Отправить заявку
                <ArrowRight className="size-4" />
              </Button>
            </form>
          )}
        </div>

        {/* Прайс-лист */}
        <div>
          <h2 className="font-heading text-xl font-bold mb-4">Прайс-лист</h2>
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="flex items-center gap-4 mb-4">
              <span className="flex size-12 items-center justify-center rounded-md bg-muted font-bold text-muted-foreground">
                PDF
              </span>
              <div>
                <p className="font-semibold">Оптовый прайс-лист</p>
                <p className="text-sm text-muted-foreground">Актуален с 1 июня 2026 г.</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Полный прайс-лист с оптовыми ценами отправляется после заполнения заявки и
              верификации ИНН компании.
            </p>
            <Button variant="outline" className="w-full" disabled>
              Запросить прайс-лист
            </Button>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Доступно после отправки заявки
            </p>
          </div>

          <div className="mt-4 rounded-lg border border-border bg-card p-5 text-sm">
            <h3 className="font-semibold mb-3">Закрывающие документы</h3>
            <ul className="flex flex-col gap-2 text-muted-foreground">
              <li className="flex items-center gap-2">
                <CheckCircle className="size-4 text-success shrink-0" />
                Универсальный передаточный документ (УПД)
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="size-4 text-success shrink-0" />
                Счёт-фактура (при работе с НДС)
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="size-4 text-success shrink-0" />
                Товарная накладная (ТОРГ-12)
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
