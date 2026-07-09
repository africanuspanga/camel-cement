import { NextRequest, NextResponse } from "next/server";
import { calculatorSessionSchema } from "@/lib/calculators";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

/**
 * Fire-and-forget analytics persistence for calculator sessions.
 * This endpoint must never surface an error to the client: the
 * calculator works fully without it.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = calculatorSessionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { persisted: false, error: "Invalid payload" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json({ persisted: false });
    }

    const { calculatorType, inputs, options, results, recommendedProduct } =
      parsed.data;

    const { error } = await supabase.from("calculator_sessions").insert({
      calculator_type: calculatorType,
      inputs: { ...inputs, ...(options ? { options } : {}) },
      results,
      recommended_product: recommendedProduct ?? null,
    });

    if (error) {
      return NextResponse.json({ persisted: false });
    }
    return NextResponse.json({ persisted: true });
  } catch {
    return NextResponse.json({ persisted: false });
  }
}
