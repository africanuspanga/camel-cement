import { cn } from "@/lib/utils";
import { ImageIcon } from "lucide-react";

/**
 * Placeholder for imagery that has not been supplied yet. Preserves the final
 * layout dimensions so nothing shifts when real photography is added.
 */
export function ComingSoonImage({
  label = "Photography coming soon",
  className,
  onDark = false,
}: {
  label?: string;
  className?: string;
  onDark?: boolean;
}) {
  return (
    <div
      role="img"
      aria-label={label}
      className={cn(
        "relative flex size-full min-h-48 flex-col items-center justify-center gap-3 overflow-hidden rounded-xl border",
        onDark
          ? "border-white/15 bg-white/5"
          : "border-concrete-200 bg-concrete-100",
        className
      )}
    >
      <div
        aria-hidden="true"
        className={cn(
          "absolute inset-0 animate-pulse",
          onDark
            ? "bg-gradient-to-br from-white/0 via-white/5 to-white/0"
            : "bg-gradient-to-br from-concrete-100 via-concrete-200/60 to-concrete-100"
        )}
      />
      <div
        className={cn(
          "relative flex size-12 items-center justify-center rounded-full border",
          onDark
            ? "border-white/20 bg-white/10 text-white/60"
            : "border-concrete-300 bg-white text-concrete-400"
        )}
      >
        <ImageIcon className="size-5" aria-hidden="true" />
      </div>
      <p
        className={cn(
          "relative text-label",
          onDark ? "text-white/60" : "text-concrete-600"
        )}
      >
        {label}
      </p>
    </div>
  );
}
