import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { formatNumber } from "@/lib/admin/format";
import { cn } from "@/lib/utils";

const linkClasses =
  "inline-flex h-9 items-center gap-1 rounded-full border border-concrete-200 bg-white px-3.5 text-sm font-medium text-foreground transition-colors hover:bg-concrete-100";
const disabledClasses =
  "pointer-events-none border-concrete-200/60 text-concrete-400";

/** Server-rendered pagination driven entirely by the ?page= searchParam. */
export function TablePagination({
  page,
  pageSize,
  total,
  basePath,
  searchParams,
}: {
  page: number;
  pageSize: number;
  total: number;
  basePath: string;
  searchParams: Record<string, string | undefined>;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (total <= pageSize) return null;

  const href = (target: number) => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) {
      if (value) params.set(key, value);
    }
    if (target > 1) params.set("page", String(target));
    else params.delete("page");
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="flex items-center justify-between gap-4 border-t border-concrete-200 px-5 py-3">
      <p className="text-sm text-muted-foreground tabular-nums">
        {formatNumber(from)}–{formatNumber(to)} of {formatNumber(total)}
      </p>
      <div className="flex items-center gap-2">
        <Link
          href={href(page - 1)}
          aria-disabled={page <= 1}
          tabIndex={page <= 1 ? -1 : undefined}
          className={cn(linkClasses, page <= 1 && disabledClasses)}
        >
          <ChevronLeft className="size-4" aria-hidden />
          Previous
        </Link>
        <span className="px-1 text-sm text-muted-foreground tabular-nums">
          Page {page} of {totalPages}
        </span>
        <Link
          href={href(page + 1)}
          aria-disabled={page >= totalPages}
          tabIndex={page >= totalPages ? -1 : undefined}
          className={cn(linkClasses, page >= totalPages && disabledClasses)}
        >
          Next
          <ChevronRight className="size-4" aria-hidden />
        </Link>
      </div>
    </div>
  );
}
