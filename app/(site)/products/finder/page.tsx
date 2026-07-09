import type { Metadata } from "next";
import { ProductFinder } from "@/components/products/product-finder";
import { getBagPriceTzs } from "@/lib/cart/pricing-server";
import { Section, Eyebrow } from "@/components/site/section";

export const metadata: Metadata = {
  title: "Find My Cement | Camel Cement Product Finder",
  description:
    "Answer a few simple questions about what you are building, the work being carried out and the performance you need. We will guide you towards the most suitable Camel Cement grade and the next practical step.",
};

export default async function ProductFinderPage() {
  const priceTzs = await getBagPriceTzs();
  return (
    <>
      <Section surface="canvas" className="pb-10 md:pb-14 lg:pb-16">
        <div className="container-site">
          <div className="mx-auto max-w-3xl space-y-5 text-center">
            <Eyebrow>Choose with Confidence</Eyebrow>
            <h1 className="text-h1 text-balance text-concrete-950">
              Find the Cement That Fits Your Project
            </h1>
            <p className="text-lead text-concrete-800">
              Answer a few simple questions about what you are building, the
              work being carried out and the performance you need. We will
              guide you towards the most suitable Camel Cement grade and the
              next practical step.
            </p>
          </div>
        </div>
      </Section>

      <Section surface="white">
        <div className="container-site">
          <ProductFinder priceTzs={priceTzs} />
        </div>
      </Section>
    </>
  );
}
