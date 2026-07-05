'use client';

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Package,
  Star,
  Gift,
  Heart,
  MapPin,
  User,
  MessageSquare,
  Copy,
  CheckCircle,
  Clock,
  Truck,
  Archive,
  XCircle,
  LogOut,
  UserCog,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { loyaltyTiers } from "@/lib/data";
import { useAuth } from "@/components/auth/auth-provider";
import { useFavorites } from "@/components/favorites/favorites-provider";
import { formatPrice, formatDate, pluralize } from "@/lib/format";
import { ProductCard } from "@/components/product/product-card";
import { cn } from "@/lib/utils";
import type { OrderStatus, Product } from "@/lib/types";
import { toast } from "sonner";

const STATUS_CONFIG: Record<
  OrderStatus,
  { icon: React.ElementType; color: string; label: string }
> = {
  Оформлен: {
    icon: CheckCircle,
    color: "text-muted-foreground",
    label: "Оформлен",
  },
  Собирается: { icon: Archive, color: "text-primary", label: "Собирается" },
  "В пути": { icon: Truck, color: "text-accent", label: "В пути" },
  Доставлен: { icon: CheckCircle, color: "text-success", label: "Доставлен" },
  Отменён: { icon: XCircle, color: "text-destructive", label: "Отменён" },
};

type Section =
  | "orders"
  | "bonus"
  | "referral"
  | "favorites"
  | "profile"
  | "reviews";

const MENU: { key: Section | "logout" | "admin"; label: string; icon: React.ElementType; href?: string }[] = [
  { key: "orders", label: "Мои заказы", icon: Package },
  { key: "bonus", label: "Бонусы", icon: Star },
  { key: "referral", label: "Реферальная программа", icon: Gift },
  { key: "favorites", label: "Избранное", icon: Heart },
  { key: "profile", label: "Профиль", icon: User },
  { key: "reviews", label: "Мои отзывы", icon: MessageSquare },
];

