import type { Metadata } from "next";
import { existsSync } from "fs";
import { join } from "path";
import Link from "next/link";
import Image from "next/image";
import { HomeHero } from "@/components/home/hero";
import { AmsonsBand } from "@/components/home/amsons-band";
import { TestimonialsSection } from "@/components/home/testimonials";
import { ProductCard } from "@/components/site/product-card";
import { Section, SectionHeading } from "@/components/site/section";
import { ComingSoonImage } from "@/components/site/coming-soon-image";
import { Button } from "@/components/ui/button";
import { products } from "@/lib/products";
import { articles } from "@/lib/articles";
import { site } from "@/lib/site";
import {
  ArrowRightIcon,
  Building2Icon,
  CalculatorIcon,
  CheckCircle2Icon,
  CompassIcon,
  FactoryIcon,
  FlaskConicalIcon,
  HandshakeIcon,
  HomeIcon,
  LandmarkIcon,
  LayersIcon,
  MapPinIcon,
  PhoneIcon,
  RouteIcon,
  SproutIcon,
  TruckIcon,
  WarehouseIcon,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Camel Cement Tanzania | We Build Stronger",
  description:
    "Discover Camel Cement products for homes, commercial construction and infrastructure. Compare cement grades, calculate materials, find a dealer and request a quote.",
};

const whyItems = [
  {
    icon: FactoryIcon,
    title: "Modern Manufacturing",
    body: "Our Mbagala facility uses modern production systems and skilled teams to manufacture dependable cement products for Tanzania's changing construction needs.",
  },
  {
    icon: FlaskConicalIcon,
    title: "Consistent Quality",
    body: "Every Camel Cement grade is developed to deliver reliable performance and comply with EN 197 standards.",
  },
  {
    icon: MapPinIcon,
    title: "Strategic Location",
    body: "Our Mbagala manufacturing location provides convenient access to Dar es Salaam and major transport routes, supporting efficient distribution.",
  },
  {
    icon: LayersIcon,
    title: "Four Specialised Grades",
    body: "Choose from rapid-strength, structural, all-purpose and stabilisation-focused cement products.",
  },
  {
    icon: HandshakeIcon,
    title: "Practical Customer Support",
    body: "Customers can access product guidance, quotations, technical resources and material estimation tools through one connected platform.",
  },
  {
    icon: Building2Icon,
    title: "Amsons Group Strength",
    body: "Camel Cement benefits from the experience, resources and operating capabilities of Amsons Group.",
  },
];

const manufacturingFeatures = [
  "Modern production facility",
  "Advanced processing equipment",
  "Quality-focused operations",
  "Efficient packaging and dispatch",
  "Year-round road access",
  "Responsive delivery support",
];

const certifications = [
  {
    name: "ISO 9001:2015",
    body: "Quality management certification",
    image: "/qa-logos/iso-9001-2015.png",
  },
  {
    name: "TBS",
    body: "Tanzania Bureau of Standards certification",
    image: "/qa-logos/tbs.png",
  },
  {
    name: "SGS",
    body: "Independent testing and verification",
    image: "/qa-logos/sgs.png",
  },
  {
    name: "Superbrands",
    body: "Brand excellence recognition",
    image: "/qa-logos/superbrands.png",
  },
];

const projectCategories = [
  { icon: HomeIcon, title: "Homes Built to Last" },
  { icon: Building2Icon, title: "Commercial Developments" },
  { icon: RouteIcon, title: "Roads and Infrastructure" },
  { icon: WarehouseIcon, title: "Precast and Block Production" },
  { icon: FactoryIcon, title: "Industrial Construction" },
  { icon: LandmarkIcon, title: "Public and Institutional Projects" },
];

