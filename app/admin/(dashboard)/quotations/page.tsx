import type { Metadata } from "next";
import { ReceiptText } from "lucide-react";

import { DataToolbar } from "@/components/admin/data-toolbar";
import { EmptyState } from "@/components/admin/empty-state";
import { PageHeader } from "@/components/admin/page-header";
import {
  RowActions,
  type DetailSection,
  type TimelineEntry,
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
import { updateQuoteStatus } from "@/lib/admin/actions";
import { formatDate, humaniseStatus, relativeTime } from "@/lib/admin/format";
import { escapeLike, PAGE_SIZE, pageRange, parsePage } from "@/lib/admin/queries";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Quotations",
};

const ALL_STATUSES = [
  "new",
  "reviewing",
  "contacted",
  "quotation_prepared",
  "quotation_sent",
  "negotiating",
  "approved",
  "won",
  "lost",
  "closed",
];

const STATUS_GROUPS: Record<string, string[]> = {
  new: ["new"],
  in_progress: [
    "reviewing",
    "contacted",
    "quotation_prepared",
    "quotation_sent",
    "negotiating",
    "approved",
  ],
  won: ["won"],
  lost: ["lost", "closed"],
};

const TABS = [
  { value: "all", label: "All" },
  { value: "new", label: "New" },
  { value: "in_progress", label: "In progress" },
  { value: "won", label: "Won" },
  { value: "lost", label: "Lost" },
];

interface QuoteRow {
  id: string;
  reference: string;
  customer_type: string;
  full_name: string;
  company: string | null;
  phone: string;
  email: string | null;
  region: string | null;
  district: string | null;
  fulfilment: string | null;
  project_type: string | null;
  notes: string | null;
  status: string;
  created_at: string;
}

export default async function QuotationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; page?: string }>;
}) {
  const params = await searchParams;
  const page = parsePage(params.page);
  const statusGroup = params.status && STATUS_GROUPS[params.status];
  const query = params.q?.trim();

  const supabase = await createClient();

  let rows: QuoteRow[] = [];
  let total = 0;
  let itemsByQuote = new Map<string, string>();
  let historyByQuote = new Map<string, TimelineEntry[]>();

  if (supabase) {
    let builder = supabase
      .from("quote_requests")
      .select(
        "id, reference, customer_type, full_name, company, phone, email, region, district, fulfilment, project_type, notes, status, created_at",
        { count: "exact" }
      );

    if (statusGroup) builder = builder.in("status", statusGroup);
    if (query) {
      const like = `%${escapeLike(query)}%`;
      builder = builder.or(
        `full_name.ilike.${like},reference.ilike.${like},company.ilike.${like}`
      );
    }

    const [from, to] = pageRange(page);
    const { data, count } = await builder
      .order("created_at", { ascending: false })
      .range(from, to);

    rows = (data ?? []) as QuoteRow[];
    total = count ?? 0;

    if (rows.length > 0) {
      const ids = rows.map((row) => row.id);
      const [itemsRes, historyRes] = await Promise.all([
        supabase
          .from("quote_items")
          .select("quote_id, product_name, quantity_bags")
          .in("quote_id", ids),
        supabase
          .from("quote_status_history")
          .select("quote_id, status, note, created_at")
          .in("quote_id", ids)
          .order("created_at", { ascending: false }),
      ]);

      const summaries = new Map<string, string[]>();
      for (const item of itemsRes.data ?? []) {
        const list = summaries.get(item.quote_id) ?? [];
        list.push(`${item.product_name} × ${item.quantity_bags}`);
        summaries.set(item.quote_id, list);
      }
      itemsByQuote = new Map(
        [...summaries.entries()].map(([id, list]) => [id, list.join(", ")])
      );

      const history = new Map<string, TimelineEntry[]>();
      for (const entry of historyRes.data ?? []) {
        const list = history.get(entry.quote_id) ?? [];
        list.push({
          status: entry.status,
          note: entry.note,
          at: entry.created_at,
        });
        history.set(entry.quote_id, list);
      }
      historyByQuote = history;
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Quotations"
        description="Review, follow up and progress quotation requests from the website and AI assistant."
      />

      <DataToolbar tabs={TABS} searchPlaceholder="Search name or reference…" />

      <Card className="gap-0 overflow-hidden rounded-2xl border-concrete-200 bg-white py-0 shadow-none">
        {rows.length === 0 ? (
          <EmptyState
            icon={ReceiptText}
            title={
              query || statusGroup
                ? "No quotations match"
                : "No quotation requests yet"
            }
            body={
              query || statusGroup
                ? "Try a different search term or status filter."
                : "New requests will appear here when customers submit the website form."
            }
          />
        ) : (
          <Table>
            <TableHeader className="bg-concrete-50">
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-5">Reference</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="hidden lg:table-cell">Products</TableHead>
                <TableHead className="hidden md:table-cell">Region</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden sm:table-cell">Created</TableHead>
                <TableHead className="w-12 pr-5" aria-label="Actions" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => {
                const sections: DetailSection[] = [
                  {
                    title: "Customer",
                    fields: [
                      { label: "Name", value: row.full_name },
                      { label: "Company", value: row.company ?? "" },
                      {
                        label: "Customer type",
                        value: humaniseStatus(row.customer_type),
                      },
                      { label: "Phone", value: row.phone },
                      { label: "Email", value: row.email ?? "" },
                    ],
                  },
                  {
                    title: "Request",
                    fields: [
                      { label: "Products", value: itemsByQuote.get(row.id) ?? "" },
                      {
                        label: "Region",
                        value: [row.region, row.district]
                          .filter(Boolean)
                          .join(", "),
                      },
                      {
                        label: "Fulfilment",
                        value: humaniseStatus(row.fulfilment),
                      },
                      {
                        label: "Project type",
                        value: humaniseStatus(row.project_type),
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
                    <TableCell>
                      <span className="block max-w-44 truncate font-medium">
                        {row.full_name}
                      </span>
                      {row.company ? (
                        <span className="block max-w-44 truncate text-xs text-muted-foreground">
                          {row.company}
                        </span>
                      ) : null}
                    </TableCell>
                    <TableCell className="hidden max-w-56 truncate text-muted-foreground lg:table-cell">
                      {itemsByQuote.get(row.id) ?? "—"}
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">
                      {row.region ?? "—"}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={row.status} />
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground tabular-nums sm:table-cell">
                      {relativeTime(row.created_at)}
                    </TableCell>
                    <TableCell className="pr-5 text-right">
                      <RowActions
                        id={row.id}
                        reference={row.reference}
                        entityLabel="Quotation request"
                        currentStatus={row.status}
                        statuses={ALL_STATUSES}
                        updateAction={updateQuoteStatus}
                        sections={sections}
                        message={row.notes}
                        timeline={historyByQuote.get(row.id) ?? []}
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
          basePath="/admin/quotations"
          searchParams={{ status: params.status, q: params.q }}
        />
      </Card>
    </div>
  );
}
