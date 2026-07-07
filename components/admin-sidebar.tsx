"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Box,
  Home,
  Layers3,
  ShoppingCart,
  Users,
} from "lucide-react";
import { cn } from "../lib/utils";

const links = [
  { href: "/admin", label: "Панель", icon: Home },
  { href: "/admin/analytics", label: "Аналитика", icon: BarChart3 },
  { href: "/admin/users", label: "Пользователи", icon: Users },
  { href: "/admin/orders", label: "Заказы", icon: ShoppingCart },
  { href: "/admin/products", label: "Товары", icon: Box },
  { href: "/admin/dictionaries", label: "Справочники", icon: Layers3 },
];

export function AdminSidebar() {
  const pathname = usePathname() || "";

  return (
    <aside className="hidden w-72 shrink-0 border-r border-border/70 bg-background/90 lg:flex lg:flex-col">
      <div className="sticky top-0 flex h-screen flex-col gap-6 overflow-hidden p-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Админка
          </p>
          <h2 className="mt-3 text-2xl font-semibold">Управление</h2>
        </div>

        <nav className="flex flex-1 flex-col gap-2">
          {links.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium transition",
                  isActive
                    ? "border-border bg-primary text-primary-foreground shadow-sm"
                    : "border-border/50 bg-card text-foreground hover:border-border hover:bg-muted",
                )}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
