import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Section, SectionHeading, Eyebrow } from "@/components/site/section";
import { Button } from "@/components/ui/button";
import {
  ArrowRightIcon,
  Building2Icon,
  CompassIcon,
  FactoryIcon,
  HeartHandshakeIcon,
  LayersIcon,
  LightbulbIcon,
  MonitorSmartphoneIcon,
  ShieldCheckIcon,
  TargetIcon,
  UsersIcon,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About Camel Cement | Building Tanzania Stronger",
  description:
    "Learn about Camel Cement, our Mbagala manufacturing facility, vision, mission, values and commitment to dependable cement solutions in Tanzania.",
};

const storyParagraphs = [
  "For more than thirteen years, Camel Cement has built lasting goodwill through reliable products, responsive service and the success of the customers and projects we support. As Tanzania's construction market has grown and customer expectations have changed, our commitment has remained clear: manufacture dependable cement, serve customers professionally and keep improving the way people access our products and support.",
  "Our modern manufacturing facility in Mbagala, Dar es Salaam is strategically positioned near major markets and transport routes. This location supports year-round access, efficient distribution and responsive deliveries to customers in Dar es Salaam and across Tanzania.",
  "Camel Cement continues to grow as part of Amsons Group, one of East Africa's diversified business groups. The strength of the Group supports our ability to invest, innovate and serve a wide range of customers, from individual home builders to major contractors and institutions.",
];

const coreValues = [
  {
    icon: HeartHandshakeIcon,
    title: "Customer Satisfaction",
    body: "We listen to customers, understand their needs and work to provide dependable products, useful information and responsive service.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Safety and Integrity",
    body: "We value safe operations, honest communication, responsible conduct and doing business the right way.",
  },
  {
    icon: UsersIcon,
    title: "Teamwork",
    body: "We achieve stronger results by working together across our employees, partners, dealers, customers and communities.",
  },
  {
    icon: LightbulbIcon,
    title: "Innovation",
    body: "We continuously improve our products, processes, technology and customer experience.",
  },
];

