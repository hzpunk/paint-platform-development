import Link from 'next/link'
import { ArrowRight, CreditCard, Palette, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PaintCan } from '@/components/product/paint-can'

const HIGHLIGHTS = [
  { icon: CreditCard, label: 'Оплата при получении' },
  { icon: Palette, label: 'Колеровка в любой цвет' },
  { icon: ShieldCheck, label: 'Сертифицированные ЛКМ' },
]

const STATS = [
  { value: '10 000+', label: 'оттенков колеровки' },
  { value: '6', label: 'проверенных брендов' },
  { value: '12 лет', label: 'на рынке ЛКМ' },
]

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-primary text-primary-foreground">
      {/* Декоративный фон */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(ellipse 80% 60% at 75% 20%, rgba(245, 166, 35, 0.12), transparent 60%), radial-gradient(ellipse 60% 50% at 10% 90%, rgba(255, 255, 255, 0.05), transparent 55%)',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)',
          backgroundSize: '56px 56px',
        }}
      />

      <div className="section-shell relative grid items-center gap-10 py-16 md:grid-cols-2 md:py-24">
        <div className="flex flex-col gap-6 animate-fade-up">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-accent">
            <span className="size-1.5 rounded-full bg-accent" aria-hidden="true" />
            Профессиональные краски и ЛКМ
          </span>
          <h1 className="text-balance font-heading text-4xl font-extrabold leading-[1.1] md:text-5xl lg:text-6xl">
            Краска, которая ложится идеально{' '}
            <span className="text-accent">с первого слоя</span>
          </h1>
          <p className="max-w-md text-pretty text-base leading-relaxed text-primary-foreground/75 md:text-lg">
            Интерьерные и фасадные краски, эмали, грунтовки и спецсоставы от
            проверенных брендов. Подберём и заколеруем в нужный оттенок,
            подготовим к самовывозу и примем оплату при получении.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              size="lg"
              className="gap-2 bg-accent font-semibold text-accent-foreground shadow-lg shadow-accent/25 transition-transform hover:bg-accent/90 hover:-translate-y-0.5"
              render={<Link href="/catalog" />}
            >
              Перейти в каталог
              <ArrowRight className="size-4" />
            </Button>
            <Button
              size="lg"
              variant="ghost"
              className="border border-primary-foreground/25 font-semibold text-primary-foreground transition-colors hover:border-primary-foreground/50 hover:bg-primary-foreground/10 hover:text-primary-foreground"
              render={<Link href="/colormixing" />}
            >
              Услуга колеровки
            </Button>
          </div>
          <ul className="flex flex-wrap gap-x-6 gap-y-2 pt-2">
            {HIGHLIGHTS.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="flex items-center gap-2 text-sm text-primary-foreground/90"
              >
                <Icon className="size-4 text-accent" />
                {label}
              </li>
            ))}
          </ul>

          <div className="mt-2 grid w-fit grid-cols-3 gap-6 border-t border-primary-foreground/15 pt-6 sm:gap-10">
            {STATS.map((s) => (
              <div key={s.label}>
                <p className="font-heading text-2xl font-extrabold text-accent md:text-3xl">
                  {s.value}
                </p>
                <p className="mt-1 text-xs leading-snug text-primary-foreground/60">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative hidden md:flex md:items-center md:justify-center">
          <div
            aria-hidden="true"
            className="absolute inset-8 rounded-full bg-accent/15 blur-3xl"
          />
          <div className="relative flex items-end justify-center gap-4 rounded-3xl border border-primary-foreground/10 bg-primary-foreground/5 p-10 backdrop-blur-sm">
            <PaintCan
              color="#F4F4F0"
              className="h-52 w-40 -rotate-6 drop-shadow-2xl transition-transform duration-500 hover:-translate-y-2"
            />
            <PaintCan
              color="#C05746"
              className="h-64 w-48 drop-shadow-2xl transition-transform duration-500 hover:-translate-y-2"
            />
            <PaintCan
              color="#7C8B4F"
              className="h-52 w-40 rotate-6 drop-shadow-2xl transition-transform duration-500 hover:-translate-y-2"
            />
            {/* Плавающие цветовые чипы */}
            <span className="absolute -top-3 left-8 rounded-full border border-primary-foreground/15 bg-primary px-3 py-1.5 text-xs font-semibold shadow-lg">
              RAL 3009 · Терракота
            </span>
            <span className="absolute -bottom-3 right-10 rounded-full border border-primary-foreground/15 bg-primary px-3 py-1.5 text-xs font-semibold shadow-lg">
              NCS S 4020-G50Y
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
