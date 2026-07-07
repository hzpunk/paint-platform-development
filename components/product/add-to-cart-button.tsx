"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/cart/cart-provider";
import { buildCartItem } from "@/lib/cart";
import { Product, Packaging } from "@/lib/types";
import { toast } from "sonner";
import { applyHzcompanyCommission } from "@/lib/productPricing";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Check, Palette } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AddToCartButtonProps {
  product: Product;
  quantity?: number;
  selectedPackaging?: Packaging;
  showQuantityControls?: boolean;
  selectedColorHex?: string | null;
}

type ColorOption = {
  hex: string;
  label: string;
  stock?: number | null;
};

export function AddToCartButton({
  product,
  quantity,
  selectedPackaging,
  showQuantityControls = false,
  selectedColorHex,
}: AddToCartButtonProps) {
  const { addItem, items, setQuantity, removeItem, keyOf } = useCart();
  const [isColorModalOpen, setIsColorModalOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState<ColorOption | null>(null);
  const [selectedQuantity, setSelectedQuantity] = useState(quantity ?? 1);

  const colorOptions = useMemo<ColorOption[]>(() => {
    const rawColors = Array.isArray(product.colors) ? product.colors : [];
    return rawColors
      .map((item, index) => {
        if (typeof item === "string") {
          const value = item.trim();
          return {
            hex: value,
            label: value || `Цвет ${index + 1}`,
          };
        }

        const hex = typeof item?.hex === "string" ? item.hex.trim() : "";
        const label =
          typeof item?.name === "string" && item.name.trim()
            ? item.name.trim()
            : hex || `Цвет ${index + 1}`;
        const stock =
          typeof item?.stock === "number" && Number.isFinite(item.stock)
            ? item.stock
            : null;

        return { hex, label, stock };
      })
      .filter((item) => item.hex || item.label);
  }, [product.colors]);
  const colorOptionsSignature = useMemo(
    () =>
      colorOptions
        .map((option) => `${option.hex}:${option.label}:${option.stock ?? ""}`)
        .join("|"),
    [colorOptions],
  );

  const requiresColorSelection = colorOptions.length > 1;
  const existingCartItem = useMemo(
    () =>
      items.find(
        (item) => item.productId === product.id || item.slug === product.slug,
      ) ?? null,
    [items, product.id, product.slug],
  );
  const existingCartKey = existingCartItem ? keyOf(existingCartItem) : null;
  const existingCartQuantity = existingCartItem?.quantity ?? 0;
  const selectedColorLabel = selectedColor?.label || selectedColor?.hex || null;
  const availableStockForSelectedColor = useMemo(() => {
    const baseStock =
      typeof selectedColor?.stock === "number" &&
      Number.isFinite(selectedColor.stock)
        ? selectedColor.stock
        : product.stock;

    if (typeof baseStock !== "number" || !Number.isFinite(baseStock))
      return null;

    const usedQty = items.reduce((sum, item) => {
      if (item.productId !== product.id) return sum;
      return item.color === selectedColorLabel ? sum + item.quantity : sum;
    }, 0);

    return Math.max(0, baseStock - usedQty);
  }, [
    items,
    product.id,
    product.stock,
    selectedColor?.stock,
    selectedColorLabel,
  ]);

  useEffect(() => {
    if (!requiresColorSelection) {
      setSelectedColor(null);
      return;
    }

    setSelectedColor((prev) => {
      if (selectedColorHex) {
        const matched = colorOptions.find(
          (option) =>
            option.hex === selectedColorHex ||
            option.label === selectedColorHex,
        );
        if (matched) {
          return matched;
        }
      }

      if (
        prev &&
        colorOptions.some(
          (option) => option.hex === prev.hex && option.label === prev.label,
        )
      ) {
        return prev;
      }

      return colorOptions[0] ?? null;
    });
  }, [colorOptionsSignature, requiresColorSelection, selectedColorHex]);

  useEffect(() => {
    setSelectedQuantity(quantity ?? 1);
  }, [quantity]);

  const addCurrentItem = (colorValue?: ColorOption | null) => {
    const qty = Math.max(1, selectedQuantity);
    const packaging =
      selectedPackaging ||
      (Array.isArray(product.packaging) && product.packaging.length > 0
        ? product.packaging[0]
        : {
            volume: 1,
            price: product.price,
            sku: `${product.id || product.slug}-default`,
          });

    const price = applyHzcompanyCommission(packaging.price ?? product.price) as number;
    const colorLabel = colorValue?.hex || colorValue?.label || null;
    const colorStock =
      typeof colorValue?.stock === "number" && Number.isFinite(colorValue.stock)
        ? colorValue.stock
        : product.stock;
    const usedQty = items.reduce((sum, item) => {
      if (item.productId !== product.id) return sum;
      return item.color === colorLabel ? sum + item.quantity : sum;
    }, 0);
    const availableStock =
      typeof colorStock === "number" && Number.isFinite(colorStock)
        ? Math.max(0, colorStock - usedQty)
        : null;

    if (availableStock !== null && availableStock <= 0) {
      toast.error("Для этого цвета нет остатков");
      return;
    }

    if (availableStock !== null && qty > availableStock) {
      toast.error(`Доступно только ${availableStock} шт`);
      return;
    }

    addItem(
      buildCartItem(
        product,
        {
          ...packaging,
          price,
          sku: packaging.sku || `${product.id || product.slug}-default`,
          volume: packaging.volume ?? 1,
        },
        qty,
        colorLabel,
        colorStock,
      ),
    );

    toast.success(`«${product.name}» добавлен в корзину`);
    setSelectedQuantity(1);
    if (requiresColorSelection) {
      setIsColorModalOpen(true);
    } else {
      setIsColorModalOpen(false);
    }
  };

  const handleAddToCart = () => {
    if (requiresColorSelection) {
      setIsColorModalOpen(true);
      return;
    }

    addCurrentItem(colorOptions[0] ?? null);
  };

  const handleIncreaseQuantity = () => {
    if (!existingCartKey) return;
    const stockCap = existingCartItem?.stock;
    if (
      typeof stockCap === "number" &&
      Number.isFinite(stockCap) &&
      existingCartQuantity >= stockCap
    ) {
      toast.error(`Доступно только ${stockCap} шт`);
      return;
    }
    setQuantity(existingCartKey, existingCartQuantity + 1);
    toast.success(`Количество «${product.name}» увеличено`);
  };

  const handleDecreaseQuantity = () => {
    if (!existingCartKey) return;
    if (existingCartQuantity <= 1) {
      removeItem(existingCartKey);
      toast.success(`«${product.name}» удалён из корзины`);
      return;
    }

    setQuantity(existingCartKey, existingCartQuantity - 1);
    toast.success(`Количество «${product.name}» уменьшено`);
  };

  const handleConfirmColor = () => {
    setIsColorModalOpen(false);
    addCurrentItem(selectedColor);
  };

  return (
    <>
      {showQuantityControls && existingCartQuantity > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/60 bg-background/80 px-3 py-2">
          <span className="text-sm font-medium">
            В корзине: {existingCartQuantity}
          </span>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleDecreaseQuantity}
            >
              −
            </Button>
            <span className="w-8 text-center text-sm font-semibold tabular-nums">
              {existingCartQuantity}
            </span>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleIncreaseQuantity}
            >
              +
            </Button>
          </div>
        </div>
      )}

      {showQuantityControls && requiresColorSelection && (
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsColorModalOpen(true)}
          className="w-full"
        >
          Другой цвет
        </Button>
      )}

      {!showQuantityControls && (
        <Button type="button" onClick={handleAddToCart} className="w-full">
          {requiresColorSelection ? "Выбрать цвет" : "Добавить в корзину"}
        </Button>
      )}

      <Dialog open={isColorModalOpen} onOpenChange={setIsColorModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Palette className="size-4" />
              Выберите цвет
            </DialogTitle>
            <DialogDescription>
              Для этого товара можно добавить несколько оттенков в корзину.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 px-3 py-2">
            <span className="text-sm font-medium">Количество</span>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() =>
                  setSelectedQuantity((value) => Math.max(1, value - 1))
                }
              >
                −
              </Button>
              <span className="w-8 text-center text-sm font-semibold tabular-nums">
                {selectedQuantity}
              </span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setSelectedQuantity((value) => value + 1)}
                disabled={
                  availableStockForSelectedColor !== null &&
                  selectedQuantity >= availableStockForSelectedColor
                }
              >
                +
              </Button>
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            {availableStockForSelectedColor !== null
              ? `Доступно: ${availableStockForSelectedColor} шт`
              : "Остаток уточняется"}
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {colorOptions.map((option) => {
              const isSelected =
                selectedColor?.hex === option.hex &&
                selectedColor?.label === option.label;
              return (
                <button
                  key={`${option.hex}-${option.label}`}
                  type="button"
                  onClick={() => setSelectedColor(option)}
                  className={cn(
                    "flex items-center justify-between rounded-lg border border-border/70 bg-background px-3 py-2 text-left transition-colors hover:border-primary",
                    isSelected && "border-primary bg-primary/5",
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span
                      className="size-5 rounded-full border border-border/60"
                      style={{ backgroundColor: option.hex || "#f1f5f9" }}
                    />
                    <span className="flex flex-col">
                      <span className="text-sm font-medium">
                        {option.label}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {typeof option.stock === "number"
                          ? `${option.stock} шт`
                          : "—"}
                      </span>
                    </span>
                  </span>
                  {isSelected && <Check className="size-4 text-primary" />}
                </button>
              );
            })}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsColorModalOpen(false)}
            >
              Отмена
            </Button>
            <Button type="button" onClick={handleConfirmColor}>
              Добавить в корзину
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
