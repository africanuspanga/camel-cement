import type { Metadata } from "next";
import Link from "next/link";
import { Section, SectionHeading, Eyebrow } from "@/components/site/section";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { getProduct } from "@/lib/products";
import { formatFileSize } from "@/lib/resources";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import {
  ArrowRightIcon,
  DownloadIcon,
  FileArchiveIcon,
  FileIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  FolderOpenIcon,
  ImageIcon,
  SearchIcon,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Camel Cement Technical Resources and Downloads",
  description:
    "Download Camel Cement brochures, technical datasheets, certificates, safety guidance, construction guides and company documents.",
};

const resourceCategories = [
  "Product brochures",
  "Technical datasheets",
  "Certificates",
  "Safety and handling",
  "Construction guides",
  "Company documents",
  "Sustainability and CSR reports",
  "Media resources",
];

interface ResourceRow {
  id: string | number;
  title?: string | null;
  category?: string | null;
  product_slug?: string | null;
  language?: string | null;
  file_type?: string | null;
  file_size_kb?: number | null;
  file_url?: string | null;
  published_at?: string | null;
  version?: string | null;
  description?: string | null;
}

function fileTypeIcon(fileType?: string | null) {
  const ext = (fileType ?? "").toLowerCase().replace(".", "");
  if (["xls", "xlsx", "csv"].includes(ext)) return FileSpreadsheetIcon;
  if (["png", "jpg", "jpeg", "webp", "svg"].includes(ext)) return ImageIcon;
  if (["zip", "rar"].includes(ext)) return FileArchiveIcon;
  if (["pdf", "doc", "docx", "txt"].includes(ext)) return FileTextIcon;
  return FileIcon;
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

async function getResources(): Promise<ResourceRow[]> {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("resources")
    .select("*")
    .order("published_at", { ascending: false });
  if (error || !data) return [];
  return data as ResourceRow[];
}

export default async function ResourcesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const { category, q } = await searchParams;
  const allResources = await getResources();

  const query = (q ?? "").trim().toLowerCase();
  const resources = allResources.filter((resource) => {
    if (category && resource.category !== category) return false;
    if (query) {
      const haystack = [
        resource.title,
        resource.category,
        resource.product_slug,
        resource.description,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });

  const chipHref = (c?: string) => {
    const params = new URLSearchParams();
    if (c) params.set("category", c);
    if (q) params.set("q", q);
    const qs = params.toString();
    return qs ? `/resources?${qs}` : "/resources";
  };

  return (
    <>
      {/* Hero */}
      <Section surface="canvas" className="border-b border-concrete-200">
        <div className="container-site">
          <div className="max-w-3xl space-y-5">
            <Eyebrow>RESOURCES AND DOWNLOADS</Eyebrow>
            <h1 className="text-h1 text-balance text-concrete-950">
              Approved Information, Ready When You Need It
            </h1>
            <p className="text-lead text-concrete-800">
              Access product documents, technical guidance, certificates,
              brochures and practical construction resources from one organised
              library.
            </p>
          </div>
        </div>
      </Section>

      {/* Library */}
      <Section surface="white">
        <div className="container-site space-y-8">
          {/* Search */}
          <form action="/resources" method="get" className="max-w-2xl">
            {category ? (
              <input type="hidden" name="category" value={category} />
            ) : null}
            <label htmlFor="resource-search" className="sr-only">
              Search the resource library
            </label>
            <div className="relative">
              <SearchIcon
                className="pointer-events-none absolute left-4 top-1/2 size-4.5 -translate-y-1/2 text-concrete-400"
                aria-hidden="true"
              />
              <Input
                id="resource-search"
                type="search"
                name="q"
                defaultValue={q ?? ""}
                placeholder="Search products, documents, standards or construction topics"
                className="h-12 rounded-full border-concrete-200 pl-11 pr-4"
              />
            </div>
          </form>

          {/* Category chips */}
          <div className="flex flex-wrap gap-2" aria-label="Resource categories">
            <Link
              href={chipHref()}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-bold transition-colors",
                !category
                  ? "border-camel-green-700 bg-camel-green-700 text-white"
                  : "border-concrete-200 bg-white text-concrete-800 hover:border-camel-green-200 hover:text-camel-green-700"
              )}
            >
              All resources
            </Link>
            {resourceCategories.map((c) => (
              <Link
                key={c}
                href={chipHref(c)}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-bold transition-colors",
                  category === c
                    ? "border-camel-green-700 bg-camel-green-700 text-white"
                    : "border-concrete-200 bg-white text-concrete-800 hover:border-camel-green-200 hover:text-camel-green-700"
                )}
              >
                {c}
              </Link>
            ))}
          </div>

          {/* Results */}
          {resources.length === 0 ? (
            <div className="flex flex-col items-center gap-5 rounded-[24px] border border-dashed border-concrete-300 bg-concrete-50 px-8 py-16 text-center">
              <div className="flex size-14 items-center justify-center rounded-full bg-white text-camel-green-700 shadow-[0_1px_2px_rgba(20,31,23,0.05)]">
                <FolderOpenIcon className="size-6" aria-hidden="true" />
              </div>
              <p className="max-w-xl text-balance text-lg font-bold text-concrete-950">
                Approved documents will appear here as they are published. Need
                something now? Contact our technical team.
              </p>
              <Button
                asChild
                className="h-12 rounded-full bg-camel-green-700 px-6 font-bold text-white hover:bg-camel-green-800"
              >
                <Link href="/contact">
                  Contact the Technical Team
                  <ArrowRightIcon aria-hidden="true" />
                </Link>
              </Button>
            </div>
          ) : (
            <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {resources.map((resource) => {
                const Icon = fileTypeIcon(resource.file_type);
                const publishedDate = formatDate(resource.published_at);
                return (
                  <li
                    key={resource.id}
                    className="flex flex-col gap-4 rounded-[18px] border border-concrete-200 bg-white p-6 shadow-[0_1px_2px_rgba(20,31,23,0.05)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex size-11 items-center justify-center rounded-xl bg-camel-green-50 text-camel-green-700">
                        <Icon className="size-5.5" aria-hidden="true" />
                      </div>
                      {resource.category ? (
                        <Badge
                          variant="outline"
                          className="h-6 border-concrete-200 px-2.5 font-semibold text-concrete-600"
                        >
                          {resource.category}
                        </Badge>
                      ) : null}
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="font-bold text-concrete-950">
                        {resource.title ?? "Untitled document"}
                      </h3>
                      {resource.description ? (
                        <p className="text-sm leading-relaxed text-concrete-600">
                          {resource.description}
                        </p>
                      ) : null}
                    </div>
                    <p className="text-xs font-semibold text-concrete-600">
                      {[
                        resource.product_slug
                          ? getProduct(resource.product_slug)?.friendlyName ??
                            resource.product_slug
                          : null,
                        resource.file_type?.toUpperCase(),
                        typeof resource.file_size_kb === "number"
                          ? formatFileSize(resource.file_size_kb)
                          : null,
                        publishedDate,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                    <div className="mt-auto pt-1">
                      {resource.file_url ? (
                        <Button
                          asChild
                          size="sm"
                          className="h-10 rounded-full bg-camel-green-700 px-5 font-bold text-white hover:bg-camel-green-800"
                        >
                          <a
                            href={`/api/resources/${resource.id}/download`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <DownloadIcon aria-hidden="true" />
                            Download
                          </a>
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          disabled
                          className="h-10 rounded-full px-5 font-bold"
                        >
                          <DownloadIcon aria-hidden="true" />
                          Download
                        </Button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </Section>

      {/* CTA */}
      <Section surface="deep">
        <div className="container-site flex flex-col items-center gap-6 text-center">
          <SectionHeading
            onDark
            heading="Cannot Find the Document You Need?"
            body="Our technical team can provide approved product information, certificates and guidance for your project."
            align="center"
          />
          <Button
            asChild
            size="lg"
            className="h-12 rounded-full bg-camel-yellow-500 px-7 font-bold text-camel-black hover:bg-camel-yellow-600"
          >
            <Link href="/contact">
              Contact Our Technical Team
              <ArrowRightIcon aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </Section>
    </>
  );
}
