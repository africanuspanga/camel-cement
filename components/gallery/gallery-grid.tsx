"use client";

import * as React from "react";
import Image from "next/image";
import { PlayIcon } from "lucide-react";

import { Lightbox, type GalleryItem } from "@/components/gallery/lightbox";

export type { GalleryItem };

const CARD_SIZES =
  "(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw";

function CardMedia({ item }: { item: GalleryItem }) {
  if (item.kind === "video") {
    if (item.poster) {
      return item.poster.startsWith("/") ? (
        <Image
          src={item.poster}
          alt={item.title}
          fill
          sizes={CARD_SIZES}
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.poster}
          alt={item.title}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      );
    }
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-camel-green-900 px-6 text-center transition-colors duration-500 group-hover:bg-camel-green-800">
        <span className="inline-flex size-12 items-center justify-center rounded-full bg-white/12 text-camel-yellow-500">
          <PlayIcon className="size-5 fill-current" aria-hidden />
        </span>
        <span className="text-sm font-semibold text-white">{item.title}</span>
      </div>
    );
  }

  return item.src.startsWith("/") ? (
    <Image
      src={item.src}
      alt={item.title}
      fill
      sizes={CARD_SIZES}
      className="object-cover transition-transform duration-500 group-hover:scale-105"
    />
  ) : (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={item.src}
      alt={item.title}
      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
    />
  );
}

/**
 * Interactive gallery grid. Every card opens the lightbox at that item;
 * the lightbox then supports chevron and arrow-key navigation.
 */
export function GalleryGrid({ items }: { items: GalleryItem[] }) {
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);

  return (
    <>
      <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((item, index) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Open ${item.title} in the gallery viewer`}
              className="group block w-full rounded-2xl text-left focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-camel-yellow-500"
            >
              <span className="relative block aspect-[4/3] overflow-hidden rounded-2xl bg-concrete-100 shadow-card">
                <CardMedia item={item} />
                {item.kind === "video" ? (
                  <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-bold tracking-wide text-white uppercase">
                    <PlayIcon className="size-3 fill-current" aria-hidden />
                    Video
                  </span>
                ) : null}
              </span>
              <span className="mt-3 block px-0.5">
                <span className="block truncate text-sm font-semibold text-concrete-950">
                  {item.title}
                </span>
                <span className="mt-0.5 block text-xs font-medium tracking-wide text-camel-green-700 uppercase">
                  {item.category}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      <Lightbox
        items={items}
        index={activeIndex}
        onIndexChange={setActiveIndex}
        onClose={() => setActiveIndex(null)}
      />
    </>
  );
}
