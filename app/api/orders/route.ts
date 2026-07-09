import { NextResponse } from "next/server";
import { orderSchema } from "@/lib/validation/forms";
import { rateLimit, clientIp, localReference } from "@/lib/validation/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";
import { getProduct } from "@/lib/products";

export const runtime = "nodejs";

const BAG_WEIGHT_KG = 50;

const orNull = (value: string | undefined) =>
  value && value.length > 0 ? value : null;

export async function POST(request: Request) {
  try {
    if (!rateLimit(`orders:${clientIp(request)}`)) {
      return NextResponse.json(
        {
          ok: false,
          persisted: false,
          error: "Too many requests. Please try again in a few minutes.",
        },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { ok: false, persisted: false, error: "Invalid request body." },
        { status: 400 }
      );
    }

    // Honeypot: pretend success so bots learn nothing.
    const honeypot = (body as Record<string, unknown>).website;
    if (typeof honeypot === "string" && honeypot.trim().length > 0) {
      return NextResponse.json({
        ok: true,
        reference: "OR-DEMO",
        persisted: false,
      });
    }

    const parsed = orderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          persisted: false,
          error: "Please check the highlighted fields and try again.",
        },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Totals are always computed server-side, never trusted from the client.
    const totalBags = data.items.reduce(
      (sum, item) => sum + item.quantityBags,
      0
    );
    const estimatedWeightKg = totalBags * BAG_WEIGHT_KG;

    const supabase = createAdminClient();

    if (!supabase) {
      return NextResponse.json({
        ok: true,
        reference: localReference("OR"),
        persisted: false,
      });
    }

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        full_name: data.fullName,
        company: orNull(data.company),
        phone: data.phone,
        email: orNull(data.email),
        fulfilment: data.fulfilment,
        region: data.region,
        district: orNull(data.district),
        site_address: orNull(data.siteAddress),
        preferred_date: orNull(data.preferredDate),
        total_bags: totalBags,
        estimated_weight_kg: estimatedWeightKg,
        notes: orNull(data.notes),
      })
      .select("id,reference")
      .single();

    if (orderError || !order) {
      throw new Error("Failed to save order");
    }

    const items = data.items.map((item) => {
      const product = getProduct(item.productSlug);
      return {
        order_id: order.id,
        product_slug: item.productSlug,
        product_name: product
          ? `Camel Cement ${product.grade} ${product.friendlyName}`
          : item.productSlug,
        quantity_bags: item.quantityBags,
      };
    });

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(items);

    if (itemsError) {
      throw new Error("Failed to save order items");
    }

    return NextResponse.json({
      ok: true,
      reference: order.reference,
      persisted: true,
    });
  } catch (error) {
    console.error("[api/orders] submission failed", error);
    return NextResponse.json(
      {
        ok: false,
        persisted: false,
        error: "Something went wrong while submitting your order. Please try again.",
      },
      { status: 500 }
    );
  }
}
