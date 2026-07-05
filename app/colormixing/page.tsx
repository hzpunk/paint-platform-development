'use client'

import { useState } from 'react'
import { CheckCircle, Palette, Pipette, Upload, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import type { Metadata } from 'next'

const RAL_COLORS = [
  { code: 'RAL 1013', name: 'Жемчужно-белый', hex: '#F0ECD7' },
  { code: 'RAL 1015', name: 'Слоновая кость', hex: '#FAEDCA' },
  { code: 'RAL 3009', name: 'Оксидно-красный', hex: '#8D3D2B' },
  { code: 'RAL 5005', name: 'Сигнальный синий', hex: '#1B4381' },
  { code: 'RAL 6005', name: 'Мшисто-зелёный', hex: '#2E4A23' },
  { code: 'RAL 7035', name: 'Светло-серый', hex: '#C4C9C9' },
  { code: 'RAL 7016', name: 'Антрацитовый', hex: '#3D4349' },
  { code: 'RAL 9003', name: 'Сигнальный белый', hex: '#F3F3F0' },
  { code: 'RAL 9005', name: 'Чёрный', hex: '#14161A' },
  { code: 'RAL 1016', name: 'Серно-жёлтый', hex: '#EFDD2B' },
  { code: 'RAL 2009', name: 'Транспортный оранжевый', hex: '#DB5E15' },
  { code: 'RAL 4010', name: 'Телемагента', hex: '#B84E8F' },
]

const STEPS = [
  {
    n: 1,
    icon: Palette,
    title: 'Выберите базу',
    desc: 'Укажите бренд и базовую краску из каталога. Колеровка доступна для товаров с пометкой «Колеровка».',
  },
  {
    n: 2,
    icon: Pipette,
    title: 'Укажите цвет',
    desc: 'Выберите оттенок из каталогов RAL, NCS, Pantone или загрузите фото нужного цвета.',
  },
  {
    n: 3,
    icon: CheckCircle,
    title: 'Получите готовую краску',
    desc: 'Компьютерная колеровка гарантирует точное попадание. Доставим в стандартные сроки.',
  },
]

const FAQ = [
  {
    q: 'Насколько точно передаётся цвет?',
    a: 'Компьютерная колеровка обеспечивает точность ΔE < 1 — это уровень, при котором отличие цветов невозможно увидеть невооружённым глазом.',
  },
  {
    q: 'Могу ли я повторить заказ с тем же оттенком?',
    a: 'Да. Мы сохраняем формулу каждого заказа в вашем аккаунте. Просто повторите заказ из истории.',
  },
  {
    q: 'Сколько стоит колеровка?',
    a: 'Базовая колеровка — от 150 ₽ за ведро. Для уровня Серебро и выше — скидка 5–100%. Стоимость рассчитывается в форме заказа.',
  },
  {
    q: 'Принимают ли заколерованные краски к возврату?',
    a: 'Нет. Краска, смешанная по индивидуальному заказу, возврату не подлежит (ст. 25 ЗоЗПП, Перечень непродовольственных товаров).',
  },
  {
    q: 'С какими базами работает колеровка?',
    a: 'Tikkurila, Dulux, Caparol и ТЕКС в нашем ассортименте. Для большинства позиций доступна интерьерная и фасадная база.',
  },
]

export default function ColorMixingPage() {
  const [palette, setPalette] = useState<'RAL' | 'NCS' | 'Pantone' | 'photo'>('RAL')
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [colorCode, setColorCode] = useState('')
  const [volume, setVolume] = useState(5)
  const [base, setBase] = useState('Tikkurila')
  const [faqOpen, setFaqOpen] = useState<number | null>(null)

  const coloringCost = Math.max(150, volume * 30)

  function submitOrder() {
    if (!selectedColor && !colorCode) {
      toast.error('Выберите цвет или укажите код')
      return
    }
    toast.success('Заявка на колеровку отправлена! Менеджер свяжется с вами.')
  }

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-12 md:px-6">
      {/* Hero */}
      <div className="rounded-2xl bg-primary text-primary-foreground p-8 md:p-12 mb-12">
        <span className="text-xs font-medium uppercase tracking-widest text-primary-foreground/60">
          Услуга
        </span>
        <h1 className="mt-3 font-heading text-3xl font-extrabold md:text-4xl">
          Колеровка в любой из 10 000+ оттенков
        </h1>
        <p className="mt-4 max-w-xl text-pretty leading-relaxed text-primary-foreground/80">
          Компьютерная колеровка по каталогам RAL, NCS и Pantone. Точное воспроизведение цвета,
          повторяемость при повторном заказе, скидки на колеровку для участников программы лояльности.
        </p>
      </div>

      {/* Как это работает */}
      <section className="mb-14">
        <h2 className="font-heading text-2xl font-bold mb-8 text-center">Как это работает</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {STEPS.map(({ n, icon: Icon, title, desc }) => (
            <div key={n} className="relative flex flex-col items-center text-center p-6 rounded-lg border border-border bg-card">
              <span className="absolute -top-4 flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                {n}
              </span>
              <div className="mt-2 flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
                <Icon className="size-7" />
              </div>
              <h3 className="font-heading font-bold mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Форма заказа */}
      <section className="mb-14">
        <h2 className="font-heading text-2xl font-bold mb-6">Заказать колеровку</h2>
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="flex flex-col gap-5">
            {/* База */}
            <div>
              <Label className="text-sm font-semibold mb-2 block">Бренд базы</Label>
              <div className="flex flex-wrap gap-2">
                {['Tikkurila', 'Dulux', 'Caparol', 'ТЕКС'].map((b) => (
                  <button
                    key={b}
                    onClick={() => setBase(b)}
                    className={`rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
                      base === b ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:border-primary'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            {/* Палитра */}
            <div>
              <Label className="text-sm font-semibold mb-2 block">Каталог цветов</Label>
              <div className="flex flex-wrap gap-2">
                {(['RAL', 'NCS', 'Pantone', 'photo'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPalette(p)}
                    className={`rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
                      palette === p ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:border-primary'
                    }`}
                  >
                    {p === 'photo' ? '📷 По фото' : p}
                  </button>
                ))}
              </div>
            </div>

            {/* Ввод кода */}
            {palette !== 'photo' && (
              <div>
                <Label htmlFor="colorCode" className="text-sm font-semibold mb-2 block">
                  Код цвета ({palette})
                </Label>
                <Input
                  id="colorCode"
                  value={colorCode}
                  onChange={(e) => setColorCode(e.target.value)}
                  placeholder={palette === 'RAL' ? 'RAL 7016' : palette === 'NCS' ? 'S 3005-R80B' : '485 C'}
                />
              </div>
            )}

            {palette === 'photo' && (
              <div className="rounded-lg border-2 border-dashed border-border p-8 text-center">
                <Upload className="mx-auto mb-2 size-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Загрузите фото нужного цвета</p>
                <p className="text-xs text-muted-foreground mt-1">JPG, PNG до 10 МБ</p>
                <Button variant="outline" size="sm" className="mt-3">Выбрать файл</Button>
              </div>
            )}

            {/* Объём */}
            <div>
              <Label className="text-sm font-semibold mb-2 block">
                Объём: <strong>{volume} л</strong>
              </Label>
              <div className="flex flex-wrap gap-2">
                {[1, 2.5, 5, 10, 20].map((v) => (
                  <button
                    key={v}
                    onClick={() => setVolume(v)}
                    className={`rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${
                      volume === v ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:border-primary'
                    }`}
                  >
                    {v} л
                  </button>
                ))}
              </div>
            </div>

            {/* Стоимость */}
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground">Стоимость колеровки (ориентировочно)</p>
              <p className="text-2xl font-bold">от {coloringCost} ₽</p>
              <p className="text-xs text-muted-foreground">Точная стоимость — при подтверждении заказа</p>
            </div>

            <Button size="lg" className="gap-2" onClick={submitOrder}>
              Отправить заявку
              <ArrowRight className="size-4" />
            </Button>
          </div>

          {/* RAL палитра */}
          {palette === 'RAL' && (
            <div>
              <p className="text-sm font-semibold mb-3">Популярные оттенки RAL</p>
              <div className="grid grid-cols-4 gap-2">
                {RAL_COLORS.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => { setSelectedColor(c.code); setColorCode(c.code) }}
                    title={`${c.code} ${c.name}`}
                    className={`flex flex-col items-center gap-1 rounded-lg p-2 border transition-all ${
                      selectedColor === c.code ? 'border-primary ring-2 ring-primary/30' : 'border-border hover:border-primary'
                    }`}
                  >
                    <div
                      className="size-10 rounded-md border border-border"
                      style={{ backgroundColor: c.hex }}
                    />
                    <span className="text-[10px] text-muted-foreground leading-tight">{c.code}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section>
        <h2 className="font-heading text-2xl font-bold mb-6">Частые вопросы</h2>
        <div className="flex flex-col gap-2">
          {FAQ.map((item, i) => (
            <div key={i} className="rounded-lg border border-border overflow-hidden">
              <button
                onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                className="flex w-full items-center justify-between gap-4 p-4 text-left font-medium hover:bg-muted/40"
              >
                {item.q}
                <span className="text-muted-foreground shrink-0">{faqOpen === i ? '−' : '+'}</span>
              </button>
              {faqOpen === i && (
                <div className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
