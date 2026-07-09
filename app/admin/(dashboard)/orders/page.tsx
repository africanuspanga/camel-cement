import type { Metadata } from "next";
import { ShoppingCart } from "lucide-react";

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
import { updateOrderStatus } from "@/lib/admin/actions";
import {
  formatDate,
  formatNumber,
  formatTonnes,
  humaniseStatus,
  relativeTime,
} from "@/lib/admin/format";
import { escapeLike, PAGE_SIZE, pageRange, parsePage } from "@/lib/admin/queries";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Orders",
};

const ALL_STATUSES = [
  "draft",
  "submitted",
  "under_review",
  "price_confirmed",
  "awaiting_approval",
  "approved",
  "payment_pending",
  "processing",
  "ready_for_collection",
  "out_for_delivery",
  "completed",
  "cancelled",
];

const STATUS_GROUPS: Record<string, string[]> = {
  submitted: ["draft", "submitted", "under_review"],
  in_fulfilment: [
    "price_confirmed",
    "awaiting_approval",
    "approved",
    "payment_pending",
    "processing",
    "ready_for_collection",
    "out_for_delivery",
  ],
  completed: ["completed"],
  cancelled: ["cancelled"],
};

const TABS = [
  { value: "all", label: "All" },
  { value: "submitted", label: "Submitted" },
  { value: "in_fulfilment", label: "In fulfilment" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

interface OrderRow {
  id: string;
  reference: string;
  full_name: string;
  company: string | null;
  phone: string;
  email: string | null;
  fulfilment: string;
  region: string | null;
  district: string | null;
  total_bags: number;
  estimated_weight_kg: number;
  notes: string | null;
  status: string;
  created_at: string;
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; page?: string }>;
}) {
  const params = await searchParams;
  const page = parsePage(params.page);
  const statusGroup = params.status && STATUS_GROUPS[params.status];
  const query = params.q?.trim();

  const supabase = await createClient();

  let rows: OrderRow[] = [];
  let total = 0;
  let itemsByOrder = new Map<string, string>();
  let historyByOrder = new Map<string, TimelineEntry[]>();

  if (supabase) {
    let builder = supabase
      .from("orders")
      .select(
        "id, reference, full_name, company, phone, email, fulfilment, region, district, total_bags, estimated_weight_kg, notes, status, created_at",
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

    rows = (data ?? []) as OrderRow[];
    total = count ?? 0;

    if (rows.length > 0) {
      const ids = rows.map((row) => row.id);
      const [itemsRes, historyRes] = await Promise.all([
        supabase
          .from("order_items")
          .select("order_id, product_name, quantity_bags")
          .in("order_id", ids),
        supabase
          .from("order_status_history")
          .select("order_id, status, note, created_at")
          .in("order_id", ids)
          .order("created_at", { ascending: false }),
      ]);

      const summaries = new Map<string, string[]>();
      for (const item of itemsRes.data ?? []) {
        const list = summaries.get(item.order_id) ?? [];
        list.push(`${item.product_name} × ${item.quantity_bags}`);
        summaries.set(item.order_id, list);
      }
      itemsByOrder = new Map(
        [...summaries.entries()].map(([id, list]) => [id, list.join(", ")])
      );

      const history = new Map<string, TimelineEntry[]>();
      for (const entry of historyRes.data ?? []) {
        const list = history.get(entry.order_id) ?? [];
        list.push({
          status: entry.status,
          note: entry.note,
          at: entry.created_at,
        });
        history.set(entry.order_id, list);
      }
      historyByOrder = history;
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Orders"
        description="Order requests prepared on the website and by the AI assistant. Price and availability are confirmed by the sales team."
      />

      <DataToolbar tabs={TABS} searchPlaceholder="Search name or reference…" />

      <Card className="gap-0 overflow-hidden rounded-2xl border-concrete-200 bg-white py-0 shadow-none">
        {rows.length === 0 ? (
          <EmptyState
            icon={ShoppingCart}
            title={query || statusGroup ? "No orders match" : "No orders yet"}
            body={
              query || statusGroup
                ? "Try a different search term or status filter."
                : "Order requests will appear here when customers submit them on the website."
            }
          />
        ) : (
          <Table>
            <TableHeader className="bg-concrete-50">
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-5">Reference</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="hidden text-right sm:table-cell">
                  Total bags
                </TableHead>
                <TableHead className="hidden text-right lg:table-cell">
                  Weight
                </TableHead>
                <TableHead className="hidden md:table-cell">Fulfilment</TableHead>
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
                      { label: "Phone", value: row.phone },
                      { label: "Email", value: row.email ?? "" },
                    ],
                  },
                  {
                    title: "Order",
                    fields: [
                      { label: "Items", value: itemsByOrder.get(row.id) ?? "" },
                      {
                        label: "Total bags",
                        value: formatNumber(row.total_bags),
                      },
                      {
                        label: "Estimated weight",
                        value: formatTonnes(row.estimated_weight_kg),
                      },
                      {
                        label: "Fulfilment",
                        value: humaniseStatus(row.fulfilment),
                      },
                      {
                        label: "Region",
                        value: [row.region, row.district]
                          .filter(Boolean)
                          .join(", "),
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
                    <TableCell className="hidden text-right font-medium tabular-nums sm:table-cell">
                      {formatNumber(row.total_bags)}
                    </TableCell>
                    <TableCell className="hidden text-right text-muted-foreground tabular-nums lg:table-cell">
                      {formatTonnes(row.estimated_weight_kg)}
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">
                      {humaniseStatus(row.fulfilment)}
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
                        entityLabel="Order request"
                        currentStatus={row.status}
                        statuses={ALL_STATUSES}
                        updateAction={updateOrderStatus}
                        sections={sections}
                        message={row.notes}
                        timeline={historyByOrder.get(row.id) ?? []}
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
          basePath="/admin/orders"
          searchParams={{ status: params.status, q: params.q }}
        />
      </Card>
    </div>
  );
}
