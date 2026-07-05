'use client'

import { Button } from "@/components/ui/button";
import { Product, Packaging } from "@/lib/types";

export interface AddToCartButtonProps {
  product: Product;
  quantity?: number;
  selectedPackaging?: Packaging;
}

export function AddToCartButton({ product, quantity, selectedPackaging }: AddToCartButtonProps) {
  const handleAddToCart = () => {
    const qty = quantity || 1;
    // If no packaging is selected from props, default to the first one in the product's array.
    const packaging = selectedPackaging || (product.packaging && product.packaging[0]);

    // The button should be disabled if no packaging options are available, but this is a safeguard.
    if (!packaging) {
      console.error("Attempted to add to cart with no packaging option:", product);
      // Here you might want to show a toast notification to the user.
      return;
    }

    console.log("Added to cart:", {
      productId: product.id,
      quantity: qty,
      sku: packaging.sku, // This should now be safe to access.
    });
  };

  // Disable the button if the product has no packaging options.
  const isDisabled = !product.packaging || product.packaging.length === 0;

  return (
    <Button onClick={handleAddToCart} disabled={isDisabled} className="w-full">
      Добавить в корзину
    </Button>
  );
}
