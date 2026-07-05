'use client'

import { useState, useEffect } from 'react'
import { AdminMarketingTable } from '@/components/admin/marketing-table'
import { MarketingMetric } from '@prisma/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function AdminMarketingPage() {
  const [metrics, setMetrics] = useState<MarketingMetric[]>([])

  useEffect(() => {
    const fetchMetrics = async () => {
      const res = await fetch('/api/admin/marketing')
      const data = await res.json()
      setMetrics(data)
    }
    fetchMetrics()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Маркетинг</h2>
        <p className="text-muted-foreground">Контент-план, социальные платформы, метрики и рекламные кампании.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Контент-план</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• Короткие ролики</p>
            <p>• Длинный контент</p>
            <p>• Текстовый контент</p>
            <p>• Фото контент</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Площадки</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• TikTok, Instagram Reels</p>
            <p>• VK Video, YouTube Shorts</p>
            <p>• Telegram, Threads, Zen</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Действия</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button size="sm">Сформировать отчёт</Button>
            <Button size="sm" variant="outline">Создать кампанию</Button>
          </CardContent>
        </Card>
      </div>

      <AdminMarketingTable initialMetrics={metrics} />
    </div>
  )
}
