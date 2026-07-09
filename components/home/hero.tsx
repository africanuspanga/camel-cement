import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon, CalculatorIcon } from "lucide-react";

export function HomeHero() {
  return (
    <section className="relative isolate overflow-hidden bg-camel-green-950">
      {/* Background video with deep green overlay for contrast */}
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
        className="absolute inset-0 -z-20 size-full object-cover motion-reduce:hidden"
      >
        <source src="/videos/hero-background.mp4" type="video/mp4" />
      </video>
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-b from-camel-green-950/80 via-camel-green-950/60 to-camel-green-950/85"
      />

      {/* Faded vertical guide borders, echoing the hero-1 composition */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-1 mx-auto hidden w-full max-w-5xl lg:block"
      >
        <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-white/15 to-transparent" />
        <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-white/15 to-transparent" />
      </div>

      <div className="container-site relative flex flex-col items-center justify-center gap-6 pb-28 pt-44 text-center md:pb-36 md:pt-52 lg:pb-44 lg:pt-60">
        <p
          className={cn(
            "flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 backdrop-blur-sm",
            "animate-in fade-in slide-in-from-bottom-10 fill-mode-backwards duration-500 ease-out"
          )}
        >
          <span
            aria-hidden="true"
            className="size-1.5 rounded-full bg-camel-yellow-500"
          />
          <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-white/90">
            The Engineer&apos;s Choice
          </span>
        </p>

        <h1
          className={cn(
            "max-w-5xl text-balance font-extrabold leading-[0.98] tracking-[-0.04em] text-white",
            "text-[clamp(3.5rem,10vw,7.5rem)]",
            "animate-in fade-in slide-in-from-bottom-10 fill-mode-backwards delay-100 duration-500 ease-out"
          )}
        >
          We Build{" "}
          <span className="relative inline-block text-camel-yellow-500">
            Stronger
            <svg
              aria-hidden="true"
              viewBox="0 0 220 12"
              className="absolute -bottom-2 left-0 w-full text-camel-yellow-500/70"
              fill="none"
            >
              <path
                d="M3 9C60 3 160 3 217 9"
                stroke="currentColor"
                strokeWidth="5"
                strokeLinecap="round"
              />
            </svg>
          </span>
        </h1>

        <p
          className={cn(
            "text-lead max-w-2xl text-pretty text-white/85",
            "animate-in fade-in slide-in-from-bottom-10 fill-mode-backwards delay-200 duration-500 ease-out"
          )}
        >
          Camel Cement delivers dependable strength, consistent quality and
          reliable performance for homes, commercial developments and major
          infrastructure across Tanzania.
        </p>

        <div
          className={cn(
            "flex flex-wrap items-center justify-center gap-3 pt-2",
            "animate-in fade-in slide-in-from-bottom-10 fill-mode-backwards delay-300 duration-500 ease-out"
          )}
        >
          <Button
            asChild
            size="lg"
            className="h-12 rounded-full bg-white px-6 font-bold text-camel-green-800 hover:bg-concrete-100"
          >
            <Link href="/products">
              Explore Our Products
              <ArrowRightIcon aria-hidden="true" />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            className="h-12 rounded-full bg-camel-yellow-500 px-6 font-bold text-camel-black hover:bg-camel-yellow-600"
          >
            <Link href="/calculator">
              <CalculatorIcon aria-hidden="true" />
              Calculate Your Cement
            </Link>
          </Button>
        </div>

        <Link
          href="/request-quote"
          className={cn(
            "group inline-flex items-center gap-1.5 text-sm font-semibold text-white/80 transition-colors hover:text-camel-yellow-500",
            "animate-in fade-in slide-in-from-bottom-10 fill-mode-backwards delay-400 duration-500 ease-out"
          )}
        >
          Request a Quote
          <ArrowRightIcon
            className="size-4 transition-transform duration-150 ease-out group-hover:translate-x-1"
            aria-hidden="true"
          />
        </Link>
      </div>
    </section>
  );
}
