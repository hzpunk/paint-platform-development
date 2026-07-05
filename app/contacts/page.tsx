import { Phone, Mail, MapPin, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Контакты',
  description: 'Контакты КраскаПроф: телефон, email, адрес. Реквизиты юридического лица.',
}

export default function ContactsPage() {
  return (
    <div className="mx-auto max-w-[1280px] px-4 py-12 md:px-6">
      <h1 className="font-heading text-3xl font-bold mb-2">Контакты</h1>
      <p className="text-muted-foreground mb-10">Мы всегда рады помочь с выбором.</p>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* Контакты */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            {[
              {
                icon: Phone,
                title: 'Телефон',
                content: <a href="tel:88001234567" className="text-lg font-semibold text-primary hover:underline">8 800 123-45-67</a>,
                note: 'Бесплатно по России',
              },
              {
                icon: Mail,
                title: 'Email',
                content: <a href="mailto:info@kraskaprof.ru" className="text-primary hover:underline">info@kraskaprof.ru</a>,
                note: 'Ответим в течение 1 рабочего дня',
              },
              {
                icon: MapPin,
                title: 'Адрес офиса/склада',
                content: <p>123056, г. Москва, ул. Красочная, д. 15, стр. 2</p>,
                note: null,
              },
              {
                icon: Clock,
                title: 'Режим работы',
                content: (
                  <div className="text-sm">
                    <p>Пн–Пт: 9:00–21:00</p>
                    <p>Сб: 10:00–18:00</p>
                    <p>Вс: выходной</p>
                  </div>
                ),
                note: null,
              },
            ].map(({ icon: Icon, title, content, note }) => (
              <div key={title} className="flex gap-4 rounded-lg border border-border bg-card p-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </span>
                <div>
                  <p className="text-sm text-muted-foreground">{title}</p>
                  <div className="mt-0.5">{content}</div>
                  {note && <p className="text-xs text-muted-foreground mt-0.5">{note}</p>}
                </div>
              </div>
            ))}
          </div>

          {/* Реквизиты */}
          <div className="rounded-lg border border-border bg-card p-5 text-sm">
            <h2 className="font-heading font-bold mb-3">Реквизиты юридического лица</h2>
            <div className="grid gap-1.5 text-muted-foreground">
              <p><span className="font-medium text-foreground">Полное наименование:</span> ООО «КраскаПроф»</p>
              <p><span className="font-medium text-foreground">ОГРН:</span> 1157746000000</p>
              <p><span className="font-medium text-foreground">ИНН:</span> 7701234567</p>
              <p><span className="font-medium text-foreground">КПП:</span> 770101001</p>
              <p><span className="font-medium text-foreground">Юридический адрес:</span> 123056, г. Москва, ул. Красочная, д. 15, стр. 2</p>
              <p><span className="font-medium text-foreground">Расчётный счёт:</span> 40702810000000000000</p>
              <p><span className="font-medium text-foreground">Банк:</span> ПАО Сбербанк</p>
              <p><span className="font-medium text-foreground">БИК:</span> 044525225</p>
              <p><span className="font-medium text-foreground">Кор. счёт:</span> 30101810400000000225</p>
            </div>
          </div>
        </div>

        {/* Форма обратной связи */}
        <div>
          <h2 className="font-heading text-xl font-bold mb-4">Напишите нам</h2>
          <form className="flex flex-col gap-4 rounded-lg border border-border bg-card p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="cname">Ваше имя</Label>
                <Input id="cname" placeholder="Иван Иванов" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="cphone">Телефон</Label>
                <Input id="cphone" type="tel" placeholder="+7 900 000-00-00" className="mt-1" />
              </div>
            </div>
            <div>
              <Label htmlFor="cemail">Email</Label>
              <Input id="cemail" type="email" placeholder="mail@example.com" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="ctheme">Тема</Label>
              <Input id="ctheme" placeholder="Вопрос по товару / заказу" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="cmsg">Сообщение</Label>
              <Textarea id="cmsg" rows={5} placeholder="Опишите ваш вопрос..." className="mt-1" />
            </div>
            <p className="text-xs text-muted-foreground">
              Нажимая «Отправить», вы соглашаетесь на обработку персональных данных в соответствии с{' '}
              <a href="/privacy" className="text-primary hover:underline">Политикой конфиденциальности</a>.
            </p>
            <Button size="lg" type="submit" className="self-start">
              Отправить сообщение
            </Button>
          </form>

          {/* Карта-заглушка */}
          <div className="mt-6 rounded-lg border border-border overflow-hidden bg-muted/30 flex items-center justify-center h-48 text-sm text-muted-foreground">
            <div className="text-center">
              <MapPin className="mx-auto mb-2 size-8" />
              <p>Яндекс Карта — доступна после интеграции API</p>
              <p className="text-xs mt-1">г. Москва, ул. Красочная, 15с2</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
