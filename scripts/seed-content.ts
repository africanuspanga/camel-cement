/**
 * Seed public content (products, launch articles, FAQs) into Supabase.
 *
 * Run with:
 *   npx dotenv -e .env.local -- npx tsx scripts/seed-content.ts
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.
 */
import { createClient } from "@supabase/supabase-js";
import { products } from "../lib/products";
import { articles } from "../lib/articles";
import { faqs } from "../lib/faqs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    "Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY.\n" +
      "Run with: npx dotenv -e .env.local -- npx tsx scripts/seed-content.ts"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

async function seedProducts(): Promise<number> {
  const rows = products.map((product, index) => ({
    slug: product.slug,
    grade: product.grade,
    friendly_name: product.friendlyName,
    short_description: product.description,
    full_description: product.heroBody,
    classification: product.classification,
    bag_size: product.bagSize,
    strength_development: product.strengthDevelopment,
    color: product.color,
    hero_image: product.image,
    key_features: product.keyFeatures,
    applications: product.applications,
    storage_guidance: product.storage,
    seo_title: product.seoTitle,
    seo_description: product.seoDescription,
    display_order: index,
  }));

  const { error } = await supabase
    .from("products")
    .upsert(rows, { onConflict: "slug" });

  if (error) {
    throw new Error(`Failed to upsert products: ${error.message}`);
  }
  return rows.length;
}

async function seedArticles(): Promise<number> {
  const rows = articles.map((article) => ({
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    content_md: article.contentMd,
    category: article.category,
    author: article.author,
    reading_minutes: article.readingMinutes,
    seo_title: article.seoTitle,
    seo_description: article.seoDescription,
    status: "published",
    published_at: article.publishedAt,
  }));

  const { error } = await supabase
    .from("posts")
    .upsert(rows, { onConflict: "slug" });

  if (error) {
    throw new Error(`Failed to upsert articles: ${error.message}`);
  }
  return rows.length;
}

async function seedFaqs(): Promise<number> {
  // Delete all existing FAQ rows first so re-runs stay idempotent.
  const { error: deleteError } = await supabase
    .from("faqs")
    .delete()
    .neq("question", "");

  if (deleteError) {
    throw new Error(`Failed to clear faqs: ${deleteError.message}`);
  }

  const rows = faqs.map((faq, index) => ({
    question: faq.question,
    answer: faq.answer,
    category: faq.category,
    display_order: index,
    published: true,
  }));

  const { error } = await supabase.from("faqs").insert(rows);

  if (error) {
    throw new Error(`Failed to insert faqs: ${error.message}`);
  }
  return rows.length;
}

async function main() {
  console.log("Seeding Camel Cement content into Supabase...");

  const productCount = await seedProducts();
  console.log(`Products upserted: ${productCount}`);

  const articleCount = await seedArticles();
  console.log(`Articles upserted: ${articleCount}`);

  const faqCount = await seedFaqs();
  console.log(`FAQs inserted: ${faqCount}`);

  console.log("Seed complete.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
