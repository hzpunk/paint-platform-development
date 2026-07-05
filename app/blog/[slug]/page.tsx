import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Calendar, Clock, ChevronRight } from 'lucide-react'
import { blogPosts, getProductBySlug } from '@/lib/data'
import { formatDate } from '@/lib/format'
import { ProductCard } from '@/components/product/product-card'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = blogPosts.find((p) => p.slug === slug)
  if (!post) return {}
  return {
    title: post.title,
    description: post.excerpt,
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = blogPosts.find((p) => p.slug === slug)
  if (!post) notFound()

  // Получаем связанные товары
  const relatedProducts = post.relatedProductSlugs
    .map((slug) => getProductBySlug(slug))
    .filter((p): p is NonNullable<typeof p> => !!p)

  return (
    <article className="mx-auto max-w-[960px] px-4 py-8 md:px-6">
      {/* Хлебные крошки */}
      <nav aria-label="Хлебные крошки" className="mb-6 flex items-center gap-1 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Главная</Link>
        <ChevronRight className="size-3.5" />
        <Link href="/blog" className="hover:text-foreground">Блог</Link>
        <ChevronRight className="size-3.5" />
        <span className="truncate text-foreground">{post.title}</span>
      </nav>

      {/* Шапка статьи */}
      <header className="mb-8">
        <span className="inline-block rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent-foreground">
          {post.category}
        </span>
        <h1 className="mt-4 font-heading text-3xl font-extrabold leading-tight md:text-4xl text-primary">
          {post.title}
        </h1>
        <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="size-3.5" />
            {formatDate(post.date)}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="size-3.5" />
            {post.readingTime} мин. на чтение
          </span>
        </div>
      </header>

      {/* Обложка */}
      <div
        className="mb-8 aspect-video w-full rounded-xl"
        style={{ backgroundColor: post.cover }}
      />

      {/* Текст статьи */}
      <div className="prose prose-primary max-w-none leading-relaxed text-foreground">
        {post.content.split('\n\n').map((paragraph, index) => (
          <p key={index} className="mb-4 text-base md:text-lg">
            {paragraph}
          </p>
        ))}
      </div>

      {/* Встроенные товары из материала */}
      {relatedProducts.length > 0 && (
        <section className="mt-12 border-t border-border pt-8">
          <h2 className="font-heading text-2xl font-bold mb-6 text-primary">
            Товары из материала
          </h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {relatedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}
    </article>
  )
}
