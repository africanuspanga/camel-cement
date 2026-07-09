import { createClient } from "@/lib/supabase/server";
import { PRICE_PER_BAG_TZS } from "./pricing";

/**
 * Reads the retail cement price (TZS per 50 kg bag) from the
 * `site_settings` table (key: "cement_price_tzs"). Falls back to
 * PRICE_PER_BAG_TZS when Supabase is not configured, the row is missing
 * or the stored value is malformed.
 *
 * Server-side only (uses the cookie-aware Supabase client).
 */
export async function getCementPriceTzs(): Promise<number> {
  try {
    const supabase = await createClient();
    if (!supabase) return PRICE_PER_BAG_TZS;

    const { data, error } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "cement_price_tzs")
      .maybeSingle();

    if (error || !data) return PRICE_PER_BAG_TZS;

    const amount = (data.value as { amount?: unknown } | null)?.amount;
    if (typeof amount === "number" && Number.isFinite(amount) && amount > 0) {
      return amount;
    }
    return PRICE_PER_BAG_TZS;
  } catch {
    return PRICE_PER_BAG_TZS;
  }
}
