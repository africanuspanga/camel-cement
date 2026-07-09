import type { Metadata } from "next";
import { Suspense } from "react";
import { Section, Eyebrow } from "@/components/site/section";
import { QuoteForm } from "@/components/forms/quote-form";

export const metadata: Metadata = {
  title: "Request a Camel Cement Quotation",
  description:
    "Request a quotation for Camel Cement products. Submit the product, quantity, project location, delivery preference and required date.",
};

export default function RequestQuotePage() {
  return (
    <>
      <Section surface="deep" className="py-14 md:py-20">
        <div className="container-site">
          <Eyebrow onDark>REQUEST A QUOTE</Eyebrow>
          <h1 className="mt-4 max-w-3xl text-h1 text-balance text-white">
            Tell Us What Your Project Needs
          </h1>
          <p className="mt-5 max-w-2xl text-lead text-white/76">
            Provide the project details below and the Camel Cement sales team
            will review your request and respond with the next steps.
          </p>
        </div>
      </Section>

      <Section surface="canvas">
        <div className="container-site">
          <Suspense fallback={null}>
            <QuoteForm />
          </Suspense>
        </div>
      </Section>
    </>
  );
}
