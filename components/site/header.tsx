"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useScroll } from "@/hooks/use-scroll";
import { mainNav, site } from "@/lib/site";
import { MobileNav } from "@/components/site/mobile-nav";
import { CartButton } from "@/components/cart/cart-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronDownIcon,
  ImagesIcon,
  MapPinIcon,
  NewspaperIcon,
  PhoneIcon,
} from "lucide-react";

export function SiteHeader() {
  const pathname = usePathname();
  const scrolled = useScroll(32);
  const isHome = pathname === "/";
  // Transparent chrome floating over the dark hero, solid white after scroll
  const transparent = isHome && !scrolled;

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-50">
        {/* Announcement bar collapses away on scroll */}
        <div
          className={cn(
            "overflow-hidden bg-camel-green-950/95 text-white backdrop-blur-sm transition-all duration-300",
            scrolled ? "max-h-0" : "max-h-10"
          )}
        >
          <div className="container-site flex h-9 items-center justify-between gap-4 text-[13px] font-medium">
            <p className="truncate">{site.announcement}</p>
            <a
              href={site.phoneHref}
              className="hidden shrink-0 items-center gap-1.5 text-white/85 transition-colors hover:text-camel-yellow-500 sm:flex"
            >
              <PhoneIcon className="size-3.5" aria-hidden="true" />
              <span className="tabular-nums">{site.phone}</span>
            </a>
          </div>
        </div>

        <header
          className={cn(
            "w-full border-b transition-all duration-300",
            transparent
              ? "border-white/10 bg-transparent"
              : "border-concrete-200 bg-white/94 shadow-[0_1px_2px_rgba(20,31,23,0.05)] backdrop-blur-xl"
          )}
        >
          <nav
            aria-label="Main"
            className="container-site flex h-[72px] items-center justify-between gap-4 lg:h-[88px]"
          >
            <Link
              href="/"
              className="flex shrink-0 items-center"
              aria-label="Camel Cement home"
            >
              <Image
                src="/logo.png"
                alt="Camel Cement, a member of Amsons Group"
                width={280}
                height={80}
                priority
                className={cn(
                  "h-14 w-auto transition-all lg:h-[72px]",
                  transparent &&
                    "drop-shadow-[0_2px_10px_rgba(0,0,0,0.45)] brightness-[1.04]"
                )}
              />
            </Link>

            <div className="hidden items-center gap-0.5 lg:flex">
              {mainNav.map((link) => {
                const active =
                  link.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(link.href);
                if (link.href === "/news") {
                  const mediaActive =
                    pathname.startsWith("/news") ||
                    pathname.startsWith("/gallery");
                  return (
                    <DropdownMenu key={link.href}>
                      <DropdownMenuTrigger
                        className={cn(
                          "relative flex items-center gap-1 rounded-full px-3.5 py-2 text-[15px] font-semibold outline-none transition-colors",
                          transparent
                            ? mediaActive
                              ? "text-camel-yellow-500"
                              : "text-white/90 hover:bg-white/10 hover:text-white"
                            : mediaActive
                              ? "text-camel-green-700"
                              : "text-concrete-800 hover:bg-concrete-100 hover:text-concrete-950"
                        )}
                      >
                        News
                        <ChevronDownIcon
                          className="size-3.5"
                          aria-hidden="true"
                        />
                        {mediaActive ? (
                          <span
                            aria-hidden="true"
                            className="absolute inset-x-3.5 -bottom-px h-0.5 rounded-full bg-camel-yellow-500"
                          />
                        ) : null}
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="start"
                        sideOffset={14}
                        className="w-[340px] rounded-2xl border-concrete-200 p-2 shadow-raised"
                      >
                        {[
                          {
                            href: "/news",
                            icon: NewspaperIcon,
                            title: "News and Insights",
                            description:
                              "Company updates, awards and practical construction guidance.",
                          },
                          {
                            href: "/gallery",
                            icon: ImagesIcon,
                            title: "Media Gallery",
                            description:
                              "Photos and video from our projects, factory and products.",
                          },
                        ].map((item) => (
                          <DropdownMenuItem
                            key={item.href}
                            asChild
                            className="rounded-xl p-2.5 focus:bg-camel-green-50"
                          >
                            <Link href={item.href} className="flex items-start gap-3.5">
                              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-camel-green-50 text-camel-green-700">
                                <item.icon
                                  className="size-5"
                                  aria-hidden="true"
                                />
                              </span>
                              <span className="min-w-0">
                                <span className="block text-[15px] font-bold text-concrete-950">
                                  {item.title}
                                </span>
                                <span className="mt-0.5 block text-[13px] leading-snug text-concrete-600">
                                  {item.description}
                                </span>
                              </span>
                            </Link>
                          </DropdownMenuItem>
                        ))}
                        <div className="mt-1.5 border-t border-concrete-100 px-2.5 py-2.5">
                          <Link
                            href="/news/african-company-of-the-year-2026"
                            className="group/award flex items-center gap-2 text-[13px] font-semibold text-camel-green-700 hover:text-camel-green-800"
                          >
                            <span
                              aria-hidden="true"
                              className="size-1.5 rounded-full bg-camel-yellow-500"
                            />
                            African Company of the Year 2026
                            <span
                              aria-hidden="true"
                              className="transition-transform duration-150 group-hover/award:translate-x-0.5"
                            >
                              →
                            </span>
                          </Link>
                        </div>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  );
                }
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "relative rounded-full px-3.5 py-2 text-[15px] font-semibold transition-colors",
                      transparent
                        ? active
                          ? "text-camel-yellow-500"
                          : "text-white/90 hover:bg-white/10 hover:text-white"
                        : active
                          ? "text-camel-green-700"
                          : "text-concrete-800 hover:bg-concrete-100 hover:text-concrete-950"
                    )}
                    aria-current={active ? "page" : undefined}
                  >
                    {link.label}
                    {active ? (
                      <span
                        aria-hidden="true"
                        className="absolute inset-x-3.5 -bottom-px h-0.5 rounded-full bg-camel-yellow-500"
                      />
                    ) : null}
                  </Link>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <Button
                asChild
                variant="ghost"
                className={cn(
                  "hidden rounded-full font-semibold xl:inline-flex",
                  transparent
                    ? "text-white hover:bg-white/10 hover:text-white"
                    : "text-concrete-800"
                )}
              >
                <Link href="/dealers">
                  <MapPinIcon aria-hidden="true" />
                  Find a Dealer
                </Link>
              </Button>
              <CartButton onDark={transparent} />
              <Button
                asChild
                className={cn(
                  "hidden h-11 rounded-full px-5 font-bold sm:inline-flex",
                  transparent
                    ? "bg-camel-yellow-500 text-camel-black hover:bg-camel-yellow-600"
                    : "bg-camel-green-700 text-white hover:bg-camel-green-800"
                )}
              >
                <Link href="/request-quote">Request a Quote</Link>
              </Button>
              <MobileNav onDark={transparent} />
            </div>
          </nav>
        </header>
      </div>

      {/* Spacer keeps in-flow content clear of the fixed chrome on inner pages */}
      {!isHome ? <div aria-hidden="true" className="h-[108px] lg:h-[124px]" /> : null}
    </>
  );
}
