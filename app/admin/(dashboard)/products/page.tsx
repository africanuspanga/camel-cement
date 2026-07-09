import type { Metadata } from "next";
import Image from "next/image";
import { Database } from "lucide-react";

import { PageHeader } from "@/components/admin/page-header";
import { PriceCard } from "@/components/admin/products/price-card";
import { ProductActiveSwitch } from "@/components/admin/product-active-switch";
import { getBagPriceTzs } from "@/lib/cart/pricing-server";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { products as fallbackProducts } from "@/lib/products";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Products",
};

const GRADE_CLASSES: Record<string, string> = {
  "42.5R": "bg-product-425r",
  "42.5N": "bg-product-425n",
  "32.5R": "bg-product-325r",
  "32.5N": "bg-product-325n",
};

interface ProductCardData {
  id: string | null; // null in fallback mode (not manageable)
  slug: string;
  grade: string;
  friendlyName: string;
  description: string;
  image: string | null;
  active: boolean;
  displayOrder: number;
}

export default async function ProductsPage() {
  const supabase = await createClient();
  const currentPrice = await getBagPriceTzs();

  let items: ProductCardData[] = [];
  let fromDatabase = false;

  if (supabase) {
    const { data } = await supabase
      .from("products")
      .select(
        "id, slug, grade, friendly_name, short_description, hero_image, active, display_order"
      )
      .order("display_order", { ascending: true });

    if (data && data.length > 0) {
      fromDatabase = true;
      items = data.map((row) => ({
        id: row.id as string,
        slug: row.slug as string,
        grade: row.grade as string,
        friendlyName: row.friendly_name as string,
        description: (row.short_description as string | null) ?? "",
        image: row.hero_image as string | null,
        active: row.active as boolean,
        displayOrder: row.display_order as number,
      }));
    }
  }

  if (!fromDatabase) {
    items = fallbackProducts.map((product, index) => ({
      id: null,
      slug: product.slug,
      grade: product.grade,
      friendlyName: product.friendlyName,
      description: product.description,
      image: product.image,
      active: true,
      displayOrder: index + 1,
    }));
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Products"
        description="The four Camel Cement grades shown on the public website. Toggle visibility without deleting anything."
      />

      <PriceCard currentPrice={currentPrice} />

      {!fromDatabase && (
        <Alert className="border-amber-300 bg-amber-50 text-amber-900">
          <Database className="size-4 text-amber-600" />
          <AlertTitle>Showing built-in catalogue</AlertTitle>
          <AlertDescription className="text-amber-800">
            Seed the database to manage products — run{" "}
            <code className="font-mono">scripts/seed-content.ts</code> and this
            page will switch to live rows with visibility controls.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {items.map((product) => (
          <Card
            key={product.slug}
            className="gap-0 overflow-hidden rounded-2xl border-concrete-200 bg-white py-0 shadow-none"
          >
            <div className="relative flex h-44 items-center justify-center bg-concrete-50">
              {product.image ? (
                <Image
                  src={product.image}
                  alt={`${product.grade} ${product.friendlyName} bag`}
                  width={150}
                  height={165}
                  className="h-36 w-auto object-contain"
                />
              ) : (
                <span className="text-sm text-muted-foreground">No image</span>
              )}
              <span
                className={cn(
                  "absolute top-3 left-3 rounded-full px-2.5 py-1 text-xs font-bold text-white",
                  GRADE_CLASSES[product.grade] ?? "bg-camel-green-800"
                )}
              >
                {product.grade}
              </span>
              <span className="absolute top-3 right-3 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-semibold text-concrete-600 tabular-nums ring-1 ring-concrete-200">
                #{product.displayOrder}
              </span>
            </div>
            <div className="flex flex-1 flex-col gap-2 p-4">
              <div>
                <h2 className="text-sm font-bold text-foreground">
                  {product.friendlyName}
                </h2>
                <p className="mt-1 line-clamp-2 text-[13px] leading-snug text-muted-foreground">
                  {product.description}
                </p>
              </div>
              <div className="mt-auto flex items-center justify-between border-t border-concrete-200 pt-3">
                <span className="font-mono text-xs text-muted-foreground">
                  /{product.slug}
                </span>
                {product.id ? (
                  <ProductActiveSwitch
                    id={product.id}
                    name={product.friendlyName}
                    active={product.active}
                  />
                ) : (
                  <span className="text-xs font-medium text-muted-foreground">
                    Preview
                  </span>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
