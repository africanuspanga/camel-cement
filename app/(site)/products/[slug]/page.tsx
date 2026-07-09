import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/site/product-card";
import { Section, SectionHeading, Eyebrow } from "@/components/site/section";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@/components/ui/table";
import { getProduct, products } from "@/lib/products";
import { JsonLd, productJsonLd } from "@/lib/seo";
import { AddToCartButton } from "@/components/cart/add-to-cart";
import { formatTzs } from "@/lib/cart/pricing";
import { getBagPriceTzs } from "@/lib/cart/pricing-server";
import {
  ArrowRightIcon,
  CalculatorIcon,
  CheckCircle2Icon,
  CheckIcon,
  FileDownIcon,
  HardHatIcon,
  HeadsetIcon,
  MapPinIcon,
  ScaleIcon,
  WarehouseIcon,
} from "lucide-react";

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return {};
  return {
    title: product.seoTitle,
    description: product.seoDescription,
  };
}

// Price is fetched at render; regenerate periodically so admin price edits show
export const revalidate = 300;

const tabTriggerClasses =
  "h-auto flex-none rounded-full px-5 py-2.5 text-sm font-bold text-concrete-800 data-active:bg-camel-green-700 data-active:text-white data-active:shadow-none";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();
  const priceTzs = await getBagPriceTzs();

  const compareProduct = getProduct(product.compareWith);
  const relatedProducts = products.filter((p) => p.slug !== product.slug);

  const specRows = [
    { label: "Classification", value: product.classification },
    { label: "Strength class", value: product.grade },
    { label: "Early strength", value: product.strengthDevelopment },
    { label: "Bag size", value: product.bagSize },
    { label: "Standard", value: "EN 197" },
  ];

  const relatedActions = [
    {
      icon: FileDownIcon,
      label: "Download technical datasheet",
      href: "/resources",
    },
    ...(compareProduct
      ? [
          {
            icon: ScaleIcon,
            label: `Compare with Grade ${compareProduct.grade}`,
            href: "/products#compare",
          },
        ]
      : []),
    {
      icon: CalculatorIcon,
      label: "Calculate project requirements",
      href: `/calculator?product=${product.slug}`,
    },
    { icon: MapPinIcon, label: "Find a dealer", href: "/dealers" },
    {
      icon: HeadsetIcon,
      label: "Request technical support",
      href: "/contact",
    },
  ];

  return (
    <>
      <JsonLd data={productJsonLd(product)} />

      {/* Hero */}
      <Section surface="white" className="pt-8 md:pt-12 lg:pt-14">
        <div className="container-site space-y-10">
          <Breadcrumb>
            <BreadcrumbList className="text-concrete-600">
              <BreadcrumbItem>
                <BreadcrumbLink asChild className="hover:text-camel-green-700">
                  <Link href="/">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild className="hover:text-camel-green-700">
                  <Link href="/products">Products</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="font-semibold text-concrete-950">
                  {product.grade}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
            <div className="relative lg:col-span-5">
              <div className="relative flex items-center justify-center rounded-[24px] bg-concrete-50 p-10 md:p-14">
                <Badge
                  className="absolute left-6 top-6 rounded-full border-0 px-3.5 py-1.5 text-sm font-bold text-white"
                  style={{ backgroundColor: product.color }}
                >
                  {product.grade}
                </Badge>
                <Image
                  src={product.image}
                  alt={`Camel Cement ${product.grade} ${product.bagSize} bag`}
                  width={520}
                  height={520}
                  priority
                  className="h-72 w-auto object-contain drop-shadow-[0_28px_28px_rgba(20,31,23,0.2)] md:h-96"
                />
              </div>
            </div>
            <div className="space-y-5 lg:col-span-7">
              <Eyebrow>{product.eyebrow}</Eyebrow>
              <h1 className="text-h1 text-balance text-concrete-950">
                Camel Cement Grade {product.grade}
              </h1>
              <p className="text-h3 text-camel-green-700">
                {product.friendlyName}
              </p>
              <p className="max-w-2xl text-lead text-concrete-800">
                {product.heroBody}
              </p>
              <dl className="flex flex-wrap gap-x-8 gap-y-3 border-y border-concrete-200 py-4">
                <div>
                  <dt className="text-eyebrow text-concrete-600">
                    Classification
                  </dt>
                  <dd className="mt-1 text-sm font-bold text-concrete-950">
                    {product.classification}
                  </dd>
                </div>
                <div>
                  <dt className="text-eyebrow text-concrete-600">
                    Strength development
                  </dt>
                  <dd className="mt-1 text-sm font-bold text-concrete-950">
                    {product.strengthDevelopment}
                  </dd>
                </div>
                <div>
                  <dt className="text-eyebrow text-concrete-600">Bag size</dt>
                  <dd className="mt-1 text-sm font-bold text-concrete-950">
                    {product.bagSize}
                  </dd>
                </div>
              </dl>
              <div>
                <p className="text-2xl font-bold tabular-nums text-concrete-950">
                  {formatTzs(priceTzs)}{" "}
                  <span className="text-base font-semibold text-concrete-800">
                    per 50 kg bag
                  </span>
                </p>
                <p className="mt-1 text-sm text-concrete-600">
                  VAT and delivery confirmed at checkout.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <AddToCartButton slug={product.slug} size="lg" />
                <Button
                  asChild
                  size="lg"
                  className="h-12 rounded-full bg-camel-green-700 px-6 font-bold text-white hover:bg-camel-green-800"
                >
                  <Link href={`/request-quote?product=${product.slug}`}>
                    Request a Quote
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-12 rounded-full border-camel-green-700 px-6 font-bold text-camel-green-700 hover:bg-camel-green-50 hover:text-camel-green-800"
                >
                  <Link href={`/calculator?product=${product.slug}`}>
                    <CalculatorIcon aria-hidden="true" />
                    Calculate Quantity
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Product information tabs */}
      <Section surface="canvas">
        <div className="container-site">
          <Tabs defaultValue="overview" className="gap-8">
            <TabsList className="h-auto w-full flex-wrap justify-start gap-1.5 rounded-full border border-concrete-200 bg-white p-1.5 sm:w-fit">
              <TabsTrigger value="overview" className={tabTriggerClasses}>
                Overview
              </TabsTrigger>
              <TabsTrigger value="applications" className={tabTriggerClasses}>
                Applications
              </TabsTrigger>
              <TabsTrigger value="technical" className={tabTriggerClasses}>
                Technical Data
              </TabsTrigger>
              <TabsTrigger value="storage" className={tabTriggerClasses}>
                Storage and Safety
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="rounded-[24px] border border-concrete-200 bg-white p-8 shadow-card md:p-10">
                <h2 className="text-h3 text-concrete-950">Key Features</h2>
                <ul className="mt-6 grid gap-4 md:grid-cols-2">
                  {product.keyFeatures.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-3 text-[15px] leading-relaxed text-concrete-800"
                    >
                      <CheckCircle2Icon
                        className="mt-0.5 size-5 shrink-0 text-camel-green-700"
                        aria-hidden="true"
                      />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </TabsContent>

            <TabsContent value="applications">
              <div className="rounded-[24px] border border-concrete-200 bg-white p-8 shadow-card md:p-10">
                <h2 className="text-h3 text-concrete-950">
                  Primary Applications
                </h2>
                <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {product.applications.map((application) => (
                    <li
                      key={application}
                      className="flex items-center gap-3 rounded-[18px] border border-concrete-200 bg-concrete-50 px-4 py-3.5 text-[15px] font-medium text-concrete-950"
                    >
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-camel-green-50 text-camel-green-700">
                        <CheckIcon className="size-3.5" aria-hidden="true" />
                      </span>
                      {application}
                    </li>
                  ))}
                </ul>
              </div>
            </TabsContent>

            <TabsContent value="technical">
              <div className="rounded-[24px] border border-concrete-200 bg-white p-8 shadow-card md:p-10">
                <h2 className="text-h3 text-concrete-950">
                  Technical Specifications
                </h2>
                <div className="mt-6 overflow-hidden rounded-[18px] border border-concrete-200">
                  <Table className="text-[15px]">
                    <TableBody>
                      {specRows.map((row) => (
                        <TableRow
                          key={row.label}
                          className="border-concrete-200 hover:bg-transparent"
                        >
                          <TableHead
                            scope="row"
                            className="w-1/2 whitespace-normal bg-concrete-50 p-4 font-semibold text-concrete-800 sm:w-64"
                          >
                            {row.label}
                          </TableHead>
                          <TableCell className="whitespace-normal p-4 font-bold text-concrete-950">
                            {row.value}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <p className="mt-5 text-sm leading-relaxed text-concrete-600">
                  Full technical datasheets and product documents are available
                  in our{" "}
                  <Link
                    href="/resources"
                    className="font-bold text-camel-green-700 underline underline-offset-4 hover:text-camel-green-800"
                  >
                    resource centre
                  </Link>
                  .
                </p>
              </div>
            </TabsContent>

            <TabsContent value="storage">
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-[24px] border border-concrete-200 bg-white p-8 shadow-card md:p-10">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-camel-green-50 text-camel-green-700">
                    <WarehouseIcon className="size-5.5" aria-hidden="true" />
                  </div>
                  <h2 className="mt-4 text-h3 text-concrete-950">
                    Storage Guidance
                  </h2>
                  <p className="mt-4 text-[15px] leading-relaxed text-concrete-800">
                    {product.storage}
                  </p>
                </div>
                <div className="rounded-[24px] border border-concrete-200 bg-white p-8 shadow-card md:p-10">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-camel-yellow-50 text-camel-yellow-700">
                    <HardHatIcon className="size-5.5" aria-hidden="true" />
                  </div>
                  <h2 className="mt-4 text-h3 text-concrete-950">
                    Safety on Site
                  </h2>
                  <p className="mt-4 text-[15px] leading-relaxed text-concrete-800">
                    Wear suitable protective equipment when handling cement,
                    including gloves, eye protection, covered clothing and a
                    dust mask in dusty conditions. Avoid direct contact with
                    skin and eyes, wash exposed skin after handling and seek
                    medical advice if cement enters the eyes.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </Section>

      {/* Why choose band */}
      <Section surface="deep">
        <div className="container-site">
          <SectionHeading
            onDark
            eyebrow="The Right Fit"
            heading={`Why choose ${product.grade}`}
            body={product.whyChoose}
          />
        </div>
      </Section>

      {/* Related actions */}
      <Section surface="white">
        <div className="container-site space-y-8">
          <SectionHeading
            eyebrow="Next Steps"
            heading="Put This Product to Work"
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {relatedActions.map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="group flex flex-col gap-4 rounded-[18px] border border-concrete-200 bg-white p-5 shadow-[0_1px_2px_rgba(20,31,23,0.05)] transition-all duration-[220ms] hover:-translate-y-[3px] hover:border-camel-green-200 hover:shadow-card"
              >
                <div className="flex size-10 items-center justify-center rounded-xl bg-camel-green-50 text-camel-green-700">
                  <action.icon className="size-5" aria-hidden="true" />
                </div>
                <span className="text-[15px] font-bold leading-snug text-concrete-950">
                  {action.label}
                </span>
                <ArrowRightIcon
                  className="mt-auto size-4 text-concrete-400 transition-transform duration-150 group-hover:translate-x-1 group-hover:text-camel-green-700"
                  aria-hidden="true"
                />
              </Link>
            ))}
          </div>
        </div>
      </Section>

      {/* Related products */}
      <Section surface="canvas">
        <div className="container-site space-y-10">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading
              eyebrow="Explore the Range"
              heading="Other Camel Cement Grades"
            />
            <Button
              asChild
              variant="outline"
              className="rounded-full border-camel-green-700 font-bold text-camel-green-700 hover:bg-camel-green-50 hover:text-camel-green-800"
            >
              <Link href="/products#compare">
                Compare All Grades
                <ArrowRightIcon aria-hidden="true" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {relatedProducts.map((related) => (
              <ProductCard key={related.slug} product={related} priceTzs={priceTzs} />
            ))}
          </div>
        </div>
      </Section>
    </>
  );
}
