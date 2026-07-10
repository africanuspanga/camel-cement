import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  Calculator,
  Inbox,
  Mail,
  Newspaper,
  ReceiptText,
  ShoppingCart,
  Sparkles,
} from "lucide-react";

import {
  ActivityAreaChart,
  OrderStatusDonut,
  ProductBarChart,
  type ActivityPoint,
  type ProductCount,
  type StatusSlice,
} from "@/components/admin/charts";
import { EmptyState } from "@/components/admin/empty-state";
import { KpiCard } from "@/components/admin/kpi-card";
import { PageHeader } from "@/components/admin/page-header";
import { RangeSelect } from "@/components/admin/range-select";
import { StatusBadge } from "@/components/admin/status-badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { humaniseStatus, relativeTime } from "@/lib/admin/format";
import {
  countSince,
  countWithTrend,
  sinceIso,
  type ServerSupabase,
} from "@/lib/admin/queries";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Overview",
};

// ── Data shaping ──────────────────────────────────────────────────────

interface QueueItem {
  id: string;
  reference: string;
  name: string;
  status: string;
  createdAt: string;
  href: string;
  kind: "Quote" | "Order";
}

interface EnquiryItem {
  id: string;
  reference: string;
  name: string;
  type: string;
  status: string;
  createdAt: string;
}

const dayLabel = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
});

function buildDailySeries(
  days: number,
  enquiryDates: string[],
  quoteDates: string[]
): ActivityPoint[] {
  const buckets = new Map<string, ActivityPoint>();
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));

  for (let i = 0; i < days; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    const key = date.toISOString().slice(0, 10);
    buckets.set(key, {
      date: key,
      label: dayLabel.format(date),
      enquiries: 0,
      quotes: 0,
    });
  }

  for (const iso of enquiryDates) {
    const bucket = buckets.get(iso.slice(0, 10));
    if (bucket) bucket.enquiries += 1;
  }
  for (const iso of quoteDates) {
    const bucket = buckets.get(iso.slice(0, 10));
    if (bucket) bucket.quotes += 1;
  }

  return [...buckets.values()];
}

const ORDER_GROUPS: { name: string; statuses: string[] }[] = [
  { name: "Submitted", statuses: ["draft", "submitted"] },
  {
    name: "In review",
    statuses: ["under_review", "price_confirmed", "awaiting_approval"],
  },
  {
    name: "In fulfilment",
    statuses: [
      "approved",
      "payment_pending",
      "processing",
      "ready_for_collection",
      "out_for_delivery",
    ],
  },
  { name: "Completed", statuses: ["completed"] },
  { name: "Cancelled", statuses: ["cancelled"] },
];

