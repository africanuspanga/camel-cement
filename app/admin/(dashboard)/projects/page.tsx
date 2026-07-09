import type { Metadata } from "next";
import { Landmark } from "lucide-react";

import { EmptyState } from "@/components/admin/empty-state";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Projects",
};

interface ProjectRow {
  id: string;
  name: string;
  category: string;
  location: string | null;
  completion_year: number | null;
  product_used: string | null;
  published: boolean;
}

export default async function ProjectsPage() {
  const supabase = await createClient();

  let rows: ProjectRow[] = [];
  if (supabase) {
    const { data } = await supabase
      .from("projects")
      .select("id, name, category, location, completion_year, product_used, published")
      .order("completion_year", { ascending: false })
      .limit(100);
    rows = (data ?? []) as ProjectRow[];
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Projects"
        description="Case studies shown on the public projects page. The full editor with galleries and testimonials arrives with the content module."
      />

      <Card className="gap-0 overflow-hidden rounded-2xl border-concrete-200 bg-white py-0 shadow-none">
        {rows.length === 0 ? (
          <EmptyState
            icon={Landmark}
            title="No projects yet"
            body="Completed construction case studies will appear here — seed launch content or add them once the editor lands."
          />
        ) : (
          <Table>
            <TableHeader className="bg-concrete-50">
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-5">Project</TableHead>
                <TableHead className="hidden md:table-cell">Category</TableHead>
                <TableHead className="hidden sm:table-cell">Location</TableHead>
                <TableHead className="hidden text-right lg:table-cell">
                  Year
                </TableHead>
                <TableHead className="hidden md:table-cell">Product</TableHead>
                <TableHead className="pr-5">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id} className="h-12">
                  <TableCell className="max-w-md truncate pl-5 font-medium">
                    {row.name}
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground md:table-cell">
                    {row.category}
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground sm:table-cell">
                    {row.location ?? "—"}
                  </TableCell>
                  <TableCell className="hidden text-right text-muted-foreground tabular-nums lg:table-cell">
                    {row.completion_year ?? "—"}
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground md:table-cell">
                    {row.product_used ?? "—"}
                  </TableCell>
                  <TableCell className="pr-5">
                    <StatusBadge
                      status={row.published ? "published" : "draft"}
                      label={row.published ? "Published" : "Draft"}
                    />
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
