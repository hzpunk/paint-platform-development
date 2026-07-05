'use client'

import { useMemo, useState } from 'react'
import { ArrowUpRight, TrendingDown, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type ProductSummary = {
  id: string
  name: string
  price: number
  stock: number
  category?: { name?: string | null } | null
  brand?: { name?: string | null } | null
}

type DashboardOverviewProps = {
  orderCount: number
  customerCount: number
  revenue: number
  products: ProductSummary[]
}

export function DashboardOverview({ orderCount, customerCount, revenue, products }: DashboardOverviewProps) {
  const [filter, setFilter] = useState<'popular' | 'needsAttention'>('popular')

  const sortedProducts = useMemo(() => {
    const list = [...products]
    if (filter === 'popular') {
      return list.sort((a, b) => b.stock - a.stock || b.price - a.price)
    }
    return list.sort((a, b) => a.stock - b.stock || a.price - b.price)
  }, [filter, products])

  const metrics = [
    { label: 'Заказы', value: orderCount.toString(), hint: 'Новые обращения', icon: TrendingUp },
    { label: 'Финансы', value: `${revenue.toLocaleString('ru')} ₽`, hint: 'Выручка за период', icon: ArrowUpRight },
    { label: 'Маркетинг', value: '12 кампаний', hint: 'Активные активности', icon: TrendingUp },
    { label: 'Посещение', value: '24.8K', hint: 'Пользователи в сутки', icon: TrendingDown },
    { label: 'Клиенты', value: customerCount.toString(), hint: 'Профили в базе', icon: ArrowUpRight },
  ]

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 bg-gradient-to-br from-primary/10 via-background to-background">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-primary">Операционный центр</p>
              <CardTitle className="mt-1 text-2xl">Главный экран админки</CardTitle>
            </div>
            <div className="rounded-full border border-primary/20 bg-background/70 px-3 py-1 text-sm text-muted-foreground">
              Рабочий режим • онлайн
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
          <div className="space-y-3">
            <p className="max-w-2xl text-sm text-muted-foreground">
              Здесь собраны основные показатели: продажи, финансы, маркетинг, клиентская база и ключевые товары.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button size="sm">Сформировать отчёт</Button>
              <Button size="sm" variant="outline">Открыть маркетинг</Button>
            </div>
          </div>
          <div className="rounded-xl border border-border/70 bg-background/80 p-4">
            <p className="text-sm font-medium">Ключевые задачи</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>• Контролировать выручку и распределение прибыли</li>
              <li>• Следить за активностью маркетинговых кампаний</li>
              <li>• Поддерживать актуальный каталог и документы</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {metrics.map((metric) => {
          const Icon = metric.icon
          return (
            <Card key={metric.label}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{metric.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-2xl font-semibold">{metric.value}</p>
                  <div className="rounded-full bg-primary/10 p-2 text-primary">
                    <Icon className="size-4" />
                  </div>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{metric.hint}</p>
              </CardContent>
            </Card>
          )
        })}
      </section>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Топ товаров</CardTitle>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={filter === 'popular' ? 'default' : 'outline'}
              onClick={() => setFilter('popular')}
            >
              Популярные
            </Button>
            <Button
              size="sm"
              variant={filter === 'needsAttention' ? 'default' : 'outline'}
              onClick={() => setFilter('needsAttention')}
            >
              Нужны внимание
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sortedProducts.map((product, idx) => (
              <div key={product.id} className="flex items-center justify-between rounded-lg border border-border/70 px-3 py-3">
                <div>
                  <p className="font-medium">{idx + 1}. {product.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {product.category?.name || 'Без категории'} • {product.brand?.name || 'Без бренда'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{product.price.toLocaleString('ru')} ₽</p>
                  <p className="text-sm text-muted-foreground">Остаток: {product.stock}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
