import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Section, SectionHeading, Eyebrow } from "@/components/site/section";
import { ArticleImage } from "@/components/site/article-image";
import { ShareButtons } from "@/components/site/share-buttons";
import { Button } from "@/components/ui/button";
import { Markdown } from "@/lib/markdown";
import { JsonLd, articleJsonLd } from "@/lib/seo";
import { articles, getArticle } from "@/lib/articles";
import {
  ArrowRightIcon,
  CalendarIcon,
  ChevronRightIcon,
  ClockIcon,
  UserIcon,
} from "lucide-react";

export function generateStaticParams() {
  return articles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return {};
  return {
    title: article.seoTitle,
    description: article.seoDescription,
    openGraph: {
      title: article.seoTitle,
      description: article.seoDescription,
      type: "article",
      publishedTime: article.publishedAt,
      images: article.image ? [{ url: article.image }] : undefined,
    },
  };
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  const related = [
    ...articles.filter(
      (a) => a.slug !== article.slug && a.category === article.category
    ),
    ...articles.filter(
      (a) => a.slug !== article.slug && a.category !== article.category
    ),
  ].slice(0, 2);

  return (
    <>
      <JsonLd data={articleJsonLd(article)} />

      {/* Article header */}
      <Section surface="canvas" className="border-b border-concrete-200">
        <div className="container-reading space-y-6">
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-1.5 text-sm font-medium text-concrete-600">
              <li>
                <Link
                  href="/news"
                  className="transition-colors hover:text-camel-green-700"
                >
                  News and Insights
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRightIcon className="size-4 text-concrete-400" />
              </li>
              <li
                aria-current="page"
                className="line-clamp-1 text-concrete-950"
              >
                {article.title}
              </li>
            </ol>
          </nav>
          <div className="space-y-4">
            <Eyebrow>{article.category}</Eyebrow>
            <h1 className="text-display text-balance text-concrete-950">
              {article.title}
            </h1>
            <p className="text-lead text-concrete-800">{article.excerpt}</p>
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-concrete-200 pt-5 text-sm font-semibold text-concrete-600">
            <span className="flex items-center gap-1.5">
              <UserIcon
                className="size-4 text-camel-green-700"
                aria-hidden="true"
              />
              {article.author}
            </span>
            <span className="flex items-center gap-1.5">
              <CalendarIcon
                className="size-4 text-camel-green-700"
                aria-hidden="true"
              />
              {formatDate(article.publishedAt)}
            </span>
            <span className="flex items-center gap-1.5">
              <ClockIcon
                className="size-4 text-camel-green-700"
                aria-hidden="true"
              />
              {article.readingMinutes} min read
            </span>
            <ShareButtons
              title={article.title}
              path={`/news/${article.slug}`}
              className="ml-auto"
            />
          </div>
        </div>
      </Section>

      {/* Body */}
      <Section surface="white">
        <div className="container-reading space-y-10">
          <ArticleImage
            src={article.image}
            alt={article.title}
            className="aspect-[16/9] rounded-[24px]"
          />
          <Markdown content={article.contentMd} />
          <ShareButtons
            title={article.title}
            path={`/news/${article.slug}`}
            className="border-t border-concrete-200 pt-6"
          />
        </div>
      </Section>

      {/* Final CTA */}
      <Section surface="deep">
        <div className="container-site flex flex-col items-center gap-6 text-center">
          <SectionHeading
            onDark
            heading="Take the Next Step"
            body="Put this guidance to work on your project with Camel Cement's tools and support."
            align="center"
          />
          <Button
            asChild
            size="lg"
            className="h-12 rounded-full bg-camel-yellow-500 px-7 font-bold text-camel-black hover:bg-camel-yellow-600"
          >
            <Link href={article.finalCta.href}>
              {article.finalCta.label}
              <ArrowRightIcon aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </Section>

      {/* Related articles */}
      {related.length > 0 ? (
        <Section surface="canvas">
          <div className="container-site space-y-10">
            <SectionHeading
              eyebrow="Keep Reading"
              heading="Related Articles"
            />
            <div className="grid gap-6 md:grid-cols-2">
              {related.map((item) => (
                <article
                  key={item.slug}
                  className="group relative flex flex-col overflow-hidden rounded-[18px] border border-concrete-200 bg-white shadow-[0_1px_2px_rgba(20,31,23,0.05)] transition-all duration-[220ms] hover:-translate-y-[3px] hover:border-camel-green-200 hover:shadow-card"
                >
                  <ArticleImage
                    src={item.image}
                    className="aspect-[16/10]"
                    imgClassName="transition-transform duration-[220ms] group-hover:scale-[1.025]"
                  />
                  <div className="flex flex-1 flex-col gap-3 p-6">
                    <p className="text-eyebrow text-camel-green-700">
                      {item.category}
                    </p>
                    <h3 className="text-lg font-bold leading-snug text-concrete-950">
                      <Link
                        href={`/news/${item.slug}`}
                        className="after:absolute after:inset-0"
                      >
                        {item.title}
                      </Link>
                    </h3>
                    <p className="line-clamp-3 text-sm leading-relaxed text-concrete-800">
                      {item.excerpt}
                    </p>
                    <p className="mt-auto pt-2 text-xs font-semibold text-concrete-600">
                      {item.readingMinutes} min read ·{" "}
                      {formatDate(item.publishedAt)}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </Section>
      ) : null}
    </>
  );
}
