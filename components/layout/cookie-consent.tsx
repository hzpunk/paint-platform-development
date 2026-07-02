'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

// Согласие на использование cookie — требование 152-ФЗ при первом посещении.
const STORAGE_KEY = 'kraskaprof.cookie-consent'

export function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true)
    } catch {
      // localStorage недоступен — баннер не показываем.
    }
  }, [])

  function accept() {
    try {
      localStorage.setItem(STORAGE_KEY, new Date().toISOString())
    } catch {
      // игнорируем — согласие не критично для работы
    }
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-label="Согласие на использование cookie"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card p-4 shadow-lg"
    >
      <div className="mx-auto flex max-w-[1280px] flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Мы используем файлы cookie для работы сайта и аналитики. Продолжая
          пользоваться сайтом, вы соглашаетесь с{' '}
          <Link href="/privacy" className="text-primary underline underline-offset-2">
            политикой конфиденциальности
          </Link>
          .
        </p>
        <Button size="lg" onClick={accept} className="shrink-0">
          Принять
        </Button>
      </div>
    </div>
  )
}
