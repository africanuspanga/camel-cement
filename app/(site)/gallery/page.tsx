import type { Metadata } from "next";
import Link from "next/link";

import { GalleryGrid, type GalleryItem } from "@/components/gallery/gallery-grid";
import { Eyebrow, Section } from "@/components/site/section";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Media Gallery | Camel Cement",
  description:
    "Photos and videos from Camel Cement projects, our Mbagala factory, delivery operations and product range across Tanzania.",
};

/**
 * Static fallback mirroring scripts/seed-extras.ts so the page still renders
 * a full gallery before Supabase credentials are configured.
 */
const FALLBACK_ITEMS: GalleryItem[] = [
  { title: "Camel Cement on site", kind: "image", src: "/gallery/gallery-1.jpg", category: "Projects" },
  { title: "Construction in progress", kind: "image", src: "/gallery/gallery-2.jpg", category: "Projects" },
  { title: "Building with Camel Cement", kind: "image", src: "/gallery/gallery-3.jpg", category: "Projects" },
  { title: "Strong foundations", kind: "image", src: "/gallery/gallery-4.jpg", category: "Projects" },
  { title: "Project delivery", kind: "image", src: "/gallery/gallery-5.jpg", category: "Projects" },
  { title: "Camel Cement delivery fleet", kind: "image", src: "/cement-truck.png", category: "Operations" },
  { title: "Our team at the Mbagala facility", kind: "image", src: "/about-us.png", category: "Factory" },
  { title: "Camel Cement 42.5R", kind: "image", src: "/products/42-5r.png", category: "Products" },
  { title: "Camel Cement 42.5N", kind: "image", src: "/products/42-5n.png", category: "Products" },
  { title: "Camel Cement 32.5R", kind: "image", src: "/products/32-5r.png", category: "Products" },
  { title: "Camel Cement 32.5N", kind: "image", src: "/products/32-5n.png", category: "Products" },
  { title: "Camel Cement brand film", kind: "video", src: "/videos/hero-background.mp4", category: "Brand" },
].map((item, index) => ({
  ...item,
  id: `fallback-${index + 1}`,
  poster: null,
  kind: item.kind as GalleryItem["kind"],
}));

async function getGalleryItems(): Promise<GalleryItem[]> {
  const supabase = await createClient();
  if (!supabase) return FALLBACK_ITEMS;

  const { data, error } = await supabase
    .from("gallery_items")
    .select("id, title, kind, src, poster, category")
    .eq("published", true)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error || !data) return FALLBACK_ITEMS;
  return data as GalleryItem[];
}

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const [{ category }, items] = await Promise.all([
    searchParams,
    getGalleryItems(),
  ]);

  const categories = [...new Set(items.map((item) => item.category))];
  const activeCategory =
    category && categories.includes(category) ? category : null;
  const visibleItems = activeCategory
    ? items.filter((item) => item.category === activeCategory)
    : items;

  return (
    <>
      {/* Hero */}
      <Section surface="deep">
        <div className="container-site">
          <div className="max-w-3xl space-y-5">
            <div className="flex items-center gap-2.5">
              <span
                aria-hidden="true"
                className="h-1 w-8 rounded-full bg-camel-yellow-500"
              />
              <Eyebrow onDark>MEDIA GALLERY</Eyebrow>
            </div>
            <h1 className="text-h1 text-balance text-white">
              Camel Cement in Pictures
            </h1>
            <p className="text-lead text-white/76">
              Photos and videos from our projects, factory, delivery operations
              and product range across Tanzania.
            </p>
          </div>
        </div>
      </Section>

      {/* Filter + grid */}
      <Section surface="canvas">
        <div className="container-site space-y-8">
          <nav aria-label="Filter gallery by category">
            <ul className="flex flex-wrap items-center gap-2.5">
              <li>
                <Link
                  href="/gallery"
                  aria-current={activeCategory === null ? "page" : undefined}
                  className={cn(
                    "inline-flex h-10 items-center rounded-full px-5 text-sm font-semibold transition-colors",
                    activeCategory === null
                      ? "bg-camel-green-700 text-white"
                      : "border border-concrete-200 bg-white text-concrete-800 hover:border-camel-green-700 hover:text-camel-green-700"
                  )}
                >
                  All
                </Link>
              </li>
              {categories.map((option) => (
                <li key={option}>
                  <Link
                    href={`/gallery?category=${encodeURIComponent(option)}`}
                    aria-current={activeCategory === option ? "page" : undefined}
                    className={cn(
                      "inline-flex h-10 items-center rounded-full px-5 text-sm font-semibold transition-colors",
                      activeCategory === option
                        ? "bg-camel-green-700 text-white"
                        : "border border-concrete-200 bg-white text-concrete-800 hover:border-camel-green-700 hover:text-camel-green-700"
                    )}
                  >
                    {option}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {visibleItems.length === 0 ? (
            <div className="rounded-2xl border border-concrete-200 bg-white p-10 text-center">
              <p className="text-sm font-medium text-concrete-800">
                No media in this category yet. Check back soon.
              </p>
            </div>
          ) : (
            <GalleryGrid items={visibleItems} />
          )}
        </div>
      </Section>
    </>
  );
}
