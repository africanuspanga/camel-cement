"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { fullNav, site } from "@/lib/site";
import { MenuIcon, PhoneIcon } from "lucide-react";

export function MobileNav({ onDark = false }: { onDark?: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={
            onDark
              ? "size-11 rounded-full text-white hover:bg-white/10 hover:text-white lg:hidden"
              : "size-11 rounded-full lg:hidden"
          }
          aria-label="Open navigation menu"
        >
          <MenuIcon className="size-5" aria-hidden="true" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="flex w-full max-w-sm flex-col p-0">
        <SheetHeader className="border-b border-concrete-200 px-6 py-4">
          <SheetTitle>
            <Image
              src="/logo.png"
              alt="Camel Cement"
              width={140}
              height={40}
              className="h-9 w-auto"
            />
          </SheetTitle>
        </SheetHeader>
        <nav
          aria-label="Mobile"
          className="flex-1 overflow-y-auto px-3 py-4"
        >
          <ul className="space-y-0.5">
            {fullNav.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-3 text-base font-semibold text-concrete-950 transition-colors hover:bg-concrete-100"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="space-y-3 border-t border-concrete-200 px-6 py-5">
          <Button
            asChild
            className="h-12 w-full rounded-full bg-camel-green-700 font-bold text-white hover:bg-camel-green-800"
          >
            <Link href="/request-quote" onClick={() => setOpen(false)}>
              Request a Quote
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-12 w-full rounded-full border-camel-green-700 font-bold text-camel-green-700"
          >
            <Link href="/dealers" onClick={() => setOpen(false)}>
              Find a Dealer
            </Link>
          </Button>
          <a
            href={site.phoneHref}
            className="flex items-center justify-center gap-2 pt-1 text-sm font-semibold text-concrete-800"
          >
            <PhoneIcon className="size-4" aria-hidden="true" />
            <span className="tabular-nums">{site.phone}</span>
          </a>
        </div>
      </SheetContent>
    </Sheet>
  );
}
