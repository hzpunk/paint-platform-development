'use client'

import { useState, useEffect } from 'react'
import { AdminFinanceTable } from '@/components/admin/finance-table'
import { FundAllocation } from '@prisma/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function AdminFinancePage() {
  const [allocations, setAllocations] = useState<FundAllocation[]>([])

  useEffect(() => {
    const fetchAllocations = async () => {
      const res = await fetch('/api/admin/finance')
      const data = await res.json()
      setAllocations(data)
    }
    fetchAllocations()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Финансы</h2>
        <p className="text-muted-foreground">Показатели выручки, распределение прибыли и финансовые отчёты.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Заработок платформы</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">12.4M ₽</p>
            <p className="text-sm text-muted-foreground">за последний квартал</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Заработок HzCompany</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">3.8M ₽</p>
            <p className="text-sm text-muted-foreground">по текущему сотрудничеству</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Действия</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button size="sm">Скачать отчёт</Button>
            <Button size="sm" variant="outline">Показать графики</Button>
          </CardContent>
        </Card>
      </div>

      <AdminFinanceTable initialAllocations={allocations} />
    </div>
  )
}
