import Link from "next/link";
import Image from "next/image";
import { site } from "@/lib/site";
import { MapPinIcon, MailIcon, PhoneIcon } from "lucide-react";
import { InstagramIcon } from "@/components/site/instagram-icon";

const footerColumns = [
  {
    title: "Explore",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Products", href: "/products" },
      { label: "Quality Assurance", href: "/quality" },
      { label: "Sustainability and CSR", href: "/sustainability" },
      { label: "Projects", href: "/projects" },
      { label: "News and Insights", href: "/news" },
    ],
  },
  {
    title: "Customer Support",
    links: [
      { label: "Cement Calculator", href: "/calculator" },
      { label: "Find a Dealer", href: "/dealers" },
      { label: "Request a Quote", href: "/request-quote" },
      { label: "Resources and Downloads", href: "/resources" },
      { label: "Frequently Asked Questions", href: "/faq" },
      { label: "Contact Us", href: "/contact" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Careers", href: "/careers" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Use", href: "/terms" },
      { label: "Cookie Preferences", href: "/privacy#cookies" },
      { label: "Amsons Group", href: "https://amsonsgroup.net" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t-4 border-camel-yellow-500 bg-camel-green-950 text-white">
      <div className="container-site grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-5 lg:gap-8 lg:py-20">
        <div className="space-y-4 lg:col-span-2 lg:pr-10">
          <Image
            src="/logo.png"
            alt="Camel Cement, a member of Amsons Group"
            width={260}
            height={76}
            className="h-16 w-auto rounded-lg bg-white p-2 lg:h-20"
          />
          <p className="text-h3 text-white">{site.tagline}</p>
          <p className="max-w-sm text-[15px] leading-relaxed text-white/76">
            Reliable cement solutions for homes, businesses and infrastructure
            across Tanzania.
          </p>
          <p className="text-label text-camel-yellow-500">
            {site.brandRelationship}
          </p>
          <a
            href={site.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white/85 transition-colors hover:border-camel-yellow-500 hover:text-camel-yellow-500"
          >
            <InstagramIcon className="size-4" aria-hidden="true" />
            {site.instagramHandle}
          </a>
        </div>

        {footerColumns.map((column) => (
          <nav key={column.title} aria-label={column.title}>
            <h3 className="text-label mb-4 uppercase tracking-wider text-white/60">
              {column.title}
            </h3>
            <ul className="space-y-2.5">
              {column.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-[15px] text-white/85 transition-colors hover:text-camel-yellow-500"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="container-site border-t border-white/10 py-8">
        <div className="grid gap-6 text-[15px] text-white/76 sm:grid-cols-3">
          <p className="flex items-start gap-2.5">
            <MapPinIcon
              className="mt-0.5 size-4 shrink-0 text-camel-yellow-500"
              aria-hidden="true"
            />
            Mbagala Industrial Area, Kilwa Road
            <br />
            P.O. Box 22786, Dar es Salaam, Tanzania
          </p>
          <a
            href={site.phoneHref}
            className="flex items-center gap-2.5 transition-colors hover:text-camel-yellow-500"
          >
            <PhoneIcon
              className="size-4 shrink-0 text-camel-yellow-500"
              aria-hidden="true"
            />
            <span className="tabular-nums">{site.phone}</span>
          </a>
          <a
            href={`mailto:${site.salesEmail}`}
            className="flex items-center gap-2.5 break-all transition-colors hover:text-camel-yellow-500"
          >
            <MailIcon
              className="size-4 shrink-0 text-camel-yellow-500"
              aria-hidden="true"
            />
            {site.salesEmail}
          </a>
        </div>
      </div>

      <div className="bg-[#01230b]">
        <div className="container-site flex flex-col items-center justify-between gap-2 py-5 text-[13px] text-white/60 sm:flex-row">
          <p>
            © {new Date().getFullYear()} Camel Cement. A member of Amsons
            Group. All rights reserved.
          </p>
          <div className="flex gap-5">
            <Link href="/privacy" className="hover:text-camel-yellow-500">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-camel-yellow-500">
              Terms
            </Link>
            <Link href="/faq" className="hover:text-camel-yellow-500">
              FAQ
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
