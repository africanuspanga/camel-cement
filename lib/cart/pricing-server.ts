import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { PRICE_PER_BAG_TZS } from "@/lib/cart/pricing";

/**
 * Live bag price from site_settings (key: cement_price_tzs), admin-editable.
 * Cached per request; falls back to the default when Supabase is unavailable.
 */
export const getBagPriceTzs = cache(async (): Promise<number> => {
  try {
    const supabase = await createClient();
    if (!supabase) return PRICE_PER_BAG_TZS;
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "cement_price_tzs")
      .maybeSingle();
    const amount = Number(
      (data?.value as { amount?: number } | null)?.amount
    );
    return Number.isFinite(amount) && amount > 0 ? amount : PRICE_PER_BAG_TZS;
  } catch {
    return PRICE_PER_BAG_TZS;
  }
});
