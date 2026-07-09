import type { Metadata } from "next";
import { Suspense } from "react";
import { Section, Eyebrow } from "@/components/site/section";
import { Calculator } from "@/components/calculator/calculator";
import {
  HowItWorks,
  CalculatorCta,
} from "@/components/calculator/how-it-works";

export const metadata: Metadata = {
  title: "Cement Calculator Tanzania | Estimate Cement for Your Project",
  description:
    "Estimate cement requirements for slabs, foundations, columns, beams, blockwork, plastering, screed and general concrete using Camel Cement's material calculator.",
};

function CalculatorFallback() {
  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_400px]">
      <div className="space-y-8">
        <div className="h-40 animate-pulse rounded-3xl bg-concrete-100" />
        <div className="h-96 animate-pulse rounded-3xl bg-concrete-100" />
      </div>
      <div className="h-96 animate-pulse rounded-[24px] bg-camel-green-900/20" />
    </div>
  );
}

export default function CalculatorPage() {
  return (
    <>
      <Section surface="deep" className="py-14 md:py-20">
        <div className="container-site">
          <Eyebrow onDark>MATERIAL ESTIMATOR</Eyebrow>
          <h1 className="mt-4 max-w-3xl text-h1 text-balance text-white">
            Plan Your Project with Greater Confidence
          </h1>
          <p className="mt-5 max-w-2xl text-lead text-white/76">
            Select the type of work, enter your project measurements and
            receive a clear preliminary estimate of the cement and related
            materials required.
          </p>
        </div>
      </Section>

      <Section surface="canvas">
        <div className="container-site">
          <Suspense fallback={<CalculatorFallback />}>
            <Calculator />
          </Suspense>
        </div>
      </Section>

      <HowItWorks />
      <CalculatorCta />
    </>
  );
}
