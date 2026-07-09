import type { Metadata } from "next";
import Image from "next/image";
import { MessageSquareQuote, StarIcon } from "lucide-react";

import { AddTestimonialDialog } from "@/components/admin/testimonials/testimonial-dialog";
import { TestimonialPublishedSwitch } from "@/components/admin/testimonials/testimonial-published-switch";
import { TestimonialRowActions } from "@/components/admin/testimonials/testimonial-row-actions";
import type { TestimonialRecord } from "@/components/admin/testimonials/testimonial-dialog";
import { EmptyState } from "@/components/admin/empty-state";
import { PageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/admin/format";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Testimonials",
};

interface TestimonialRow extends TestimonialRecord {
  created_at: string;
}

/** Compact gold star row with half-star support for table cells. */
function RatingStars({ rating }: { rating: number }) {
  return (
    <span
      role="img"
      aria-label={`Rated ${rating} out of 5`}
      className="flex items-center gap-1.5"
    >
      <span className="flex items-center gap-px" aria-hidden="true">
        {Array.from({ length: 5 }, (_, index) => {
          const percent = Math.max(0, Math.min(1, rating - index)) * 100;
          return (
            <span key={index} className="relative inline-flex">
              <StarIcon className="size-3.5 fill-concrete-200 text-concrete-200" />
              {percent > 0 ? (
                <span
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${percent}%` }}
                >
                  <StarIcon className="size-3.5 fill-camel-yellow-500 text-camel-yellow-500" />
                </span>
              ) : null}
            </span>
          );
        })}
      </span>
      <span className="text-xs text-muted-foreground tabular-nums">
        {rating.toFixed(1)}
      </span>
    </span>
  );
}

export default async function TestimonialsPage() {
  const supabase = await createClient();

  let rows: TestimonialRow[] = [];
  if (supabase) {
    // Staff RLS policy lets signed-in staff see unpublished rows too.
    const { data } = await supabase
      .from("testimonials")
      .select("id, name, role, company, quote, rating, source, published, created_at")
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });

    rows = (data ?? []).map((row) => ({
      ...row,
      rating: Number(row.rating),
    })) as TestimonialRow[];
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Testimonials"
        description="Customer quotes shown in the homepage social-proof section. Published rows appear on the site in display order."
      >
        <AddTestimonialDialog />
      </PageHeader>

      <Card className="gap-0 overflow-hidden rounded-2xl border-concrete-200 bg-white py-0 shadow-none">
        {rows.length === 0 ? (
          <EmptyState
            icon={MessageSquareQuote}
            title="No testimonials yet"
            body="Add your first customer quote and it will appear on the homepage as soon as it is published."
            action={<AddTestimonialDialog />}
          />
        ) : (
          <Table>
            <TableHeader className="bg-concrete-50">
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-5">Name</TableHead>
                <TableHead className="hidden lg:table-cell">
                  Role / Company
                </TableHead>
                <TableHead className="hidden md:table-cell">Quote</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead className="hidden sm:table-cell">Source</TableHead>
                <TableHead>Published</TableHead>
                <TableHead className="hidden xl:table-cell">Created</TableHead>
                <TableHead className="w-12 pr-5">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id} className="h-12">
                  <TableCell className="pl-5 font-medium">{row.name}</TableCell>
                  <TableCell className="hidden max-w-52 text-muted-foreground lg:table-cell">
                    <span className="block truncate">
                      {[row.role, row.company].filter(Boolean).join(" · ") ||
                        "—"}
                    </span>
                  </TableCell>
                  <TableCell className="hidden max-w-72 text-muted-foreground md:table-cell">
                    <span className="block truncate">{row.quote}</span>
                  </TableCell>
                  <TableCell>
                    <RatingStars rating={row.rating} />
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {row.source === "google" ? (
                      <Badge
                        variant="outline"
                        className="gap-1.5 rounded-full border-concrete-200 font-medium text-concrete-700"
                      >
                        <Image
                          src="/google-icon.png"
                          alt=""
                          width={14}
                          height={14}
                          className="size-3.5"
                        />
                        Google
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="rounded-full border-concrete-200 font-medium text-concrete-700"
                      >
                        Direct
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <TestimonialPublishedSwitch
                      id={row.id}
                      name={row.name}
                      published={row.published}
                    />
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground tabular-nums xl:table-cell">
                    {formatDate(row.created_at)}
                  </TableCell>
                  <TableCell className="pr-5 text-right">
                    <TestimonialRowActions testimonial={row} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