const differentiators = [
  {
    icon: LayersIcon,
    title: "A Product for Every Major Need",
    body: "Four cement grades cover rapid strength, structural performance, general building work and stabilisation-focused applications.",
  },
  {
    icon: FactoryIcon,
    title: "A Strategic Manufacturing Base",
    body: "Our Mbagala plant provides direct access to Dar es Salaam and major routes serving the national market.",
  },
  {
    icon: CompassIcon,
    title: "Modern Technology",
    body: "Our production approach is built around capable equipment, skilled teams and disciplined operations.",
  },
  {
    icon: MonitorSmartphoneIcon,
    title: "Customer Accessibility",
    body: "Our digital platform provides product information, calculation tools, dealer discovery, quotations, documents and assistance at any time.",
  },
  {
    icon: Building2Icon,
    title: "Group Strength",
    body: "Amsons Group provides a strong foundation for long-term growth, reliability and continuous investment.",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <Section surface="canvas" className="border-b border-concrete-200">
        <div className="container-site">
          <div className="max-w-3xl space-y-5">
            <Eyebrow>ABOUT CAMEL CEMENT</Eyebrow>
            <h1 className="text-h1 text-balance text-concrete-950">
              Strength for the Structures That Shape Tanzania
            </h1>
            <p className="text-lead text-concrete-800">
              Camel Cement is a trusted Tanzanian cement brand backed by Amsons
              Group. We combine modern manufacturing, dependable products and
              practical customer service to support homes, businesses,
              institutions and infrastructure across the country.
            </p>
          </div>
        </div>
      </Section>

      {/* Company story */}
      <Section surface="white">
        <div className="container-site grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <div className="space-y-6">
            <SectionHeading
              eyebrow="Our Story"
              heading="Building Stronger Since the Beginning"
            />
            <div className="space-y-5 text-[16px] leading-[1.75] text-concrete-800">
              {storyParagraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 32)}>{paragraph}</p>
              ))}
            </div>
          </div>
          <div className="relative overflow-hidden rounded-[24px] shadow-card">
            <Image
              src="/about-us.png"
              alt="Camel Cement team and manufacturing operations in Mbagala, Dar es Salaam"
              width={840}
              height={640}
              className="size-full object-cover"
              priority
            />
          </div>
        </div>
      </Section>

      {/* Camel Cement at a glance */}
      <section
        aria-label="Camel Cement at a glance"
        className="bg-camel-green-900 py-14 lg:py-16"
      >
        <div className="container-site">
          <dl className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-5">
            {[
              { value: "4", label: "Specialised Cement Grades" },
              { value: "24/7", label: "Production" },
              { value: "EN 197", label: "Compliant Products" },
              { value: "Mbagala", label: "Strategic Manufacturing Location" },
              { value: "Nationwide", label: "Growing Distribution Reach" },
            ].map((item) => (
              <div key={item.label} className="space-y-2 text-center">
                <dt className="sr-only">{item.label}</dt>
                <dd className="text-h2 tabular-nums text-camel-yellow-500">
                  {item.value}
                </dd>
                <dd className="mx-auto h-1 w-8 rounded-full bg-white/20" />
                <dd className="text-sm font-semibold text-white/76">
                  {item.label}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Vision and mission */}
      <Section surface="wash">
        <div className="container-site grid gap-6 lg:grid-cols-2">
          <div className="flex flex-col gap-6 rounded-[24px] bg-camel-green-900 p-8 text-white shadow-card md:p-10">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-camel-yellow-500">
                <CompassIcon className="size-5.5" aria-hidden="true" />
              </div>
              <p className="text-eyebrow text-camel-yellow-500">Our Vision</p>
            </div>
            <p className="text-balance text-xl font-bold leading-snug md:text-2xl">
              To be the preferred manufacturer and supplier of cement that
              partners in building Tanzania, engages with its community and
              cares for all its stakeholders.
            </p>
          </div>
          <div className="flex flex-col gap-6 rounded-[24px] bg-camel-green-900 p-8 text-white shadow-card md:p-10">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-camel-yellow-500">
                <TargetIcon className="size-5.5" aria-hidden="true" />
              </div>
              <p className="text-eyebrow text-camel-yellow-500">Our Mission</p>
            </div>
            <p className="text-balance text-xl font-bold leading-snug md:text-2xl">
              To deliver innovative products that meet customer needs through
              skilled people, high operating standards and consistent
              performance that supports long-term success.
            </p>
          </div>
        </div>
      </Section>

      {/* Core values */}
      <Section surface="white">
        <div className="container-site space-y-10">
          <SectionHeading
            eyebrow="Core Values"
            heading="The Principles Behind Every Bag"
            align="center"
          />
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {coreValues.map((value) => (
              <div
                key={value.title}
                className="space-y-3 rounded-[18px] border border-concrete-200 bg-white p-7 shadow-[0_1px_2px_rgba(20,31,23,0.05)] transition-all duration-[220ms] hover:-translate-y-[3px] hover:border-camel-green-200 hover:shadow-card"
              >
                <div className="flex size-11 items-center justify-center rounded-xl bg-camel-green-50 text-camel-green-700">
                  <value.icon className="size-5.5" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-bold text-concrete-950">
                  {value.title}
                </h3>
                <p className="text-[15px] leading-relaxed text-concrete-800">
                  {value.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* What makes us different */}
      <Section surface="canvas">
        <div className="container-site space-y-10">
          <SectionHeading
            eyebrow="Why Camel Cement"
            heading="What Makes Us Different"
          />
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {differentiators.map((item, index) => (
              <div
                key={item.title}
                className="flex flex-col gap-4 rounded-[18px] border border-concrete-200 bg-white p-7 shadow-[0_1px_2px_rgba(20,31,23,0.05)]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-camel-green-50 text-camel-green-700">
                    <item.icon className="size-5.5" aria-hidden="true" />
                  </div>
                  <span className="text-2xl font-bold tabular-nums text-concrete-200">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-concrete-950">
                  {item.title}
                </h3>
                <p className="text-[15px] leading-relaxed text-concrete-800">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Closing CTA */}
      <Section surface="deep">
        <div className="container-site flex flex-col items-center gap-6 text-center">
          <SectionHeading
            onDark
            heading="Let Us Build the Future Together"
            body="Whether you are building a home, producing blocks, managing a commercial development or delivering national infrastructure, Camel Cement is ready to support the work."
            align="center"
          />
          <Button
            asChild
            size="lg"
            className="h-12 rounded-full bg-camel-yellow-500 px-7 font-bold text-camel-black hover:bg-camel-yellow-600"
          >
            <Link href="/products">
              Explore Our Products
              <ArrowRightIcon aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </Section>
    </>
  );
}
