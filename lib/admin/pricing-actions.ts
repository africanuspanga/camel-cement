"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireStaff, writeAudit } from "@/lib/admin/staff";

const priceSchema = z
  .number()
  .int("Price must be a whole number")
  .min(500, "Price looks too low")
  .max(1_000_000, "Price looks too high");

/** Updates the retail bag price used across the website and cart. */
export async function updateBagPrice(
  amount: number
): Promise<{ ok: boolean; error?: string }> {
  const guard = await requireStaff();
  if (!guard.ok) return { ok: false, error: guard.error };

  const parsed = priceSchema.safeParse(amount);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid price" };
  }

  const { supabase, userId } = guard.ctx;
  const { error } = await supabase.from("site_settings").upsert({
    key: "cement_price_tzs",
    value: { amount: parsed.data, currency: "TZS", per: "50 kg bag" },
    description: "Retail price per 50 kg bag used by the online cart",
    updated_by: userId,
  });
  if (error) {
    console.error("updateBagPrice:", error.message);
    return { ok: false, error: "Could not save the price. Please try again." };
  }

  await writeAudit(guard.ctx, "pricing.updated", "site_setting", "cement_price_tzs", {
    amount: parsed.data,
  });

  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/products/[slug]", "page");
  revalidatePath("/products/finder");
  revalidatePath("/cart");
  revalidatePath("/admin/products");

  return { ok: true };
}
