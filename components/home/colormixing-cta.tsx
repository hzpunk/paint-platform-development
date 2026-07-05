import Link from 'next/link'
import { ArrowRight, Palette } from 'lucide-react'
import { Button } from '@/components/ui/button'

const SWATCHES = [
  { hex: '#F4F4F0', name: 'Белый' },
  { hex: '#D9C7A3', name: 'Бежевый' },
  { hex: '#9DB4C0', name: 'Серо-голубой' },
  { hex: '#7C8B4F', name: 'Оливковый' },
  { hex: '#C05746', name: 'Терракота' },
  { hex: '#3A4A6B', name: 'Индиго' },
  { hex: '#6B7280', name: 'Графит' },
  { hex: '#E7B7A0', name: 'Пудровый' },
]

export function ColorMixingCta() {
  return (
    <section className="section-shell py-14 md:py-20">
      <div className="grid items-center gap-10 overflow-hidden rounded-3xl border border-border bg-card p-8 shadow-[var(--shadow-card)] md:grid-cols-2 md:p-12">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            <Palette className="size-3.5" />
            Услуга
          </span>
          <h2 className="mt-4 font-heading text-2xl font-bold text-balance md:text-3xl">
            Колеровка в любой из <span className="text-accent-foreground">10 000+</span>{' '}
            оттенков
          </h2>
          <p className="mt-3 max-w-md text-pretty leading-relaxed text-muted-foreground">
            Подбираем цвет по каталогам RAL, NCS, Tikkurila или вашему образцу.
            Компьютерная колеровка гарантирует точное попадание и повторяемость
            оттенка при повторном заказе.
          </p>
          <Button
            size="lg"
            className="mt-6 gap-2 font-semibold"
            render={<Link href="/colormixing" />}
          >
            Заказать колеровку
            <ArrowRight className="size-4" />
          </Button>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {SWATCHES.map((s) => (
            <div key={s.hex} className="group relative">
              <div
                className="aspect-square rounded-xl border border-border shadow-sm transition-transform duration-200 group-hover:-translate-y-1 group-hover:shadow-md"
                style={{ backgroundColor: s.hex }}
                role="img"
                aria-label={`Оттенок ${s.name}`}
              />
              <span className="pointer-events-none absolute inset-x-0 -bottom-1 translate-y-full text-center text-[11px] font-medium text-muted-foreground opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                {s.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
