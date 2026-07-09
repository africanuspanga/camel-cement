import Link from "next/link";
import {
  ArrowRightIcon,
  FlaskConicalIcon,
  LayersIcon,
  PercentIcon,
  ScaleIcon,
} from "lucide-react";
import { Section, SectionHeading } from "@/components/site/section";

const steps = [
  {
    icon: LayersIcon,
    title: "Wet to Dry Volume",
    body: "Freshly placed concrete and mortar compact as they settle, so more loose material is needed than the finished volume. The calculator multiplies the wet volume by 1.54 for concrete and 1.33 for mortar to find the dry material volume.",
  },
  {
    icon: FlaskConicalIcon,
    title: "Mix Ratios",
    body: "A mix ratio such as 1:2:4 describes the volume of cement, sand and aggregate in the mix. The cement share is one part divided by the total number of parts, so a 1:2:4 mix uses one seventh of the dry volume as cement.",
  },
  {
    icon: ScaleIcon,
    title: "From Volume to Bags",
    body: "The cement volume is converted to weight using a bulk density of 1440 kg per cubic metre, then divided by the 50 kg bag size. The bag count is always rounded up so you are not left short on site.",
  },
  {
    icon: PercentIcon,
    title: "Wastage Allowance",
    body: "Real sites lose material to spillage, cutting, uneven surfaces and handling. A wastage allowance is added to every quantity, with 5 percent recommended for most projects and higher allowances available for difficult conditions.",
  },
];

export function HowItWorks() {
  return (
    <Section id="how-it-works" surface="white">
      <div className="container-site">
        <SectionHeading
          eyebrow="HOW IT WORKS"
          heading="How the Calculator Estimates Your Materials"
          body="The calculator uses standard preliminary estimation methods trusted across the construction industry. Here is the method in plain language."
        />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="rounded-3xl border border-concrete-200 bg-white p-6 shadow-card"
            >
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-xl bg-camel-green-50 text-camel-green-700">
                  <step.icon aria-hidden="true" className="size-5" />
                </span>
                <span className="text-sm font-bold text-concrete-400 tabular-nums">
                  0{index + 1}
                </span>
              </div>
              <h3 className="mt-4 text-lg font-bold text-concrete-950">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-concrete-800">
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

export function CalculatorCta() {
  return (
    <Section surface="deep">
      <div className="container-site">
        <div className="flex flex-col items-start gap-8 lg:flex-row lg:items-center lg:justify-between">
          <SectionHeading
            onDark
            eyebrow="NEXT STEP"
            heading="Turn Your Estimate into a Quotation"
            body="Send the result directly to the Camel Cement sales team and receive support for product selection, quantities, availability and delivery."
          />
          <Link
            href="/request-quote?source=calculator"
            className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-camel-yellow-500 px-7 font-bold text-camel-black transition-colors hover:bg-camel-yellow-600"
          >
            Request Quote from This Estimate
            <ArrowRightIcon aria-hidden="true" className="size-4" />
          </Link>
        </div>
      </div>
    </Section>
  );
}
