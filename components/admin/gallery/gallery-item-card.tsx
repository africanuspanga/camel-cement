"use client";

import * as React from "react";
import Image from "next/image";
import { FilmIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  deleteGalleryItem,
  setGalleryItemPublished,
} from "@/lib/admin/gallery-actions";

export interface AdminGalleryItem {
  id: string;
  title: string;
  kind: "image" | "video";
  src: string;
  poster: string | null;
  category: string;
  published: boolean;
}

function Thumbnail({ item }: { item: AdminGalleryItem }) {
  const imageSrc = item.kind === "video" ? item.poster : item.src;

  if (!imageSrc) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-camel-green-900">
        <FilmIcon className="size-6 text-camel-yellow-500" aria-hidden />
      </div>
    );
  }

  return imageSrc.startsWith("/") ? (
    <Image
      src={imageSrc}
      alt={item.title}
      fill
      sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
      className="object-cover"
    />
  ) : (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imageSrc}
      alt={item.title}
      className="absolute inset-0 h-full w-full object-cover"
    />
  );
}

export function GalleryItemCard({ item }: { item: AdminGalleryItem }) {
  const [published, setPublished] = React.useState(item.published);
  const [pending, startTransition] = React.useTransition();
  const [deleting, startDeleting] = React.useTransition();

  const togglePublished = (next: boolean) => {
    setPublished(next);
    startTransition(async () => {
      const result = await setGalleryItemPublished(item.id, next);
      if (result.ok) {
        toast.success(
          next
            ? `${item.title} is now live`
            : `${item.title} hidden from the gallery`
        );
      } else {
        setPublished(!next);
        toast.error("Could not update item", { description: result.error });
      }
    });
  };

  const remove = () => {
    startDeleting(async () => {
      const result = await deleteGalleryItem(item.id);
      if (result.ok) {
        toast.success("Media deleted", {
          description: `${item.title} was removed from the gallery.`,
        });
      } else {
        toast.error("Could not delete media", { description: result.error });
      }
    });
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-concrete-200 bg-white">
      <div className="relative aspect-[4/3] bg-concrete-100">
        <Thumbnail item={item} />
        <Badge
          variant="secondary"
          className="absolute top-2.5 left-2.5 bg-black/60 text-white capitalize"
        >
          {item.kind}
        </Badge>
      </div>
      <div className="space-y-3 p-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">
            {item.title}
          </p>
          <p className="mt-0.5 text-xs font-medium tracking-wide text-camel-green-700 uppercase">
            {item.category}
          </p>
        </div>
        <div className="flex items-center justify-between gap-2">
          <label className="flex items-center gap-2">
            <Switch
              checked={published}
              disabled={pending || deleting}
              aria-label={`${item.title} visible in the public gallery`}
              onCheckedChange={togglePublished}
              className="data-[state=checked]:bg-camel-green-700"
            />
            <span className="text-xs font-medium text-muted-foreground">
              {published ? "Live" : "Hidden"}
            </span>
          </label>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                size="icon-sm"
                disabled={deleting}
                aria-label={`Delete ${item.title}`}
              >
                <Trash2Icon aria-hidden />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this media?</AlertDialogTitle>
                <AlertDialogDescription>
                  “{item.title}” will be removed from the public gallery. If
                  the file was uploaded to storage it will be deleted too. This
                  cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-full">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={remove}
                  className="rounded-full bg-red-600 text-white hover:bg-red-700"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}
