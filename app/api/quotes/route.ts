import { NextResponse } from "next/server";
import { quoteRequestSchema } from "@/lib/validation/forms";
import { rateLimit, clientIp, localReference } from "@/lib/validation/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";
import { getProduct } from "@/lib/products";

export const runtime = "nodejs";

const orNull = (value: string | undefined) =>
  value && value.length > 0 ? value : null;

export async function POST(request: Request) {
  try {
    if (!rateLimit(`quotes:${clientIp(request)}`)) {
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
        reference: "QT-DEMO",
        persisted: false,
      });
    }

    const parsed = quoteRequestSchema.safeParse(body);
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
    const supabase = createAdminClient();

    if (!supabase) {
      return NextResponse.json({
        ok: true,
        reference: localReference("QT"),
        persisted: false,
      });
    }

    const { data: quote, error: quoteError } = await supabase
      .from("quote_requests")
      .insert({
        customer_type: data.customerType,
        full_name: data.fullName,
        company: orNull(data.company),
        phone: data.phone,
        email: orNull(data.email),
        project_type: data.projectType,
        project_name: orNull(data.projectName),
        region: data.region,
        district: orNull(data.district),
        site_address: orNull(data.siteAddress),
        start_date: orNull(data.startDate),
        delivery_date: orNull(data.deliveryDate),
        fulfilment: data.fulfilment,
        notes: orNull(data.notes),
      })
      .select("id,reference")
      .single();

    if (quoteError || !quote) {
      throw new Error("Failed to save quote request");
    }

    const items = data.items.map((item) => {
      const product = getProduct(item.productSlug);
      return {
        quote_id: quote.id,
        product_slug: item.productSlug,
        product_name: product
          ? `Camel Cement ${product.grade} ${product.friendlyName}`
          : item.productSlug,
        quantity_bags: item.quantityBags,
      };
    });

    const { error: itemsError } = await supabase
      .from("quote_items")
      .insert(items);

    if (itemsError) {
      throw new Error("Failed to save quote items");
    }

    return NextResponse.json({
      ok: true,
      reference: quote.reference,
      persisted: true,
    });
  } catch (error) {
    console.error("[api/quotes] submission failed", error);
    return NextResponse.json(
      {
        ok: false,
        persisted: false,
        error: "Something went wrong while submitting your request. Please try again.",
      },
      { status: 500 }
    );
  }
}
