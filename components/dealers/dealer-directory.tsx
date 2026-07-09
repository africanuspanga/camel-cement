"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { regions } from "@/lib/site";
import { products } from "@/lib/products";
import {
  BadgeCheckIcon,
  ClockIcon,
  MapPinIcon,
  MessageCircleIcon,
  NavigationIcon,
  PackageIcon,
  PhoneIcon,
  SearchIcon,
  TruckIcon,
} from "lucide-react";

export interface Dealer {
  id: string | number;
  name: string;
  authorised?: boolean | null;
  phone?: string | null;
  whatsapp?: string | null;
  region?: string | null;
  district?: string | null;
  address?: string | null;
  delivery_available?: boolean | null;
  collection_available?: boolean | null;
  opening_hours?: string | null;
  products?: string[] | null;
}

const ALL = "all";

function directionsUrl(dealer: Dealer): string {
  const query = [dealer.name, dealer.address, dealer.district, dealer.region]
    .filter(Boolean)
    .join(", ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

function whatsappUrl(whatsapp: string): string {
  return `https://wa.me/${whatsapp.replace(/\D/g, "")}`;
}

export function DealerDirectory({ dealers }: { dealers: Dealer[] }) {
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState<string>(ALL);
  const [district, setDistrict] = useState("");
  const [product, setProduct] = useState<string>(ALL);

  const filteredDealers = useMemo(() => {
    const q = query.trim().toLowerCase();
    const d = district.trim().toLowerCase();
    return dealers.filter((dealer) => {
      if (region !== ALL && dealer.region !== region) return false;
      if (d && !(dealer.district ?? "").toLowerCase().includes(d))
        return false;
      if (
        product !== ALL &&
        !(dealer.products ?? []).some(
          (p) => p.toLowerCase() === product.toLowerCase()
        )
      )
        return false;
      if (q) {
        const haystack = [
          dealer.name,
          dealer.address,
          dealer.region,
          dealer.district,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [dealers, query, region, district, product]);

  return (
    <div className="space-y-8">
      {/* Filters */}
      <div className="grid gap-4 rounded-[18px] border border-concrete-200 bg-white p-6 shadow-[0_1px_2px_rgba(20,31,23,0.05)] sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="dealer-search">Search</Label>
          <div className="relative">
            <SearchIcon
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-concrete-400"
              aria-hidden="true"
            />
            <Input
              id="dealer-search"
              type="search"
              placeholder="Dealer name or location"
              className="pl-9"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="dealer-region">Region</Label>
          <Select value={region} onValueChange={setRegion}>
            <SelectTrigger id="dealer-region" className="w-full">
              <SelectValue placeholder="All regions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All regions</SelectItem>
              {regions.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="dealer-district">District</Label>
          <Input
            id="dealer-district"
            placeholder="Filter by district"
            value={district}
            onChange={(event) => setDistrict(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dealer-product">Product</Label>
          <Select value={product} onValueChange={setProduct}>
            <SelectTrigger id="dealer-product" className="w-full">
              <SelectValue placeholder="All products" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All products</SelectItem>
              {products.map((p) => (
                <SelectItem key={p.slug} value={p.grade}>
                  Camel Cement {p.grade} ({p.friendlyName})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results */}
      {filteredDealers.length === 0 ? (
        <div
          role="status"
          className="flex flex-col items-center gap-4 rounded-[24px] border border-dashed border-concrete-300 bg-white px-8 py-16 text-center"
        >
          <div className="flex size-14 items-center justify-center rounded-full bg-camel-green-50 text-camel-green-700">
            <MapPinIcon className="size-6" aria-hidden="true" />
          </div>
          <p className="max-w-xl text-balance font-bold text-concrete-950">
            No dealer matched the current search. Contact Camel Cement on +255
            788 026 188 and our sales team will help you.
          </p>
          <Button
            asChild
            className="h-11 rounded-full bg-camel-green-700 px-6 font-bold text-white hover:bg-camel-green-800"
          >
            <a href="tel:+255788026188">
              <PhoneIcon aria-hidden="true" />
              Call +255 788 026 188
            </a>
          </Button>
        </div>
      ) : (
        <ul className="grid gap-5 md:grid-cols-2" aria-label="Dealer results">
          {filteredDealers.map((dealer) => (
            <li
              key={dealer.id}
              className="flex flex-col gap-4 rounded-[18px] border border-concrete-200 bg-white p-6 shadow-[0_1px_2px_rgba(20,31,23,0.05)]"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-lg font-bold text-concrete-950">
                  {dealer.name}
                </h3>
                {dealer.authorised ? (
                  <Badge className="h-6 gap-1 border-camel-green-200 bg-camel-green-50 px-2.5 font-bold text-camel-green-800">
                    <BadgeCheckIcon aria-hidden="true" />
                    Authorised
                  </Badge>
                ) : null}
              </div>

              <div className="space-y-1.5 text-sm text-concrete-800">
                {dealer.address ? (
                  <p className="flex items-start gap-2">
                    <MapPinIcon
                      className="mt-0.5 size-4 shrink-0 text-camel-green-700"
                      aria-hidden="true"
                    />
                    {dealer.address}
                  </p>
                ) : null}
                <p className="pl-6 text-concrete-600">
                  {[dealer.district, dealer.region].filter(Boolean).join(", ")}
                </p>
                {dealer.opening_hours ? (
                  <p className="flex items-center gap-2 text-concrete-600">
                    <ClockIcon
                      className="size-4 shrink-0 text-camel-green-700"
                      aria-hidden="true"
                    />
                    {dealer.opening_hours}
                  </p>
                ) : null}
              </div>

              {(dealer.products ?? []).length > 0 ? (
                <div className="flex flex-wrap items-center gap-1.5">
                  <PackageIcon
                    className="size-4 text-concrete-400"
                    aria-hidden="true"
                  />
                  {(dealer.products ?? []).map((grade) => (
                    <Badge
                      key={grade}
                      variant="outline"
                      className="h-6 border-concrete-200 px-2.5 font-semibold text-concrete-800"
                    >
                      {grade}
                    </Badge>
                  ))}
                </div>
              ) : null}

              <div className="flex flex-wrap gap-2">
                {dealer.delivery_available ? (
                  <Badge className="h-6 gap-1 bg-camel-yellow-100 px-2.5 font-semibold text-concrete-950">
                    <TruckIcon aria-hidden="true" />
                    Delivery available
                  </Badge>
                ) : null}
                {dealer.collection_available ? (
                  <Badge className="h-6 gap-1 bg-concrete-100 px-2.5 font-semibold text-concrete-950">
                    Collection available
                  </Badge>
                ) : null}
              </div>

              <div className="mt-auto flex flex-wrap gap-2 border-t border-concrete-100 pt-4">
                {dealer.phone ? (
                  <Button
                    asChild
                    size="sm"
                    className="h-9 rounded-full bg-camel-green-700 px-4 font-bold text-white hover:bg-camel-green-800"
                  >
                    <a href={`tel:${dealer.phone.replace(/\s/g, "")}`}>
                      <PhoneIcon aria-hidden="true" />
                      {dealer.phone}
                    </a>
                  </Button>
                ) : null}
                {dealer.whatsapp ? (
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="h-9 rounded-full border-camel-green-700 px-4 font-bold text-camel-green-700 hover:bg-camel-green-50"
                  >
                    <a
                      href={whatsappUrl(dealer.whatsapp)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircleIcon aria-hidden="true" />
                      WhatsApp
                    </a>
                  </Button>
                ) : null}
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="h-9 rounded-full border-concrete-300 px-4 font-bold text-concrete-800 hover:bg-concrete-50"
                >
                  <a
                    href={directionsUrl(dealer)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <NavigationIcon aria-hidden="true" />
                    Get directions
                  </a>
                </Button>
                <Button
                  asChild
                  size="sm"
                  variant="ghost"
                  className="h-9 rounded-full px-4 font-bold text-camel-green-700 hover:bg-camel-green-50"
                >
                  <Link href="/contact?type=dealer">Request availability</Link>
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
