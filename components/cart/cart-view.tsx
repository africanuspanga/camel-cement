"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Section } from "@/components/site/section";
import { AddToCartButton } from "@/components/cart/add-to-cart";
import { useCart } from "@/lib/cart/cart-context";
import {
  MAX_BAGS,
  formatBagsWeight,
  formatTzs,
} from "@/lib/cart/pricing";
import { products, type Product } from "@/lib/products";
import {
  ArrowRightIcon,
  CreditCardIcon,
  MinusIcon,
  PlusIcon,
  ShoppingCartIcon,
  Trash2Icon,
} from "lucide-react";

/* ── Quantity input ─────────────────────────────────────────── */

function QtyInput({
  slug,
  qty,
  name,
}: {
  slug: string;
  qty: number;
  name: string;
}) {
  const { setBags } = useCart();
  const [draft, setDraft] = React.useState<string | null>(null);

  const commit = () => {
    if (draft !== null) {
      const parsed = Number.parseInt(draft, 10);
      if (Number.isFinite(parsed) && parsed >= 1) {
        setBags(slug, Math.min(parsed, MAX_BAGS));
      }
    }
    setDraft(null);
  };

  return (
    <Input
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      autoComplete="off"
      value={draft ?? String(qty)}
      onChange={(event) => setDraft(event.target.value.replace(/\D/g, ""))}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === "Enter") event.currentTarget.blur();
      }}
      aria-label={`Quantity of ${name} in 50 kg bags`}
      className="h-11 w-20 rounded-full border-concrete-300 bg-white text-center text-base font-bold tabular-nums"
    />
  );
}

/* ── Line item row ──────────────────────────────────────────── */

const qtyButtonClasses =
  "size-11 rounded-full border-concrete-300 bg-white text-concrete-800 hover:bg-concrete-100 hover:text-concrete-950";

function CartLine({
  product,
  qty,
  pricePerBag,
}: {
  product: Product;
  qty: number;
  pricePerBag: number;
}) {
  const { addBags, setBags, remove } = useCart();

  return (
    <li className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-[18px] border border-concrete-200 bg-white p-4 shadow-card sm:p-5">
      <div className="flex size-20 shrink-0 items-center justify-center rounded-xl bg-concrete-50 p-2">
        <Image
          src={product.image}
          alt={`Camel Cement ${product.grade} 50 kg bag`}
          width={80}
          height={80}
          className="h-16 w-auto object-contain"
        />
      </div>

      <div className="min-w-36 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            className="rounded-full border-0 px-2.5 py-0.5 text-xs font-bold text-white"
            style={{ backgroundColor: product.color }}
          >
            {product.grade}
          </Badge>
          <span className="text-xs font-semibold text-concrete-600">
            50 kg bag
          </span>
        </div>
        <p className="mt-1.5 font-bold text-concrete-950">
          <Link
            href={`/products/${product.slug}`}
            className="hover:text-camel-green-700"
          >
            {product.friendlyName}
          </Link>
        </p>
        <p className="mt-0.5 text-sm text-concrete-600">
          <span className="tabular-nums">{formatTzs(pricePerBag)}</span> per
          bag
        </p>
      </div>

      <div className="flex items-center gap-1.5">
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label={
            qty <= 1
              ? `Remove ${product.friendlyName} from cart`
              : `Decrease quantity of ${product.friendlyName}`
          }
          className={qtyButtonClasses}
          onClick={() => (qty <= 1 ? remove(product.slug) : setBags(product.slug, qty - 1))}
        >
          {qty <= 1 ? (
            <Trash2Icon aria-hidden="true" />
          ) : (
            <MinusIcon aria-hidden="true" />
          )}
        </Button>
        <QtyInput slug={product.slug} qty={qty} name={product.friendlyName} />
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label={`Increase quantity of ${product.friendlyName}`}
          className={qtyButtonClasses}
          disabled={qty >= MAX_BAGS}
          onClick={() => addBags(product.slug, 1)}
        >
          <PlusIcon aria-hidden="true" />
        </Button>
      </div>

      <p className="w-32 text-right text-base font-bold tabular-nums text-concrete-950 max-sm:ml-auto sm:w-36">
        {formatTzs(qty * pricePerBag)}
      </p>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={`Remove ${product.friendlyName} from cart`}
        className="size-11 rounded-full text-concrete-600 hover:bg-red-50 hover:text-red-700"
        onClick={() => remove(product.slug)}
      >
        <Trash2Icon aria-hidden="true" />
      </Button>
    </li>
  );
}

/* ── Empty state ────────────────────────────────────────────── */

function EmptyCart({ pricePerBag }: { pricePerBag: number }) {
  return (
    <div className="mx-auto max-w-xl rounded-[24px] border border-concrete-200 bg-concrete-50 px-6 py-14 text-center md:py-16">
      <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-camel-green-50 text-camel-green-700">
        <ShoppingCartIcon className="size-7" aria-hidden="true" />
      </div>
      <h2 className="mt-5 text-h3 text-concrete-950">Your cart is empty</h2>
      <p className="mx-auto mt-3 max-w-sm text-[15px] leading-relaxed text-concrete-800">
        Add bags of any Camel Cement grade and we will put together your order
        — every grade is {formatTzs(pricePerBag)} per 50 kg bag.
      </p>
      <Button
        asChild
        size="lg"
        className="mt-7 h-12 rounded-full bg-camel-green-700 px-7 font-bold text-white hover:bg-camel-green-800"
      >
        <Link href="/products">
          Browse Products
          <ArrowRightIcon aria-hidden="true" />
        </Link>
      </Button>
    </div>
  );
}

/* ── Loading skeleton (pre-hydration) ───────────────────────── */

