import type { Metadata } from "next";
import { FileDown } from "lucide-react";

import { EmptyState } from "@/components/admin/empty-state";
import { PageHeader } from "@/components/admin/page-header";
import { ResourcePublicSwitch } from "@/components/admin/resources/resource-public-switch";
import { ResourceRowActions } from "@/components/admin/resources/resource-row-actions";
import { UploadResourceDialog } from "@/components/admin/resources/upload-resource-dialog";
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
import { formatDate, formatNumber } from "@/lib/admin/format";
import { getProduct } from "@/lib/products";
import { formatFileSize } from "@/lib/resources";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Resources",
};

interface ResourceRow {
  id: string;
  title: string;
  category: string;
  product_slug: string | null;
  language: string;
  file_url: string | null;
  file_type: string | null;
  file_size_kb: number | null;
  version: string | null;
  public: boolean;
  download_count: number;
  published_at: string | null;
}

export default async function ResourcesPage() {
  const supabase = await createClient();

  let rows: ResourceRow[] = [];
  if (supabase) {
    const { data } = await supabase
      .from("resources")
      .select(
        "id, title, category, product_slug, language, file_url, file_type, file_size_kb, version, public, download_count, published_at"
      )
      .order("created_at", { ascending: false })
      .limit(500);
    rows = (data ?? []) as ResourceRow[];
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Resources"
        description="Datasheets, certificates and guides available in the public download centre."
      >
        <UploadResourceDialog />
      </PageHeader>

      <Card className="gap-0 overflow-hidden rounded-2xl border-concrete-200 bg-white py-0 shadow-none">
        {rows.length === 0 ? (
          <EmptyState
            icon={FileDown}
            title="No documents yet"
            body="Upload your first datasheet or brochure to populate the public download centre."
          />
        ) : (
          <Table>
            <TableHeader className="bg-concrete-50">
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-5">Title</TableHead>
                <TableHead className="hidden md:table-cell">Category</TableHead>
                <TableHead className="hidden lg:table-cell">Product</TableHead>
                <TableHead className="hidden sm:table-cell">Type</TableHead>
                <TableHead className="hidden sm:table-cell">Size</TableHead>
                <TableHead className="hidden md:table-cell">Published</TableHead>
                <TableHead>Public</TableHead>
                <TableHead className="hidden text-right lg:table-cell">
                  Downloads
                </TableHead>
                <TableHead className="pr-5 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => {
                const product = row.product_slug
                  ? getProduct(row.product_slug)
                  : undefined;
                return (
                  <TableRow key={row.id} className="h-12">
                    <TableCell className="max-w-xs truncate pl-5 font-medium">
                      {row.title}
                      {row.version ? (
                        <span className="ml-2 text-xs font-normal text-muted-foreground">
                          {row.version}
                        </span>
                      ) : null}
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">
                      {row.category}
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground lg:table-cell">
                      {product?.friendlyName ?? row.product_slug ?? "—"}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {row.file_type ? (
                        <Badge
                          variant="outline"
                          className="border-concrete-200 font-semibold text-concrete-600"
                        >
                          {row.file_type}
                        </Badge>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground tabular-nums sm:table-cell">
                      {formatFileSize(row.file_size_kb)}
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground tabular-nums md:table-cell">
                      {formatDate(row.published_at)}
                    </TableCell>
                    <TableCell>
                      <ResourcePublicSwitch
                        id={row.id}
                        title={row.title}
                        initialPublic={row.public}
                      />
                    </TableCell>
                    <TableCell className="hidden text-right text-muted-foreground tabular-nums lg:table-cell">
                      {formatNumber(row.download_count)}
                    </TableCell>
                    <TableCell className="pr-4">
                      <ResourceRowActions
                        id={row.id}
                        title={row.title}
                        fileUrl={row.file_url}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
