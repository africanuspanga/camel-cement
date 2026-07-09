import { NextResponse } from "next/server";
import { contactSchema } from "@/lib/validation/forms";
import { rateLimit, clientIp, localReference } from "@/lib/validation/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const orNull = (value: string | undefined) =>
  value && value.length > 0 ? value : null;

export async function POST(request: Request) {
  try {
    if (!rateLimit(`contact:${clientIp(request)}`)) {
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
        reference: "EN-DEMO",
        persisted: false,
      });
    }

    const parsed = contactSchema.safeParse(body);
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
        reference: localReference("EN"),
        persisted: false,
      });
    }

    const { data: enquiry, error } = await supabase
      .from("contact_enquiries")
      .insert({
        enquiry_type: data.enquiryType,
        full_name: data.fullName,
        company: orNull(data.company),
        email: data.email,
        phone: data.phone,
        region: orNull(data.region),
        district: orNull(data.district),
        product: orNull(data.product),
        message: data.message,
        preferred_contact: data.preferredContact ?? null,
        source_page: orNull(data.sourcePage) ?? "/contact",
      })
      .select("id,reference")
      .single();

    if (error || !enquiry) {
      throw new Error("Failed to save enquiry");
    }

    return NextResponse.json({
      ok: true,
      reference: enquiry.reference,
      persisted: true,
    });
  } catch (error) {
    console.error("[api/contact] submission failed", error);
    return NextResponse.json(
      {
        ok: false,
        persisted: false,
        error: "Something went wrong while sending your enquiry. Please try again.",
      },
      { status: 500 }
    );
  }
}
