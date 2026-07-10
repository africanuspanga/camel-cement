import {
  MinusIcon,
  TrendingDownIcon,
  TrendingUpIcon,
  type LucideIcon,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { formatNumber } from "@/lib/admin/format";
import { cn } from "@/lib/utils";

export type KpiTrend = "up" | "down" | "flat";

const trendStyles: Record<KpiTrend, string> = {
  up: "bg-camel-green-50 text-camel-green-800",
  down: "bg-camel-yellow-50 text-camel-yellow-700",
  flat: "bg-concrete-100 text-concrete-600",
};

const trendIcons: Record<KpiTrend, LucideIcon> = {
  up: TrendingUpIcon,
  down: TrendingDownIcon,
  flat: MinusIcon,
};

/**
 * Dashboard KPI card: label, large tabular value, trend pill, icon chip.
 * Deltas render "—" until comparison data exists — never fake trends.
 */
export function KpiCard({
  label,
  value,
  delta,
  trend = "flat",
  hint,
  icon: Icon,
  compact = false,
}: {
  label: string;
  value: number;
  delta?: string;
  trend?: KpiTrend;
  hint?: string;
  icon: LucideIcon;
  compact?: boolean;
}) {
  const TrendIcon = trendIcons[trend];

  return (
    <Card
      className={cn(
        "gap-0 rounded-2xl border-concrete-200 bg-white p-5 shadow-none transition-shadow hover:shadow-card",
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
        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold tabular-nums",
              trendStyles[delta ? trend : "flat"]
            )}
          >
            <TrendIcon className="size-3" aria-hidden />
            {delta ?? "—"}
          </span>
          {hint ?? "vs previous period"}
        </div>
      )}
    </Card>
  );
}
