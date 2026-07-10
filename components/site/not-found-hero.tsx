import Link from "next/link";
import { ArrowRightIcon, HomeIcon, PackageIcon } from "lucide-react";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * Branded 404 hero on the deep green surface: a huge gradient "404",
 * a short explanation and routes back to solid ground. Used by both the
 * root app/not-found.tsx (unmatched URLs, full screen, no site chrome)
 * and app/(site)/not-found.tsx (notFound() inside the site shell).
 */
export function NotFoundHero({ fullScreen = false }: { fullScreen?: boolean }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-8 bg-camel-green-950 bg-gradient-to-b from-camel-green-900 to-camel-green-950 px-6 py-20 text-center",
        fullScreen && "min-h-svh"
      )}
    >
      <p className="text-eyebrow text-camel-yellow-500">
        {site.name} · {site.tagline}
      </p>

      <div>
        <p
          aria-hidden="true"
          className="bg-gradient-to-b from-camel-yellow-500 via-camel-yellow-500/45 to-transparent bg-clip-text text-[clamp(8rem,26vw,15rem)] font-extrabold leading-none tracking-tight text-transparent select-none"
        >
          404
        </p>
        <h1 className="mt-2 text-2xl font-bold text-white md:text-3xl">
          This page has moved or does not exist
        </h1>
        <p className="mx-auto mt-3 max-w-md text-white/70">
          Even the strongest structures need the right foundations. These links
          will get you back on solid ground.
        </p>
      </div>

      <div className="flex w-full max-w-sm flex-col gap-3 sm:w-auto sm:max-w-none sm:flex-row">
        <Link
          href="/"
          className="flex h-12 items-center justify-center gap-2 rounded-full bg-camel-yellow-500 px-7 text-sm font-bold text-camel-black transition-colors hover:bg-camel-yellow-600"
        >
          <HomeIcon aria-hidden="true" className="size-4" />
          Go Home
        </Link>
        <Link
          href="/products"
          className="flex h-12 items-center justify-center gap-2 rounded-full border border-white/30 px-7 text-sm font-bold text-white transition-colors hover:bg-white/10"
        >
          <PackageIcon aria-hidden="true" className="size-4" />
          Explore Products
          <ArrowRightIcon aria-hidden="true" className="size-4" />
        </Link>
      </div>

      <p className="text-sm text-white/55">
        Need a hand? Call{" "}
        <a
          href={site.phoneHref}
          className="font-bold text-camel-yellow-500 hover:text-camel-yellow-200"
        >
          {site.phone}
        </a>{" "}
        and our team will point you the right way.
      </p>
    </div>
  );
}
