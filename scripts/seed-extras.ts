/**
 * Seeds testimonials, gallery items, two sample plant vacancies and the
 * cement price setting. Idempotent: clears previous seeded rows first.
 *
 * Run: npx dotenv -e .env.local -- npx tsx scripts/seed-extras.ts
 */
import { createClient } from "@supabase/supabase-js";

const testimonials = [
  {
    name: "Joseph Mwakasege",
    role: "Homeowner",
    company: "Mbezi Beach, Dar es Salaam",
    quote:
      "I built my three bedroom house with Camel 32.5R from foundation to plaster. The bags were always fresh and the finish came out clean. My fundi asks for it by name now.",
    rating: 5,
    source: "google",
    display_order: 1,
  },
  {
    name: "Grace Kimaro",
    role: "Managing Director",
    company: "Real estate developer, Kigamboni",
    quote:
      "We moved our 40 unit housing project to Camel 42.5N and the structural results have been consistent batch after batch. Deliveries arrive on schedule, which matters more than anything on a live site.",
    rating: 5,
    source: "google",
    display_order: 2,
  },
  {
    name: "Emmanuel Nkya",
    role: "Senior Site Agent",
    company: "National roadworks contractor",
    quote:
      "For bridge decks and culverts we need early strength we can trust. Camel 42.5R has passed every cube test our lab has thrown at it.",
    rating: 4.5,
    source: "google",
    display_order: 3,
  },
  {
    name: "Fatma Suleiman",
    role: "Block Yard Owner",
    company: "Temeke, Dar es Salaam",
    quote:
      "My block yard runs on Camel 42.5R. Blocks are ready to move earlier, breakage is down, and customers have noticed the difference.",
    rating: 5,
    source: "google",
    display_order: 4,
  },
  {
    name: "Daniel Mushi",
    role: "Fundi (Mason)",
    company: "Arusha",
    quote:
      "Saruji hii inachanganyika vizuri na haina mabonge. Plaster inakaa imara na wateja wangu wanafurahia kazi.",
    rating: 4.5,
    source: "google",
    display_order: 5,
  },
  {
    name: "Amina Hassan",
    role: "Procurement Manager",
    company: "Hardware retailer, Dodoma",
    quote:
      "Camel moves faster off our shelves than any other brand we stock. Consistent quality means fewer complaints and more repeat customers.",
    rating: 4,
    source: "google",
    display_order: 6,
  },
];

const galleryItems = [
  { title: "Camel Cement on site", kind: "image", src: "/gallery/gallery-1.jpg", category: "Projects", display_order: 1 },
  { title: "Construction in progress", kind: "image", src: "/gallery/gallery-2.jpg", category: "Projects", display_order: 2 },
  { title: "Building with Camel Cement", kind: "image", src: "/gallery/gallery-3.jpg", category: "Projects", display_order: 3 },
  { title: "Strong foundations", kind: "image", src: "/gallery/gallery-4.jpg", category: "Projects", display_order: 4 },
  { title: "Project delivery", kind: "image", src: "/gallery/gallery-5.jpg", category: "Projects", display_order: 5 },
  { title: "Camel Cement delivery fleet", kind: "image", src: "/cement-truck.png", category: "Operations", display_order: 6 },
  { title: "Our team at the Mbagala facility", kind: "image", src: "/about-us.png", category: "Factory", display_order: 7 },
  { title: "Camel Cement 42.5R", kind: "image", src: "/products/42-5r.png", category: "Products", display_order: 8 },
  { title: "Camel Cement 42.5N", kind: "image", src: "/products/42-5n.png", category: "Products", display_order: 9 },
  { title: "Camel Cement 32.5R", kind: "image", src: "/products/32-5r.png", category: "Products", display_order: 10 },
  { title: "Camel Cement 32.5N", kind: "image", src: "/products/32-5n.png", category: "Products", display_order: 11 },
  { title: "Camel Cement brand film", kind: "video", src: "/videos/hero-background.mp4", category: "Brand", display_order: 12 },
];

const inThirtyDays = new Date(Date.now() + 30 * 24 * 3600 * 1000)
  .toISOString()
  .slice(0, 10);

const vacancies = [
  {
    slug: "production-machine-operator",
    title: "Production Machine Operator",
    department: "Manufacturing",
    location: "Mbagala Plant, Dar es Salaam",
    employment_type: "Full time",
    experience_level: "2+ years",
    description_md:
      "Operate and monitor cement production machinery at our Mbagala facility, maintaining safe, efficient and consistent output across shifts. This is a sample vacancy for preview purposes.",
    responsibilities: [
      "Operate assigned production equipment according to standard procedures",
      "Monitor process parameters and report deviations promptly",
      "Carry out routine equipment checks and basic maintenance",
      "Maintain accurate shift production records",
      "Follow all site safety rules and wear required protective equipment",
    ],
    requirements: [
      "Technical certificate in mechanical, electrical or process operations",
      "At least 2 years operating industrial production equipment",
      "Understanding of workplace safety practices",
      "Ability to work rotating shifts",
    ],
    benefits: [
      "Competitive salary",
      "Health cover",
      "On-the-job training and development",
    ],
    closes_at: inThirtyDays,
    published: true,
  },
  {
    slug: "quality-control-laboratory-technician",
    title: "Quality Control Laboratory Technician",
    department: "Quality",
    location: "Mbagala Plant, Dar es Salaam",
    employment_type: "Full time",
    experience_level: "1-3 years",
    description_md:
      "Perform laboratory testing on raw materials and finished cement to support EN 197 compliance and consistent product performance. This is a sample vacancy for preview purposes.",
    responsibilities: [
      "Prepare and test cement and raw material samples",
      "Record, analyse and report test results accurately",
      "Maintain laboratory equipment and calibration schedules",
      "Support production with timely quality feedback",
      "Follow laboratory safety and housekeeping standards",
    ],
    requirements: [
      "Diploma or degree in chemistry, materials science or related field",
      "Laboratory experience, preferably in cement or construction materials",
      "Attention to detail and disciplined record keeping",
      "Computer literacy for data entry and reporting",
    ],
    benefits: [
      "Competitive salary",
      "Health cover",
      "Professional development support",
    ],
    closes_at: inThirtyDays,
    published: true,
  },
];

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) throw new Error("Supabase env vars missing");

  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  await supabase.from("testimonials").delete().neq("name", "");
  const { error: tErr } = await supabase.from("testimonials").insert(testimonials);
  if (tErr) throw tErr;
  console.log(`✔ Testimonials: ${testimonials.length}`);

  await supabase.from("gallery_items").delete().neq("title", "");
  const { error: gErr } = await supabase.from("gallery_items").insert(galleryItems);
  if (gErr) throw gErr;
  console.log(`✔ Gallery items: ${galleryItems.length}`);

  const { error: vErr } = await supabase
    .from("vacancies")
    .upsert(vacancies, { onConflict: "slug" });
  if (vErr) throw vErr;
  console.log(`✔ Sample vacancies: ${vacancies.length}`);

  const { error: sErr } = await supabase.from("site_settings").upsert({
    key: "cement_price_tzs",
    value: { amount: 18500, currency: "TZS", per: "50 kg bag" },
    description: "Retail price per 50 kg bag used by the online cart",
  });
  if (sErr) throw sErr;
  console.log("✔ Cement price setting: TZS 18,500 per 50 kg bag");
}

main().catch((err) => {
  console.error("Seed failed:", err.message ?? err);
  process.exit(1);
});
