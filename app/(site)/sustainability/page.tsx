import type { Metadata } from "next";
import Link from "next/link";
import { Section, SectionHeading, Eyebrow } from "@/components/site/section";
import { ComingSoonImage } from "@/components/site/coming-soon-image";
import { Button } from "@/components/ui/button";
import {
  ArrowRightIcon,
  HandHeartIcon,
  HandshakeIcon,
  HeartPulseIcon,
  LeafIcon,
  NewspaperIcon,
  RecycleIcon,
  UsersIcon,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Sustainability and CSR | Camel Cement Tanzania",
  description:
    "Explore Camel Cement's commitment to responsible operations, safety, resource efficiency, people, communities and continuous improvement.",
};

const focusAreas = [
  {
    icon: HeartPulseIcon,
    title: "Health and Safety",
    body: "We promote disciplined work practices, employee awareness and a culture in which safety remains a shared responsibility.",
  },
  {
    icon: RecycleIcon,
    title: "Resource Efficiency",
    body: "We seek practical improvements in the use of energy, materials, water and operational resources.",
  },
  {
    icon: LeafIcon,
    title: "Environmental Responsibility",
    body: "We support responsible housekeeping, dust control, waste management and continuous improvement in environmental performance.",
  },
  {
    icon: UsersIcon,
    title: "People and Skills",
    body: "We value skilled employees, teamwork, professional development and opportunities for people to grow through meaningful work.",
  },
  {
    icon: HandHeartIcon,
    title: "Community Engagement",
    body: "We believe strong businesses should contribute positively to the communities connected to their operations.",
  },
  {
    icon: HandshakeIcon,
    title: "Responsible Partnerships",
    body: "We encourage responsible conduct across suppliers, service providers, dealers and other business relationships.",
  },
];

export default function SustainabilityPage() {
  return (
    <>
      {/* Hero */}
      <Section surface="canvas" className="border-b border-concrete-200">
        <div className="container-site">
          <div className="max-w-3xl space-y-5">
            <Eyebrow>SUSTAINABILITY AND CSR</Eyebrow>
            <h1 className="text-h1 text-balance text-concrete-950">
              Building Strength That Lasts
            </h1>
            <p className="text-lead text-concrete-800">
              The value of construction is measured not only by what is built,
              but by how responsibly people, resources and communities are
              treated along the way.
            </p>
          </div>
        </div>
      </Section>

      {/* Responsible operations */}
      <Section surface="white">
        <div className="container-site grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <SectionHeading
            eyebrow="Responsible Operations"
            heading="Improving the Way We Operate"
            body="Camel Cement is committed to responsible manufacturing, efficient use of resources, safe working practices and continuous improvement across its operations. The company works to strengthen performance while reducing avoidable waste and supporting a more resilient construction industry."
          />
          <ComingSoonImage
            label="Operations photography coming soon"
            className="aspect-[4/3] rounded-[24px]"
          />
        </div>
      </Section>

      {/* Focus areas */}
      <Section surface="canvas">
        <div className="container-site space-y-10">
          <SectionHeading
            eyebrow="Focus Areas"
            heading="Where We Direct Our Effort"
            align="center"
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {focusAreas.map((area) => (
              <div
                key={area.title}
                className="space-y-3 rounded-[18px] border border-concrete-200 bg-white p-7 shadow-[0_1px_2px_rgba(20,31,23,0.05)] transition-all duration-[220ms] hover:-translate-y-[3px] hover:border-camel-green-200 hover:shadow-card"
              >
                <div className="flex size-11 items-center justify-center rounded-xl bg-camel-green-50 text-camel-green-700">
                  <area.icon className="size-5.5" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-bold text-concrete-950">
                  {area.title}
                </h3>
                <p className="text-[15px] leading-relaxed text-concrete-800">
                  {area.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* CSR initiatives */}
      <Section surface="wash">
        <div className="container-site space-y-10">
          <SectionHeading
            eyebrow="CSR Initiatives"
            heading="Community and Sustainability Updates"
            body="Official initiatives are documented with their date, location, focus area, beneficiaries and supporting media, then published here once approved."
          />
          <div className="flex flex-col items-center gap-5 rounded-[24px] border border-dashed border-camel-green-200 bg-white px-8 py-16 text-center shadow-[0_1px_2px_rgba(20,31,23,0.05)]">
            <div className="flex size-14 items-center justify-center rounded-full bg-camel-green-50 text-camel-green-700">
              <NewspaperIcon className="size-6" aria-hidden="true" />
            </div>
            <p className="max-w-xl text-balance text-lg font-bold text-concrete-950">
              Camel Cement community and sustainability updates will be
              published here as official initiatives are completed and
              documented.
            </p>
            <p className="max-w-xl text-sm text-concrete-600">
              Check back for announcements, or follow official Camel Cement
              updates in the news section.
            </p>
          </div>
        </div>
      </Section>

      {/* CTA */}
      <Section surface="deep">
        <div className="container-site flex flex-col items-center gap-6 text-center">
          <SectionHeading
            onDark
            heading="Progress Through Continuous Improvement"
            body="Our sustainability journey is built on practical action, transparent communication and the commitment to keep improving."
            align="center"
          />
          <Button
            asChild
            size="lg"
            className="h-12 rounded-full bg-camel-yellow-500 px-7 font-bold text-camel-black hover:bg-camel-yellow-600"
          >
            <Link href="/news">
              Read Our Latest Updates
              <ArrowRightIcon aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </Section>
    </>
  );
}
