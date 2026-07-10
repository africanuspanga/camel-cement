import type { Metadata } from "next";
import { NotFoundHero } from "@/components/site/not-found-hero";

export const metadata: Metadata = {
  title: "Page Not Found",
};

/** Global 404 for unmatched URLs (renders without the site shell). */
export default function NotFound() {
  return <NotFoundHero fullScreen />;
}
