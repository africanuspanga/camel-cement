import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Section, SectionHeading, Eyebrow } from "@/components/site/section";
import { ApplicationForm } from "@/components/forms/application-form";
import { Badge } from "@/components/ui/badge";
import { Markdown } from "@/lib/markdown";
import { JsonLd } from "@/lib/seo";
import { site } from "@/lib/site";
import { createClient } from "@/lib/supabase/server";
import {
  BriefcaseIcon,
  CalendarIcon,
  CheckIcon,
  ChevronRightIcon,
  GaugeIcon,
  GiftIcon,
  ListChecksIcon,
  MapPinIcon,
} from "lucide-react";

interface Vacancy {
  id: string;
  slug: string;
  title: string;
  department: string | null;
  location: string | null;
  employment_type: string | null;
  experience_level: string | null;
  description_md: string | null;
  responsibilities: unknown;
  requirements: unknown;
  benefits: unknown;
  posted_at: string | null;
  closes_at: string | null;
}

function toStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function formatDate(value?: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

async function getVacancy(slug: string): Promise<Vacancy | null> {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("vacancies")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  if (error || !data) return null;
  return data as Vacancy;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const vacancy = await getVacancy(slug);
  if (!vacancy) return {};
  return {
    title: `${vacancy.title} | Careers`,
    description: `Apply for the ${vacancy.title} role at Camel Cement${
      vacancy.location ? ` in ${vacancy.location}` : ""
    }. Submit your CV and application online.`,
  };
}

function jobPostingJsonLd(vacancy: Vacancy): object {
  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: vacancy.title,
    description:
      vacancy.description_md ?? `${vacancy.title} at ${site.name}.`,
    datePosted: vacancy.posted_at ?? undefined,
    validThrough: vacancy.closes_at ?? undefined,
    employmentType: vacancy.employment_type ?? undefined,
    hiringOrganization: {
      "@type": "Organization",
      name: site.name,
      sameAs: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Dar es Salaam",
        addressCountry: "TZ",
      },
    },
  };
}

function VacancyList({
  heading,
  items,
  icon: Icon,
}: {
  heading: string;
  items: string[];
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
}) {
  if (items.length === 0) return null;
  return (
    <div className="space-y-4 rounded-[18px] border border-concrete-200 bg-white p-7 shadow-[0_1px_2px_rgba(20,31,23,0.05)]">
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-xl bg-camel-green-50 text-camel-green-700">
          <Icon className="size-5" aria-hidden={true} />
        </span>
        <h2 className="text-lg font-bold text-concrete-950">{heading}</h2>
      </div>
      <ul className="space-y-2.5">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2.5">
            <CheckIcon
              className="mt-0.5 size-4.5 shrink-0 text-camel-green-700"
              aria-hidden="true"
            />
            <span className="text-[15px] leading-relaxed text-concrete-800">
              {item}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default async function VacancyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const vacancy = await getVacancy(slug);
  if (!vacancy) notFound();

  const responsibilities = toStringList(vacancy.responsibilities);
  const requirements = toStringList(vacancy.requirements);
  const benefits = toStringList(vacancy.benefits);
  const closing = formatDate(vacancy.closes_at);

  return (
    <>
      <JsonLd data={jobPostingJsonLd(vacancy)} />

      {/* Header */}
      <Section surface="canvas" className="border-b border-concrete-200">
        <div className="container-site space-y-6">
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-1.5 text-sm font-medium text-concrete-600">
              <li>
                <Link
                  href="/careers"
                  className="transition-colors hover:text-camel-green-700"
                >
                  Careers
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRightIcon className="size-4 text-concrete-400" />
              </li>
              <li aria-current="page" className="line-clamp-1 text-concrete-950">
                {vacancy.title}
              </li>
            </ol>
          </nav>
          <div className="max-w-3xl space-y-5">
            <Eyebrow>OPEN POSITION</Eyebrow>
            <h1 className="text-h1 text-balance text-concrete-950">
              {vacancy.title}
            </h1>
            <div className="flex flex-wrap gap-2">
              {vacancy.department ? (
                <Badge className="h-7 gap-1.5 border-concrete-200 bg-white px-3 font-semibold text-concrete-800">
                  <BriefcaseIcon
                    className="size-3.5 text-camel-green-700"
                    aria-hidden="true"
                  />
                  {vacancy.department}
                </Badge>
              ) : null}
              {vacancy.location ? (
                <Badge className="h-7 gap-1.5 border-concrete-200 bg-white px-3 font-semibold text-concrete-800">
                  <MapPinIcon
                    className="size-3.5 text-camel-green-700"
                    aria-hidden="true"
                  />
                  {vacancy.location}
                </Badge>
              ) : null}
              {vacancy.employment_type ? (
                <Badge className="h-7 border-camel-green-200 bg-camel-green-50 px-3 font-bold text-camel-green-800">
                  {vacancy.employment_type}
                </Badge>
              ) : null}
              {vacancy.experience_level ? (
                <Badge className="h-7 gap-1.5 border-concrete-200 bg-white px-3 font-semibold text-concrete-800">
                  <GaugeIcon
                    className="size-3.5 text-camel-green-700"
                    aria-hidden="true"
                  />
                  {vacancy.experience_level}
                </Badge>
              ) : null}
              {closing ? (
                <Badge className="h-7 gap-1.5 border-camel-yellow-500/40 bg-camel-yellow-500/15 px-3 font-bold text-concrete-900">
                  <CalendarIcon className="size-3.5" aria-hidden="true" />
                  Closes {closing}
                </Badge>
              ) : null}
            </div>
          </div>
        </div>
      </Section>

      {/* Description + lists */}
      <Section surface="white">
        <div className="container-site space-y-10">
          {vacancy.description_md ? (
            <div className="max-w-3xl">
              <Markdown content={vacancy.description_md} />
            </div>
          ) : null}
          <div className="grid gap-6 lg:grid-cols-3">
            <VacancyList
              heading="Responsibilities"
              items={responsibilities}
              icon={ListChecksIcon}
            />
            <VacancyList
              heading="Requirements"
              items={requirements}
              icon={BriefcaseIcon}
            />
            <VacancyList heading="Benefits" items={benefits} icon={GiftIcon} />
          </div>
        </div>
      </Section>

      {/* Application form */}
      <Section surface="wash" id="apply">
        <div className="container-site space-y-10">
          <SectionHeading
            eyebrow="Apply Now"
            heading={`Apply for ${vacancy.title}`}
            body="Complete the form below and attach your CV. The recruitment team reviews every application and contacts shortlisted candidates."
          />
          <div className="mx-auto w-full max-w-3xl">
            <ApplicationForm slug={vacancy.slug} positionTitle={vacancy.title} />
          </div>
        </div>
      </Section>
    </>
  );
}
