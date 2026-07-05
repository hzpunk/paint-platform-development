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
import { categories } from "@/lib/data";

const NAV = [
  { href: "/catalog", label: "Каталог" },
  { href: "/colormixing", label: "Колеровка" },
  { href: "/wholesale", label: "Оптовикам" },
];

export function SiteHeader() {
  const { itemCount } = useCart();
  const { favorites } = useFavorites();
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
    <header className="sticky top-0 z-50 border-b border-border bg-card">
      {/* Верхняя строка: телефон/режим работы */}
      <div className="hidden border-b border-border bg-primary text-primary-foreground md:block">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between px-6 py-1.5 text-xs">
          <span>Самовывоз в Москве · Оплата при получении</span>
          <a
            href="tel:88001234567"
            className="flex items-center gap-1.5 font-medium transition-opacity hover:opacity-80"
          >
            <Phone className="size-3.5" />8 800 123-45-67
          </a>
        </div>
      </div>

      <div className="mx-auto flex max-w-[1280px] items-center gap-4 px-4 py-3 md:px-6">
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
            <SheetHeader>
              <SheetTitle className="font-heading">Меню</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-1 px-4">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-2.5 text-sm font-medium hover:bg-muted"
                >
                  {item.label}
                </Link>
              ))}
              <div className="my-2 h-px bg-border" />
              <span className="px-3 py-1 text-xs font-medium text-muted-foreground">
                Категории
              </span>
              {categories.map((c) => (
                <Link
                  key={c.slug}
                  href={`/catalog?category=${c.slug}`}
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-2 text-sm hover:bg-muted"
                >
                  {c.name}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>

        {/* Логотип */}
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Paintbrush className="size-5" />
          </span>
          <span className="font-heading text-lg font-extrabold tracking-tight text-primary">
            Краска<span className="text-accent">Проф</span>
          </span>
        </Link>

        {/* Навигация (desktop) */}
        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Поиск */}
        <form
          onSubmit={submitSearch}
          className="relative ml-auto hidden max-w-md flex-1 sm:block"
        >
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск красок, эмалей, грунтовок…"
            className="pl-9"
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
              <Badge className="absolute -top-1 -right-1 size-5 rounded-full bg-accent p-0 text-[11px] text-accent-foreground">
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
              <Badge className="absolute -top-1 -right-1 size-5 rounded-full bg-accent p-0 text-[11px] text-accent-foreground">
                {itemCount > 99 ? "99+" : itemCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
