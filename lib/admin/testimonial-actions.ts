"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

export type ActionResult = { ok: boolean; error?: string };

type StaffContext = {
  supabase: NonNullable<Awaited<ReturnType<typeof createClient>>>;
  userId: string;
  role: string;
};

/**
 * Same staff guard as lib/admin/actions.ts: valid session + active profiles
 * row. RLS enforces this at the database layer too — the guard keeps error
 * messages friendly.
 */
async function requireStaff(): Promise<
  { ok: true; ctx: StaffContext } | { ok: false; error: string }
> {
  const supabase = await createClient();
  if (!supabase) {
    return {
      ok: false,
      error: "Supabase is not configured. Add credentials to .env.local first.",
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "You are signed out. Sign in again." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, active")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || !profile.active) {
    return { ok: false, error: "Your account does not have staff access." };
  }

  return { ok: true, ctx: { supabase, userId: user.id, role: profile.role } };
}

async function writeAudit(
  ctx: StaffContext,
  action: string,
  entityId: string | null,
  afterData?: Record<string, unknown>
) {
  await ctx.supabase.from("audit_logs").insert({
    user_id: ctx.userId,
    action,
    entity: "testimonial",
    entity_id: entityId,
    after_data: afterData ?? null,
  });
}

function revalidateTestimonialPaths() {
  revalidatePath("/");
  revalidatePath("/admin/testimonials");
}

// ── Validation ────────────────────────────────────────────────────────

const testimonialSchema = z.object({
  name: z.string().trim().min(2, "A name is required."),
  role: z.string().trim().max(120).optional(),
  company: z.string().trim().max(160).optional(),
  quote: z
    .string()
    .trim()
    .min(10, "The quote is too short.")
    .max(500, "Keep the quote under 500 characters."),
  rating: z
    .number()
    .min(1, "Rating must be between 1 and 5.")
    .max(5, "Rating must be between 1 and 5.")
    .multipleOf(0.5, "Rating must be in half-star steps."),
  source: z.enum(["google", "direct"]),
  published: z.boolean(),
});

export type TestimonialInput = {
  name: string;
  role?: string;
  company?: string;
  quote: string;
  rating: number;
  source: string;
  published: boolean;
};

// ── Actions ───────────────────────────────────────────────────────────

export async function createTestimonial(
  input: TestimonialInput
): Promise<ActionResult> {
  const parsed = testimonialSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid testimonial.",
    };
  }

  const guard = await requireStaff();
  if (!guard.ok) return { ok: false, error: guard.error };
  const { ctx } = guard;

  // Append after the current highest display_order.
  const { data: last } = await ctx.supabase
    .from("testimonials")
    .select("display_order")
    .order("display_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data, error } = await ctx.supabase
    .from("testimonials")
    .insert({
      name: parsed.data.name,
      role: parsed.data.role || null,
      company: parsed.data.company || null,
      quote: parsed.data.quote,
      rating: parsed.data.rating,
      source: parsed.data.source,
      published: parsed.data.published,
      display_order: (last?.display_order ?? 0) + 1,
    })
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };

  await writeAudit(ctx, "testimonial.created", data?.id ?? null, {
    name: parsed.data.name,
    rating: parsed.data.rating,
    source: parsed.data.source,
  });

  revalidateTestimonialPaths();
  return { ok: true };
}

export async function updateTestimonial(
  id: string,
  input: TestimonialInput
): Promise<ActionResult> {
  const parsed = testimonialSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid testimonial.",
    };
  }

  const guard = await requireStaff();
  if (!guard.ok) return { ok: false, error: guard.error };
  const { ctx } = guard;

  const { error } = await ctx.supabase
    .from("testimonials")
    .update({
      name: parsed.data.name,
      role: parsed.data.role || null,
      company: parsed.data.company || null,
      quote: parsed.data.quote,
      rating: parsed.data.rating,
      source: parsed.data.source,
      published: parsed.data.published,
    })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  await writeAudit(ctx, "testimonial.updated", id, {
    name: parsed.data.name,
    rating: parsed.data.rating,
    source: parsed.data.source,
    published: parsed.data.published,
  });

  revalidateTestimonialPaths();
  return { ok: true };
}

export async function deleteTestimonial(id: string): Promise<ActionResult> {
  const guard = await requireStaff();
  if (!guard.ok) return { ok: false, error: guard.error };
  const { ctx } = guard;

  const { error } = await ctx.supabase
    .from("testimonials")
    .delete()
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  await writeAudit(ctx, "testimonial.deleted", id);

  revalidateTestimonialPaths();
  return { ok: true };
}

export async function toggleTestimonialPublished(
  id: string,
  published: boolean
): Promise<ActionResult> {
  const guard = await requireStaff();
  if (!guard.ok) return { ok: false, error: guard.error };
  const { ctx } = guard;

  const { error } = await ctx.supabase
    .from("testimonials")
    .update({ published })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  await writeAudit(
    ctx,
    published ? "testimonial.published" : "testimonial.unpublished",
    id,
    { published }
  );

  revalidateTestimonialPaths();
  return { ok: true };
}
