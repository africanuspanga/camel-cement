"use client";

import { toast } from "sonner";

interface ShareButtonsProps {
  title: string;
  path: string;
  className?: string;
}

const buttonClass =
  "flex size-11 items-center justify-center rounded-full border border-concrete-300 bg-white text-concrete-700 transition-colors hover:border-camel-green-600 hover:text-camel-green-700 focus-visible:outline-none focus-visible:ring-[4px] focus-visible:ring-camel-green-700/25";

/** Minimal 24px line-style brand glyphs (lucide ships no brand icons). */
function WhatsAppGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-5"
      aria-hidden="true"
    >
      <path d="M3.5 20.5l1.2-3.7a8.5 8.5 0 1 1 3.2 2.9z" />
      <path d="M9.3 8.6c-.3.8-.2 2 .9 3.4 1.1 1.4 2.3 2.2 3.4 2.4.6.1 1.3-.2 1.6-.8l.2-.5-1.8-1-.8.7c-.8-.4-1.5-1-2.1-1.9l.6-.9-1.1-1.7-.5.1c-.2.1-.3.2-.4.2z" />
    </svg>
  );
}

function XGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-5"
      aria-hidden="true"
    >
      <path d="M4 4l16 16" />
      <path d="M20 4L4 20" />
    </svg>
  );
}

function FacebookGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-5"
      aria-hidden="true"
    >
      <path d="M14 8h2.5V4.5H14A4 4 0 0 0 10 8.5V11H7.5v3.5H10v6h3.5v-6h2.5l.5-3.5h-3V8.7c0-.4.3-.7.5-.7z" />
    </svg>
  );
}

function LinkedInGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-5"
      aria-hidden="true"
    >
      <rect x="3.5" y="3.5" width="17" height="17" rx="2.5" />
      <path d="M8 10.5v6" />
      <path d="M8 7.6v.1" />
      <path d="M12 16.5v-3.6a2.2 2.2 0 0 1 4.4 0v3.6" />
      <path d="M12 10.5v2.4" />
    </svg>
  );
}

function CopyLinkGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-5"
      aria-hidden="true"
    >
      <path d="M10 13.5a4 4 0 0 0 6 .4l2.3-2.3a4 4 0 0 0-5.7-5.7L11.4 7" />
      <path d="M14 10.5a4 4 0 0 0-6-.4l-2.3 2.3a4 4 0 0 0 5.7 5.7l1.2-1.2" />
    </svg>
  );
}

export function ShareButtons({ title, path, className }: ShareButtonsProps) {
  const buildUrl = () =>
    typeof window === "undefined" ? path : `${window.location.origin}${path}`;

  const openShare = (buildHref: (url: string) => string) => {
    const href = buildHref(buildUrl());
    window.open(href, "_blank", "noopener,noreferrer,width=640,height=520");
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(buildUrl());
      toast.success("Link copied");
    } catch {
      toast.error("Could not copy the link");
    }
  };

  return (
    <div className={className}>
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-semibold text-concrete-700">Share:</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              openShare(
                (url) =>
                  `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`
              )
            }
            aria-label="Share on WhatsApp"
            title="Share on WhatsApp"
            className={buttonClass}
          >
            <WhatsAppGlyph />
          </button>
          <button
            type="button"
            onClick={() =>
              openShare(
                (url) =>
                  `https://twitter.com/intent/tweet?text=${encodeURIComponent(
                    title
                  )}&url=${encodeURIComponent(url)}`
              )
            }
            aria-label="Share on X"
            title="Share on X"
            className={buttonClass}
          >
            <XGlyph />
          </button>
          <button
            type="button"
            onClick={() =>
              openShare(
                (url) =>
                  `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
              )
            }
            aria-label="Share on Facebook"
            title="Share on Facebook"
            className={buttonClass}
          >
            <FacebookGlyph />
          </button>
          <button
            type="button"
            onClick={() =>
              openShare(
                (url) =>
                  `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
              )
            }
            aria-label="Share on LinkedIn"
            title="Share on LinkedIn"
            className={buttonClass}
          >
            <LinkedInGlyph />
          </button>
          <button
            type="button"
            onClick={() => void copyLink()}
            aria-label="Copy link"
            title="Copy link"
            className={buttonClass}
          >
            <CopyLinkGlyph />
          </button>
        </div>
      </div>
    </div>
  );
}