async function loadDashboard(supabase: ServerSupabase, days: number) {
  const since = sinceIso(days);

  const [
    quoteTrend,
    orderTrend,
    enquiryTrend,
    calculatorTrend,
    applicationCount,
    chatCount,
    subscriberCount,
    publishedCount,
    enquirySeriesRes,
    quoteSeriesRes,
    quoteItemsRes,
    orderStatusRes,
    newQuotesRes,
    submittedOrdersRes,
    recentEnquiriesRes,
  ] = await Promise.all([
    countWithTrend(supabase, "quote_requests", days),
    countWithTrend(supabase, "orders", days),
    countWithTrend(supabase, "contact_enquiries", days),
    countWithTrend(supabase, "calculator_sessions", days),
    countSince(supabase, "job_applications", since),
    countSince(supabase, "chat_sessions", since),
    countSince(supabase, "newsletter_subscribers"),
    countSince(supabase, "posts", undefined, {
      column: "status",
      value: "published",
    }),
    supabase
      .from("contact_enquiries")
      .select("created_at")
      .gte("created_at", since)
      .limit(2000),
    supabase
      .from("quote_requests")
      .select("created_at")
      .gte("created_at", since)
      .limit(2000),
    supabase
      .from("quote_items")
      .select("product_name, created_at")
      .gte("created_at", since)
      .limit(2000),
    supabase.from("orders").select("status").limit(2000),
    supabase
      .from("quote_requests")
      .select("id, reference, full_name, status, created_at")
      .eq("status", "new")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("orders")
      .select("id, reference, full_name, status, created_at")
      .eq("status", "submitted")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("contact_enquiries")
      .select("id, reference, full_name, enquiry_type, status, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const series = buildDailySeries(
    days,
    (enquirySeriesRes.data ?? []).map((row) => row.created_at as string),
    (quoteSeriesRes.data ?? []).map((row) => row.created_at as string)
  );

  const productMap = new Map<string, number>();
  for (const item of quoteItemsRes.data ?? []) {
    const name = (item.product_name as string) || "Other";
    productMap.set(name, (productMap.get(name) ?? 0) + 1);
  }
  const productData: ProductCount[] = [...productMap.entries()]
    .map(([product, requests]) => ({ product, requests }))
    .sort((a, b) => b.requests - a.requests)
    .slice(0, 6);

  const orderStatuses = (orderStatusRes.data ?? []).map(
    (row) => row.status as string
  );
  const orderSlices: StatusSlice[] = ORDER_GROUPS.map((group) => ({
    name: group.name,
    value: orderStatuses.filter((status) => group.statuses.includes(status))
      .length,
  })).filter((slice) => slice.value > 0);

  const needsAttention: QueueItem[] = [
    ...(newQuotesRes.data ?? []).map((row) => ({
      id: row.id as string,
      reference: row.reference as string,
      name: row.full_name as string,
      status: row.status as string,
      createdAt: row.created_at as string,
      href: "/admin/quotations",
      kind: "Quote" as const,
    })),
    ...(submittedOrdersRes.data ?? []).map((row) => ({
      id: row.id as string,
      reference: row.reference as string,
      name: row.full_name as string,
      status: row.status as string,
      createdAt: row.created_at as string,
      href: "/admin/orders",
      kind: "Order" as const,
    })),
  ]
    .sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 5);

  const recentEnquiries: EnquiryItem[] = (recentEnquiriesRes.data ?? []).map(
    (row) => ({
      id: row.id as string,
      reference: row.reference as string,
      name: row.full_name as string,
      type: row.enquiry_type as string,
      status: row.status as string,
      createdAt: row.created_at as string,
    })
  );

  return {
    trends: {
      quotes: quoteTrend,
      orders: orderTrend,
      enquiries: enquiryTrend,
      calculators: calculatorTrend,
    },
    counts: {
      applications: applicationCount,
      chats: chatCount,
      subscribers: subscriberCount,
      published: publishedCount,
    },
    series,
    productData,
    orderSlices,
    orderTotal: orderStatuses.length,
    needsAttention,
    recentEnquiries,
  };
}

const EMPTY_TREND = {
  value: 0,
  delta: "—",
  trend: "flat" as const,
};

const EMPTY_DASHBOARD = (days: number) => ({
  trends: {
    quotes: EMPTY_TREND,
    orders: EMPTY_TREND,
    enquiries: EMPTY_TREND,
    calculators: EMPTY_TREND,
  },
  counts: {
    applications: 0,
    chats: 0,
    subscribers: 0,
    published: 0,
  },
  series: buildDailySeries(days, [], []),
  productData: [] as ProductCount[],
  orderSlices: [] as StatusSlice[],
  orderTotal: 0,
  needsAttention: [] as QueueItem[],
  recentEnquiries: [] as EnquiryItem[],
});

// ── Page ──────────────────────────────────────────────────────────────

export default async function AdminOverviewPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const params = await searchParams;
  const days = params.range === "7" ? 7 : params.range === "90" ? 90 : 30;

  const supabase = await createClient();

  let firstName = "";
  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle();
      firstName = (profile?.full_name ?? "").trim().split(/\s+/)[0] ?? "";
    }
  }

  const data = supabase
    ? await loadDashboard(supabase, days)
    : EMPTY_DASHBOARD(days);

  const todayLabel = new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  const trendHint = `vs previous ${days} days`;

  return (
    <div className="space-y-6">
      <PageHeader
        title={firstName ? `Welcome back, ${firstName}` : "Overview"}
        description={`${todayLabel} · What is happening across the Camel Cement platform in the last ${days} days.`}
      >
        <RangeSelect />
      </PageHeader>

      {/* ── Primary KPIs ── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="New quote requests"
          value={data.trends.quotes.value}
          delta={data.trends.quotes.delta}
          trend={data.trends.quotes.trend}
          hint={trendHint}
          icon={ReceiptText}
        />
        <KpiCard
          label="Order requests"
          value={data.trends.orders.value}
          delta={data.trends.orders.delta}
          trend={data.trends.orders.trend}
          hint={trendHint}
          icon={ShoppingCart}
        />
        <KpiCard
          label="New enquiries"
          value={data.trends.enquiries.value}
          delta={data.trends.enquiries.delta}
          trend={data.trends.enquiries.trend}
          hint={trendHint}
          icon={Inbox}
        />
        <KpiCard
          label="Calculator sessions"
          value={data.trends.calculators.value}
          delta={data.trends.calculators.delta}
          trend={data.trends.calculators.trend}
          hint={trendHint}
          icon={Calculator}
        />
      </div>

      {/* ── Secondary KPIs ── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          compact
          label="Job applications"
          value={data.counts.applications}
          icon={BriefcaseBusiness}
        />
        <KpiCard
          compact
          label="AI conversations"
          value={data.counts.chats}
          icon={Sparkles}
        />
        <KpiCard
          compact
          label="Newsletter subscribers"
          value={data.counts.subscribers}
          icon={Mail}
        />
        <KpiCard
          compact
          label="Published articles"
          value={data.counts.published}
          icon={Newspaper}
        />
      </div>

      {/* ── Charts ── */}
      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="gap-4 rounded-2xl border-concrete-200 bg-white shadow-none xl:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Enquiries and quotes by day</CardTitle>
            <CardDescription>
              Daily inbound volume over the selected period.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ActivityAreaChart data={data.series} />
          </CardContent>
        </Card>

        <Card className="gap-4 rounded-2xl border-concrete-200 bg-white shadow-none">
          <CardHeader>
            <CardTitle className="text-base">Order status</CardTitle>
            <CardDescription>All orders, grouped by stage.</CardDescription>
          </CardHeader>
          <CardContent>
            <OrderStatusDonut data={data.orderSlices} total={data.orderTotal} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="gap-4 rounded-2xl border-concrete-200 bg-white shadow-none">
          <CardHeader>
            <CardTitle className="text-base">Quote requests by product</CardTitle>
            <CardDescription>
              Most requested grades in the selected period.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProductBarChart data={data.productData} />
          </CardContent>
        </Card>

        {/* ── Needs attention ── */}
        <Card className="gap-0 rounded-2xl border-concrete-200 bg-white py-0 shadow-none">
          <CardHeader className="border-b border-concrete-200 py-4 [.border-b]:pb-4">
            <CardTitle className="text-base">Needs attention</CardTitle>
            <CardDescription>
              New quote requests and submitted orders.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {data.needsAttention.length === 0 ? (
              <EmptyState
                icon={ReceiptText}
                title="No quotation requests yet"
                body="New requests will appear here when customers submit the website form."
              />
            ) : (
              <ul className="divide-y divide-concrete-200">
                {data.needsAttention.map((item) => (
                  <li key={`${item.kind}-${item.id}`}>
                    <Link
                      href={item.href}
                      className="group flex items-center gap-3 px-5 py-3 transition-colors hover:bg-concrete-50"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-mono text-[13px] font-semibold text-foreground">
                          {item.reference}
                        </p>
                        <p className="truncate text-sm text-muted-foreground">
                          {item.name} · {relativeTime(item.createdAt)}
                        </p>
                      </div>
                      <StatusBadge status={item.status} />
                      <ArrowUpRight
                        className="size-4 shrink-0 text-concrete-400 transition-colors group-hover:text-camel-green-700"
                        aria-hidden
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* ── Recent enquiries ── */}
        <Card className="gap-0 rounded-2xl border-concrete-200 bg-white py-0 shadow-none">
          <CardHeader className="border-b border-concrete-200 py-4 [.border-b]:pb-4">
            <CardTitle className="text-base">Recent enquiries</CardTitle>
            <CardDescription>The five latest contact enquiries.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {data.recentEnquiries.length === 0 ? (
              <EmptyState
                icon={Inbox}
                title="No enquiries yet"
                body="Contact form submissions will appear here as soon as they arrive."
              />
            ) : (
              <ul className="divide-y divide-concrete-200">
                {data.recentEnquiries.map((item) => (
                  <li key={item.id}>
                    <Link
                      href="/admin/enquiries"
                      className="group flex items-center gap-3 px-5 py-3 transition-colors hover:bg-concrete-50"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-mono text-[13px] font-semibold text-foreground">
                          {item.reference}
                        </p>
                        <p className="truncate text-sm text-muted-foreground">
                          {item.name} · {humaniseStatus(item.type)} ·{" "}
                          {relativeTime(item.createdAt)}
                        </p>
                      </div>
                      <StatusBadge status={item.status} />
                      <ArrowUpRight
                        className="size-4 shrink-0 text-concrete-400 transition-colors group-hover:text-camel-green-700"
                        aria-hidden
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
