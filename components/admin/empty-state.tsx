import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Designed empty state per design doc section 29: icon chip, short title,
 * one supporting sentence. Used inside cards and table shells.
 */
export function EmptyState({
  icon: Icon,
  title,
  body,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  body: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-6 py-12 text-center",
        className
      )}
    >
      <div className="flex size-11 items-center justify-center rounded-xl bg-camel-green-50 text-camel-green-700">
        <Icon className="size-5" aria-hidden />
      </div>
      <p className="mt-4 text-sm font-semibold text-foreground">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{body}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
