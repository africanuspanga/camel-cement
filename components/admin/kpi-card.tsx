import type { LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import { formatNumber } from "@/lib/admin/format";
import { cn } from "@/lib/utils";

/**
 * Dashboard KPI card: label, large tabular value, delta line, icon chip.
 * Deltas render "—" until comparison data exists — never fake trends.
 */
export function KpiCard({
  label,
  value,
  delta,
  hint,
  icon: Icon,
  compact = false,
}: {
  label: string;
  value: number;
  delta?: string;
  hint?: string;
  icon: LucideIcon;
  compact?: boolean;
}) {
  return (
    <Card
      className={cn(
        "gap-0 rounded-2xl border-concrete-200 bg-white p-5 shadow-none",
        compact && "p-4"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-label text-muted-foreground">{label}</p>
          <p
            className={cn(
              "mt-2 font-semibold text-foreground tabular-nums",
              compact ? "text-2xl" : "text-[32px] leading-none"
            )}
          >
            {formatNumber(value)}
          </p>
        </div>
        <div
          className={cn(
            "flex shrink-0 items-center justify-center rounded-xl bg-camel-green-50 text-camel-green-700",
            compact ? "size-9" : "size-10"
          )}
        >
          <Icon className={compact ? "size-4" : "size-5"} aria-hidden />
        </div>
      </div>
      {!compact && (
        <p className="mt-3 text-xs text-muted-foreground">
          <span className="font-semibold text-concrete-600 tabular-nums">
            {delta ?? "—"}
          </span>{" "}
          {hint ?? "vs previous period"}
        </p>
      )}
    </Card>
  );
}
