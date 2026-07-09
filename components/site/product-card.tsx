import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AddToCartButton } from "@/components/cart/add-to-cart";
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
        <div className="relative z-10 mt-auto flex flex-wrap gap-2 pt-3">
          <AddToCartButton slug={product.slug} size="sm" />
          <Button
            asChild
            size="sm"
            variant="outline"
            className="rounded-full border-camel-green-700 font-bold text-camel-green-700 hover:bg-camel-green-50 hover:text-camel-green-800"
          >
            <Link href={`/products/${product.slug}`}>
              View Details
              <ArrowRightIcon aria-hidden="true" />
            </Link>
          </Button>
          <Button
            asChild
            size="sm"
            variant="ghost"
            className="rounded-full font-bold text-concrete-800"
          >
            <Link href={`/calculator?product=${product.slug}`}>
              <CalculatorIcon aria-hidden="true" />
              Calculate
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
