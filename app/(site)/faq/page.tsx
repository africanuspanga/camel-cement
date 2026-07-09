import type { Metadata } from "next";
import Link from "next/link";
import { Section, SectionHeading, Eyebrow } from "@/components/site/section";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { faqs } from "@/lib/faqs";
import { site } from "@/lib/site";
import {
  ArrowRightIcon,
  CalculatorIcon,
  MessageCircleQuestionIcon,
  PackageIcon,
  ShoppingCartIcon,
  WarehouseIcon,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Frequently Asked Questions | Camel Cement",
  description:
    "Answers to common questions about Camel Cement products, grades, ordering, quotations, the material calculator and correct cement storage.",
};

const categoryOrder = [
  { key: "Products", label: "Product Questions", icon: PackageIcon },
  { key: "Ordering", label: "Ordering Questions", icon: ShoppingCartIcon },
  { key: "Calculator", label: "Calculator Questions", icon: CalculatorIcon },
  { key: "Storage", label: "Storage Questions", icon: WarehouseIcon },
];

export default function FaqPage() {
  return (
    <>
      {/* Hero */}
      <Section surface="canvas" className="border-b border-concrete-200">
        <div className="container-site">
          <div className="max-w-3xl space-y-5">
            <Eyebrow>FREQUENTLY ASKED QUESTIONS</Eyebrow>
            <h1 className="text-h1 text-balance text-concrete-950">
              Answers Before You Build
            </h1>
            <p className="text-lead text-concrete-800">
              Clear answers to the questions we hear most often about products,
              ordering, material estimation and cement storage.
            </p>
          </div>
        </div>
      </Section>

      {/* Grouped questions */}
      <Section surface="white">
        <div className="container-reading space-y-14">
          {categoryOrder.map((category) => {
            const items = faqs.filter(
              (faq) => faq.category === category.key
            );
            if (items.length === 0) return null;
            return (
              <div key={category.key} className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-camel-green-50 text-camel-green-700">
                    <category.icon className="size-5.5" aria-hidden="true" />
                  </div>
                  <h2 className="text-h3 text-concrete-950">
                    {category.label}
                  </h2>
                </div>
                <Accordion
                  type="single"
                  collapsible
                  className="rounded-[18px] border border-concrete-200 bg-white px-6 shadow-[0_1px_2px_rgba(20,31,23,0.05)]"
                >
                  {items.map((faq) => (
                    <AccordionItem key={faq.question} value={faq.question}>
                      <AccordionTrigger className="py-5 text-left font-bold text-concrete-950 hover:text-camel-green-700 hover:no-underline">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="pb-5 text-[15px] leading-relaxed text-concrete-800">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            );
          })}
        </div>
      </Section>

      {/* CTA */}
      <Section surface="deep">
        <div className="container-site flex flex-col items-center gap-6 text-center">
          <SectionHeading
            onDark
            heading="Still Have a Question?"
            body="Our sales and technical teams are ready to help with product selection, quantities, documents and delivery."
            align="center"
          />
          <div className="flex flex-wrap justify-center gap-3">
            <Button
              asChild
              size="lg"
              className="h-12 rounded-full bg-camel-yellow-500 px-7 font-bold text-camel-black hover:bg-camel-yellow-600"
            >
              <Link href="/contact">
                Contact Us
                <ArrowRightIcon aria-hidden="true" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              className="h-12 rounded-full bg-white px-7 font-bold text-camel-green-800 hover:bg-concrete-100"
            >
              <a href={site.phoneHref}>Call {site.phone}</a>
            </Button>
          </div>
          <p className="flex items-center gap-2 text-sm text-white/60">
            <MessageCircleQuestionIcon className="size-4" aria-hidden="true" />
            Ask the Camel Build Assistant any time from the yellow button
          </p>
        </div>
      </Section>
    </>
  );
}
