import Link from "next/link";
import { Section, Eyebrow } from "@/components/site/section";
import { Button } from "@/components/ui/button";
import {
  ArrowRightIcon,
  CalculatorIcon,
  HomeIcon,
  PackageIcon,
  PhoneIcon,
} from "lucide-react";

const helpfulLinks = [
  { icon: HomeIcon, label: "Home", href: "/" },
  { icon: PackageIcon, label: "Products", href: "/products" },
  { icon: CalculatorIcon, label: "Calculator", href: "/calculator" },
  { icon: PhoneIcon, label: "Contact", href: "/contact" },
];

export default function NotFound() {
  return (
    <Section surface="canvas" className="py-24 md:py-32">
      <div className="container-site flex flex-col items-center gap-8 text-center">
        <div className="space-y-4">
          <Eyebrow>ERROR 404</Eyebrow>
          <h1 className="text-display text-balance text-concrete-950">
            Page not found
          </h1>
          <p className="mx-auto max-w-xl text-lead text-concrete-800">
            The page you are looking for has moved or does not exist. These
            links will get you back on solid ground.
          </p>
        </div>

        <div className="grid w-full max-w-2xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {helpfulLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group flex flex-col items-center gap-3 rounded-[18px] border border-concrete-200 bg-white p-6 shadow-[0_1px_2px_rgba(20,31,23,0.05)] transition-all duration-[220ms] hover:-translate-y-[3px] hover:border-camel-green-200 hover:shadow-card"
            >
              <div className="flex size-11 items-center justify-center rounded-xl bg-camel-green-50 text-camel-green-700">
                <link.icon className="size-5.5" aria-hidden="true" />
              </div>
              <span className="font-bold text-concrete-950 group-hover:text-camel-green-700">
                {link.label}
              </span>
            </Link>
          ))}
        </div>

        <Button
          asChild
          size="lg"
          className="h-12 rounded-full bg-camel-green-700 px-7 font-bold text-white hover:bg-camel-green-800"
        >
          <Link href="/">
            Return to the Homepage
            <ArrowRightIcon aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </Section>
  );
}
