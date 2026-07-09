import type { Metadata } from "next";
import Link from "next/link";
import { Section, Eyebrow } from "@/components/site/section";
import { ArticleImage } from "@/components/site/article-image";
import { articles } from "@/lib/articles";
import { cn } from "@/lib/utils";
import { NewspaperIcon } from "lucide-react";

export const metadata: Metadata = {
  title: "Camel Cement News and Construction Insights",
  description:
    "Read Camel Cement announcements, construction guidance and practical articles about cement, concrete, storage, material planning and curing.",
};

const newsCategories = [
  "Company News",
  "Product Guidance",
  "Construction Knowledge",
  "Quality and Safety",
  "Sustainability and CSR",
  "Careers",
];

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const activeCategory = newsCategories.includes(category ?? "")
    ? category
    : undefined;
  const filteredArticles = activeCategory
    ? articles.filter((article) => article.category === activeCategory)
    : articles;

  return (
    <>
      {/* Hero */}
      <Section surface="canvas" className="border-b border-concrete-200">
        <div className="container-site">
          <div className="max-w-3xl space-y-5">
            <Eyebrow>NEWS AND INSIGHTS</Eyebrow>
            <h1 className="text-h1 text-balance text-concrete-950">
              Practical Knowledge for Stronger Construction
            </h1>
            <p className="text-lead text-concrete-800">
              Explore official Camel Cement updates and useful guidance created
              for builders, contractors, students, professionals and anyone who
              wants to understand cement and concrete better.
            </p>
          </div>
        </div>
      </Section>

      {/* Articles */}
      <Section surface="white">
        <div className="container-site space-y-8">
          {/* Category chips */}
          <div className="flex flex-wrap gap-2" aria-label="Article categories">
            <Link
              href="/news"
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-bold transition-colors",
                !activeCategory
                  ? "border-camel-green-700 bg-camel-green-700 text-white"
                  : "border-concrete-200 bg-white text-concrete-800 hover:border-camel-green-200 hover:text-camel-green-700"
              )}
            >
              All articles
            </Link>
            {newsCategories.map((c) => (
              <Link
                key={c}
                href={`/news?category=${encodeURIComponent(c)}`}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-bold transition-colors",
                  activeCategory === c
                    ? "border-camel-green-700 bg-camel-green-700 text-white"
                    : "border-concrete-200 bg-white text-concrete-800 hover:border-camel-green-200 hover:text-camel-green-700"
                )}
              >
                {c}
              </Link>
            ))}
          </div>

          {filteredArticles.length === 0 ? (
            <div className="flex flex-col items-center gap-4 rounded-[24px] border border-dashed border-concrete-300 bg-concrete-50 px-8 py-16 text-center">
              <div className="flex size-14 items-center justify-center rounded-full bg-white text-camel-green-700 shadow-[0_1px_2px_rgba(20,31,23,0.05)]">
                <NewspaperIcon className="size-6" aria-hidden="true" />
              </div>
              <p className="max-w-xl text-balance font-bold text-concrete-950">
                No articles have been published in this category yet. New
                updates and guidance are added regularly.
              </p>
              <Link
                href="/news"
                className="font-bold text-camel-green-700 hover:underline"
              >
                View all articles
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredArticles.map((article) => (
                <article
                  key={article.slug}
                  className="group relative flex flex-col overflow-hidden rounded-[18px] border border-concrete-200 bg-white shadow-[0_1px_2px_rgba(20,31,23,0.05)] transition-all duration-[220ms] hover:-translate-y-[3px] hover:border-camel-green-200 hover:shadow-card"
                >
                  <ArticleImage
                    src={article.image}
                    className="aspect-[16/10]"
                    imgClassName="transition-transform duration-[220ms] group-hover:scale-[1.025]"
                  />
                  <div className="flex flex-1 flex-col gap-3 p-6">
                    <p className="text-eyebrow text-camel-green-700">
                      {article.category}
                    </p>
                    <h2 className="text-lg font-bold leading-snug text-concrete-950">
                      <Link
                        href={`/news/${article.slug}`}
                        className="after:absolute after:inset-0"
                      >
                        {article.title}
                      </Link>
                    </h2>
                    <p className="line-clamp-3 text-sm leading-relaxed text-concrete-800">
                      {article.excerpt}
                    </p>
                    <p className="mt-auto pt-2 text-xs font-semibold text-concrete-600">
                      {article.readingMinutes} min read ·{" "}
                      {formatDate(article.publishedAt)}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </Section>
    </>
  );
}
