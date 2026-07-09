import type { Metadata } from "next";
import { ScrollText } from "lucide-react";

import { DataToolbar } from "@/components/admin/data-toolbar";
import { EmptyState } from "@/components/admin/empty-state";
import { PageHeader } from "@/components/admin/page-header";
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
import { formatDateTime, humaniseStatus } from "@/lib/admin/format";
import { PAGE_SIZE, pageRange, parsePage } from "@/lib/admin/queries";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Audit Logs",
};

const ENTITY_TABS = [
  { value: "all", label: "All" },
  { value: "quote_requests", label: "Quotations" },
  { value: "orders", label: "Orders" },
  { value: "contact_enquiries", label: "Enquiries" },
  { value: "products", label: "Products" },
  { value: "site_settings", label: "Settings" },
];

interface AuditRow {
  id: string;
  action: string;
  entity: string;
  entity_id: string | null;
  success: boolean;
  created_at: string;
  profiles: { email: string | null } | null;
}

export default async function AuditLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ entity?: string; page?: string }>;
}) {
  const params = await searchParams;
  const page = parsePage(params.page);
  const entity =
    params.entity && params.entity !== "all" ? params.entity : undefined;

  const supabase = await createClient();

  let rows: AuditRow[] = [];
  let total = 0;

  if (supabase) {
    let builder = supabase
      .from("audit_logs")
      .select("id, action, entity, entity_id, success, created_at, profiles(email)", {
        count: "exact",
      });
    if (entity) builder = builder.eq("entity", entity);

    const [from, to] = pageRange(page);
    const { data, count } = await builder
      .order("created_at", { ascending: false })
      .range(from, to);

    rows = (data ?? []) as unknown as AuditRow[];
    total = count ?? 0;
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Audit Logs"
        description="A read-only record of every change made through the admin dashboard."
      />

      <DataToolbar
        tabs={ENTITY_TABS}
        paramKey="entity"
        searchPlaceholder="Search… (soon)"
      />

      <Card className="gap-0 overflow-hidden rounded-2xl border-concrete-200 bg-white py-0 shadow-none">
        {rows.length === 0 ? (
          <EmptyState
            icon={ScrollText}
            title="No audit entries yet"
            body="Every status change, publish action and settings update is recorded here automatically."
          />
        ) : (
          <Table>
            <TableHeader className="bg-concrete-50">
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-5">Action</TableHead>
                <TableHead className="hidden sm:table-cell">Entity</TableHead>
                <TableHead className="hidden lg:table-cell">Record</TableHead>
                <TableHead className="hidden md:table-cell">User</TableHead>
                <TableHead className="pr-5">When</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id} className="h-12">
                  <TableCell className="pl-5 font-mono text-[13px] font-medium">
                    {row.action}
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground sm:table-cell">
                    {humaniseStatus(row.entity)}
                  </TableCell>
                  <TableCell className="hidden max-w-48 truncate font-mono text-xs text-muted-foreground lg:table-cell">
                    {row.entity_id ?? "—"}
                  </TableCell>
                  <TableCell className="hidden max-w-52 truncate text-muted-foreground md:table-cell">
                    {row.profiles?.email ?? "—"}
                  </TableCell>
                  <TableCell className="pr-5 text-muted-foreground tabular-nums">
                    {formatDateTime(row.created_at)}
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
          basePath="/admin/audit-logs"
          searchParams={{ entity: params.entity }}
        />
      </Card>
    </div>
  );
}
