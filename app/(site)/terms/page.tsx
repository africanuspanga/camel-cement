import type { Metadata } from "next";
import Link from "next/link";
import { Section, Eyebrow } from "@/components/site/section";
import { site } from "@/lib/site";
import { ScaleIcon } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Use | Camel Cement",
  description:
    "The terms governing use of the Camel Cement website and digital services, including product guidance, calculator estimates, quotations and order requests.",
};

const sections: { heading: string; paragraphs: string[] }[] = [
  {
    heading: "Website Information",
    paragraphs: [
      "The content on this website is provided for general information about Camel Cement products and services. We work to keep information accurate and current, but content may be updated, corrected or removed at any time without notice.",
    ],
  },
  {
    heading: "Product Guidance",
    paragraphs: [
      "Product descriptions, application guidance and comparison content are provided to help you understand the general role of each cement grade.",
      "They do not replace professional advice. Final product selection for structural work should follow the project specification and guidance from a qualified professional.",
    ],
  },
  {
    heading: "Material Calculator Estimates",
    paragraphs: [
      "The material calculator provides preliminary planning estimates only. Actual requirements vary according to the approved mix design, material properties, workmanship, compaction, curing, site conditions and wastage.",
      "Structural calculations and final material quantities should be confirmed by a qualified professional before purchasing or building.",
    ],
  },
  {
    heading: "Quotations",
    paragraphs: [
      "Submitting a quotation request through the website does not create a contract. Quotations issued by the sales team are subject to the validity period, conditions and confirmation steps stated in the quotation itself.",
    ],
  },
  {
    heading: "Order Requests",
    paragraphs: [
      "Order requests submitted through the website are requests for review, not confirmed orders. An order becomes binding only after the sales team confirms price, availability, fulfilment details and any payment requirements.",
    ],
  },
  {
    heading: "Prices and Availability",
    paragraphs: [
      "The website does not publish binding prices. Prices, discounts and product availability are confirmed by the sales team at the time of quotation or order confirmation and may change without notice.",
    ],
  },
  {
    heading: "Delivery and Collection",
    paragraphs: [
      "Delivery and collection options depend on location, quantities, vehicle access and scheduling. Arrangements described on the website are indicative and are confirmed for each order by the sales team.",
    ],
  },
  {
    heading: "Intellectual Property",
    paragraphs: [
      "The Camel Cement name, logo, product artwork, text, images and other content on this website are protected by intellectual property rights held by the company or its licensors.",
      "You may view and print content for personal or internal business reference. Any other reproduction or commercial use requires prior written permission.",
    ],
  },
  {
    heading: "Acceptable Use",
    paragraphs: [
      "You agree not to misuse the website, including by submitting false information, attempting to gain unauthorised access, interfering with its operation, scraping content at scale or using the website for unlawful purposes.",
      "We may restrict access where misuse is identified.",
    ],
  },
  {
    heading: "AI Assistant Limitations",
    paragraphs: [
      "The Camel Build Assistant generates responses automatically and may occasionally be incomplete or inaccurate.",
      "Assistant responses are informational and do not constitute engineering, legal or commercial advice, and do not create binding offers. Confirm important details with the sales or technical team.",
    ],
  },
  {
    heading: "External Links",
    paragraphs: [
      "The website may contain links to external websites operated by third parties. We are not responsible for the content, availability or practices of external websites, and a link does not imply endorsement.",
    ],
  },
  {
    heading: "Liability Boundaries",
    paragraphs: [
      "To the extent permitted by applicable law, Camel Cement is not liable for losses arising from reliance on general website content, calculator estimates or assistant responses, or from interruptions to website availability.",
      "Nothing in these terms excludes liability that cannot be excluded under applicable law.",
    ],
  },
  {
    heading: "Changes to These Terms",
    paragraphs: [
      "We may update these terms from time to time. The current version will always be published on this page, and continued use of the website after an update constitutes acceptance of the revised terms.",
    ],
  },
  {
    heading: "Governing Law",
    paragraphs: [
      "These terms are governed by the laws of the United Republic of Tanzania. Any dispute arising from use of the website will be subject to the jurisdiction of the courts of Tanzania, unless applicable law provides otherwise.",
    ],
  },
  {
    heading: "Contact Information",
    paragraphs: [
      `Questions about these terms can be sent to ${site.generalEmail} or raised by calling ${site.phone}. You can also write to ${site.postal}.`,
    ],
  },
];

export default function TermsPage() {
  return (
    <>
      <Section surface="canvas" className="border-b border-concrete-200">
        <div className="container-reading space-y-5">
          <Eyebrow>TERMS</Eyebrow>
          <h1 className="text-h1 text-balance text-concrete-950">
            Terms of Use
          </h1>
        </div>
      </Section>

      <Section surface="white">
        <div className="container-reading space-y-10">
          <div className="flex items-start gap-3 rounded-xl border border-camel-yellow-200 bg-camel-yellow-50 p-5">
            <ScaleIcon
              className="mt-0.5 size-5 shrink-0 text-camel-yellow-700"
              aria-hidden="true"
            />
            <p className="text-sm font-semibold text-concrete-950">
              This page is prepared for legal review before production launch.
            </p>
          </div>

          <p className="text-xl font-bold text-concrete-950">
            These terms govern the use of the Camel Cement website and digital
            services.
          </p>

          {sections.map((section) => (
            <div key={section.heading} className="space-y-4">
              <h2 className="text-h3 text-concrete-950">{section.heading}</h2>
              {section.paragraphs.map((paragraph) => (
                <p
                  key={paragraph.slice(0, 32)}
                  className="text-[17px] leading-[1.75] text-concrete-800"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          ))}

          <p className="border-t border-concrete-200 pt-6 text-sm text-concrete-600">
            See also the{" "}
            <Link
              href="/privacy"
              className="font-bold text-camel-green-700 hover:underline"
            >
              privacy policy
            </Link>
            .
          </p>
        </div>
      </Section>
    </>
  );
}
