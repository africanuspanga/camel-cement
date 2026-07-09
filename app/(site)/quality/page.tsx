import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Section, SectionHeading, Eyebrow } from "@/components/site/section";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import {
  ArrowRightIcon,
  FileTextIcon,
  FlaskConicalIcon,
  GaugeIcon,
  MountainIcon,
  PackageCheckIcon,
  TrendingUpIcon,
  WarehouseIcon,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Camel Cement Quality Assurance and Standards",
  description:
    "Learn how Camel Cement supports dependable performance through standards compliance, quality-focused manufacturing, testing, packaging and approved certifications.",
};

const certifications = [
  {
    name: "ISO 9001:2015",
    body: "Quality management system certification supporting disciplined and consistent operations.",
    image: "/qa-logos/iso-9001-2015.png",
  },
  {
    name: "SGS",
    body: "Independent testing and verification by a recognised international inspection body.",
    image: "/qa-logos/sgs.png",
  },
  {
    name: "TBS",
    body: "Tanzania Bureau of Standards certification for products sold in Tanzania.",
    image: "/qa-logos/tbs.png",
  },
  {
    name: "Superbrands",
    body: "Brand excellence recognition earned through sustained market trust.",
    image: "/qa-logos/superbrands.png",
  },
];

const qualitySteps = [
  {
    icon: MountainIcon,
    title: "Raw Material Control",
    body: "Production quality begins with controlled inputs and disciplined handling of manufacturing materials.",
  },
  {
    icon: GaugeIcon,
    title: "Process Monitoring",
    body: "Production is monitored through defined operating controls to support consistency from one batch to the next.",
  },
  {
    icon: FlaskConicalIcon,
    title: "Laboratory Testing",
    body: "Product performance is assessed through quality checks and approved testing procedures.",
  },
  {
    icon: PackageCheckIcon,
    title: "Packaging Integrity",
    body: "Bags are inspected and handled to protect product quality during storage, dispatch and transportation.",
  },
  {
    icon: WarehouseIcon,
    title: "Storage and Dispatch",
    body: "Finished cement is stored and dispatched through organised processes designed to protect condition and support reliable delivery.",
  },
  {
    icon: TrendingUpIcon,
    title: "Continuous Improvement",
    body: "Camel Cement continues to improve systems, technology, staff capability and customer feedback processes.",
  },
];

const downloads = [
  "Product certificates",
  "Technical datasheets",
  "Safety and handling guidance",
  "Product brochures",
  "Quality policy documents",
];

async function getQualityDocuments() {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("resources")
    .select("id, title, category, file_type, file_size_kb")
    .eq("public", true)
    .in("category", [
      "Certificates",
      "Technical datasheets",
      "Safety and handling",
      "Company documents",
    ])
    .order("created_at", { ascending: false })
    .limit(8);
  return data ?? [];
}

