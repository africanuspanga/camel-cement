import type { Metadata } from "next";
import { ImagesIcon } from "lucide-react";

import { AddMediaDialog } from "@/components/admin/gallery/add-media-dialog";
import {
  GalleryItemCard,
  type AdminGalleryItem,
} from "@/components/admin/gallery/gallery-item-card";
import { EmptyState } from "@/components/admin/empty-state";
import { PageHeader } from "@/components/admin/page-header";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Gallery",
};

export default async function AdminGalleryPage() {
  const supabase = await createClient();

  let items: AdminGalleryItem[] = [];
  if (supabase) {
    const { data } = await supabase
      .from("gallery_items")
      .select("id, title, kind, src, poster, category, published")
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: true });
    items = (data ?? []) as AdminGalleryItem[];
  }

  const categories = [...new Set(items.map((item) => item.category))];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Gallery"
        description="Photos and videos shown on the public media gallery page."
      >
        <AddMediaDialog categories={categories} />
      </PageHeader>

      {items.length === 0 ? (
        <Card className="gap-0 rounded-2xl border-concrete-200 bg-white py-0 shadow-none">
          <EmptyState
            icon={ImagesIcon}
            title="No media yet"
            body="Upload a photo or video, or link an existing file, to populate the public gallery."
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => (
            <GalleryItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
