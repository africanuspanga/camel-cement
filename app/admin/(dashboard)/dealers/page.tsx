import type { Metadata } from "next";
import { MapPin } from "lucide-react";

import { AddDealerDialog } from "@/components/admin/add-dealer-dialog";
import { ImportDealersDialog } from "@/components/admin/dealers/import-dealers-dialog";
import { DataToolbar } from "@/components/admin/data-toolbar";
import { EmptyState } from "@/components/admin/empty-state";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { TablePagination } from "@/components/admin/table-pagination";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { escapeLike, PAGE_SIZE, pageRange, parsePage } from "@/lib/admin/queries";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Dealers",
};

interface DealerRow {
  id: string;
  name: string;
  region: string;
  district: string | null;
  phone: string | null;
  authorised: boolean;
  active: boolean;
}

export default async function DealersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const params = await searchParams;
  const page = parsePage(params.page);
  const query = params.q?.trim();

  const supabase = await createClient();

  let rows: DealerRow[] = [];
  let total = 0;

  if (supabase) {
    let builder = supabase
      .from("dealers")
      .select("id, name, region, district, phone, authorised, active", {
        count: "exact",
      });

    if (query) {
      const like = `%${escapeLike(query)}%`;
      builder = builder.or(
        `name.ilike.${like},region.ilike.${like},district.ilike.${like}`
      );
    }

    const [from, to] = pageRange(page);
    const { data, count } = await builder
      .order("region", { ascending: true })
      .order("name", { ascending: true })
      .range(from, to);

    rows = (data ?? []) as DealerRow[];
    total = count ?? 0;
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Dealers"
        description="The authorised dealer network powering the public dealer locator."
      >
        <div className="flex flex-wrap items-center gap-2">
          <ImportDealersDialog />
          <AddDealerDialog />
        </div>
      </PageHeader>

      <DataToolbar searchPlaceholder="Search name, region or district…" />

      <Card className="gap-0 overflow-hidden rounded-2xl border-concrete-200 bg-white py-0 shadow-none">
        {rows.length === 0 ? (
          <EmptyState
            icon={MapPin}
            title={query ? "No dealers match" : "No dealers yet"}
            body={
              query
                ? "Try a different search term."
                : "Add your first dealer to power the public locator."
            }
          />
        ) : (
          <Table>
            <TableHeader className="bg-concrete-50">
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-5">Name</TableHead>
                <TableHead>Region</TableHead>
                <TableHead className="hidden md:table-cell">District</TableHead>
                <TableHead className="hidden sm:table-cell">Phone</TableHead>
                <TableHead>Authorised</TableHead>
                <TableHead className="pr-5">Active</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id} className="h-12">
                  <TableCell className="pl-5 font-medium">{row.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {row.region}
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground md:table-cell">
                    {row.district ?? "—"}
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground tabular-nums sm:table-cell">
                    {row.phone ?? "—"}
                  </TableCell>
                  <TableCell>
                    <StatusBadge
                      status={row.authorised ? "authorised" : "no"}
                      label={row.authorised ? "Authorised" : "Pending"}
                    />
                  </TableCell>
                  <TableCell className="pr-5">
                    <StatusBadge
                      status={row.active ? "active" : "inactive"}
                      label={row.active ? "Active" : "Inactive"}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        <TablePagination
          page={page}
          pageSize={PAGE_SIZE}
          total={total}
          basePath="/admin/dealers"
          searchParams={{ q: params.q }}
        />
      </Card>
    </div>
  );
}