export default function AccountPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [section, setSection] = useState<Section>("orders");
  const [profileLoading, setProfileLoading] = useState(true);
  const [profile, setProfile] = useState<any | null>(null);
  const [pname, setPname] = useState("");
  const [pphone, setPphone] = useState("");
  const [pemail, setPemail] = useState("");
  const [pbday, setPbday] = useState("");
  const { user, logout } = useAuth();
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  const displayMenu = [
    ...MENU,
    ...(user?.isAdmin ? [{ key: "admin", label: "Панель администратора", icon: UserCog, href: "/admin" }] : []),
    ...(user ? [{ key: "logout", label: "Выйти", icon: LogOut }] : []),
  ];

  const USER = profile ??
    user ?? {
      name: "Гость",
      phone: "",
      email: "",
      birthday: "",
      bonusBalance: 0,
      totalSpent: 0,
      referralCode: "—",
    };

  const TIER =
    loyaltyTiers.find(
      (t) =>
        (USER.totalSpent ?? 0) >= t.threshold &&
        (!loyaltyTiers[loyaltyTiers.indexOf(t) + 1] ||
          (USER.totalSpent ?? 0) <
            loyaltyTiers[loyaltyTiers.indexOf(t) + 1].threshold),
    ) ?? loyaltyTiers[0];
  const { favorites } = useFavorites();
  const favoriteProducts = allProducts.filter((p) => favorites.includes(p.id));
  const [copiedCode, setCopiedCode] = useState(false);

  // load orders for the demo user
  useEffect(() => {
    fetch("/api/orders")
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setOrders(data);
          } else {
            setOrders([]);
          }
        } else {
          setOrders([]);
        }
      })
      .catch(() => setOrders([]));
  }, []);

  // load all products for favorites
  useEffect(() => {
    fetch("/api/products?limit=100") // Assuming the API supports a limit
      .then((r) => r.json())
      .then((data) => setAllProducts(data.products || []))
      .catch(() => setAllProducts([]));
  }, []);

  useEffect(() => {
    let mounted = true;
    async function loadProfile() {
      try {
        const res = await fetch("/api/me");
        if (!res.ok) {
          setProfile(null);
        } else {
          const data = await res.json();
          if (mounted) setProfile(data);
          if (mounted) {
            setPname(data.name ?? "");
            setPphone(data.phone ?? "");
            setPemail(data.email ?? "");
            setPbday(data.birthday ?? "");
          }
        }
      } catch {
        if (mounted) setProfile(null);
      } finally {
        if (mounted) setProfileLoading(false);
      }
    }
    loadProfile();
    return () => {
      mounted = false;
    };
  }, []);

  function copyReferral() {
    navigator.clipboard.writeText(
      `https://kraskaprof.ru?ref=${USER.referralCode}`,
    );
    setCopiedCode(true);
    toast.success("Ссылка скопирована!");
    setTimeout(() => setCopiedCode(false), 2000);
  }

  const nextTier = loyaltyTiers[loyaltyTiers.indexOf(TIER) + 1];

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-8 md:px-6">
      <h1 className="mb-6 font-heading text-2xl font-bold md:text-3xl">
        Личный кабинет
      </h1>

      <div className="grid gap-8 lg:grid-cols-4">
        {/* Сайдбар */}
        <aside className="lg:col-span-1">
          {/* Пользователь */}
          <div className="rounded-lg border border-border bg-card p-4 mb-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg">
                {USER.name.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-sm">{USER.name}</p>
                <p className="text-xs text-muted-foreground">{USER.phone}</p>
              </div>
            </div>
            <div
              className="rounded-md px-3 py-2 text-xs font-semibold text-center"
              style={{ backgroundColor: `${TIER.color}20`, color: TIER.color }}
            >
              {TIER.name} · {USER.bonusBalance} баллов
            </div>
          </div>

          {/* Меню */}
          <nav className="flex flex-col gap-1">
            {displayMenu.map(({ key, label, icon: Icon, href }) => {
              const buttonClass = cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors text-left",
                section === key
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-muted text-foreground/70",
              );

              if (key === "logout") {
                return (
                  <button key={key} onClick={logout} className={buttonClass}>
                    <Icon className="size-4 shrink-0" />
                    {label}
                  </button>
                );
              } else if (href) {
                return (
                  <Link key={key} href={href} className={buttonClass}>
                    <Icon className="size-4 shrink-0" />
                    {label}
                  </Link>
                );
              } else {
                return (
                  <button key={key} onClick={() => setSection(key as Section)} className={buttonClass}>
                    <Icon className="size-4 shrink-0" />
                    {label}
                  </button>
                );
              }
            })}
          </nav>
        </aside>

        {/* Контент */}
        <div className="lg:col-span-3">
          {/* Заказы */}
          {section === "orders" && (
            <div className="flex flex-col gap-4">
              <h2 className="font-heading font-bold text-xl">Мои заказы</h2>
              {orders.map((order) => {
                const cfg = STATUS_CONFIG[order.status as OrderStatus];
                const StatusIcon = cfg.icon;
                return (
                  <div
                    key={order.id}
                    className="rounded-lg border border-border bg-card p-5"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
                      <div>
                        <p className="font-mono font-semibold text-sm">
                          #{order.id}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(order.date)}
                        </p>
                      </div>
                      <div
                        className={cn(
                          "flex items-center gap-1.5 text-sm font-medium",
                          cfg.color,
                        )}
                      >
                        <StatusIcon className="size-4" />
                        {cfg.label}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5 text-sm mb-4">
                      {order.items.map((item: any, i: number) => (
                        <div
                          key={i}
                          className="flex justify-between text-muted-foreground"
                        >
                          <span>
                            {item.name} · {item.volume} л · {item.quantity} шт.
                          </span>
                          <span className="font-medium text-foreground">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between border-t border-border pt-3 flex-wrap gap-2">
                      <div className="text-sm">
                        <span className="font-bold">
                          {formatPrice(order.total)}
                        </span>
                        <span className="text-muted-foreground ml-2">
                          +{order.bonusEarned ?? 0} баллов
                        </span>
                      </div>
                      <div className="flex gap-2">
                        {order.tracking && (
                          <Button variant="outline" size="sm">
                            Отследить
                          </Button>
                        )}
                        <Button size="sm">Повторить заказ</Button>
                      </div>
                    </div>
                  </div>
                );
              })}
              {orders.length === 0 && (
                <div className="text-sm text-muted-foreground">
                  У вас ещё нет заказов
                </div>
              )}
            </div>
          )}

          {/* Бонусы */}
          {section === "bonus" && (
            <div className="flex flex-col gap-6">
              <h2 className="font-heading font-bold text-xl">
                Бонусная программа
              </h2>

              {/* Текущий уровень */}
              <div className="rounded-lg border border-border bg-card p-6">
                <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Текущий уровень
                    </p>
                    <p
                      className="text-2xl font-bold"
                      style={{ color: TIER.color }}
                    >
                      {TIER.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      Баланс баллов
                    </p>
                    <p className="text-3xl font-bold">
                      {USER.bonusBalance.toLocaleString("ru")}
                    </p>
                  </div>
                </div>
                {nextTier && (
                  <div>
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>До уровня «{nextTier.name}»</span>
                      <span>
                        {(nextTier.threshold - USER.totalSpent).toLocaleString(
                          "ru",
                        )}{" "}
                        ₽
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted">
                      <div
                        className="h-2 rounded-full bg-primary"
                        style={{
                          width: `${Math.min(100, (USER.totalSpent / nextTier.threshold) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Таблица уровней */}
              <div>
                <h3 className="font-semibold mb-3">Уровни программы</h3>
                <div className="flex flex-col gap-3">
                  {loyaltyTiers.map((tier) => (
                    <div
                      key={tier.name}
                      className={cn(
                        "rounded-lg border p-4",
                        tier.name === TIER.name
                          ? "border-primary bg-primary/5"
                          : "border-border bg-card",
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className="font-semibold"
                          style={{ color: tier.color }}
                        >
                          {tier.name}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          от {tier.threshold.toLocaleString("ru")} ₽ ·{" "}
                          {tier.rate}% бонусами
                        </span>
                      </div>
                      <ul className="flex flex-wrap gap-2">
                        {tier.perks.map((perk) => (
                          <li
                            key={perk}
                            className="text-xs rounded-full bg-muted px-2 py-1"
                          >
                            {perk}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Реферальная программа */}
          {section === "referral" && (
            <div className="flex flex-col gap-6">
              <h2 className="font-heading font-bold text-xl">
                Реферальная программа
              </h2>
              <div className="rounded-lg border border-border bg-card p-6">
                <div className="grid gap-6 md:grid-cols-3 mb-6">
                  {[
                    { label: "Приглашено друзей", value: USER.referralCount },
                    { label: "Заработано баллов", value: USER.referralBonus },
                    { label: "Текущий баланс", value: USER.bonusBalance },
                  ].map(({ label, value }) => (
                    <div
                      key={label}
                      className="text-center p-4 rounded-lg bg-muted/30"
                    >
                      <p className="text-2xl font-bold">
                        {typeof value === "number"
                          ? value.toLocaleString("ru")
                          : value !== undefined && value !== null
                          ? String(value)
                          : "—"}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {label}
                      </p>
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">
                    Ваша реферальная ссылка
                  </p>
                  <div className="flex gap-2">
                    <Input
                      readOnly
                      value={`https://kraskaprof.ru?ref=${USER.referralCode}`}
                      className="font-mono text-sm"
                    />
                    <Button variant="outline" onClick={copyReferral}>
                      {copiedCode ? (
                        <CheckCircle className="size-4 text-success" />
                      ) : (
                        <Copy className="size-4" />
                      )}
                    </Button>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Код: <strong>{USER.referralCode}</strong>
                  </p>
                </div>
              </div>
              <div className="rounded-lg border border-border bg-card p-5 text-sm">
                <h3 className="font-semibold mb-3">Условия программы</h3>
                <ul className="flex flex-col gap-2 text-muted-foreground">
                  <li>
                    • Друг зарегистрировался по вашей ссылке → +500 баллов вам
                  </li>
                  <li>• Друг сделал первый заказ → +2% от суммы заказа вам</li>
                  <li>
                    • Для мастеров и бригад — повышенные ставки реферального
                    бонуса
                  </li>
                  <li>• Нет ограничений по количеству приглашений</li>
                </ul>
              </div>
            </div>
          )}

          {/* Избранное */}
          {section === "favorites" && (
            <div>
              <h2 className="font-heading font-bold text-xl mb-4">Избранное</h2>
              {favoriteProducts.length === 0 ? (
                <div className="rounded-lg border border-border bg-card p-12 text-center">
                  <Heart className="mx-auto mb-3 size-10 text-muted-foreground" />
                  <p className="text-muted-foreground">Нет избранных товаров</p>
                </div>
              ) : (
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                  {favoriteProducts.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Адреса removed — сайт поддерживает только самовывоз */}

          {/* Профиль */}
          {section === "profile" && (
            <div>
              <h2 className="font-heading font-bold text-xl mb-6">Профиль</h2>
              <div className="grid gap-4 max-w-lg">
                {[
                  { id: "pname", label: "Имя", value: USER.name, type: "text" },
                  {
                    id: "pphone",
                    label: "Телефон",
                    value: USER.phone,
                    type: "tel",
                  },
                  {
                    id: "pemail",
                    label: "Email",
                    value: USER.email,
                    type: "email",
                  },
                  {
                    id: "pbday",
                    label: "Дата рождения (скидка в ДР)",
                    value: USER.birthday,
                    type: "date",
                  },
                ].map(({ id, label, value, type }) => {
                  let val = "";
                  let onChange: any;
                  if (id === "pname") {
                    val = pname;
                    onChange = (e: any) => setPname(e.target.value);
                  } else if (id === "pphone") {
                    val = pphone;
                    onChange = (e: any) => setPphone(e.target.value);
                  } else if (id === "pemail") {
                    val = pemail;
                    onChange = (e: any) => setPemail(e.target.value);
                  } else if (id === "pbday") {
                    val = pbday;
                    onChange = (e: any) => setPbday(e.target.value);
                  }
                  return (
                    <div key={id}>
                      <Label htmlFor={id}>{label}</Label>
                      <Input
                        id={id}
                        type={type}
                        value={val}
                        onChange={onChange}
                        className="mt-1"
                      />
                    </div>
                  );
                })}
                <Button
                  className="self-start"
                  onClick={async () => {
                    try {
                      const res = await fetch("/api/me", {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          name: pname,
                          phone: pphone,
                          email: pemail,
                          birthday: pbday,
                        }),
                      });
                      if (!res.ok) throw new Error("Failed");
                      const data = await res.json();
                      setProfile(data);
                      toast.success("Профиль обновлён");
                    } catch (e) {
                      toast.error("Ошибка сохранения");
                    }
                  }}
                >
                  Сохранить
                </Button>
              </div>
            </div>
          )}

          {/* Отзывы */}
          {section === "reviews" && (
            <div>
              <h2 className="font-heading font-bold text-xl mb-4">
                Мои отзывы
              </h2>
              <div className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground text-center">
                Отзывы можно оставлять только для подтверждённых покупок.
                Перейдите в раздел «Мои заказы» и нажмите «Оставить отзыв».
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
