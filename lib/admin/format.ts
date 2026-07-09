/**
 * Formatting helpers for the admin dashboard. No dependencies — safe to
 * import from both server and client components.
 */

const DIVISIONS: { amount: number; unit: Intl.RelativeTimeFormatUnit }[] = [
  { amount: 60, unit: "seconds" },
  { amount: 60, unit: "minutes" },
  { amount: 24, unit: "hours" },
  { amount: 7, unit: "days" },
  { amount: 4.34524, unit: "weeks" },
  { amount: 12, unit: "months" },
  { amount: Number.POSITIVE_INFINITY, unit: "years" },
];

const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

/** "3 minutes ago", "yesterday", "2 months ago" — from an ISO string or Date. */
export function relativeTime(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "—";

  let duration = (date.getTime() - Date.now()) / 1000;
  for (const division of DIVISIONS) {
    if (Math.abs(duration) < division.amount) {
      return rtf.format(Math.round(duration), division.unit);
    }
    duration /= division.amount;
  }
  return "—";
}

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const dateTimeFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

/** "9 Jul 2026" */
export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "—";
  return dateFormat.format(date);
}

/** "9 Jul 2026, 10:42" */
export function formatDateTime(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "—";
  return dateTimeFormat.format(date);
}

const numberFormat = new Intl.NumberFormat("en-GB");

/** "12,480" */
export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "0";
  return numberFormat.format(value);
}

/** Weight in tonnes from kilograms: "24.5 t" */
export function formatTonnes(kg: number | null | undefined): string {
  if (!kg) return "0 t";
  return `${numberFormat.format(Math.round((kg / 1000) * 10) / 10)} t`;
}

/** "quotation_prepared" → "Quotation prepared" */
export function humaniseStatus(status: string | null | undefined): string {
  if (!status) return "—";
  const label = status.replace(/_/g, " ").trim();
  return label.charAt(0).toUpperCase() + label.slice(1);
}

/** Initials from a full name or email for avatar chips. */
export function initials(value: string | null | undefined): string {
  if (!value) return "CC";
  const clean = value.split("@")[0].replace(/[._-]+/g, " ").trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "CC";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