export default function HomePage() {
  const latestArticles = articles.slice(0, 3);
  // Gallery photography for the projects section; falls back to designed
  // placeholders until files exist in public/gallery.
  const galleryImages = [1, 2, 3, 4, 5, 6]
    .map((i) => `/gallery/gallery-${i}.jpg`)
    .filter((p) => existsSync(join(process.cwd(), "public", p)));

  return (
    <>
      <HomeHero />
      <AmsonsBand />

      {/* Product range */}
      <Section surface="white" id="products">
        <div className="container-site space-y-10">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading
              eyebrow="Our Products"
              heading="The Right Cement for Every Build"
              body="From home construction and masonry to precast production, ready-mix concrete and major infrastructure, Camel Cement offers four dependable grades developed for different strength, setting and application requirements."
            />
            <Button
              asChild
              variant="outline"
              className="rounded-full border-camel-green-700 font-bold text-camel-green-700"
            >
              <Link href="/products">
                Compare the Range
                <ArrowRightIcon aria-hidden="true" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {products.map((product, i) => (
              <ProductCard key={product.slug} product={product} priority={i < 2} />
            ))}
          </div>
        </div>
      </Section>

      {/* Guided product selection */}
      <Section surface="canvas">
        <div className="container-site grid items-center gap-10 lg:grid-cols-2">
          <SectionHeading
            eyebrow="Choose with Confidence"
            heading="Find the Cement That Fits Your Project"
            body="Answer a few simple questions about what you are building, the work being carried out and the performance you need. We will guide you towards the most suitable Camel Cement grade and the next practical step."
          />
          <div className="flex flex-col items-start gap-5 rounded-3xl border border-concrete-200 bg-white p-8 shadow-card">
            <div className="flex size-12 items-center justify-center rounded-full bg-camel-green-50 text-camel-green-700">
              <CompassIcon className="size-6" aria-hidden="true" />
            </div>
            <ul className="space-y-2.5 text-[15px] text-concrete-800">
              {[
                "What are you building?",
                "Which construction activity are you carrying out?",
                "Do you need rapid early strength or standard strength?",
                "Is there an engineer's product specification?",
              ].map((q) => (
                <li key={q} className="flex items-start gap-2.5">
                  <CheckCircle2Icon
                    className="mt-0.5 size-4.5 shrink-0 text-camel-green-700"
                    aria-hidden="true"
                  />
                  {q}
                </li>
              ))}
            </ul>
            <Button
              asChild
              className="h-12 rounded-full bg-camel-green-700 px-6 font-bold text-white hover:bg-camel-green-800"
            >
              <Link href="/products/finder">Find My Cement</Link>
            </Button>
          </div>
        </div>
      </Section>

      {/* Calculator feature band */}
      <Section surface="deep">
        <div className="container-site grid items-center gap-10 lg:grid-cols-2">
          <div className="space-y-5">
            <SectionHeading
              onDark
              eyebrow="Plan Your Materials"
              heading="Estimate Before You Build"
              body="Use the Camel Cement calculator to estimate the approximate cement required for a slab, foundation, column, beam, blockwork, plastering, floor screed or general concrete work."
            />
            <div className="flex flex-wrap gap-3">
              <Button
                asChild
                size="lg"
                className="h-12 rounded-full bg-camel-yellow-500 px-6 font-bold text-camel-black hover:bg-camel-yellow-600"
              >
                <Link href="/calculator">
                  <CalculatorIcon aria-hidden="true" />
                  Start Calculation
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 rounded-full border-white/40 bg-transparent px-6 font-bold text-white hover:bg-white/10 hover:text-white"
              >
                <Link href="/calculator#how-it-works">Learn How It Works</Link>
              </Button>
            </div>
            <p className="max-w-xl text-sm leading-relaxed text-white/60">
              Calculator results are preliminary planning estimates. Actual
              material requirements depend on the approved mix design,
              workmanship, material quality, site conditions, wastage and
              project specifications. Structural work should be confirmed by a
              qualified construction professional.
            </p>
          </div>
          {/* Illustrative live-estimate card */}
          <div className="mx-auto w-full max-w-md rounded-3xl border border-white/15 bg-camel-green-950/60 p-7 shadow-raised backdrop-blur-sm">
            <p className="text-eyebrow text-white/60">Estimated requirement</p>
            <p className="mt-3 text-display tabular-nums text-camel-yellow-500">
              126 bags
            </p>
            <p className="mt-1 text-sm text-white/76">
              Recommended product: Camel Cement 42.5N
            </p>
            <div className="mt-6 space-y-2.5 border-t border-white/10 pt-5 text-sm text-white/76">
              <div className="flex justify-between">
                <span>Concrete slab, 12 m × 10 m × 0.15 m</span>
                <span className="tabular-nums">18.0 m³</span>
              </div>
              <div className="flex justify-between">
                <span>Wastage allowance</span>
                <span className="tabular-nums">5%</span>
              </div>
            </div>
            <Button
              asChild
              className="mt-6 h-11 w-full rounded-full bg-white font-bold text-camel-green-800 hover:bg-concrete-100"
            >
              <Link href="/calculator">Try It with Your Measurements</Link>
            </Button>
          </div>
        </div>
      </Section>

      {/* Why Camel Cement */}
      <Section surface="white">
        <div className="container-site space-y-10">
          <SectionHeading
            eyebrow="Built on Reliability"
            heading="A Stronger Choice for Construction"
            align="center"
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {whyItems.map((item) => (
              <div
                key={item.title}
                className="space-y-3 rounded-[18px] border border-concrete-200 bg-white p-7 shadow-[0_1px_2px_rgba(20,31,23,0.05)] transition-all duration-[220ms] hover:-translate-y-[3px] hover:border-camel-green-200 hover:shadow-card"
              >
                <div className="flex size-11 items-center justify-center rounded-xl bg-camel-green-50 text-camel-green-700">
                  <item.icon className="size-5.5" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-bold text-concrete-950">
                  {item.title}
                </h3>
                <p className="text-[15px] leading-relaxed text-concrete-800">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Manufacturing */}
      <Section surface="canvas">
        <div className="container-site grid items-center gap-10 lg:grid-cols-2">
          <div className="relative order-2 overflow-hidden rounded-[24px] lg:order-1">
            <Image
              src="/cement-truck.png"
              alt="Camel Cement delivery truck at the Mbagala manufacturing facility"
              width={720}
              height={540}
              className="size-full object-cover"
            />
          </div>
          <div className="order-1 space-y-6 lg:order-2">
            <SectionHeading
              eyebrow="Our Facility"
              heading="Manufactured for Consistency"
              body="At our Mbagala manufacturing facility, technology, experienced people and disciplined processes come together to produce cement that builders, contractors, block makers and construction professionals can depend on."
            />
            <ul className="grid gap-2.5 sm:grid-cols-2">
              {manufacturingFeatures.map((feature) => (
                <li
                  key={feature}
                  className="flex items-center gap-2.5 text-[15px] font-medium text-concrete-800"
                >
                  <CheckCircle2Icon
                    className="size-4.5 shrink-0 text-camel-green-700"
                    aria-hidden="true"
                  />
                  {feature}
                </li>
              ))}
            </ul>
            <Button
              asChild
              className="h-12 rounded-full bg-camel-green-700 px-6 font-bold text-white hover:bg-camel-green-800"
            >
              <Link href="/about">Explore Our Manufacturing</Link>
            </Button>
          </div>
        </div>
      </Section>

      {/* Quality + certifications */}
      <Section surface="white">
        <div className="container-site space-y-10">
          <SectionHeading
            eyebrow="Quality You Can Build On"
            heading="Standards, Testing and Trusted Performance"
            body="Quality is central to the way Camel Cement manufactures, tests, packages and delivers its products. Our products comply with EN 197 standards, supported by approved certification and recognition."
            align="center"
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {certifications.map((cert) => (
              <div
                key={cert.name}
                className="flex flex-col items-center gap-3 rounded-xl border border-concrete-200 bg-white p-6 text-center transition-all duration-[220ms] hover:-translate-y-[3px] hover:border-camel-green-200 hover:shadow-card"
              >
                <div className="flex h-20 items-center justify-center">
                  <Image
                    src={cert.image}
                    alt={`${cert.name} certification`}
                    width={160}
                    height={80}
                    className="max-h-20 w-auto object-contain"
                  />
                </div>
                <p className="font-bold text-concrete-950">{cert.name}</p>
                <p className="text-sm text-concrete-600">{cert.body}</p>
              </div>
            ))}
          </div>
          <div className="text-center">
            <Button
              asChild
              variant="outline"
              className="rounded-full border-camel-green-700 font-bold text-camel-green-700"
            >
              <Link href="/quality">
                View Quality Assurance
                <ArrowRightIcon aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </Section>

      {/* Testimonials */}
      <TestimonialsSection />

      {/* Dealer locator */}
      <Section surface="wash">
        <div className="container-site flex flex-col items-center gap-6 text-center">
          <SectionHeading
            eyebrow="Closer to Your Project"
            heading="Find Camel Cement Near You"
            body="Search by region, district or current location to find authorised Camel Cement contacts and dealers serving your area."
            align="center"
          />
          <div className="flex flex-wrap justify-center gap-3">
            <Button
              asChild
              size="lg"
              className="h-12 rounded-full bg-camel-green-700 px-6 font-bold text-white hover:bg-camel-green-800"
            >
              <Link href="/dealers">
                <MapPinIcon aria-hidden="true" />
                Find a Dealer
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 rounded-full border-camel-green-700 px-6 font-bold text-camel-green-700 hover:bg-camel-green-50"
            >
              <a href={site.phoneHref}>
                <PhoneIcon aria-hidden="true" />
                {site.phone}
              </a>
            </Button>
          </div>
        </div>
      </Section>

      {/* Projects */}
      <Section surface="white">
        <div className="container-site space-y-10">
          <SectionHeading
            eyebrow="Built with Camel Cement"
            heading="Strength Across Every Type of Project"
            body="Camel Cement supports the work that shapes communities, businesses and infrastructure. Explore the types of projects our products are designed to serve."
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {projectCategories.map((category, i) => (
              <Link
                key={category.title}
                href="/projects"
                className="group overflow-hidden rounded-[18px] border border-concrete-200 bg-white shadow-[0_1px_2px_rgba(20,31,23,0.05)] transition-all duration-[220ms] hover:-translate-y-[3px] hover:border-camel-green-200 hover:shadow-card"
              >
                {galleryImages.length > 0 ? (
                  <div className="aspect-[16/9] overflow-hidden">
                    <Image
                      src={galleryImages[i % galleryImages.length]}
                      alt={category.title}
                      width={640}
                      height={360}
                      className="size-full object-cover transition-transform duration-[220ms] group-hover:scale-[1.025]"
                    />
                  </div>
                ) : (
                  <ComingSoonImage
                    label="Project photography coming soon"
                    className="aspect-[16/9] rounded-none border-0"
                  />
                )}
                <div className="flex items-center justify-between gap-3 p-5">
                  <div className="flex items-center gap-3">
                    <category.icon
                      className="size-5 text-camel-green-700"
                      aria-hidden="true"
                    />
                    <h3 className="font-bold text-concrete-950">
                      {category.title}
                    </h3>
                  </div>
                  <ArrowRightIcon
                    className="size-4 text-concrete-400 transition-transform duration-150 group-hover:translate-x-1 group-hover:text-camel-green-700"
                    aria-hidden="true"
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </Section>

      {/* Sustainability */}
      <Section surface="canvas">
        <div className="container-site grid items-center gap-10 lg:grid-cols-[1fr_auto]">
          <SectionHeading
            eyebrow="Building Responsibly"
            heading="Stronger Industry. Stronger Communities."
            body="Our responsibility extends beyond the cement bag. We are committed to safe operations, responsible resource use, continuous improvement, community engagement and creating lasting value for the people and places connected to our work."
          />
          <Button
            asChild
            size="lg"
            className="h-12 w-fit rounded-full bg-camel-green-700 px-6 font-bold text-white hover:bg-camel-green-800"
          >
            <Link href="/sustainability">
              <SproutIcon aria-hidden="true" />
              Sustainability and CSR
            </Link>
          </Button>
        </div>
      </Section>

      {/* News */}
      <Section surface="white">
        <div className="container-site space-y-10">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading
              eyebrow="Knowledge and Updates"
              heading="News, Guidance and Construction Insights"
              body="Read practical guidance about cement, concrete and construction, together with official Camel Cement announcements, activities and company updates."
            />
            <Button
              asChild
              variant="outline"
              className="rounded-full border-camel-green-700 font-bold text-camel-green-700"
            >
              <Link href="/news">
                View All News and Insights
                <ArrowRightIcon aria-hidden="true" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {latestArticles.map((article) => (
              <article
                key={article.slug}
                className="group relative flex flex-col overflow-hidden rounded-[18px] border border-concrete-200 bg-white shadow-[0_1px_2px_rgba(20,31,23,0.05)] transition-all duration-[220ms] hover:-translate-y-[3px] hover:border-camel-green-200 hover:shadow-card"
              >
                {article.image ? (
                  <div className="aspect-[16/10] overflow-hidden">
                    <Image
                      src={article.image}
                      alt=""
                      width={640}
                      height={400}
                      className="size-full object-cover transition-transform duration-[220ms] group-hover:scale-[1.025]"
                    />
                  </div>
                ) : (
                  <ComingSoonImage
                    label="Article image coming soon"
                    className="aspect-[16/10] rounded-none border-0"
                  />
                )}
                <div className="flex flex-1 flex-col gap-3 p-6">
                  <p className="text-eyebrow text-camel-green-700">
                    {article.category}
                  </p>
                  <h3 className="text-lg font-bold leading-snug text-concrete-950">
                    <Link
                      href={`/news/${article.slug}`}
                      className="after:absolute after:inset-0"
                    >
                      {article.title}
                    </Link>
                  </h3>
                  <p className="line-clamp-3 text-sm leading-relaxed text-concrete-800">
                    {article.excerpt}
                  </p>
                  <p className="mt-auto pt-2 text-xs font-semibold text-concrete-600">
                    {article.readingMinutes} min read ·{" "}
                    {new Date(article.publishedAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </Section>

      {/* Final CTA */}
      <Section surface="deep">
        <div className="container-site flex flex-col items-center gap-6 text-center">
          <SectionHeading
            onDark
            heading="Ready to Build Stronger?"
            body="Tell us what you are building, the product you need and where your project is located. Our sales team will help you move forward."
            align="center"
          />
          <div className="flex flex-wrap justify-center gap-3">
            <Button
              asChild
              size="lg"
              className="h-12 rounded-full bg-camel-yellow-500 px-7 font-bold text-camel-black hover:bg-camel-yellow-600"
            >
              <Link href="/request-quote">Request a Quote</Link>
            </Button>
            <Button
              asChild
              size="lg"
              className="h-12 rounded-full bg-white px-7 font-bold text-camel-green-800 hover:bg-concrete-100"
            >
              <a href={site.phoneHref}>
                <PhoneIcon aria-hidden="true" />
                Call {site.phone}
              </a>
            </Button>
          </div>
          <div className="flex items-center gap-2 text-sm text-white/60">
            <TruckIcon className="size-4" aria-hidden="true" />
            Delivery and collection options confirmed by our sales team
          </div>
        </div>
      </Section>
    </>
  );
}
