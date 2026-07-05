import Link from 'next/link'
import { Paintbrush, Send, Phone, Mail } from 'lucide-react'
import { categories } from '@/lib/data'

const infoLinks = [
  { href: '/colormixing', label: 'Колеровка' },
  { href: '/wholesale', label: 'Оптовикам' },
  { href: '/loyalty', label: 'Программа лояльности' },
  { href: '/blog', label: 'Блог' },
  { href: '/contacts', label: 'Контакты' },
]

const legalLinks = [
  { href: '/privacy', label: 'Политика конфиденциальности' },
  { href: '/terms', label: 'Пользовательское соглашение' },
  { href: '/loyalty-terms', label: 'Условия программы лояльности' },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-primary text-primary-foreground">
      <div className="mx-auto max-w-[1280px] px-4 py-12 md:px-6">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex size-9 items-center justify-center rounded-md bg-primary-foreground text-primary">
                <Paintbrush className="size-5" />
              </span>
              <span className="font-heading text-lg font-extrabold">
                Краска<span className="text-accent">Проф</span>
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm text-primary-foreground/70">
              Лакокрасочные материалы для профессионалов и частных мастеров.
              Сертифицированная продукция, колеровка в любой цвет, самовывоз в Москве.
            </p>
            <div className="mt-4 flex items-center gap-3">
              <a
                href="https://vk.com"
                className="flex size-9 items-center justify-center rounded-md bg-primary-foreground/10 transition-colors hover:bg-primary-foreground/20"
                aria-label="ВКонтакте"
              >
                <span className="text-sm font-bold">VK</span>
              </a>
              <a
                href="https://t.me"
                className="flex size-9 items-center justify-center rounded-md bg-primary-foreground/10 transition-colors hover:bg-primary-foreground/20"
                aria-label="Telegram"
              >
                <Send className="size-4" />
              </a>
            </div>
          </div>

          <nav aria-label="Категории">
            <h3 className="font-heading text-sm font-bold">Каталог</h3>
            <ul className="mt-4 space-y-2 text-sm">
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/catalog?category=${c.slug}`}
                    className="text-primary-foreground/70 transition-colors hover:text-primary-foreground"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Информация">
            <h3 className="font-heading text-sm font-bold">Покупателям</h3>
            <ul className="mt-4 space-y-2 text-sm">
              {infoLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-primary-foreground/70 transition-colors hover:text-primary-foreground"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h3 className="font-heading text-sm font-bold">Контакты</h3>
            <ul className="mt-4 space-y-3 text-sm text-primary-foreground/70">
              <li>
                <a href="tel:88001234567" className="flex items-center gap-2 hover:text-primary-foreground">
                  <Phone className="size-4" />8 800 123-45-67
                </a>
              </li>
              <li>
                <a href="mailto:info@kraskaprof.ru" className="flex items-center gap-2 hover:text-primary-foreground">
                  <Mail className="size-4" />info@kraskaprof.ru
                </a>
              </li>
              <li>ежедневно 9:00–21:00</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-primary-foreground/15 pt-6 text-xs text-primary-foreground/60">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <p>ООО «КраскаПроф» · ИНН 7701234567 · ОГРН 1157746000000</p>
              <p>123056, г. Москва, ул. Красочная, д. 15, стр. 2</p>
            </div>
            <ul className="flex flex-wrap gap-x-4 gap-y-1">
              {legalLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-primary-foreground">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <p className="mt-4">
            © {new Date().getFullYear()} КраскаПроф. Все права защищены. Цены на сайте
            не являются публичной офертой.
          </p>
        </div>
      </div>
    </footer>
  )
}