function CartSkeleton() {
  return (
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
      <div className="space-y-4">
        <Skeleton className="h-28 w-full rounded-[18px] bg-concrete-100" />
        <Skeleton className="h-28 w-full rounded-[18px] bg-concrete-100" />
      </div>
      <Skeleton className="h-80 w-full rounded-[24px] bg-concrete-100" />
    </div>
  );
}

/* ── Cart view ──────────────────────────────────────────────── */

export function CartView({ pricePerBag }: { pricePerBag: number }) {
  const { ready, items, totalBags } = useCart();
  const [payOpen, setPayOpen] = React.useState(false);

  const lineItems = products.flatMap((product) => {
    const item = items.find((entry) => entry.slug === product.slug);
    return item ? [{ product, qty: item.qty }] : [];
  });
  const suggestions = products.filter(
    (product) => !items.some((entry) => entry.slug === product.slug)
  );
  const subtotal = totalBags * pricePerBag;

  return (
    <Section surface="white" className="pt-10 md:pt-12 lg:pt-14">
      <div className="container-site">
        {!ready ? (
          <CartSkeleton />
        ) : lineItems.length === 0 ? (
          <EmptyCart pricePerBag={pricePerBag} />
        ) : (
          <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
            {/* Line items + suggestions */}
            <div className="space-y-10">
              <ul className="space-y-4">
                {lineItems.map(({ product, qty }) => (
                  <CartLine
                    key={product.slug}
                    product={product}
                    qty={qty}
                    pricePerBag={pricePerBag}
                  />
                ))}
              </ul>

              {suggestions.length > 0 ? (
                <div className="space-y-4">
                  <h2 className="text-lg font-bold text-concrete-950">
                    You may also need
                  </h2>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {suggestions.map((product) => (
                      <div
                        key={product.slug}
                        className="flex items-center gap-3 rounded-[18px] border border-concrete-200 bg-white p-3 shadow-card"
                      >
                        <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-concrete-50 p-1.5">
                          <Image
                            src={product.image}
                            alt={`Camel Cement ${product.grade} 50 kg bag`}
                            width={56}
                            height={56}
                            className="h-11 w-auto object-contain"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-concrete-950">
                            {product.friendlyName}
                          </p>
                          <p className="text-xs font-semibold tabular-nums text-concrete-600">
                            Grade {product.grade} · {formatTzs(pricePerBag)}
                          </p>
                        </div>
                        <AddToCartButton
                          slug={product.slug}
                          size="sm"
                          className="h-11 shrink-0 px-4"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            {/* Order summary */}
            <aside className="rounded-[24px] border border-concrete-200 bg-concrete-50 p-6 md:p-8 lg:sticky lg:top-24">
              <h2 className="text-h3 text-concrete-950">Order Summary</h2>
              <dl className="mt-6 space-y-3.5 text-[15px]">
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-concrete-800">Total bags</dt>
                  <dd className="font-bold tabular-nums text-concrete-950">
                    {totalBags.toLocaleString("en-US")}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-concrete-800">Estimated weight</dt>
                  <dd className="font-bold tabular-nums text-concrete-950">
                    {formatBagsWeight(totalBags)}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4 border-t border-concrete-200 pt-4">
                  <dt className="font-bold text-concrete-950">Subtotal</dt>
                  <dd className="text-xl font-bold tabular-nums text-concrete-950">
                    {formatTzs(subtotal)}
                  </dd>
                </div>
              </dl>
              <p className="mt-4 text-sm leading-relaxed text-concrete-600">
                Delivery charges confirmed by our sales team.
              </p>
              <Button
                type="button"
                size="lg"
                onClick={() => setPayOpen(true)}
                className="mt-6 h-12 w-full rounded-full bg-camel-yellow-500 font-bold text-camel-black hover:bg-camel-yellow-600"
              >
                <CreditCardIcon aria-hidden="true" />
                Pay Now
              </Button>
              <p className="mt-4 text-center text-sm">
                <Link
                  href="/request-quote"
                  className="font-bold text-camel-green-700 underline underline-offset-4 hover:text-camel-green-800"
                >
                  Request a Quote instead
                </Link>
              </p>
            </aside>
          </div>
        )}
      </div>

      {/* Payments coming soon */}
      <Dialog open={payOpen} onOpenChange={setPayOpen}>
        <DialogContent className="gap-5 rounded-[24px] p-6 sm:max-w-md">
          <DialogHeader className="items-start gap-3">
            <div className="flex size-12 items-center justify-center rounded-full bg-camel-yellow-50 text-camel-yellow-700">
              <CreditCardIcon className="size-6" aria-hidden="true" />
            </div>
            <DialogTitle className="text-lg font-bold text-concrete-950">
              Payments coming soon
            </DialogTitle>
            <DialogDescription className="text-[15px] leading-relaxed text-concrete-800">
              Online card and mobile money payments are on the way. In the
              meantime, submit your cart as an order request and our sales
              team will confirm the final price and delivery with you.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="-mx-6 -mb-6 rounded-b-[24px] p-6 sm:justify-stretch">
            <Button
              asChild
              variant="outline"
              className="h-12 flex-1 rounded-full border-camel-green-700 font-bold text-camel-green-700 hover:bg-camel-green-50 hover:text-camel-green-800"
            >
              <Link href="/products">Keep Shopping</Link>
            </Button>
            <Button
              asChild
              className="h-12 flex-1 rounded-full bg-camel-green-700 font-bold text-white hover:bg-camel-green-800"
            >
              <Link href="/order">
                Submit as Order Request
                <ArrowRightIcon aria-hidden="true" />
              </Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Section>
  );
}
