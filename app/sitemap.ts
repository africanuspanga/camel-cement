import type { MetadataRoute } from "next";
import { products } from "@/lib/products";
import { articles } from "@/lib/articles";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "",
    "/about",
    "/products",
    "/products/finder",
    "/calculator",
    "/quality",
    "/sustainability",
    "/projects",
    "/dealers",
    "/resources",
    "/news",
    "/careers",
    "/contact",
    "/request-quote",
    "/order",
    "/faq",
    "/privacy",
    "/terms",
  ].map((path) => ({
    url: `${BASE}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  const productRoutes = products.map((product) => ({
    url: `${BASE}/products/${product.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.9,
  }));

  const articleRoutes = articles.map((article) => ({
    url: `${BASE}/news/${article.slug}`,
    lastModified: new Date(article.publishedAt),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...productRoutes, ...articleRoutes];
}
