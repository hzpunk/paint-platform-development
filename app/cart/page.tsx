"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Trash2,
  Heart,
  ArrowRight,
  ShoppingCart,
  Tag,
  Gift,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PaintCan } from "@/components/product/paint-can";
import { useCart } from "@/components/cart/cart-provider";
import { useAuth } from "@/components/auth/auth-provider";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useFavorites } from "@/components/favorites/favorites-provider";
import { isRenderableImage } from "@/lib/cart";

// Промокоды-заглушки (на проде заменить API)
const PROMO_CODES: Record<string, number> = {
  PROF10: 10,
  PAINT15: 15,
};

export default function CartPage() {
  const { items, subtotal, totalBonus, removeItem, setQuantity, keyOf } =
    useCart();
  const { toggle, isFavorite } = useFavorites();
  const { user } = useAuth();
  const [promo, setPromo] = useState("");
  const [promoApplied, setPromoApplied] = useState<number | null>(null);
  const [promoError, setPromoError] = useState("");
  const [bonusToUse, setBonusToUse] = useState(0);
  const userBonusBalance = user?.bonusBalance ?? 0;

  const discount = promoApplied
    ? Math.round((subtotal * promoApplied) / 100)
    : 0;

  const maxBonusAllowed = Math.min(
    userBonusBalance,
    Math.round((subtotal - discount) * 0.2),
  );

  const bonusDiscount = Math.min(bonusToUse, maxBonusAllowed);
  const total = subtotal - discount - bonusDiscount;
  const earnedBonus = bonusDiscount > 0 ? 0 : totalBonus;

  function applyPromo() {
    const code = promo.trim().toUpperCase();
    const pct = PROMO_CODES[code];
    if (pct) {
      setPromoApplied(pct);
      setPromoError("");
    } else {
      setPromoApplied(null);
      setPromoError("Промокод не найден или уже использован");
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center md:px-6">
        <ShoppingCart className="mx-auto mb-4 size-16 text-muted-foreground" />
        <h1 className="font-heading text-2xl font-bold mb-2">Корзина пуста</h1>
        <p className="text-muted-foreground mb-6">
          Добавьте товары из каталога
        </p>
        <Button render={<Link href="/catalog" />}>Перейти в каталог</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <h1 className="mb-6 font-heading text-2xl font-bold md:text-3xl">
        Корзина
      </h1>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Список товаров */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {items.map((item) => {
            const key = keyOf(item);
            const brandLabel =
              typeof item.brand === "string"
                ? item.brand
                : (item.brand?.name ?? "");
            const isLiked = isFavorite(item.productId, item.slug);
            return (
              <div
                key={key}
                className="flex gap-4 rounded-lg border border-border bg-card p-4"
              >
                {/* Изображение */}
                <div className="shrink-0 w-20 h-20 rounded-md overflow-hidden bg-muted/30">
                  {isRenderableImage(item.image) ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <PaintCan
                      color={item.image || item.color || "#E5E5E0"}
                      className="w-20 h-20"
                    />
                  )}
                </div>

                {/* Инфо */}
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/product/${item.slug}`}
                    className="font-medium hover:text-primary line-clamp-2 text-sm leading-snug"
                  >
                    {item.name}
                  </Link>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {brandLabel} · {item.volume} л
                    {item.color ? ` · ${item.color}` : ""}
                  </p>
                  {item.color ? (
                    <div className="mt-2 flex items-center gap-2">
                      <span
                        className="size-3.5 rounded-full border border-border/60"
                        style={{ backgroundColor: item.color || "#f1f5f9" }}
                      />
                      <span className="text-xs font-medium text-foreground">
                        {item.color}
                      </span>
                    </div>
                  ) : null}
                  <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                    {item.sku}
                  </p>

                  <div className="mt-3 flex items-center justify-between gap-3 flex-wrap">
                    {/* Количество */}
                    <div className="flex items-center rounded-md border border-border">
                      <button
                        onClick={() => {
                          if (item.quantity === 1) removeItem(key);
                          else setQuantity(key, item.quantity - 1);
                        }}
                        className="flex size-8 items-center justify-center hover:bg-muted"
                        aria-label="Уменьшить"
                      >
                        −
                      </button>
                      <span className="w-10 text-center text-sm tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(key, item.quantity + 1)}
                        className="flex size-8 items-center justify-center hover:bg-muted"
                        aria-label="Увеличить"
                      >
                        +
                      </button>
                    </div>

                    {/* Цена */}
                    <span className="font-bold">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                </div>

                {/* Действия */}
                <div className="flex flex-col gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-muted-foreground hover:text-destructive"
                    onClick={() => removeItem(key)}
                    aria-label="Удалить"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "size-8 text-muted-foreground hover:text-primary",
                      isLiked && "text-destructive hover:text-destructive",
                    )}
                    onClick={() => toggle(item.productId)}
                    aria-label={
                      isLiked ? "Убрать из избранного" : "Добавить в избранное"
                    }
                  >
                    <Heart
                      className={cn("size-4", isLiked && "fill-destructive")}
                    />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Итого */}
        <div className="flex flex-col gap-4">
          <div className="rounded-lg border border-border bg-card p-5 flex flex-col gap-4">
            <h2 className="font-heading font-bold text-lg">Итого</h2>

            {/* Промокод */}
            <div>
              <p className="mb-2 text-sm font-medium flex items-center gap-2">
                <Tag className="size-4" /> Промокод
              </p>
              <div className="flex gap-2">
                <Input
                  value={promo}
                  onChange={(e) => setPromo(e.target.value)}
                  placeholder="Введите промокод"
                  className="flex-1"
                />
                <Button variant="outline" onClick={applyPromo} size="sm">
                  Применить
                </Button>
              </div>
              {promoError && (
                <p className="mt-1 text-xs text-destructive">{promoError}</p>
              )}
              {promoApplied && (
                <p className="mt-1 text-xs text-success">
                  ✓ Скидка {promoApplied}% применена
                </p>
              )}
            </div>

            {/* Бонусные баллы */}
            <div>
              <p className="mb-2 text-sm font-medium flex items-center gap-2">
                <Gift className="size-4" /> Бонусные баллы
                <span className="ml-auto text-xs text-muted-foreground">
                  Баланс: {userBonusBalance}
                </span>
              </p>
              {maxBonusAllowed > 0 ? (
                <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/10 p-3">
                  <input
                    type="checkbox"
                    id="use-bonuses"
                    checked={bonusDiscount > 0}
                    onChange={(e) => {
                      setBonusToUse(e.target.checked ? maxBonusAllowed : 0);
                    }}
                    className="size-4 accent-primary cursor-pointer"
                  />
                  <label
                    htmlFor="use-bonuses"
                    className="text-sm font-medium cursor-pointer flex-1"
                  >
                    Списать доступные бонусы: {maxBonusAllowed} баллов (−{formatPrice(maxBonusAllowed)})
                  </label>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Нет доступных бонусов для списания
                </p>
              )}
              <p className="mt-2 text-[11px] text-muted-foreground">
                Бонусами можно оплатить не более 20% от суммы заказа. При списании бонусов новые баллы за заказ не начисляются.
              </p>
            </div>

            <div className="flex flex-col gap-2 text-sm border-t border-border pt-4">
              <Row label="Товары" value={formatPrice(subtotal)} />
              {discount > 0 && (
                <Row
                  label={`Скидка (${promoApplied}%)`}
                  value={`−${formatPrice(discount)}`}
                  className="text-success"
                />
              )}
              {bonusDiscount > 0 && (
                <Row
                  label="Бонусы"
                  value={`−${formatPrice(bonusDiscount)}`}
                  className="text-success"
                />
              )}
              <Row label="Получение" value="Самовывоз (Бесплатно)" />
            </div>

            <div className="flex items-center justify-between border-t border-border pt-4">
              <span className="font-bold text-lg">Итого</span>
              <span className="font-bold text-2xl">{formatPrice(total)}</span>
            </div>

            {earnedBonus > 0 ? (
              <p className="text-xs text-success">
                +{earnedBonus} баллов за этот заказ
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Баллы не начисляются при оплате бонусами
              </p>
            )}

            <Button
              size="lg"
              className="w-full gap-2"
              render={
                <Link
                  href={`/checkout?promo=${promoApplied ? promo.trim() : ""}&bonus=${bonusDiscount}`}
                />
              }
            >
              Оформить заказ
              <ArrowRight className="size-4" />
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              Оплата при получении · Удобный самовывоз
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-lg border border-dashed border-border/70 bg-muted/20 p-4 text-sm text-muted-foreground">
        Здесь будет блок рекомендаций и сопутствующих товаров после подключения
        актуального сервиса предложений.
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  className,
  note,
}: {
  label: string;
  value: string;
  className?: string;
  note?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <span>{label}</span>
        {note && <p className="text-xs text-muted-foreground">{note}</p>}
      </div>
      <span className={cn("font-medium", className)}>{value}</span>
    </div>
  );
}
