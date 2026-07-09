"use client";

import Link from "next/link";
import { ShoppingCartIcon } from "lucide-react";
import { useCart } from "@/lib/cart/cart-context";
import { cn } from "@/lib/utils";

/**
 * Header cart icon with a live bag-count badge. Renders the badge only after
 * the cart has hydrated to stay hydration-safe. Pass `onDark` when the header
 * sits over a dark or transparent hero.
 */
export function CartButton({
  onDark = false,
  className,
}: {
  onDark?: boolean;
  className?: string;
}) {
  const { ready, totalBags } = useCart();
  const count = ready ? totalBags : 0;
  const showBadge = ready && totalBags > 0;

  return (
    <Link
      href="/cart"
      aria-label={`View cart, ${count} ${count === 1 ? "bag" : "bags"}`}
      className={cn(
        "relative inline-flex size-11 shrink-0 items-center justify-center rounded-full transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        onDark
          ? "text-white hover:bg-white/15 focus-visible:ring-white/50"
          : "text-concrete-950 hover:bg-concrete-100",
        className
      )}
    >
      <ShoppingCartIcon className="size-5" aria-hidden="true" />
      {showBadge ? (
        <span
          aria-hidden="true"
          className="absolute -top-0.5 -right-0.5 inline-flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-camel-yellow-500 px-1 text-[11px] leading-none font-bold tabular-nums text-camel-black"
        >
          {totalBags > 99 ? "99+" : totalBags}
        </span>
      ) : null}
    </Link>
  );
}
