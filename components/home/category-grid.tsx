import Link from 'next/link'
import {
  Home,
  Building2,
  Layers,
  Paintbrush,
  ShieldCheck,
  FlaskConical,
  type LucideIcon,
} from 'lucide-react'
import { categories } from '@/lib/data'

const ICONS: Record<string, LucideIcon> = {
  Home,
  Building2,
  Layers,
  Paintbrush,
  ShieldCheck,
  FlaskConical,
}

export function CategoryGrid() {
  return (
    <section className="mx-auto max-w-[1280px] px-4 py-14 md:px-6">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-bold md:text-3xl">Категории</h2>
          <p className="mt-1 text-muted-foreground">Выберите тип покрытия для вашей задачи</p>
        </div>
        <Link href="/catalog" className="hidden text-sm font-medium text-primary hover:underline sm:block">
          Весь каталог
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {categories.map((c) => {
          const Icon = ICONS[c.icon] ?? Layers
          return (
            <Link
              key={c.slug}
              href={`/catalog?category=${c.slug}`}
              className="group flex flex-col items-center gap-3 rounded-lg border border-border bg-card p-5 text-center transition-colors hover:border-primary hover:bg-muted/40"
            >
              <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <Icon className="size-6" />
              </span>
              <span className="text-sm font-medium leading-tight">{c.name}</span>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
