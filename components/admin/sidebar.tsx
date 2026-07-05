import Link from "next/link";
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
} from "lucide-react";

export function AdminSidebar() {
  const NAV = [
    { href: "/admin", label: "Дашборд", icon: Home },
    { href: "/admin/orders", label: "Заказы", icon: FileText },
    { href: "/admin/catalog", label: "Каталог", icon: Box },
    { href: "/admin/customers", label: "Клиенты", icon: Users },
    { href: "/admin/colormixing", label: "Колеровка", icon: Tag },
    { href: "/admin/wholesale", label: "Опт", icon: Slash },
    { href: "/admin/reviews", label: "Отзывы", icon: MessageSquare },
    { href: "/admin/team", label: "Сотрудники", icon: User },
    { href: "/admin/marketing", label: "Маркетинг", icon: TrendingUp },
    { href: "/admin/users", label: "Пользователи", icon: Users },
    { href: "/admin/finance", label: "Финансы", icon: DollarSign },
    { href: "/admin/feedback", label: "Обратная связь", icon: MessageCircle },
    { href: "/admin/hzcompany", label: "HzCompany", icon: Building2 },
    { href: "/admin/info", label: "Информация", icon: Info },
    { href: "/admin/documents", label: "Документы", icon: FilePlus2 },
    { href: "/hzcompany", label: "Супер админ", icon: Shield },
    { href: "/admin/settings", label: "Настройки", icon: Settings },
  ];

  return (
    <aside className="w-64 border-r border-border bg-card p-4">
      <div className="mb-6">
        <h3 className="font-semibold">Админ-панель</h3>
      </div>
      <nav className="flex flex-col gap-1">
        {NAV.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-muted"
          >
            <n.icon className="size-4" />
            <span>{n.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
