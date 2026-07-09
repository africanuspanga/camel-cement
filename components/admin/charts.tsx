"use client";

import { BarChart3 } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { formatNumber } from "@/lib/admin/format";

/** Brand chart palette per design doc section 29. */
export const CHART_PALETTE = [
  "#00872C",
  "#FFAC00",
  "#005E20",
  "#A9DFC0",
  "#6B716C",
] as const;

function ChartEmptyOverlay({ message }: { message?: string }) {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 rounded-xl bg-white/72 backdrop-blur-[2px]">
      <div className="flex size-10 items-center justify-center rounded-xl bg-camel-green-50 text-camel-green-700">
        <BarChart3 className="size-5" aria-hidden />
      </div>
      <p className="text-sm font-semibold text-foreground">No data yet</p>
      <p className="max-w-55 text-center text-xs text-muted-foreground">
        {message ?? "New activity will appear here."}
      </p>
    </div>
  );
}

// ── Enquiries and quotes by day ───────────────────────────────────────

export interface ActivityPoint {
  date: string; // "2026-07-01"
  label: string; // "1 Jul"
  enquiries: number;
  quotes: number;
}

const activityConfig = {
  enquiries: { label: "Enquiries", color: "#00872C" },
  quotes: { label: "Quote requests", color: "#FFAC00" },
} satisfies ChartConfig;

export function ActivityAreaChart({ data }: { data: ActivityPoint[] }) {
  const isEmpty = data.every((point) => point.enquiries === 0 && point.quotes === 0);

  return (
    <div className="relative">
      {isEmpty && (
        <ChartEmptyOverlay message="Enquiries and quote requests will chart here as they arrive." />
      )}
      <ChartContainer config={activityConfig} className="h-64 w-full aspect-auto">
        <AreaChart data={data} margin={{ left: 0, right: 8, top: 8 }}>
          <defs>
            <linearGradient id="fillEnquiries" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00872C" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#00872C" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="fillQuotes" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#FFAC00" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#FFAC00" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={24}
          />
          <YAxis tickLine={false} axisLine={false} width={32} allowDecimals={false} />
          <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
          <Area
            dataKey="enquiries"
            type="monotone"
            stroke="#00872C"
            strokeWidth={2}
            fill="url(#fillEnquiries)"
          />
          <Area
            dataKey="quotes"
            type="monotone"
            stroke="#FFAC00"
            strokeWidth={2}
            fill="url(#fillQuotes)"
          />
        </AreaChart>
      </ChartContainer>
    </div>
  );
}

// ── Quote requests by product ─────────────────────────────────────────

export interface ProductCount {
  product: string;
  requests: number;
}

const productConfig = {
  requests: { label: "Requests", color: "#00872C" },
} satisfies ChartConfig;

export function ProductBarChart({ data }: { data: ProductCount[] }) {
  const isEmpty = data.length === 0;
  const rows = isEmpty
    ? [
        { product: "42.5R Rapid Strength", requests: 0 },
        { product: "42.5N Structural", requests: 0 },
        { product: "32.5R General", requests: 0 },
        { product: "32.5N Masonry", requests: 0 },
      ]
    : data;

  return (
    <div className="relative">
      {isEmpty && (
        <ChartEmptyOverlay message="Requested products will rank here once quotations arrive." />
      )}
      <ChartContainer config={productConfig} className="h-64 w-full aspect-auto">
        <BarChart data={rows} layout="vertical" margin={{ left: 8, right: 16 }}>
          <CartesianGrid horizontal={false} strokeDasharray="3 3" />
          <XAxis type="number" hide />
          <YAxis
            dataKey="product"
            type="category"
            tickLine={false}
            axisLine={false}
            width={130}
            tick={{ fontSize: 12 }}
          />
          <ChartTooltip content={<ChartTooltipContent hideLabel={false} />} />
          <Bar dataKey="requests" radius={[0, 6, 6, 0]} barSize={20}>
            {rows.map((row, index) => (
              <Cell
                key={row.product}
                fill={CHART_PALETTE[index % CHART_PALETTE.length]}
              />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>
    </div>
  );
}

// ── Order status donut ────────────────────────────────────────────────

export interface StatusSlice {
  name: string;
  value: number;
}

const donutConfig = {
  value: { label: "Orders" },
} satisfies ChartConfig;

export function OrderStatusDonut({
  data,
  total,
  centreLabel = "orders",
}: {
  data: StatusSlice[];
  total: number;
  centreLabel?: string;
}) {
  const isEmpty = total === 0;
  const slices = isEmpty ? [{ name: "No orders", value: 1 }] : data;

  return (
    <div className="relative">
      {isEmpty && (
        <ChartEmptyOverlay message="Order statuses will break down here once orders come in." />
      )}
      <ChartContainer config={donutConfig} className="h-64 w-full aspect-auto">
        <PieChart>
          {!isEmpty && (
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
          )}
          <Pie
            data={slices}
            dataKey="value"
            nameKey="name"
            innerRadius={62}
            outerRadius={92}
            paddingAngle={isEmpty ? 0 : 2}
            strokeWidth={2}
          >
            {slices.map((slice, index) => (
              <Cell
                key={slice.name}
                fill={isEmpty ? "#E4E6E3" : CHART_PALETTE[index % CHART_PALETTE.length]}
              />
            ))}
          </Pie>
          <text
            x="50%"
            y="47%"
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-foreground text-2xl font-semibold tabular-nums"
          >
            {formatNumber(total)}
          </text>
          <text
            x="50%"
            y="58%"
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-muted-foreground text-xs"
          >
            {centreLabel}
          </text>
        </PieChart>
      </ChartContainer>
      {!isEmpty && (
        <ul className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1">
          {data.map((slice, index) => (
            <li
              key={slice.name}
              className="flex items-center gap-1.5 text-xs text-muted-foreground"
            >
              <span
                aria-hidden
                className="size-2 rounded-full"
                style={{
                  backgroundColor: CHART_PALETTE[index % CHART_PALETTE.length],
                }}
              />
              {slice.name}
              <span className="font-semibold text-foreground tabular-nums">
                {formatNumber(slice.value)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ── Generic vertical bar (analytics) ─────────────────────────────────

export interface SimpleBarPoint {
  name: string;
  value: number;
}

const simpleBarConfig = {
  value: { label: "Sessions", color: "#00872C" },
} satisfies ChartConfig;

export function SimpleBarChart({
  data,
  emptyMessage,
}: {
  data: SimpleBarPoint[];
  emptyMessage?: string;
}) {
  const isEmpty = data.length === 0 || data.every((point) => point.value === 0);
  const rows = isEmpty
    ? [
        { name: "Concrete", value: 0 },
        { name: "Mortar", value: 0 },
        { name: "Plaster", value: 0 },
      ]
    : data;

  return (
    <div className="relative">
      {isEmpty && <ChartEmptyOverlay message={emptyMessage} />}
      <ChartContainer config={simpleBarConfig} className="h-64 w-full aspect-auto">
        <BarChart data={rows} margin={{ left: 0, right: 8, top: 8 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
          <YAxis tickLine={false} axisLine={false} width={32} allowDecimals={false} />
          <ChartTooltip content={<ChartTooltipContent hideLabel />} />
          <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={36}>
            {rows.map((row, index) => (
              <Cell
                key={row.name}
                fill={CHART_PALETTE[index % CHART_PALETTE.length]}
              />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>
    </div>
  );
}
