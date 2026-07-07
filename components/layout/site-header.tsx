"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  Phone,
  Paintbrush,
  Heart,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useCart } from "@/components/cart/cart-provider";
import { useFavorites } from "@/components/favorites/favorites-provider";
import { useAuth } from "@/components/auth/auth-provider";
import { categories } from "@/lib/data";

const NAV = [
  { href: "/catalog", label: "Каталог" },
  { href: "/colormixing", label: "Колеровка" },
  { href: "/wholesale", label: "Оптовикам" },
];

export function SiteHeader() {
  const { itemCount } = useCart();
  const { favorites } = useFavorites();
  const { user } = useAuth();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/85">
      {/* Верхняя строка: телефон/режим работы */}
      <div className="hidden bg-primary text-primary-foreground md:block">
        <div className="section-shell flex items-center justify-between py-1.5 text-xs">
          <span className="flex items-center gap-1.5 text-primary-foreground/85">
            <Clock className="size-3.5 text-accent" />
            Самовывоз в Москве · Оплата при получении · ежедневно 9:00–21:00
          </span>
          <a
            href="tel:88001234567"
            className="flex items-center gap-1.5 font-semibold tracking-wide transition-opacity hover:opacity-80"
          >
            <Phone className="size-3.5 text-accent" />8 800 123-45-67
          </a>
        </div>
      </div>

      <div className="section-shell flex items-center gap-3 py-3 lg:gap-4">
        {/* Мобильное меню */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                aria-label="Меню"
              >
                <Menu className="size-5" />
              </Button>
            }
          />
          <SheetContent side="left" className="w-80">
            <SheetHeader className="border-b border-border">
              <SheetTitle className="flex items-center gap-2 font-heading">
                <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Paintbrush className="size-4" />
                </span>
                Краски<span className="-ml-2 text-accent">УНАС</span>
              </SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-1 overflow-y-auto px-4 py-4">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors hover:bg-secondary hover:text-primary"
                >
                  {item.label}
                </Link>
              ))}
              <div className="my-3 h-px bg-border" />
              <span className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Категории
              </span>
              {categories.map((c: any) => (
                <Link
                  key={c.slug}
                  href={`/catalog?category=${c.slug}`}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm text-foreground/80 transition-colors hover:bg-secondary hover:text-primary"
                >
                  {c.name}
                </Link>
              ))}
              <div className="my-3 h-px bg-border" />
              <a
                href="tel:88001234567"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-foreground/80"
              >
                <Phone className="size-4 text-primary" />8 800 123-45-67
              </a>
            </nav>
          </SheetContent>
        </Sheet>

        {/* Логотип */}
        <Link
          href="/"
          className="group flex shrink-0 items-center gap-2"
          aria-label="КраскиУНАС — на главную"
        >
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm transition-transform duration-200 group-hover:scale-105 group-hover:-rotate-6">
            <Paintbrush className="size-5" />
          </span>
          <span className="font-heading text-lg font-extrabold tracking-tight text-primary">
            Краски<span className="text-accent">УНАС</span>
          </span>
        </Link>

        {/* Навигация (desktop) */}
        <nav className="hidden items-center gap-0.5 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="relative rounded-lg px-3 py-2 text-sm font-semibold text-foreground/75 transition-colors after:absolute after:inset-x-3 after:-bottom-0.5 after:h-0.5 after:origin-left after:scale-x-0 after:rounded-full after:bg-accent after:transition-transform after:duration-200 hover:text-primary hover:after:scale-x-100"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Поиск */}
        <form
          onSubmit={submitSearch}
          className="relative ml-auto hidden max-w-md flex-1 sm:block"
          role="search"
        >
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск красок, эмалей, грунтовок…"
            className="rounded-full border-transparent bg-muted pl-9 transition-colors focus-visible:border-ring focus-visible:bg-card"
            aria-label="Поиск по каталогу"
          />
        </form>

        {/* Действия */}
        <div className="flex items-center gap-1 sm:ml-0 ml-auto">
          <Button
            variant="ghost"
            size="icon"
            className="sm:hidden"
            aria-label="Поиск"
            render={<Link href="/search" />}
          >
            <Search className="size-5" />
          </Button>
          {!user ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="font-semibold"
                render={<Link href="/login" />}
              >
                Войти
              </Button>
              <Button
                size="sm"
                className="hidden font-semibold sm:inline-flex"
                render={<Link href="/register" />}
              >
                Регистрация
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                aria-label={
                  mounted ? `Избранное, товаров: ${favorites.length}` : "Избранное"
                }
                render={<Link href="/account?tab=favorites" />}
              >
                <Heart className="size-5 text-foreground" />
                {mounted && favorites.length > 0 && (
                  <Badge className="absolute -top-1 -right-1 size-5 rounded-full bg-accent p-0 text-[11px] font-bold text-accent-foreground shadow-sm">
                    {favorites.length}
                  </Badge>
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Личный кабинет"
                render={<Link href="/account" />}
              >
                <User className="size-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                aria-label={`Корзина, товаров: ${itemCount}`}
                render={<Link href="/cart" />}
              >
                <ShoppingCart className="size-5" />
                {itemCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 size-5 rounded-full bg-accent p-0 text-[11px] font-bold text-accent-foreground shadow-sm">
                    {itemCount > 99 ? "99+" : itemCount}
                  </Badge>
                )}
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
