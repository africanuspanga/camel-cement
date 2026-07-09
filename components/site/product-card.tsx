import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AddToCartButton } from "@/components/cart/add-to-cart";
import { PRICE_PER_BAG_TZS, formatTzs } from "@/lib/cart/pricing";
import type { Product } from "@/lib/products";
import { ArrowRightIcon, CalculatorIcon } from "lucide-react";

export function ProductCard({
  product,
  priority = false,
}: {
  product: Product;
  priority?: boolean;
}) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-[18px] border border-concrete-200 bg-white shadow-card transition-all duration-[220ms] hover:-translate-y-[3px] hover:border-camel-green-200 hover:shadow-raised">
      {/* Product identity strip */}
      <div
        aria-hidden="true"
        className="h-1.5 w-full"
        style={{ backgroundColor: product.color }}
      />
      <div className="flex items-center justify-center bg-concrete-50 p-6">
        <Image
          src={product.image}
          alt={`Camel Cement ${product.grade} 50 kg bag`}
          width={280}
          height={280}
          priority={priority}
          className="h-44 w-auto object-contain drop-shadow-[0_16px_16px_rgba(20,31,23,0.15)] transition-transform duration-[220ms] group-hover:scale-[1.025] md:h-52"
        />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-6">
        <div className="flex items-center gap-2">
          <Badge
            className="rounded-full border-0 px-2.5 py-0.5 text-xs font-bold text-white"
            style={{ backgroundColor: product.color }}
          >
            {product.grade}
          </Badge>
          <span className="text-xs font-semibold text-concrete-600">
            {product.bagSize} bag
          </span>
        </div>
        <h3 className="text-xl font-bold text-concrete-950">
          <Link
            href={`/products/${product.slug}`}
            className="after:absolute after:inset-0"
          >
            {product.friendlyName}
          </Link>
        </h3>
        <p className="text-sm leading-relaxed text-concrete-800">
          {product.description}
        </p>
        <p className="text-sm text-concrete-600">
          <span className="font-semibold text-concrete-800">Best for:</span>{" "}
          {product.bestFor}
        </p>
        <div className="relative z-10 mt-auto space-y-3.5 border-t border-concrete-100 pt-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xl font-extrabold tabular-nums leading-none text-concrete-950">
                {formatTzs(PRICE_PER_BAG_TZS)}
              </p>
              <p className="mt-1 text-xs font-medium text-concrete-600">
                per 50 kg bag
              </p>
            </div>
            <Link
              href={`/calculator?product=${product.slug}`}
              className="inline-flex min-h-11 items-center gap-1.5 text-sm font-bold text-camel-green-700 transition-colors hover:text-camel-green-800"
            >
              <CalculatorIcon className="size-4" aria-hidden="true" />
              Calculate
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <AddToCartButton
              slug={product.slug}
              size="sm"
              className="h-11 w-full"
            />
            <Button
              asChild
              variant="outline"
              className="h-11 w-full rounded-full border-camel-green-700 font-bold text-camel-green-700 hover:bg-camel-green-50 hover:text-camel-green-800"
            >
              <Link href={`/products/${product.slug}`}>
                View Details
                <ArrowRightIcon aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
