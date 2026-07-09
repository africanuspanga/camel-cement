/**
 * Testimonial shape shared by the public homepage section and the admin
 * module, plus the fallback set used when Supabase is not configured
 * (demo/preview mode). The fallback mirrors the seeded rows in
 * scripts/seed-extras.ts exactly.
 */

export interface Testimonial {
  id?: string;
  name: string;
  role: string | null;
  company: string | null;
  quote: string;
  rating: number;
  source: string;
}

export const fallbackTestimonials: Testimonial[] = [
  {
    name: "Joseph Mwakasege",
    role: "Homeowner",
    company: "Mbezi Beach, Dar es Salaam",
    quote:
      "I built my three bedroom house with Camel 32.5R from foundation to plaster. The bags were always fresh and the finish came out clean. My fundi asks for it by name now.",
    rating: 5,
    source: "google",
  },
  {
    name: "Grace Kimaro",
    role: "Managing Director",
    company: "Real estate developer, Kigamboni",
    quote:
      "We moved our 40 unit housing project to Camel 42.5N and the structural results have been consistent batch after batch. Deliveries arrive on schedule, which matters more than anything on a live site.",
    rating: 5,
    source: "google",
  },
  {
    name: "Emmanuel Nkya",
    role: "Senior Site Agent",
    company: "National roadworks contractor",
    quote:
      "For bridge decks and culverts we need early strength we can trust. Camel 42.5R has passed every cube test our lab has thrown at it.",
    rating: 4.5,
    source: "google",
  },
  {
    name: "Fatma Suleiman",
    role: "Block Yard Owner",
    company: "Temeke, Dar es Salaam",
    quote:
      "My block yard runs on Camel 42.5R. Blocks are ready to move earlier, breakage is down, and customers have noticed the difference.",
    rating: 5,
    source: "google",
  },
  {
    name: "Daniel Mushi",
    role: "Fundi (Mason)",
    company: "Arusha",
    quote:
      "Saruji hii inachanganyika vizuri na haina mabonge. Plaster inakaa imara na wateja wangu wanafurahia kazi.",
    rating: 4.5,
    source: "google",
  },
  {
    name: "Amina Hassan",
    role: "Procurement Manager",
    company: "Hardware retailer, Dodoma",
    quote:
      "Camel moves faster off our shelves than any other brand we stock. Consistent quality means fewer complaints and more repeat customers.",
    rating: 4,
    source: "google",
  },
];