export default async function QualityPage() {
  const documents = await getQualityDocuments();
  return (
    <>
      {/* Hero */}
      <Section surface="canvas" className="border-b border-concrete-200">
        <div className="container-site">
          <div className="max-w-3xl space-y-5">
            <Eyebrow>QUALITY ASSURANCE</Eyebrow>
            <h1 className="text-h1 text-balance text-concrete-950">
              Quality You Can Build On
            </h1>
            <p className="text-lead text-concrete-800">
              Dependable construction begins with dependable materials. Camel
              Cement places quality at the centre of production, testing,
              packaging, storage and delivery.
            </p>
          </div>
        </div>
      </Section>

      {/* Standards and certifications */}
      <Section surface="white">
        <div className="container-site space-y-10">
          <SectionHeading
            eyebrow="Standards"
            heading="Manufactured to Recognised Standards"
            body="Camel Cement products comply with EN 197 standards. Approved ISO 9001:2015, SGS, TBS and recognition assets are presented on this page to give customers direct access to the company's quality credentials."
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {certifications.map((cert) => (
              <div
                key={cert.name}
                className="flex flex-col gap-4 rounded-[18px] border border-concrete-200 bg-white p-6 shadow-[0_1px_2px_rgba(20,31,23,0.05)] transition-all duration-[220ms] hover:-translate-y-[3px] hover:border-camel-green-200 hover:shadow-card"
              >
                <div className="flex aspect-[4/3] items-center justify-center rounded-xl bg-concrete-50 p-5">
                  <Image
                    src={cert.image}
                    alt={`${cert.name} official certification mark`}
                    width={220}
                    height={140}
                    className="max-h-full w-auto object-contain"
                  />
                </div>
                <div className="space-y-1.5">
                  <h3 className="font-bold text-concrete-950">{cert.name}</h3>
                  <p className="text-sm leading-relaxed text-concrete-600">
                    {cert.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Quality process */}
      <Section surface="canvas">
        <div className="container-site space-y-10">
          <SectionHeading
            eyebrow="Quality Process"
            heading="Six Disciplines Behind Every Batch"
            body="Quality is built into each stage of the operation, from the materials entering the plant to the moment finished cement leaves for a customer."
          />
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {qualitySteps.map((step, index) => (
              <div
                key={step.title}
                className="flex flex-col gap-4 rounded-[18px] border border-concrete-200 bg-white p-7 shadow-[0_1px_2px_rgba(20,31,23,0.05)] transition-all duration-[220ms] hover:-translate-y-[3px] hover:border-camel-green-200 hover:shadow-card"
              >
                <div className="flex items-center justify-between">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-camel-green-50 text-camel-green-700">
                    <step.icon className="size-5.5" aria-hidden="true" />
                  </div>
                  <span className="text-eyebrow text-concrete-400">
                    Step {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-concrete-950">
                  {step.title}
                </h3>
                <p className="text-[15px] leading-relaxed text-concrete-800">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Downloads */}
      <Section surface="wash">
        <div className="container-site grid items-start gap-10 lg:grid-cols-2">
          <SectionHeading
            eyebrow="Documentation"
            heading="Quality Documents and Downloads"
            body="Approved certificates, datasheets and quality documents are published in the resource library as they become available."
          />
          <ul className="divide-y divide-concrete-200 rounded-[18px] border border-concrete-200 bg-white shadow-[0_1px_2px_rgba(20,31,23,0.05)]">
            {documents.length > 0
              ? documents.map((doc) => (
                  <li key={doc.id}>
                    <a
                      href={`/api/resources/${doc.id}/download`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between gap-4 p-5 transition-colors hover:bg-camel-green-50"
                    >
                      <span className="flex min-w-0 items-center gap-3 font-medium text-concrete-950">
                        <FileTextIcon
                          className="size-5 shrink-0 text-camel-green-700"
                          aria-hidden="true"
                        />
                        <span className="min-w-0">
                          <span className="block truncate">{doc.title}</span>
                          <span className="block text-xs font-normal text-concrete-600">
                            {doc.category}
                            {doc.file_type ? ` · ${doc.file_type}` : ""}
                          </span>
                        </span>
                      </span>
                      <ArrowRightIcon
                        className="size-4 shrink-0 text-concrete-400 transition-transform duration-150 group-hover:translate-x-1 group-hover:text-camel-green-700"
                        aria-hidden="true"
                      />
                    </a>
                  </li>
                ))
              : downloads.map((item) => (
                  <li key={item}>
                    <Link
                      href="/resources"
                      className="group flex items-center justify-between gap-4 p-5 transition-colors hover:bg-camel-green-50"
                    >
                      <span className="flex items-center gap-3 font-medium text-concrete-950">
                        <FileTextIcon
                          className="size-5 text-camel-green-700"
                          aria-hidden="true"
                        />
                        {item}
                      </span>
                      <ArrowRightIcon
                        className="size-4 text-concrete-400 transition-transform duration-150 group-hover:translate-x-1 group-hover:text-camel-green-700"
                        aria-hidden="true"
                      />
                    </Link>
                  </li>
                ))}
          </ul>
        </div>
      </Section>

      {/* CTA */}
      <Section surface="deep">
        <div className="container-site flex flex-col items-center gap-6 text-center">
          <SectionHeading
            onDark
            heading="Need a Technical Document?"
            body="Search the resource library or contact our technical team for approved product information and certification documents."
            align="center"
          />
          <Button
            asChild
            size="lg"
            className="h-12 rounded-full bg-camel-yellow-500 px-7 font-bold text-camel-black hover:bg-camel-yellow-600"
          >
            <Link href="/resources">
              Browse Resources
              <ArrowRightIcon aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </Section>
    </>
  );
}
