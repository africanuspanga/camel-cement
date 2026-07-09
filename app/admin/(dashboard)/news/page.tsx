import type { Metadata } from "next";
import { Newspaper } from "lucide-react";

import { EmptyState } from "@/components/admin/empty-state";
import { PageHeader } from "@/components/admin/page-header";
import { PostStatusMenu } from "@/components/admin/post-status-menu";
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
import { formatDate } from "@/lib/admin/format";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "News",
};

interface PostRow {
  id: string;
  slug: string;
  title: string;
  category: string;
  status: "draft" | "review" | "published";
  published_at: string | null;
}

export default async function NewsPage() {
  const supabase = await createClient();

  let rows: PostRow[] = [];
  if (supabase) {
    const { data } = await supabase
      .from("posts")
      .select("id, slug, title, category, status, published_at")
      .order("created_at", { ascending: false })
      .limit(100);
    rows = (data ?? []) as PostRow[];
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="News"
        description="Articles and insights on the public website. The full visual editor arrives with the content module — for now you can control publication state."
      />

      <Card className="gap-0 overflow-hidden rounded-2xl border-concrete-200 bg-white py-0 shadow-none">
        {rows.length === 0 ? (
          <EmptyState
            icon={Newspaper}
            title="No articles yet"
            body="Seed the launch articles with scripts/seed-content.ts, or they will appear here once the content module creates them."
          />
        ) : (
          <Table>
            <TableHeader className="bg-concrete-50">
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-5">Title</TableHead>
                <TableHead className="hidden md:table-cell">Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden sm:table-cell">Published</TableHead>
                <TableHead className="w-12 pr-5" aria-label="Actions" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id} className="h-12">
                  <TableCell className="pl-5">
                    <span className="block max-w-md truncate font-medium">
                      {row.title}
                    </span>
                    <span className="block font-mono text-xs text-muted-foreground">
                      /news/{row.slug}
                    </span>
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground md:table-cell">
                    {row.category}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={row.status} />
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground tabular-nums sm:table-cell">
                    {formatDate(row.published_at)}
                  </TableCell>
                  <TableCell className="pr-5 text-right">
                    <PostStatusMenu
                      id={row.id}
                      title={row.title}
                      status={row.status}
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
