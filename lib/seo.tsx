import { site } from "@/lib/site";
import type { Article } from "@/lib/articles";
import type { Product } from "@/lib/products";

/** Absolute site origin used to build canonical JSON-LD URLs. */
function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

function absoluteUrl(path: string): string {
  if (path.startsWith("http")) return path;
  return `${siteUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Renders a JSON-LD structured data block. Keep the data objects small and
 * build them with the typed helpers below.
 */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/** Organization schema for the whole site (wired in app/layout.tsx). */
export function organizationJsonLd(): object {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.name,
    url: siteUrl(),
    logo: absoluteUrl("/logo.png"),
    sameAs: [site.instagram],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "sales",
      telephone: site.phone,
      email: site.salesEmail,
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: "Mbagala Industrial Area, Kilwa Road",
      addressLocality: "Dar es Salaam",
      addressCountry: "TZ",
    },
  };
}

/** NewsArticle schema for a news article detail page. */
export function articleJsonLd(article: Article): object {
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.excerpt,
    datePublished: article.publishedAt,
    url: absoluteUrl(`/news/${article.slug}`),
    author: {
      "@type": "Organization",
      name: site.name,
      url: siteUrl(),
    },
    publisher: {
      "@type": "Organization",
      name: site.name,
      logo: { "@type": "ImageObject", url: absoluteUrl("/logo.png") },
    },
    ...(article.image ? { image: [absoluteUrl(article.image)] } : {}),
  };
}

/**
 * Product schema for a cement product page. Exported for the product detail
 * page to wire in; not rendered anywhere by default.
 */
export function productJsonLd(product: Product): object {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `Camel Cement ${product.grade} ${product.friendlyName}`,
    image: [absoluteUrl(product.image)],
    description: product.description,
    brand: { "@type": "Brand", name: site.name },
    offers: {
      "@type": "Offer",
      url: absoluteUrl(`/products/${product.slug}`),
      price: 18500,
      priceCurrency: "TZS",
      availability: "https://schema.org/InStock",
    },
  };
}
