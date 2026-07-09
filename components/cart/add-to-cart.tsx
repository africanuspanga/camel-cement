"use client";

import { toast } from "sonner";
import { ShoppingCartIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart/cart-context";
import { getProduct } from "@/lib/products";
import { cn } from "@/lib/utils";

/**
 * Yellow "Add to Cart" pill. `size="sm"` is the compact variant for product
 * cards; `size="lg"` is the prominent hero variant (48px tall).
 */
export function AddToCartButton({
  slug,
  size = "sm",
  className,
}: {
  slug: string;
  size?: "sm" | "lg";
  className?: string;
}) {
  const { addBags } = useCart();

  const handleClick = () => {
    addBags(slug, 1);
    const product = getProduct(slug);
    toast.success("Added to cart", {
      description: product
        ? `Camel Cement ${product.grade} ${product.friendlyName} — 1 × 50 kg bag`
        : "1 × 50 kg bag added to your order.",
    });
  };

  return (
    <Button
      type="button"
      size={size === "lg" ? "lg" : "sm"}
      onClick={handleClick}
      className={cn(
        "rounded-full bg-camel-yellow-500 font-bold text-camel-black hover:bg-camel-yellow-600",
        size === "lg" && "h-12 px-6",
        className
      )}
    >
      <ShoppingCartIcon aria-hidden="true" />
      Add to Cart
    </Button>
  );
}
