import type { Metadata } from "next";
import Link from "next/link";
import { Section, SectionHeading, Eyebrow } from "@/components/site/section";
import { TalentForm } from "@/components/forms/talent-form";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import {
  BriefcaseIcon,
  Building2Icon,
  CalendarIcon,
  GraduationCapIcon,
  HardHatIcon,
  MapPinIcon,
  ShieldCheckIcon,
  UsersIcon,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Careers at Camel Cement Tanzania",
  description:
    "Explore career opportunities at Camel Cement and apply to join a team committed to safety, quality, teamwork, innovation and building Tanzania.",
};

const whyWorkWithUs = [
  {
    icon: HardHatIcon,
    title: "Meaningful Industry",
    body: "Contribute to products and services that support homes, businesses, institutions and infrastructure.",
  },
  {
    icon: GraduationCapIcon,
    title: "Learning and Growth",
    body: "Develop practical skills through real responsibility, teamwork and continuous improvement.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Safety and Integrity",
    body: "Work in an environment where responsible conduct, professional standards and safe practices matter.",
  },
  {
    icon: UsersIcon,
    title: "Strong Team Culture",
    body: "Collaborate with people who value performance, respect and shared success.",
  },
  {
    icon: Building2Icon,
    title: "Group Opportunity",
    body: "Be part of a business supported by the wider capabilities and growth of Amsons Group.",
  },
];

interface Vacancy {
  id: string | number;
  slug?: string | null;
  title?: string | null;
  department?: string | null;
  location?: string | null;
  employment_type?: string | null;
  posted_at?: string | null;
  closes_at?: string | null;
  description_md?: string | null;
}

/** Plain-text excerpt from the markdown description for the vacancy card. */
function excerpt(markdown?: string | null, maxLength = 180): string | null {
  if (!markdown) return null;
  const text = markdown
    .replace(/^#+\s+/gm, "")
    .replace(/[*_`>#-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!text) return null;
  return text.length > maxLength ? `${text.slice(0, maxLength).trimEnd()}…` : text;
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

async function getVacancies(): Promise<Vacancy[]> {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("vacancies")
    .select("*")
    .eq("published", true);
  if (error || !data) return [];
  return data as Vacancy[];
}

export default async function CareersPage() {
  const vacancies = await getVacancies();

  return (
    <>
      {/* Hero */}
      <Section surface="canvas" className="border-b border-concrete-200">
        <div className="container-site">
          <div className="max-w-3xl space-y-5">
            <Eyebrow>CAREERS</Eyebrow>
            <h1 className="text-h1 text-balance text-concrete-950">
              Build Your Career. Help Build Tanzania.
            </h1>
            <p className="text-lead text-concrete-800">
              Join a team working across manufacturing, quality, engineering,
              sales, logistics, finance, technology, customer service and
              corporate operations.
            </p>
          </div>
        </div>
      </Section>

      {/* Why work with us */}
      <Section surface="white">
        <div className="container-site space-y-10">
          <SectionHeading
            eyebrow="Why Work with Us"
            heading="A Workplace Built on Shared Success"
            align="center"
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {whyWorkWithUs.map((item) => (
              <div
                key={item.title}
                className="space-y-3 rounded-[18px] border border-concrete-200 bg-white p-7 shadow-[0_1px_2px_rgba(20,31,23,0.05)] transition-all duration-[220ms] hover:-translate-y-[3px] hover:border-camel-green-200 hover:shadow-card"
              >
                <div className="flex size-11 items-center justify-center rounded-xl bg-camel-green-50 text-camel-green-700">
                  <item.icon className="size-5.5" aria-hidden="true" />
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

      {/* Vacancies */}
      <Section surface="canvas">
        <div className="container-site space-y-10">
          <SectionHeading
            eyebrow="Open Positions"
            heading="Current Vacancies"
            body="Published opportunities appear here with their department, location, employment type and closing date."
          />
          {vacancies.length === 0 ? (
            <div className="flex flex-col items-center gap-4 rounded-[24px] border border-dashed border-concrete-300 bg-white px-8 py-16 text-center">
              <div className="flex size-14 items-center justify-center rounded-full bg-camel-green-50 text-camel-green-700">
                <BriefcaseIcon className="size-6" aria-hidden="true" />
              </div>
              <p className="max-w-xl text-balance font-bold text-concrete-950">
                There are no open positions matching the current filters. Join
                our talent community or check again for future opportunities.
              </p>
              <a
                href="#talent-community"
                className="font-bold text-camel-green-700 hover:underline"
              >
                Join the talent community below
              </a>
            </div>
          ) : (
            <ul className="grid gap-5 md:grid-cols-2">
              {vacancies.map((vacancy) => {
                const posted = formatDate(vacancy.posted_at);
                const closing = formatDate(vacancy.closes_at);
                const summary = excerpt(vacancy.description_md);
                const href = vacancy.slug ? `/careers/${vacancy.slug}` : null;
                return (
                  <li
                    key={vacancy.id}
                    className="flex flex-col gap-4 rounded-[18px] border border-concrete-200 bg-white p-7 shadow-[0_1px_2px_rgba(20,31,23,0.05)]"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-lg font-bold text-concrete-950">
                        {vacancy.title ?? "Open position"}
                      </h3>
                      {vacancy.employment_type ? (
                        <Badge className="h-6 border-camel-green-200 bg-camel-green-50 px-2.5 font-bold text-camel-green-800">
                          {vacancy.employment_type}
                        </Badge>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm font-semibold text-concrete-600">
                      {vacancy.department ? (
                        <span className="flex items-center gap-1.5">
                          <BriefcaseIcon
                            className="size-4 text-camel-green-700"
                            aria-hidden="true"
                          />
                          {vacancy.department}
                        </span>
                      ) : null}
                      {vacancy.location ? (
                        <span className="flex items-center gap-1.5">
                          <MapPinIcon
                            className="size-4 text-camel-green-700"
                            aria-hidden="true"
                          />
                          {vacancy.location}
                        </span>
                      ) : null}
                    </div>
                    {summary ? (
                      <p className="text-sm leading-relaxed text-concrete-800">
                        {summary}
                      </p>
                    ) : null}
                    {posted || closing ? (
                      <p className="mt-auto flex items-center gap-1.5 border-t border-concrete-100 pt-4 text-xs font-semibold text-concrete-600">
                        <CalendarIcon
                          className="size-3.5 text-camel-green-700"
                          aria-hidden="true"
                        />
                        {[
                          posted ? `Posted ${posted}` : null,
                          closing ? `Closes ${closing}` : null,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    ) : null}
                    {href ? (
                      <div className="flex flex-wrap gap-3 pt-1">
                        <Link
                          href={href}
                          className="inline-flex h-11 items-center rounded-full border border-concrete-300 px-5 text-sm font-bold text-concrete-800 transition-colors hover:border-camel-green-600 hover:text-camel-green-700"
                        >
                          View role
                        </Link>
                        <Link
                          href={`${href}#apply`}
                          className="inline-flex h-11 items-center rounded-full bg-camel-green-700 px-5 text-sm font-bold text-white transition-colors hover:bg-camel-green-800"
                        >
                          Apply now
                        </Link>
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </Section>

      {/* Talent community */}
      <Section surface="wash" id="talent-community">
        <div className="container-site grid items-start gap-10 lg:grid-cols-2 lg:gap-14">
          <SectionHeading
            eyebrow="Talent Community"
            heading="Stay Connected to Future Opportunities"
            body="Submit your professional profile and areas of interest. The recruitment team can review it when a relevant opportunity becomes available."
          />
          <TalentForm />
        </div>
      </Section>
    </>
  );
}
