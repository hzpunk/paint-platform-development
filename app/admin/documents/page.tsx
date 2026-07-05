'use client'

import { useState, useEffect } from 'react'
import { AdminDocumentsTable } from '@/components/admin/documents-table'
import { Document } from '@prisma/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function AdminDocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])

  useEffect(() => {
    const fetchDocuments = async () => {
      const res = await fetch('/api/admin/documents')
      const data = await res.json()
      setDocuments(Array.isArray(data) ? data : [])
    }
    fetchDocuments()
  }, [])

  const legalCount = documents.filter((item) => item.type?.toLowerCase().includes('юрд') || item.type?.toLowerCase().includes('legal')).length
  const reportCount = documents.filter((item) => item.type?.toLowerCase().includes('отч') || item.type?.toLowerCase().includes('report')).length

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Документы</h2>
        <p className="text-muted-foreground">Юрдокументы, отчёты, акты и быстрый доступ к загрузке.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Юрдокументы</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{legalCount}</p>
            <p className="text-sm text-muted-foreground">актуальных файла</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Отчёты</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{reportCount}</p>
            <p className="text-sm text-muted-foreground">готовых к скачиванию</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Действия</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button size="sm">Добавить документ</Button>
            <Button size="sm" variant="outline">Скачать пакет</Button>
          </CardContent>
        </Card>
      </div>

      <AdminDocumentsTable initialDocuments={documents} />
    </div>
  )
}
