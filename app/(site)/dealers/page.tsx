import type { Metadata } from "next";
import { Section, SectionHeading, Eyebrow } from "@/components/site/section";
import {
  DealerDirectory,
  type Dealer,
} from "@/components/dealers/dealer-directory";
import { createClient } from "@/lib/supabase/server";
import { MapPinIcon } from "lucide-react";

export const metadata: Metadata = {
  title: "Find Camel Cement Dealers in Tanzania",
  description:
    "Search for Camel Cement sales contacts and authorised dealers by region, district and location across Tanzania.",
};

async function getDealers(): Promise<Dealer[]> {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("dealers")
    .select(
      "id, name, authorised, phone, whatsapp, region, district, address, delivery_available, collection_available, opening_hours, products"
    )
    .order("name");
  if (error || !data) return [];
  return data as Dealer[];
}

export default async function DealersPage() {
  const dealers = await getDealers();

  return (
    <>
      {/* Hero */}
      <Section surface="canvas" className="border-b border-concrete-200">
        <div className="container-site">
          <div className="max-w-3xl space-y-5">
            <Eyebrow>FIND A DEALER</Eyebrow>
            <h1 className="text-h1 text-balance text-concrete-950">
              Camel Cement, Closer to Your Project
            </h1>
            <p className="text-lead text-concrete-800">
              Search by region, district or current location to find authorised
              Camel Cement contacts and dealers serving your area.
            </p>
          </div>
        </div>
      </Section>

      {/* Factory location map */}
      <Section surface="white" className="pb-0 md:pb-0 lg:pb-0">
        <div className="container-site space-y-4">
          <div className="overflow-hidden rounded-[24px] border border-concrete-200 shadow-card">
            <iframe
              title="Camel Cement, Mbagala Industrial Area, Kilwa Road, Dar es Salaam"
              src="https://maps.google.com/maps?q=Camel%20Cement%20Mbagala%20Industrial%20Area%20Kilwa%20Road%20Dar%20es%20Salaam&z=13&output=embed"
              className="h-[320px] w-full border-0 md:h-[420px]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
          <p className="flex items-center gap-2 text-sm text-concrete-600">
            <MapPinIcon
              className="size-4 shrink-0 text-camel-green-700"
              aria-hidden="true"
            />
            Camel Cement factory, Mbagala Industrial Area, Kilwa Road, Dar es
            Salaam. The dealer list below is fully searchable by region,
            district, product and keyword.
          </p>
        </div>
      </Section>

      {/* Directory */}
      <Section surface="white">
        <div className="container-site space-y-10">
          <SectionHeading
            eyebrow="Dealer Directory"
            heading="Search Authorised Contacts and Dealers"
          />
          <DealerDirectory dealers={dealers} />
        </div>
      </Section>
    </>
  );
}
