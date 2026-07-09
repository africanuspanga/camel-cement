import type { Metadata } from "next";
import Link from "next/link";
import { Section, SectionHeading, Eyebrow } from "@/components/site/section";
import { ComingSoonImage } from "@/components/site/coming-soon-image";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import {
  ArrowRightIcon,
  Building2Icon,
  FactoryIcon,
  HomeIcon,
  LandmarkIcon,
  MapPinIcon,
  RouteIcon,
  WarehouseIcon,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Construction Applications and Projects | Camel Cement",
  description:
    "See how Camel Cement products support residential, commercial, infrastructure, precast, industrial and public construction applications.",
};

const applicationCategories = [
  {
    icon: HomeIcon,
    title: "Homes Built to Last",
    body: "Reliable cement for foundations, walls, slabs, plastering, paving and the everyday work that turns a plan into a permanent home.",
  },
  {
    icon: Building2Icon,
    title: "Commercial Developments",
    body: "Products suited to structural concrete, floors, columns, walls, precast components and the demanding schedules of business construction.",
  },
  {
    icon: RouteIcon,
    title: "Roads and Infrastructure",
    body: "High-performance and stabilisation-focused options for roads, bridges, drainage, paving and public infrastructure work.",
  },
  {
    icon: WarehouseIcon,
    title: "Precast and Block Production",
    body: "Consistent products for block makers, brick producers, pavers and precast manufacturers who depend on repeatable results.",
  },
  {
    icon: FactoryIcon,
    title: "Industrial Construction",
    body: "Cement options for structural, flooring, repair and general work in factories, warehouses and industrial facilities.",
  },
  {
    icon: LandmarkIcon,
    title: "Public and Institutional Projects",
    body: "Dependable cement for schools, hospitals, government buildings, community facilities and other projects that serve the public.",
  },
];

interface PublishedProject {
  id: string | number;
  name?: string | null;
  location?: string | null;
  category?: string | null;
  completion_year?: string | number | null;
  product_used?: string | null;
  result_summary?: string | null;
}

async function getPublishedProjects(): Promise<PublishedProject[]> {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("published", true);
  if (error || !data) return [];
  return data as PublishedProject[];
}

export default async function ProjectsPage() {
  const publishedProjects = await getPublishedProjects();

  return (
    <>
      {/* Hero */}
      <Section surface="canvas" className="border-b border-concrete-200">
        <div className="container-site">
          <div className="max-w-3xl space-y-5">
            <Eyebrow>PROJECTS AND APPLICATIONS</Eyebrow>
            <h1 className="text-h1 text-balance text-concrete-950">
              Built for the Work That Moves Tanzania Forward
            </h1>
            <p className="text-lead text-concrete-800">
              Camel Cement products are designed to support projects of
              different scales, from individual homes and masonry work to
              commercial structures, precast production and infrastructure.
            </p>
          </div>
        </div>
      </Section>

      {/* Published case studies (from the dashboard, when available) */}
      {publishedProjects.length > 0 ? (
        <Section surface="white">
          <div className="container-site space-y-10">
            <SectionHeading
              eyebrow="Case Studies"
              heading="Recent Projects Supported by Camel Cement"
            />
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {publishedProjects.map((project) => (
                <article
                  key={project.id}
                  className="flex flex-col overflow-hidden rounded-[18px] border border-concrete-200 bg-white shadow-[0_1px_2px_rgba(20,31,23,0.05)]"
                >
                  <ComingSoonImage
                    label="Project photography coming soon"
                    className="aspect-[16/9] rounded-none border-0"
                  />
                  <div className="flex flex-1 flex-col gap-3 p-6">
                    {project.category ? (
                      <p className="text-eyebrow text-camel-green-700">
                        {project.category}
                      </p>
                    ) : null}
                    <h3 className="text-lg font-bold text-concrete-950">
                      {project.name ?? "Camel Cement project"}
                    </h3>
                    {project.result_summary ? (
                      <p className="text-sm leading-relaxed text-concrete-800">
                        {project.result_summary}
                      </p>
                    ) : null}
                    <p className="mt-auto flex items-center gap-2 pt-2 text-xs font-semibold text-concrete-600">
                      <MapPinIcon
                        className="size-3.5 text-camel-green-700"
                        aria-hidden="true"
                      />
                      {[project.location, project.completion_year]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </Section>
      ) : null}

      {/* Application categories */}
      <Section surface={publishedProjects.length > 0 ? "canvas" : "white"}>
        <div className="container-site space-y-10">
          <SectionHeading
            eyebrow="Application Categories"
            heading="Where Camel Cement Goes to Work"
            body="Explore the construction applications our four grades are engineered to serve. Approved project case studies will be published here as they are documented."
          />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {applicationCategories.map((category) => (
              <div
                key={category.title}
                className="flex flex-col overflow-hidden rounded-[18px] border border-concrete-200 bg-white shadow-[0_1px_2px_rgba(20,31,23,0.05)] transition-all duration-[220ms] hover:-translate-y-[3px] hover:border-camel-green-200 hover:shadow-card"
              >
                <ComingSoonImage
                  label="Application photography coming soon"
                  className="aspect-[16/9] rounded-none border-0"
                />
                <div className="flex flex-1 flex-col gap-3 p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-camel-green-50 text-camel-green-700">
                      <category.icon className="size-5" aria-hidden="true" />
                    </div>
                    <h3 className="text-lg font-bold text-concrete-950">
                      {category.title}
                    </h3>
                  </div>
                  <p className="text-[15px] leading-relaxed text-concrete-800">
                    {category.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* CTA */}
      <Section surface="deep">
        <div className="container-site flex flex-col items-center gap-6 text-center">
          <SectionHeading
            onDark
            heading="Tell Us About Your Project"
            body="Share the location, construction type, expected quantities and timeline. Our team will help you identify the next step."
            align="center"
          />
          <Button
            asChild
            size="lg"
            className="h-12 rounded-full bg-camel-yellow-500 px-7 font-bold text-camel-black hover:bg-camel-yellow-600"
          >
            <Link href="/contact">
              Discuss Your Project
              <ArrowRightIcon aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </Section>
    </>
  );
}
