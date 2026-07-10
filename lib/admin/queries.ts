// Server-side query helpers for the admin dashboard. Import only from
// Server Components / server actions (pulls in next/headers via the client).
import { createClient } from "@/lib/supabase/server";

export const PAGE_SIZE = 20;

export type ServerSupabase = NonNullable<Awaited<ReturnType<typeof createClient>>>;

/** Parses ?page= into a safe 1-based page number. */
export function parsePage(value: string | undefined): number {
  const page = Number.parseInt(value ?? "1", 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
}

/** Range bounds for .range() pagination. */
export function pageRange(page: number, pageSize = PAGE_SIZE): [number, number] {
  const from = (page - 1) * pageSize;
  return [from, from + pageSize - 1];
}

/** ISO timestamp for "last N days" filters. */
export function sinceIso(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(0, 0, 0, 0);
  return date.toISOString();
}

/** Escapes user input for use inside PostgREST .or()/ilike patterns. */
export function escapeLike(value: string): string {
  return value.replace(/[%_,()]/g, (char) => `\\${char}`).slice(0, 80);
}

/** head:true exact count with created_at >= since; returns 0 on any failure. */
export async function countSince(
  supabase: ServerSupabase,
  table: string,
  since?: string,
  filter?: { column: string; value: string },
  until?: string
): Promise<number> {
  let query = supabase.from(table).select("id", { count: "exact", head: true });
  if (since) query = query.gte("created_at", since);
  if (until) query = query.lt("created_at", until);
  if (filter) query = query.eq(filter.column, filter.value);
  const { count, error } = await query;
  if (error) return 0;
  return count ?? 0;
}

/**
 * Current count plus the count for the preceding period of equal length,
 * formatted as a KPI delta ("+12%", "−8%", "New") with a trend direction.
 */
export async function countWithTrend(
  supabase: ServerSupabase,
  table: string,
  days: number
): Promise<{ value: number; delta: string; trend: "up" | "down" | "flat" }> {
  const since = sinceIso(days);
  const previousSince = sinceIso(days * 2);
  const [value, previous] = await Promise.all([
    countSince(supabase, table, since),
    countSince(supabase, table, previousSince, undefined, since),
  ]);

  if (previous === 0) {
    return value === 0
      ? { value, delta: "—", trend: "flat" }
      : { value, delta: "New", trend: "up" };
  }
  const percent = Math.round(((value - previous) / previous) * 100);
  if (percent === 0) return { value, delta: "±0%", trend: "flat" };
  return {
    value,
    delta: `${percent > 0 ? "+" : "−"}${Math.abs(percent)}%`,
    trend: percent > 0 ? "up" : "down",
  };
}
