"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Star,
  Minus,
  Plus,
  Heart,
  ChevronRight,
  ChevronLeft,
  PackageCheck,
  Sparkles,
} from "lucide-react";
import { Product, Review, Packaging } from "@/lib/types";
import { ProductCard } from "@/components/product/product-card";
import { AddToCartButton } from "@/components/product/add-to-cart-button";
import { useFavorites } from "@/components/favorites/favorites-provider";
import { bonusFor } from "@/lib/data";
import { cn, formatDate } from "@/lib/utils";
import { formatPrice } from "@/lib/format";
import { applyHzcompanyCommission, HZCOMPANY_COMMISSION_RATE } from "@/lib/productPricing";

interface ProductPageClientProps {
  product: Product;
  related: Product[];
  reviews: Review[];
  accessories: Product[];
}

/** Человекочитаемые подписи технических характеристик. */
const SPEC_LABELS: Record<string, string> = {
  composition: "Состав",
  consumption: "Расход (м²/л)",
  dryingTime: "Время высыхания",
  coverage: "Укрывистость",
  layers: "Количество слоёв",
  storage: "Условия хранения",
};

export function ProductPageClient({
  product,
  related,
  reviews,
  accessories,
}: ProductPageClientProps) {
  // JSON-поля из Prisma могут прийти как null — приводим к безопасным массивам.
  const packaging = useMemo<Packaging[]>(
    () => (Array.isArray(product.packaging) ? product.packaging : []),
    [product.packaging],
  );
  const colors = Array.isArray(product.colors) ? product.colors : [];
  const specs =
    product.specs && typeof product.specs === "object" ? product.specs : null;

  const images = Array.isArray(product.images) ? product.images : [];
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const primaryImage = images[selectedImageIndex] ?? null;

  const [quantity, setQuantity] = useState(1);
  const [selectedPackaging, setSelectedPackaging] = useState<Packaging | null>(
    packaging[0] ?? null,
  );
  const [selectedColor, setSelectedColor] = useState(colors[0]?.hex ?? null);
  const [area, setArea] = useState(20);

  const { isFavorite, toggle } = useFavorites();
  const liked = isFavorite(product.id, product.slug);

  const brandName =
    typeof product.brand === "string"
      ? product.brand
      : product.brand?.name || "Бренд";

  // Итоговая цена зависит от выбранной фасовки (если есть) либо базовой цены товара.
  const baseUnitPrice = selectedPackaging?.price ?? product.price;
  const unitPrice = applyHzcompanyCommission(baseUnitPrice) as number;
  const totalPrice = unitPrice * quantity;
  const bonus = bonusFor(totalPrice);

  const displayPrice = applyHzcompanyCommission(product.price) as number;
  const displayOldPrice = typeof product.oldPrice === "number" ? (applyHzcompanyCommission(product.oldPrice) as number) : null;

  const hasDiscount =
    typeof displayOldPrice === "number" && displayOldPrice > displayPrice;
  const discountPercent = hasDiscount
    ? Math.round((1 - displayPrice / displayOldPrice) * 100)
    : 0;

  const litersNeeded = area / Math.max(specs?.consumption ?? 8, 1);
  const cansNeeded = Math.max(
    1,
    Math.ceil(litersNeeded / Math.max(selectedPackaging?.volume ?? 1, 1)),
  );
  const calculatorTotal =
    cansNeeded * unitPrice;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
      {/* Хлебные крошки */}
      <nav className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/" className="transition-colors hover:text-foreground">
          Главная
        </Link>
        <ChevronRight className="size-4" />
        <Link
          href="/catalog"
          className="transition-colors hover:text-foreground"
        >
          Каталог
        </Link>
        <ChevronRight className="size-4" />
        <span className="truncate text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
        {/* Изображение */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="relative aspect-[4/3.2] overflow-hidden rounded-2xl border border-border/60 bg-muted/40 shadow-sm">
            {primaryImage ? (
              <img
                src={primaryImage || "/placeholder.svg"}
                alt={product.name}
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <div
                className="absolute inset-0"
                style={{ backgroundColor: selectedColor || "#f1f5f9" }}
              />
            )}

            {/* Left/Right arrows */}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Previous image"
                  onClick={() =>
                    setSelectedImageIndex(
                      (i) => (i - 1 + images.length) % images.length,
                    )
                  }
                  className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-card/90 p-2 shadow-sm hover:scale-105"
                >
                  <ChevronLeft className="size-5" />
                </button>
                <button
                  type="button"
                  aria-label="Next image"
                  onClick={() =>
                    setSelectedImageIndex((i) => (i + 1) % images.length)
                  }
                  className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-card/90 p-2 shadow-sm hover:scale-105"
                >
                  <ChevronRight className="size-5" />
                </button>
              </>
            )}

            <button
              type="button"
              onClick={() => toggle(product.id)}
              aria-label={
                liked ? "Убрать из избранного" : "Добавить в избранное"
              }
              aria-pressed={liked}
              className={cn(
                "absolute right-3 top-3 flex size-11 items-center justify-center rounded-full border border-border/60 bg-card/90 text-muted-foreground shadow-sm backdrop-blur transition-all hover:scale-105 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                liked && "text-destructive",
              )}
            >
              <Heart
                className={cn(
                  "size-6 transition-all",
                  liked && "fill-destructive",
                )}
              />
            </button>

            {hasDiscount && (
              <Badge
                variant="destructive"
                className="absolute left-3 top-3 shadow-sm"
              >
                {"−"}
                {discountPercent}%
              </Badge>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="mt-3 flex gap-2">
              {images.map((img, idx) => (
                <button
                  key={img + "-" + idx}
                  type="button"
                  onClick={() => setSelectedImageIndex(idx)}
                  className={cn(
                    "h-14 w-14 overflow-hidden rounded-lg border transition-transform hover:scale-105",
                    selectedImageIndex === idx
                      ? "ring-2 ring-primary"
                      : "border-border/60",
                  )}
                >
                  <img
                    src={img}
                    alt={`${product.name} ${idx + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Информация о товаре */}
        <div className="space-y-5">
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
              {brandName}
            </p>
            <h1 className="text-balance text-2xl font-bold md:text-3xl">
              {product.name}
            </h1>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1">
                <Star className="size-5 fill-primary text-primary" />
                <span className="font-bold">{product.rating ?? 0}</span>
              </div>
              <a
                href="#reviews"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground hover:underline"
              >
                ({product.reviewsCount ?? 0} отзывов)
              </a>
            </div>
          </div>

          {product.shortSpec && (
            <p className="text-pretty text-muted-foreground">
              {product.shortSpec}
            </p>
          )}

          <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-baseline gap-2">
                  <p className="text-3xl font-bold text-foreground">
                    {formatPrice(unitPrice)}
                  </p>
                  {product.commission ? (
                    <div className="w-full">
                      <p className="text-sm text-muted-foreground">
                        Комиссия: {formatPrice(Math.round(baseUnitPrice * HZCOMPANY_COMMISSION_RATE))}
                      </p>
                    </div>
                  ) : null}
                  {hasDiscount && (
                    <p className="text-sm text-muted-foreground line-through">
                      {formatPrice(displayOldPrice as number)}
                    </p>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Цена за литр:{" "}
                  {formatPrice(
                    Math.round(
                      unitPrice / Math.max(selectedPackaging?.volume ?? 1, 1),
                    ),
                  )}
                </p>
              </div>
              <div className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                + {bonus} баллов
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1">
                <PackageCheck className="size-4 text-primary" />
                {product.stock > 0 ? "В наличии" : "Под заказ"}
              </span>
            </div>
          </div>

          {/* Выбор цвета */}
          {colors.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">
                Цвет
                {selectedColor
                  ? `: ${colors.find((c) => c.hex === selectedColor)?.name ?? ""}`
                  : ""}
              </h3>
              <div className="flex flex-wrap gap-2">
                {colors.map((c, i) => (
                  <div
                    key={`${c.hex}-${i}`}
                    className="flex flex-col items-center gap-1"
                  >
                    <button
                      type="button"
                      title={c.name}
                      aria-label={c.name}
                      aria-pressed={selectedColor === c.hex}
                      onClick={() => setSelectedColor(c.hex)}
                      className={cn(
                        "size-9 rounded-full border shadow-sm transition-all hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        selectedColor === c.hex
                          ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                          : "border-border/70",
                      )}
                      style={{ backgroundColor: c.hex }}
                    />
                    <span className="text-[11px] text-muted-foreground">
                      {typeof c.stock === "number" ? `${c.stock} шт` : "—"}
                    </span>
                  </div>
                ))}
              </div>
              <a
                href="/colormixing"
                className="text-sm font-medium text-primary hover:underline"
              >
                Заказать колеровку
              </a>
            </div>
          )}

          {/* Выбор фасовки */}
          {packaging.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Фасовка</h3>
              <RadioGroup
                value={selectedPackaging?.sku ?? ""}
                onValueChange={(sku) =>
                  setSelectedPackaging(
                    packaging.find((p) => p.sku === sku) ?? null,
                  )
                }
                className="flex flex-wrap gap-2"
              >
                {packaging.map((p) => (
                  <Label
                    key={p.sku}
                    htmlFor={p.sku}
                    className={cn(
                      "flex cursor-pointer flex-col rounded-lg border px-4 py-2 text-center transition-colors",
                      selectedPackaging?.sku === p.sku
                        ? "border-primary bg-primary/10 text-primary"
                        : "hover:bg-muted/50",
                    )}
                  >
                    <RadioGroupItem
                      value={p.sku}
                      id={p.sku}
                      className="sr-only"
                    />
                    <span className="font-semibold">{p.volume} л</span>
                    <span className="text-xs text-muted-foreground">
                      {applyHzcompanyCommission(p.price).toLocaleString("ru-RU")} ₽
                    </span>
                  </Label>
                ))}
              </RadioGroup>
            </div>
          )}

          <div className="flex items-center justify-between gap-4 rounded-2xl border border-border/60 bg-muted/30 p-4">
            <div className="min-w-0">
              <p className="text-sm text-muted-foreground">Итого</p>
              <p className="text-2xl font-bold md:text-3xl">
                {formatPrice(totalPrice)}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                aria-label="Уменьшить количество"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                <Minus className="size-4" />
              </Button>
              <span className="w-8 text-center font-bold tabular-nums">
                {quantity}
              </span>
              <Button
                variant="outline"
                size="icon"
                aria-label="Увеличить количество"
                onClick={() => setQuantity((q) => q + 1)}
              >
                <Plus className="size-4" />
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <AddToCartButton
              product={product}
              quantity={quantity}
              selectedPackaging={selectedPackaging ?? undefined}
              selectedColorHex={selectedColor}
            />
          </div>
        </div>
      </div>

      <div className="mt-12 rounded-2xl border border-border/60 bg-linear-to-br from-primary/5 to-transparent p-6">
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="mb-6 flex-wrap justify-start" variant="line">
            <TabsTrigger value="description">Описание</TabsTrigger>
            <TabsTrigger value="specs">Характеристики</TabsTrigger>
            <TabsTrigger value="usage">Инструкция</TabsTrigger>
            <TabsTrigger value="reviews">Отзывы</TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="space-y-3">
            {product.description ? (
              <p className="leading-relaxed text-muted-foreground">
                {product.description}
              </p>
            ) : (
              <p className="text-muted-foreground">
                Подробное описание будет добавлено позже.
              </p>
            )}
          </TabsContent>

          <TabsContent value="specs" className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                "composition",
                "consumption",
                "coverage",
                "dryingTime",
                "layers",
                "storage",
              ].map((k) => (
                <div key={k} className="rounded-xl border bg-card p-4">
                  <p className="text-sm text-muted-foreground">
                    {SPEC_LABELS[k] ?? k}
                  </p>
                  <p className="font-medium">
                    {specs && specs[k] != null ? String(specs[k]) : "—"}
                  </p>
                </div>
              ))}
              {/* Render any additional specs the product has */}
              {specs &&
                typeof specs === "object" &&
                Object.keys(specs)
                  .filter(
                    (k) =>
                      ![
                        "composition",
                        "consumption",
                        "coverage",
                        "dryingTime",
                        "layers",
                        "storage",
                      ].includes(k),
                  )
                  .map((key) => (
                    <div key={key} className="rounded-xl border bg-card p-4">
                      <p className="text-sm text-muted-foreground">
                        {SPEC_LABELS[key] ?? key}
                      </p>
                      <p className="font-medium">
                        {String((specs as any)[key])}
                      </p>
                    </div>
                  ))}
            </div>
          </TabsContent>

          <TabsContent value="usage" className="space-y-3">
            <p className="leading-relaxed text-muted-foreground">
              {product.application ||
                "Наносить на подготовленную сухую поверхность в 1–2 слоя. Перед применением тщательно перемешать и при необходимости разбавить до рабочей вязкости."}
            </p>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-3">
            <div id="reviews" className="scroll-mt-24">
              {reviews.length === 0 ? (
                <p className="text-muted-foreground">
                  Пока нет отзывов. Станьте первым!
                </p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((r) => (
                    <div key={r.id} className="rounded-xl border bg-card p-4">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={cn(
                                "size-4",
                                i < r.rating
                                  ? "fill-primary text-primary"
                                  : "text-muted-foreground/40",
                              )}
                            />
                          ))}
                        </div>
                        <p className="text-sm font-semibold">
                          {r.author || r.user?.name || "Покупатель"}
                          {" · "}
                          <span className="font-normal text-muted-foreground">
                            {formatDate(
                              r.date ||
                                (typeof r.createdAt === "string"
                                  ? r.createdAt
                                  : (r.createdAt?.toISOString?.() ?? "")),
                            )}
                          </span>
                        </p>
                      </div>
                      {r.text && (
                        <p className="mt-2 text-pretty text-muted-foreground">
                          {r.text}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <div className="mt-12 rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold">Калькулятор расхода</h2>
            <p className="text-sm text-muted-foreground">
              Площадь м² → литры → банки → цена
            </p>
          </div>
          <div className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            <Sparkles className="mr-1 inline size-4" />
            Подбор под проект
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_0.7fr]">
          <div className="space-y-4 rounded-2xl border bg-muted/20 p-4">
            <label className="block text-sm font-medium">
              Площадь поверхности, м²
              <input
                type="range"
                min="5"
                max="200"
                value={area}
                onChange={(e) => setArea(Number(e.target.value))}
                className="mt-3 w-full accent-primary"
              />
            </label>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>5 м²</span>
              <span className="font-semibold text-foreground">{area} м²</span>
              <span>200 м²</span>
            </div>
          </div>
          <div className="rounded-2xl border bg-card p-4">
            <p className="text-sm text-muted-foreground">Необходимо</p>
            <p className="mt-1 text-3xl font-bold">
              {litersNeeded.toFixed(1)} л
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              ≈ {cansNeeded} {cansNeeded === 1 ? "банка" : "банки"} по{" "}
              {selectedPackaging?.volume ?? 1} л
            </p>
            <p className="mt-4 text-lg font-semibold">
              Оценка: {formatPrice(calculatorTotal)}
            </p>
          </div>
        </div>
      </div>

      {/* Похожие товары */}
      {related.length > 0 && (
        <section className="mt-12">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-2xl font-bold">Похожие товары</h2>
            <Link
              href="/catalog"
              className="text-sm font-medium text-primary hover:underline"
            >
              Все товары
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* С этим покупают */}
      {accessories.length > 0 && (
        <section className="mt-12">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-2xl font-bold">С этим покупают</h2>
            <span className="text-sm text-muted-foreground">
              Аксессуары и расходники
            </span>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {accessories.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
