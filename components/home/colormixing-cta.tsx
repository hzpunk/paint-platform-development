import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

const SWATCHES = [
  '#F4F4F0',
  '#D9C7A3',
  '#9DB4C0',
  '#7C8B4F',
  '#C05746',
  '#3A4A6B',
  '#6B7280',
  '#E7B7A0',
]

export function ColorMixingCta() {
  return (
    <section className="mx-auto max-w-[1280px] px-4 py-14 md:px-6">
      <div className="grid items-center gap-8 rounded-2xl border border-border bg-card p-8 md:grid-cols-2 md:p-12">
        <div>
          <span className="text-sm font-medium uppercase tracking-wide text-accent-foreground">
            Услуга
          </span>
          <h2 className="mt-2 font-heading text-2xl font-bold md:text-3xl">
            Колеровка в любой из 10 000+ оттенков
          </h2>
          <p className="mt-3 max-w-md text-pretty leading-relaxed text-muted-foreground">
            Подбираем цвет по каталогам RAL, NCS, Tikkurila или вашему образцу.
            Компьютерная колеровка гарантирует точное попадание и повторяемость
            оттенка при повторном заказе.
          </p>
          <Button className="mt-6 gap-2" render={<Link href="/colormixing" />}>
            Заказать колеровку
            <ArrowRight className="size-4" />
          </Button>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {SWATCHES.map((hex) => (
            <div
              key={hex}
              className="aspect-square rounded-lg border border-border shadow-sm"
              style={{ backgroundColor: hex }}
              aria-hidden
            />
          ))}
        </div>
      </div>
    </section>
  )
}
