import type { Metadata } from "next";
import Link from "next/link";
import { ProductCard } from "@/components/site/product-card";
import { getBagPriceTzs } from "@/lib/cart/pricing-server";
import { Section, SectionHeading, Eyebrow } from "@/components/site/section";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { products } from "@/lib/products";
import {
  ArrowDownIcon,
  ArrowRightIcon,
  CalculatorIcon,
  CompassIcon,
  InfoIcon,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Camel Cement Products | 32.5N, 32.5R, 42.5N and 42.5R",
  description:
    "Compare Camel Cement grades and choose the right product for masonry, structural concrete, precast work, roads, bridges, plastering and more.",
};

const stickyCellClasses =
  "sticky left-0 z-10 w-44 min-w-44 bg-white whitespace-normal align-top";

export default async function ProductsPage() {
  const priceTzs = await getBagPriceTzs();
  return (
    <>
      {/* Hero */}
      <Section surface="canvas" className="lg:py-28">
        <div className="container-site">
          <div className="max-w-3xl space-y-5">
            <Eyebrow>Our Products</Eyebrow>
            <h1 className="text-h1 text-balance text-concrete-950">
              Engineered for Every Construction Challenge
            </h1>
            <p className="text-lead text-concrete-800">
              Camel Cement offers four specialised grades designed for
              dependable strength, workability, durability and efficiency.
              Every product complies with EN 197 standards and is supported by
              clear application guidance and technical resources.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button
                asChild
                className="h-12 rounded-full bg-camel-green-700 px-6 font-bold text-white hover:bg-camel-green-800"
              >
                <Link href="/products/finder">
                  <CompassIcon aria-hidden="true" />
                  Find My Cement
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-12 rounded-full border-camel-green-700 px-6 font-bold text-camel-green-700 hover:bg-camel-green-50 hover:text-camel-green-800"
              >
                <Link href="#compare">
                  Compare the Range
                  <ArrowDownIcon aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </Section>

      {/* Product range */}
      <Section surface="white">
        <div className="container-site">
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {products.map((product, i) => (
              <ProductCard
                key={product.slug}
                product={product}
                priority={i < 2}
                priceTzs={priceTzs}
              />
            ))}
          </div>
        </div>
      </Section>

      {/* Comparison */}
      <Section surface="canvas" id="compare" className="scroll-mt-24">
        <div className="container-site space-y-10">
          <SectionHeading
            eyebrow="Side by Side"
            heading="Compare the Range"
            body="Use this comparison to understand the general role of each cement grade. Final product selection for structural work should follow the project specification and guidance from a qualified professional."
          />

          <div className="overflow-hidden rounded-[24px] border border-concrete-200 bg-white shadow-card">
            <Table className="min-w-[960px] text-[15px]">
              <TableHeader>
                <TableRow className="border-concrete-200 hover:bg-transparent">
                  <TableHead
                    scope="col"
                    className={`${stickyCellClasses} p-5 text-eyebrow text-concrete-600`}
                  >
                    Product
                  </TableHead>
                  {products.map((product) => (
                    <TableHead
                      key={product.slug}
                      scope="col"
                      className="min-w-52 whitespace-normal p-5 align-top"
                    >
                      <div className="space-y-2">
                        <Badge
                          className="rounded-full border-0 px-3 py-1 text-xs font-bold text-white"
                          style={{ backgroundColor: product.color }}
                        >
                          {product.grade}
                        </Badge>
                        <p className="text-base font-bold text-concrete-950">
                          {product.friendlyName}
                        </p>
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="border-concrete-200 hover:bg-transparent">
                  <TableHead scope="row" className={`${stickyCellClasses} p-5`}>
                    Classification
                  </TableHead>
                  {products.map((product) => (
                    <TableCell
                      key={product.slug}
                      className="whitespace-normal p-5 align-top text-concrete-800"
                    >
                      {product.classification}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow className="border-concrete-200 hover:bg-transparent">
                  <TableHead scope="row" className={`${stickyCellClasses} p-5`}>
                    Strength development
                  </TableHead>
                  {products.map((product) => (
                    <TableCell
                      key={product.slug}
                      className="whitespace-normal p-5 align-top text-concrete-800"
                    >
                      {product.strengthDevelopment}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow className="border-concrete-200 hover:bg-transparent">
                  <TableHead scope="row" className={`${stickyCellClasses} p-5`}>
                    Workability
                  </TableHead>
                  {products.map((product) => (
                    <TableCell
                      key={product.slug}
                      className="whitespace-normal p-5 align-top text-concrete-800"
                    >
                      {product.workability}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow className="border-concrete-200 hover:bg-transparent">
                  <TableHead scope="row" className={`${stickyCellClasses} p-5`}>
                    Primary applications
                  </TableHead>
                  {products.map((product) => (
                    <TableCell
                      key={product.slug}
                      className="whitespace-normal p-5 align-top leading-relaxed text-concrete-800"
                    >
                      {product.applications.slice(0, 4).join(", ")}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow className="border-concrete-200 hover:bg-transparent">
                  <TableHead scope="row" className={`${stickyCellClasses} p-5`}>
                    Bag size
                  </TableHead>
                  {products.map((product) => (
                    <TableCell
                      key={product.slug}
                      className="whitespace-normal p-5 align-top text-concrete-800"
                    >
                      {product.bagSize}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow className="hover:bg-transparent">
                  <TableHead scope="row" className={`${stickyCellClasses} p-5`}>
                    Next steps
                  </TableHead>
                  {products.map((product) => (
                    <TableCell
                      key={product.slug}
                      className="whitespace-normal p-5 align-top"
                    >
                      <div className="flex flex-col items-start gap-2">
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
                        <Button
                          asChild
                          size="sm"
                          className="rounded-full bg-camel-green-700 font-bold text-white hover:bg-camel-green-800"
                        >
                          <Link href={`/request-quote?product=${product.slug}`}>
                            Request Quote
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </div>

          <p className="flex max-w-3xl items-start gap-2.5 text-sm leading-relaxed text-concrete-600">
            <InfoIcon
              className="mt-0.5 size-4 shrink-0 text-camel-green-700"
              aria-hidden="true"
            />
            Final product selection for structural work should follow the
            project specification and guidance from a qualified professional.
          </p>
        </div>
      </Section>

      {/* Product finder CTA */}
      <Section surface="deep">
        <div className="container-site flex flex-col items-center gap-6 text-center">
          <SectionHeading
            onDark
            heading="Need Help Choosing?"
            body="Tell us what you are building and we will guide you towards the Camel Cement product that best matches the selected application."
            align="center"
          />
          <Button
            asChild
            size="lg"
            className="h-12 rounded-full bg-camel-yellow-500 px-7 font-bold text-camel-black hover:bg-camel-yellow-600"
          >
            <Link href="/products/finder">
              <CompassIcon aria-hidden="true" />
              Find My Cement
            </Link>
          </Button>
        </div>
      </Section>
    </>
  );
}
