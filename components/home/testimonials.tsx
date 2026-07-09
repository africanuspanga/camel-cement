import Image from "next/image";
import { StarIcon } from "lucide-react";

import { Section, SectionHeading } from "@/components/site/section";
import { createClient } from "@/lib/supabase/server";
import { fallbackTestimonials, type Testimonial } from "@/lib/testimonials";

/**
 * Five star slots with half-star support: each slot layers a gold star over
 * a concrete base inside an overflow-hidden wrapper whose width is the fill
 * percentage for that slot (100 / 50 / 0).
 */
function Stars({
  rating,
  className = "size-[15px]",
}: {
  rating: number;
  className?: string;
}) {
  return (
    <span
      role="img"
      aria-label={`Rated ${rating} out of 5`}
      className="flex items-center gap-0.5"
    >
      {Array.from({ length: 5 }, (_, index) => {
        const percent = Math.max(0, Math.min(1, rating - index)) * 100;
        return (
          <span key={index} className="relative inline-flex" aria-hidden="true">
            <StarIcon className={`${className} fill-concrete-200 text-concrete-200`} />
            {percent > 0 ? (
              <span
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${percent}%` }}
              >
                <StarIcon
                  className={`${className} fill-camel-yellow-500 text-camel-yellow-500`}
                />
              </span>
            ) : null}
          </span>
        );
      })}
    </span>
  );
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  const meta = [testimonial.role, testimonial.company]
    .filter(Boolean)
    .join(" · ");

  return (
    <figure className="relative flex flex-col rounded-[18px] border border-concrete-200 bg-white p-7 shadow-card transition-all duration-[220ms] hover:-translate-y-[3px] hover:border-camel-green-200 hover:shadow-raised">
      {/* Subtle yellow detail + oversized quotation mark */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-4 right-6 font-heading text-[64px] leading-none font-bold text-camel-yellow-500/25 select-none"
      >
        &ldquo;
      </span>

      <div className="flex items-center gap-2">
        <Stars rating={testimonial.rating} />
        <span className="text-xs font-semibold text-concrete-600 tabular-nums">
          {testimonial.rating.toFixed(1)}
        </span>
      </div>

      <blockquote className="mt-4 flex-1">
        <p className="text-[15px] leading-relaxed text-concrete-800 md:text-base">
          &ldquo;{testimonial.quote}&rdquo;
        </p>
      </blockquote>

      <figcaption className="mt-6 flex items-center gap-3 border-t border-concrete-100 pt-5">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-concrete-950">
            {testimonial.name}
          </p>
          {meta ? (
            <p className="truncate text-xs text-concrete-600">{meta}</p>
          ) : null}
        </div>
        {testimonial.source === "google" ? (
          <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-concrete-200 bg-concrete-50 py-1 pr-2.5 pl-1.5">
            <Image
              src="/google-icon.png"
              alt=""
              width={20}
              height={20}
              className="size-5"
            />
            <span className="text-[11px] font-semibold text-concrete-600">
              Google
            </span>
            <span className="sr-only">Review from Google</span>
          </span>
        ) : null}
      </figcaption>
    </figure>
  );
}

async function getTestimonials(): Promise<Testimonial[]> {
  const supabase = await createClient();
  if (!supabase) return fallbackTestimonials;

  const { data, error } = await supabase
    .from("testimonials")
    .select("id, name, role, company, quote, rating, source")
    .eq("published", true)
    .order("display_order", { ascending: true });

  if (error || !data || data.length === 0) return fallbackTestimonials;
  return data.map((row) => ({ ...row, rating: Number(row.rating) }));
}

/** Homepage social-proof section fed by the `testimonials` table. */
export async function TestimonialsSection() {
  const testimonials = await getTestimonials();
  const average =
    testimonials.reduce((sum, item) => sum + item.rating, 0) /
    testimonials.length;

  return (
    <Section surface="canvas">
      <div className="container-site">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            eyebrow="What Builders Say"
            heading="Trusted Across Every Kind of Build"
            body="Builders, contractors and developers across Tanzania choose Camel Cement for consistent strength, fresh bags and deliveries that keep their sites moving."
          />
          <div className="flex shrink-0 items-center gap-2.5 md:pb-1">
            <Stars rating={average} className="size-[17px]" />
            <p className="text-sm font-semibold text-concrete-800">
              {average.toFixed(1)}
              <span className="font-normal text-concrete-600">
                {" "}
                · Rated by builders, contractors and developers across Tanzania
              </span>
            </p>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {testimonials.map((testimonial) => (
            <TestimonialCard
              key={testimonial.id ?? testimonial.name}
              testimonial={testimonial}
            />
          ))}
        </div>
      </div>
    </Section>
  );
}
