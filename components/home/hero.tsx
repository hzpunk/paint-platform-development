import Link from 'next/link'
import { ArrowRight, CreditCard, Palette, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PaintCan } from '@/components/product/paint-can'

const HIGHLIGHTS = [
  { icon: CreditCard, label: 'Оплата при получении' },
  { icon: Palette, label: 'Колеровка в любой цвет' },
  { icon: ShieldCheck, label: 'Сертифицированные ЛКМ' },
]

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-[1280px] items-center gap-8 px-4 py-14 md:grid-cols-2 md:px-6 md:py-20">
        <div className="flex flex-col gap-6">
          <span className="w-fit rounded-full bg-primary-foreground/10 px-3 py-1 text-xs font-medium uppercase tracking-wide">
            Профессиональные краски и ЛКМ
          </span>
          <h1 className="text-balance font-heading text-4xl font-extrabold leading-tight md:text-5xl">
            Краска, которая ложится идеально с первого слоя
          </h1>
          <p className="max-w-md text-pretty text-base leading-relaxed text-primary-foreground/80">
            Интерьерные и фасадные краски, эмали, грунтовки и спецсоставы от
            проверенных брендов. Подберём и заколеруем в нужный оттенок,
            подготовим к самовывозу и примем оплату при получении.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              size="lg"
              variant="secondary"
              className="gap-2"
              render={<Link href="/catalog" />}
            >
              Перейти в каталог
              <ArrowRight className="size-4" />
            </Button>
            <Button
              size="lg"
              variant="ghost"
              className="border border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
              render={<Link href="/colormixing" />}
            >
              Услуга колеровки
            </Button>
          </div>
          <ul className="flex flex-wrap gap-x-6 gap-y-2 pt-2">
            {HIGHLIGHTS.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2 text-sm text-primary-foreground/90">
                <Icon className="size-4 text-accent" />
                {label}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative hidden md:flex md:items-center md:justify-center">
          <div className="flex items-end justify-center gap-4 rounded-2xl bg-primary-foreground/5 p-10 ring-1 ring-primary-foreground/10">
            <PaintCan color="#F4F4F0" className="h-52 w-40 drop-shadow-2xl" />
            <PaintCan color="#C05746" className="h-64 w-48 drop-shadow-2xl" />
            <PaintCan color="#7C8B4F" className="h-52 w-40 drop-shadow-2xl" />
          </div>
        </div>
      </div>
    </section>
  )
}
