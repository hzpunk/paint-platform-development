"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useToast } from "./toast-provider";
import { useLanguage } from "./language-provider";
import { LoadingSpinner } from "./loading-spinner";
import { Box, Layers, Tag, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { applyHzcompanyCommission } from "@/lib/productPricing";

interface ProductColor {
  hex: string;
  name: string;
  stock?: number | null;
}

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  updatedAt: string;
  category: { name: string };
  brand: { name: string };
  images?: string[];
  rating?: number;
  reviewsCount?: number;
  slug?: string;
  colors?: Array<string | { hex?: string; name?: string }>;
}

export default function AdminProducts() {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/products", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to load products");
      const data = await response.json();
      setProducts(data || []);
    } catch (error) {
      console.error(error);
      showToast("Не удалось загрузить товары", "destructive");
    } finally {
      setLoading(false);
    }
  };

  const normalizeColors = (value: Product["colors"]) => {
    if (!Array.isArray(value)) return [] as ProductColor[];

    return value
      .map((item) => {
        if (typeof item === "string") {
          const hex = item.trim();
          return hex ? { hex, name: hex } : null;
        }

        if (item && typeof item === "object") {
          const hex = typeof item.hex === "string" ? item.hex.trim() : "";
          const name =
            typeof item.name === "string" && item.name.trim()
              ? item.name.trim()
              : hex;
          const stockValue =
            typeof item.stock === "number"
              ? item.stock
              : typeof item.stock === "string" && item.stock.trim()
                ? Number(item.stock)
                : null;

          return hex
            ? {
                hex,
                name: name || hex,
                stock: Number.isFinite(stockValue) ? stockValue : null,
              }
            : null;
        }

        return null;
      })
      .filter((item): item is ProductColor => Boolean(item));
  };

  const filtered = products.filter((product) => {
    const term = search.toLowerCase().trim();
    if (!term) return true;
    return (
      product.name.toLowerCase().includes(term) ||
      product.category.name.toLowerCase().includes(term) ||
      product.brand.name.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Товары</h1>
          <p className="text-sm text-muted-foreground">
            Список всех товаров, доступных на сайте.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Input
            placeholder="Поиск по названию, категории или бренду"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <Button
            variant="outline"
            onClick={fetchProducts}
            className="min-w-[140px]"
          >
            Обновить
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-14">
          <LoadingSpinner />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-8 text-center">
          <CardTitle className="text-lg font-semibold">
            Товары не найдены
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Попробуйте изменить фильтр.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          <div className="flex justify-end">
            <Link href="/admin/products/new">
              <Button>Добавить товар</Button>
            </Link>
          </div>
          {filtered.map((product) => (
            <Card key={product.id} className="border-border/70">
              <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-6">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded overflow-hidden bg-muted">
                    {product.images && product.images[0] ? (
                      // use next/image for improved loading
                      // eslint-disable-next-line @next/next/no-img-element
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        width={80}
                        height={80}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full text-muted-foreground">
                        <Box className="h-6 w-6" />
                      </div>
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    <div className="mt-1 text-sm text-muted-foreground">
                      ID: {product.id}
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {product.brand.name} · {product.category.name}
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-sm">
                      <Star className="h-4 w-4 text-amber-400" />
                      <span className="font-medium">
                        {(product.rating ?? 0).toFixed(1)}
                      </span>
                      <span className="text-muted-foreground">
                        ({product.reviewsCount ?? 0})
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 text-sm text-muted-foreground">
                  <div className="text-lg font-semibold">
                    {applyHzcompanyCommission(product.price).toLocaleString("ru-RU")} ₽
                  </div>
                  <div>Остаток: {product.stock}</div>
                  <div className="flex gap-2">
                    <Link href={`/admin/products/${product.id}`}>
                      <Button size="sm">Редактировать</Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        navigator.clipboard?.writeText(
                          location.origin +
                            `/product/${product.slug ?? product.id}`,
                        )
                      }
                    >
                      Открыть
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                {normalizeColors(product.colors).length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {normalizeColors(product.colors).map((color, index) => (
                      <div
                        key={`${product.id}-${color.hex}-${index}`}
                        className="flex items-center gap-2 rounded-full border border-border/70 bg-background px-2.5 py-1"
                      >
                        <span
                          className="size-3 rounded-full border border-border/60"
                          style={{ backgroundColor: color.hex || "#f1f5f9" }}
                        />
                        <span className="text-xs font-medium text-foreground">
                          {color.name}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {color.stock ?? product.stock} шт
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                <div>
                  Обновлено:{" "}
                  {new Date(product.updatedAt).toLocaleString("ru-RU")}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
