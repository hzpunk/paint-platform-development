"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  FileText,
  Box,
  Users,
  Settings,
  Slash,
  Tag,
  MessageSquare,
  User,
  TrendingUp,
  DollarSign,
  MessageCircle,
  Building2,
  Info,
  FilePlus2,
  Shield,
  Sparkles,
} from "lucide-react";

export function AdminSidebar() {
  const pathname = usePathname();
  const NAV = [
    { href: "/admin", label: "Дашборд", icon: Home },
    { href: "/admin/orders", label: "Заказы", icon: FileText },
    { href: "/admin/catalog", label: "Каталог", icon: Box },
    { href: "/admin/customers", label: "Клиенты", icon: Users },
    { href: "/admin/marketing", label: "Маркетинг", icon: TrendingUp },
    { href: "/admin/users", label: "Пользователи", icon: Users },
    { href: "/admin/finance", label: "Финансы", icon: DollarSign },
    { href: "/admin/feedback", label: "Обратная связь", icon: MessageCircle },
    { href: "/admin/hzcompany", label: "HzCompany", icon: Building2 },
    { href: "/admin/info", label: "Информация", icon: Info },
    { href: "/admin/documents", label: "Документы", icon: FilePlus2 },
    { href: "/admin/colormixing", label: "Колеровка", icon: Tag },
    { href: "/admin/wholesale", label: "Опт", icon: Slash },
    { href: "/admin/reviews", label: "Отзывы", icon: MessageSquare },
    { href: "/admin/team", label: "Сотрудники", icon: User },
    { href: "/hzcompany", label: "Супер админ", icon: Shield },
    { href: "/admin/settings", label: "Настройки", icon: Settings },
  ];

  return (
    <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r border-border/70 bg-card/90 p-5 lg:block">
      <div className="mb-6 rounded-xl border border-primary/10 bg-primary/5 p-3">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-primary p-2 text-primary-foreground">
            <Sparkles className="size-4" />
          </div>
          <div>
            <p className="text-sm font-semibold">Админ-панель</p>
            <p className="text-xs text-muted-foreground">Операционный центр</p>
          </div>
        </div>
      </div>
      <nav className="flex flex-col gap-1">
        {NAV.map((n) => {
          const isActive = pathname === n.href || pathname.startsWith(`${n.href}/`);
          return (
            <Link
              key={n.href}
              href={n.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <n.icon className="size-4" />
              <span>{n.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
