import Link from 'next/link'
import { ProductCard } from '@/components/product/product-card'
import type { Product } from '@/lib/types'

interface ProductRowProps {
  title: string
  subtitle?: string
  products: Product[]
  moreHref?: string
}

export function ProductRow({ title, subtitle, products, moreHref }: ProductRowProps) {
  if (products.length === 0) return null
  return (
    <section className="mx-auto max-w-[1280px] px-4 py-14 md:px-6">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-bold md:text-3xl">{title}</h2>
          {subtitle && <p className="mt-1 text-muted-foreground">{subtitle}</p>}
        </div>
        {moreHref && (
          <Link href={moreHref} className="hidden text-sm font-medium text-primary hover:underline sm:block">
            Смотреть все
          </Link>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  )
}
