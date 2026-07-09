/**
 * Simple in-memory rate limiting for public form endpoints. Suitable for a
 * single Node process; swap for a shared store if the app scales out.
 */

const buckets = new Map<string, number[]>();

const DEFAULT_LIMIT = 10;
const DEFAULT_WINDOW_MS = 5 * 60 * 1000;

export function rateLimit(
  key: string,
  limit: number = DEFAULT_LIMIT,
  windowMs: number = DEFAULT_WINDOW_MS
): boolean {
  const now = Date.now();
  const recent = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);

  if (recent.length >= limit) {
    buckets.set(key, recent);
    return false;
  }

  recent.push(now);
  buckets.set(key, recent);

  // Opportunistic cleanup so the map does not grow without bound.
  if (buckets.size > 2000) {
    for (const [k, hits] of buckets) {
      if (hits.every((t) => now - t >= windowMs)) buckets.delete(k);
    }
  }

  return true;
}

export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

/** Local fallback reference like QT-2026-48213 when the DB is unavailable. */
export function localReference(prefix: string): string {
  const digits = Math.floor(10000 + Math.random() * 90000);
  return `${prefix}-${new Date().getFullYear()}-${digits}`;
}
