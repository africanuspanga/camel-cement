import type { Metadata } from "next";
import { Calculator, Globe, MousePointerClick, Package } from "lucide-react";

import { SimpleBarChart, type SimpleBarPoint } from "@/components/admin/charts";
import { KpiCard } from "@/components/admin/kpi-card";
import { PageHeader } from "@/components/admin/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { humaniseStatus } from "@/lib/admin/format";
import { countSince, sinceIso, type ServerSupabase } from "@/lib/admin/queries";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Analytics",
};

async function loadAnalytics(supabase: ServerSupabase) {
  const since = sinceIso(30);

  const [calcCount, eventCount, calcTypesRes, productRes] = await Promise.all([
    countSince(supabase, "calculator_sessions", since),
    countSince(supabase, "analytics_events", since),
    supabase
      .from("calculator_sessions")
      .select("calculator_type")
      .gte("created_at", since)
      .limit(2000),
    supabase
      .from("calculator_sessions")
      .select("recommended_product")
      .gte("created_at", since)
      .not("recommended_product", "is", null)
      .limit(2000),
  ]);

  const typeMap = new Map<string, number>();
  for (const row of calcTypesRes.data ?? []) {
    const key = humaniseStatus(row.calculator_type as string);
    typeMap.set(key, (typeMap.get(key) ?? 0) + 1);
  }
  const byType: SimpleBarPoint[] = [...typeMap.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const productMap = new Map<string, number>();
  for (const row of productRes.data ?? []) {
    const key = row.recommended_product as string;
    productMap.set(key, (productMap.get(key) ?? 0) + 1);
  }
  const topProduct =
    [...productMap.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  return { calcCount, eventCount, byType, topProduct };
}

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const data = supabase
    ? await loadAnalytics(supabase)
    : {
        calcCount: 0,
        eventCount: 0,
        byType: [] as SimpleBarPoint[],
        topProduct: null as string | null,
      };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Analytics"
        description="Behaviour signals from the public website over the last 30 days. Deeper traffic reporting arrives with the analytics module."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <KpiCard
          label="Calculator sessions"
          value={data.calcCount}
          icon={Calculator}
          hint="last 30 days"
        />
        <KpiCard
          label="Tracked events"
          value={data.eventCount}
          icon={MousePointerClick}
          hint="last 30 days"
        />
        <Card className="gap-0 rounded-2xl border-concrete-200 bg-white p-5 shadow-none">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-label text-muted-foreground">
                Most recommended product
              </p>
              <p className="mt-2 truncate text-xl font-semibold text-foreground">
                {data.topProduct ?? "—"}
              </p>
            </div>
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-camel-green-50 text-camel-green-700">
              <Package className="size-5" aria-hidden />
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            From calculator recommendations
          </p>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="gap-4 rounded-2xl border-concrete-200 bg-white shadow-none">
          <CardHeader>
            <CardTitle className="text-base">Calculator use by type</CardTitle>
            <CardDescription>
              Which estimators visitors reach for most.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SimpleBarChart
              data={data.byType}
              emptyMessage="Calculator sessions will break down by project type here."
            />
          </CardContent>
        </Card>

        <Card className="gap-4 rounded-2xl border-concrete-200 bg-white shadow-none">
          <CardHeader>
            <CardTitle className="text-base">Traffic and events</CardTitle>
            <CardDescription>Coming with the analytics module.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-64 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-concrete-300 bg-concrete-50 text-center">
              <div className="flex size-10 items-center justify-center rounded-xl bg-camel-green-50 text-camel-green-700">
                <Globe className="size-5" aria-hidden />
              </div>
              <p className="text-sm font-semibold">Traffic sources and page views</p>
              <p className="max-w-60 text-xs text-muted-foreground">
                Website events are already collected in{" "}
                <code className="font-mono">analytics_events</code>; the
                reporting views land in the next release.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
