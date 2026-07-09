/**
 * Shared cart pricing constants and formatters.
 *
 * Kept free of any "use client" directive or server-only imports so both
 * Server Components (product pages, cart page) and Client Components
 * (cart context, cart view) can import from here safely.
 */

/** Fallback retail price per 50 kg bag when site_settings is unavailable. */
export const PRICE_PER_BAG_TZS = 18500;

/** Weight of a single bag in kilograms. */
export const BAG_WEIGHT_KG = 50;

/** Maximum quantity of bags allowed per line item. */
export const MAX_BAGS = 100000;

/** Formats an amount as "TZS 18,500". */
export function formatTzs(n: number): string {
  return `TZS ${Math.round(n).toLocaleString("en-US")}`;
}

/**
 * Formats a bag count as a human weight: "150 kg" below one tonne,
 * "7.5 tonnes" (or "1 tonne") at and above one tonne.
 */
export function formatBagsWeight(bags: number): string {
  const kg = bags * BAG_WEIGHT_KG;
  if (kg < 1000) return `${kg.toLocaleString("en-US")} kg`;
  const tonnes = kg / 1000;
  const rounded =
    Number.isInteger(tonnes) && tonnes < 1000
      ? tonnes.toLocaleString("en-US")
      : tonnes.toLocaleString("en-US", { maximumFractionDigits: 1 });
  return `${rounded} ${tonnes === 1 ? "tonne" : "tonnes"}`;
}

/** Clamps a quantity to the allowed 0..MAX_BAGS integer range. */
export function clampBags(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.min(MAX_BAGS, Math.max(0, Math.floor(n)));
}
