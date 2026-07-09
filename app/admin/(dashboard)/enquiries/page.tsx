import type { Metadata } from "next";
import { Inbox } from "lucide-react";

import { DataToolbar } from "@/components/admin/data-toolbar";
import { EmptyState } from "@/components/admin/empty-state";
import { PageHeader } from "@/components/admin/page-header";
import {
  RowActions,
  type DetailSection,
} from "@/components/admin/row-actions";
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
import { updateEnquiryStatus } from "@/lib/admin/actions";
import { formatDate, humaniseStatus, relativeTime } from "@/lib/admin/format";
import { escapeLike, PAGE_SIZE, pageRange, parsePage } from "@/lib/admin/queries";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Enquiries",
};

const ALL_STATUSES = [
  "new",
  "assigned",
  "contacted",
  "waiting_customer",
  "in_progress",
  "resolved",
  "closed",
  "spam",
];

const STATUS_GROUPS: Record<string, string[]> = {
  new: ["new"],
  in_progress: ["assigned", "contacted", "waiting_customer", "in_progress"],
  resolved: ["resolved"],
  closed: ["closed", "spam"],
};

const TABS = [
  { value: "all", label: "All" },
  { value: "new", label: "New" },
  { value: "in_progress", label: "In progress" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

interface EnquiryRow {
  id: string;
  reference: string;
  enquiry_type: string;
  full_name: string;
  company: string | null;
  phone: string;
  email: string | null;
  region: string | null;
  product: string | null;
  message: string;
  status: string;
  priority: string;
  created_at: string;
}

export default async function EnquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; page?: string }>;
}) {
  const params = await searchParams;
  const page = parsePage(params.page);
  const statusGroup = params.status && STATUS_GROUPS[params.status];
  const query = params.q?.trim();

  const supabase = await createClient();

  let rows: EnquiryRow[] = [];
  let total = 0;

  if (supabase) {
    let builder = supabase
      .from("contact_enquiries")
      .select(
        "id, reference, enquiry_type, full_name, company, phone, email, region, product, message, status, priority, created_at",
        { count: "exact" }
      );

    if (statusGroup) builder = builder.in("status", statusGroup);
    if (query) {
      const like = `%${escapeLike(query)}%`;
      builder = builder.or(
        `full_name.ilike.${like},reference.ilike.${like},phone.ilike.${like}`
      );
    }

    const [from, to] = pageRange(page);
    const { data, count } = await builder
      .order("created_at", { ascending: false })
      .range(from, to);

    rows = (data ?? []) as EnquiryRow[];
    total = count ?? 0;
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Enquiries"
        description="Contact form submissions and support requests from the public website."
      />

      <DataToolbar tabs={TABS} searchPlaceholder="Search name, phone or ref…" />

      <Card className="gap-0 overflow-hidden rounded-2xl border-concrete-200 bg-white py-0 shadow-none">
        {rows.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title={query || statusGroup ? "No enquiries match" : "No enquiries yet"}
            body={
              query || statusGroup
                ? "Try a different search term or status filter."
                : "Contact form submissions will appear here as soon as they arrive."
            }
          />
        ) : (
          <Table>
            <TableHeader className="bg-concrete-50">
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-5">Reference</TableHead>
                <TableHead className="hidden md:table-cell">Type</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="hidden lg:table-cell">Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Priority</TableHead>
                <TableHead className="hidden sm:table-cell">Created</TableHead>
                <TableHead className="w-12 pr-5" aria-label="Actions" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => {
                const sections: DetailSection[] = [
                  {
                    title: "Contact",
                    fields: [
                      { label: "Name", value: row.full_name },
                      { label: "Company", value: row.company ?? "" },
                      { label: "Phone", value: row.phone },
                      { label: "Email", value: row.email ?? "" },
                      { label: "Region", value: row.region ?? "" },
                    ],
                  },
                  {
                    title: "Enquiry",
                    fields: [
                      { label: "Type", value: humaniseStatus(row.enquiry_type) },
                      { label: "Product", value: row.product ?? "" },
                      {
                        label: "Priority",
                        value: humaniseStatus(row.priority),
                      },
                      { label: "Created", value: formatDate(row.created_at) },
                    ],
                  },
                ];

                return (
                  <TableRow key={row.id} className="h-12">
                    <TableCell className="pl-5 font-mono text-[13px] font-semibold">
                      {row.reference}
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">
                      {humaniseStatus(row.enquiry_type)}
                    </TableCell>
                    <TableCell>
                      <span className="block max-w-44 truncate font-medium">
                        {row.full_name}
                      </span>
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground tabular-nums lg:table-cell">
                      {row.phone}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={row.status} />
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <StatusBadge status={row.priority} />
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground tabular-nums sm:table-cell">
                      {relativeTime(row.created_at)}
                    </TableCell>
                    <TableCell className="pr-5 text-right">
                      <RowActions
                        id={row.id}
                        reference={row.reference}
                        entityLabel="Enquiry"
                        currentStatus={row.status}
                        statuses={ALL_STATUSES}
                        updateAction={updateEnquiryStatus}
                        sections={sections}
                        message={row.message}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
        <TablePagination
          page={page}
          pageSize={PAGE_SIZE}
          total={total}
          basePath="/admin/enquiries"
          searchParams={{ status: params.status, q: params.q }}
        />
      </Card>
    </div>
  );
}
