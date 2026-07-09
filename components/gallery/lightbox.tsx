"use client";

import * as React from "react";
import Image from "next/image";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DownloadIcon,
  XIcon,
} from "lucide-react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export interface GalleryItem {
  id: string;
  title: string;
  kind: "image" | "video";
  src: string;
  poster: string | null;
  category: string;
}

/** Site-relative sources go through next/image; remote URLs use a plain tag. */
function isLocalSrc(src: string) {
  return src.startsWith("/");
}

/**
 * Expanded media viewer. Renders the active gallery item large inside a
 * shadcn Dialog with previous / next navigation (chevrons + arrow keys),
 * a caption bar and a download action.
 */
export function Lightbox({
  items,
  index,
  onIndexChange,
  onClose,
}: {
  items: GalleryItem[];
  index: number | null;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}) {
  const item = index === null ? null : items[index];
  const hasMany = items.length > 1;

  const goPrev = React.useCallback(() => {
    if (index === null || !hasMany) return;
    onIndexChange((index - 1 + items.length) % items.length);
  }, [index, hasMany, items.length, onIndexChange]);

  const goNext = React.useCallback(() => {
    if (index === null || !hasMany) return;
    onIndexChange((index + 1) % items.length);
  }, [index, hasMany, items.length, onIndexChange]);

  return (
    <Dialog open={item !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            goPrev();
          } else if (event.key === "ArrowRight") {
            event.preventDefault();
            goNext();
          }
        }}
        className="max-h-[calc(100dvh-1rem)] w-[calc(100%-1rem)] max-w-[calc(100%-1rem)] gap-0 overflow-hidden rounded-2xl border-none bg-concrete-950 p-0 text-white ring-white/10 sm:w-full sm:max-w-5xl"
        aria-describedby={undefined}
      >
        {item ? (
          <>
            {/* Media area */}
            <div className="relative flex min-h-[40vh] items-center justify-center bg-black">
              {item.kind === "video" ? (
                <video
                  key={item.id}
                  src={item.src}
                  poster={item.poster ?? undefined}
                  controls
                  autoPlay
                  playsInline
                  className="max-h-[78vh] w-full"
                  aria-label={item.title}
                />
              ) : isLocalSrc(item.src) ? (
                <Image
                  key={item.id}
                  src={item.src}
                  alt={item.title}
                  width={1600}
                  height={1200}
                  sizes="(min-width: 1024px) 1024px, 100vw"
                  className="h-auto max-h-[78vh] w-auto object-contain"
                  priority
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={item.id}
                  src={item.src}
                  alt={item.title}
                  className="h-auto max-h-[78vh] w-auto object-contain"
                />
              )}

              {/* Close */}
              <DialogClose
                aria-label="Close gallery viewer"
                className="absolute top-3 right-3 inline-flex size-10 items-center justify-center rounded-full bg-black/55 text-white transition-colors hover:bg-black/75"
              >
                <XIcon className="size-5" aria-hidden />
              </DialogClose>

              {/* Prev / next */}
              {hasMany ? (
                <>
                  <button
                    type="button"
                    onClick={goPrev}
                    aria-label="Previous item"
                    className="absolute top-1/2 left-3 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white transition-colors hover:bg-black/75"
                  >
                    <ChevronLeftIcon className="size-5" aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={goNext}
                    aria-label="Next item"
                    className="absolute top-1/2 right-3 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white transition-colors hover:bg-black/75"
                  >
                    <ChevronRightIcon className="size-5" aria-hidden />
                  </button>
                </>
              ) : null}
            </div>

            {/* Caption + actions */}
            <div className="flex flex-col gap-3 border-t border-white/10 bg-concrete-950 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <DialogTitle className="truncate text-base font-semibold text-white">
                  {item.title}
                </DialogTitle>
                <DialogDescription
                  className={cn(
                    "mt-1 flex items-center gap-2 text-xs text-white/60"
                  )}
                >
                  <span className="text-eyebrow text-camel-yellow-500">
                    {item.category}
                  </span>
                  <span aria-hidden>·</span>
                  <span>{item.kind === "video" ? "Video" : "Photo"}</span>
                  {hasMany && index !== null ? (
                    <>
                      <span aria-hidden>·</span>
                      <span className="tabular-nums">
                        {index + 1} of {items.length}
                      </span>
                    </>
                  ) : null}
                </DialogDescription>
              </div>
              <div className="flex shrink-0 items-center gap-2.5">
                <a
                  href={item.src}
                  download
                  target="_blank"
                  rel="noopener"
                  className="inline-flex h-10 items-center gap-2 rounded-full bg-camel-green-700 px-5 text-sm font-semibold text-white transition-colors hover:bg-camel-green-800"
                >
                  <DownloadIcon className="size-4" aria-hidden />
                  Download
                </a>
                <DialogClose className="inline-flex h-10 items-center rounded-full border border-white/25 px-5 text-sm font-semibold text-white transition-colors hover:bg-white/10">
                  Close
                </DialogClose>
              </div>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
