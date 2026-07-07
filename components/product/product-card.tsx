"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Heart } from "lucide-react";
import type { Product } from "@/lib/types";
import { bonusFor } from "@/lib/data";
import { cn } from "@/lib/utils";
import { useFavorites } from "@/components/favorites/favorites-provider";
import { useCart } from "@/components/cart/cart-provider";
import { AddToCartButton } from "./add-to-cart-button";
import { applyHzcompanyCommission } from "@/lib/productPricing";

interface ProductCardProps {
  product: Product;
}

/** Максимум цветных образцов, показываемых прямо на карточке. */
const MAX_SWATCHES = 5;

function isRenderableImage(value: string | null | undefined) {
  if (!value) return false;
  if (/^(#|rgb|hsl|rgba|hsla)/i.test(value)) return false;
  if (value.startsWith("data:image/")) return true;
  return (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("/")
  );
}

export function ProductCard({ product }: ProductCardProps) {
  const primaryImage = Array.isArray(product.images) ? product.images[0] : null;
  const colors = useMemo(() => {
    const rawColors = Array.isArray(product.colors) ? product.colors : [];
    return rawColors
      .map((entry) => {
        if (typeof entry === "string") {
          const value = entry.trim();
          return value ? { hex: value, name: value } : null;
        }

        if (entry && typeof entry === "object" && "hex" in entry) {
          const hex =
            typeof (entry as { hex?: unknown }).hex === "string"
              ? (entry as { hex: string }).hex.trim()
              : "";
          const name =
            typeof (entry as { name?: unknown }).name === "string"
              ? (entry as { name: string }).name.trim()
              : hex;

          return hex ? { hex, name: name || hex } : null;
        }

        return null;
      })
      .filter((entry): entry is { hex: string; name: string } =>
        Boolean(entry),
      );
  }, [product.colors]);
  const firstColor = colors[0]?.hex ?? null;
  const imageSrc = isRenderableImage(primaryImage) ? primaryImage : null;

  const displayPrice = applyHzcompanyCommission(product.price) as number;
  const displayOldPrice = typeof product.oldPrice === "number" ? (applyHzcompanyCommission(product.oldPrice) as number) : null;

  const bonus = bonusFor(displayPrice);
  const brandName =
    typeof product.brand === "string"
      ? product.brand
      : product.brand?.name || "Бренд";
  const isInStock = product.inStock ?? product.stock > 0;

  // Расчёт скидки для отображения бейджа и зачёркнутой цены.
  const hasDiscount =
    typeof displayOldPrice === "number" && displayOldPrice > displayPrice;
  const discountPercent = hasDiscount
    ? Math.round((1 - displayPrice / displayOldPrice) * 100)
    : 0;

  // Доступные объёмы расфасовки (для подписи под ценой).
  const volumes = Array.isArray(product.packaging)
    ? Array.from(new Set(product.packaging.map((p) => p.volume))).sort(
        (a, b) => a - b,
      )
    : [];

  // Избранное: клиентский стор (localStorage + синк с сервером при входе).
  const { isFavorite, toggle } = useFavorites();
  const { items } = useCart();
  const isLiked = isFavorite(product.id, product.slug);
  const isInCart = items.some(
    (item) => item.productId === product.id || item.slug === product.slug,
  );
  const selectedCartColor =
    items.find(
      (item) => item.productId === product.id || item.slug === product.slug,
    )?.color ?? null;

  // Клик по сердечку не должен открывать страницу товара (внутри ссылки).
  function handleLike(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    toggle(product.id);
  }

  return (
    <Card className="group flex h-full flex-col overflow-hidden border-border/60 bg-card shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-border hover:shadow-lg">
      <CardHeader className="relative p-0">
        <Link href={`/product/${product.slug}`} className="block">
          <div className="relative aspect-square overflow-hidden bg-muted/60">
            {imageSrc ? (
              <img
                src={imageSrc}
                alt={product.name}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : firstColor ? (
              <div
                className="absolute inset-0 transition-transform duration-300 group-hover:scale-105"
                style={{ backgroundColor: firstColor }}
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted/70" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />

            {/* Бейджи слева сверху: скидка + маркетинговые метки */}
            <div className="absolute left-2 top-2 flex flex-col gap-1">
              {hasDiscount && (
                <Badge variant="destructive" className="shadow-sm">
                  {"−"}
                  {discountPercent}%
                </Badge>
              )}
              {product.badges?.map((b: string) => (
                <Badge
                  key={b}
                  variant={b === "Хит" ? "default" : "secondary"}
                  className="shadow-sm"
                >
                  {b}
                </Badge>
              ))}
            </div>

            {/* Плашка "нет в наличии" поверх изображения */}
            {!isInStock && (
              <div className="absolute inset-x-0 bottom-0 bg-foreground/70 py-1.5 text-center text-xs font-medium text-background backdrop-blur-sm">
                Под заказ
              </div>
            )}
          </div>
        </Link>

        <button
          type="button"
          onClick={handleLike}
          aria-label={isLiked ? "Убрать из избранного" : "Добавить в избранное"}
          aria-pressed={isLiked}
          className={cn(
            "absolute right-2 top-2 z-10 flex size-9 items-center justify-center rounded-full border border-border/60 bg-card/90 text-muted-foreground shadow-sm backdrop-blur transition-all duration-200 hover:scale-110 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            isLiked && "text-destructive",
          )}
        >
          <Heart
            className={cn(
              "size-5 transition-all",
              isLiked && "fill-destructive",
            )}
          />
        </button>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-2.5 p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
            {brandName}
          </p>
          <div className="flex shrink-0 items-center gap-1">
            <Star className="size-3.5 fill-primary text-primary" />
            <span className="text-xs font-bold">{product.rating ?? 0}</span>
            <span className="text-xs text-muted-foreground">
              ({product.reviewsCount ?? 0})
            </span>
          </div>
        </div>

        <Link
          href={`/product/${product.slug}`}
          className="line-clamp-2 text-pretty text-base font-semibold leading-tight text-foreground transition-colors hover:text-primary"
        >
          {product.name}
        </Link>

        <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {product.shortSpec ||
            product.description ||
            "Качественное покрытие для любых задач."}
        </p>

        {/* Образцы доступных цветов */}
        {colors.length > 0 && (
          <div className="mt-auto flex items-center gap-1.5 pt-1">
            {colors.slice(0, MAX_SWATCHES).map((c, i) => {
              const isActiveColor =
                Boolean(selectedCartColor) &&
                [c.hex, c.name]
                  .filter(Boolean)
                  .some(
                    (value) =>
                      value &&
                      selectedCartColor?.toLowerCase() === value.toLowerCase(),
                  );

              return (
                <span
                  key={`${c.hex}-${i}`}
                  title={c.name || c.hex}
                  className={cn(
                    "size-4 rounded-full border border-border/70 shadow-sm transition-all",
                    isActiveColor && "border-primary ring-2 ring-primary/30",
                  )}
                  style={{ backgroundColor: c.hex }}
                  aria-label={
                    isActiveColor ? "Выбранный цвет" : c.name || c.hex
                  }
                />
              );
            })}
            {colors.length > MAX_SWATCHES && (
              <span className="text-xs font-medium text-muted-foreground">
                +{colors.length - MAX_SWATCHES}
              </span>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col items-stretch gap-3 border-t bg-muted/20 p-4 pt-3">
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-baseline gap-2">
              <p className="text-lg font-bold text-foreground">
                {displayPrice.toLocaleString("ru-RU")} ₽
              </p>
              {hasDiscount && (
                <p className="text-sm text-muted-foreground line-through">
                  {(displayOldPrice as number).toLocaleString("ru-RU")} ₽
                </p>
              )}
            </div>
            <p className="text-xs text-primary">+ {bonus} баллов</p>
          </div>
          {volumes.length > 0 && (
            <div className="shrink-0 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
              {volumes.length > 1
                ? `${volumes[0]}–${volumes[volumes.length - 1]} л`
                : `${volumes[0]} л`}
            </div>
          )}
        </div>
        <AddToCartButton product={product} showQuantityControls={isInCart} />
      </CardFooter>
    </Card>
  );
}
