"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

export type ActionResult = { ok: boolean; error?: string };

const NOT_CONFIGURED: ActionResult = {
  ok: false,
  error: "Supabase is not configured. Add credentials to .env.local first.",
};

const NOT_STAFF: ActionResult = {
  ok: false,
  error: "Your account does not have staff access.",
};

type StaffContext = {
  supabase: NonNullable<Awaited<ReturnType<typeof createClient>>>;
  userId: string;
  role: string;
};

/**
 * Resolves the signed-in staff member. Every mutation goes through this
 * guard: valid session + active profiles row (RLS also enforces this at the
 * database layer — this keeps error messages friendly).
 */
async function requireStaff(): Promise<
  { ok: true; ctx: StaffContext } | { ok: false; error: string }
> {
  const supabase = await createClient();
  if (!supabase) return { ok: false, error: NOT_CONFIGURED.error! };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "You are signed out. Sign in again." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, active")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || !profile.active) return { ok: false, error: NOT_STAFF.error! };

  return { ok: true, ctx: { supabase, userId: user.id, role: profile.role } };
}

async function writeAudit(
  ctx: StaffContext,
  action: string,
  entity: string,
  entityId: string | null,
  afterData?: Record<string, unknown>
) {
  await ctx.supabase.from("audit_logs").insert({
    user_id: ctx.userId,
    action,
    entity,
    entity_id: entityId,
    after_data: afterData ?? null,
  });
}

// ── Auth ──────────────────────────────────────────────────────────────

export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  if (supabase) await supabase.auth.signOut();
  redirect("/admin/login");
}

// ── Quotations ────────────────────────────────────────────────────────

const quoteStatusSchema = z.enum([
  "new",
  "reviewing",
  "contacted",
  "quotation_prepared",
  "quotation_sent",
  "negotiating",
  "approved",
  "won",
  "lost",
  "closed",
]);

export async function updateQuoteStatus(
  id: string,
  status: string,
  note?: string
): Promise<ActionResult> {
  const parsed = quoteStatusSchema.safeParse(status);
  if (!parsed.success) return { ok: false, error: "Invalid quotation status." };

  const guard = await requireStaff();
  if (!guard.ok) return { ok: false, error: guard.error };
  const { ctx } = guard;

  const { error } = await ctx.supabase
    .from("quote_requests")
    .update({ status: parsed.data })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  await ctx.supabase.from("quote_status_history").insert({
    quote_id: id,
    status: parsed.data,
    note: note?.trim() || null,
    changed_by: ctx.userId,
  });
  await writeAudit(ctx, "quote.status_changed", "quote_requests", id, {
    status: parsed.data,
    note: note?.trim() || null,
  });

  revalidatePath("/admin/quotations");
  revalidatePath("/admin");
  return { ok: true };
}

// ── Orders ────────────────────────────────────────────────────────────

const orderStatusSchema = z.enum([
  "draft",
  "submitted",
  "under_review",
  "price_confirmed",
  "awaiting_approval",
  "approved",
  "payment_pending",
  "processing",
  "ready_for_collection",
  "out_for_delivery",
  "completed",
  "cancelled",
]);

export async function updateOrderStatus(
  id: string,
  status: string,
  note?: string
): Promise<ActionResult> {
  const parsed = orderStatusSchema.safeParse(status);
  if (!parsed.success) return { ok: false, error: "Invalid order status." };

  const guard = await requireStaff();
  if (!guard.ok) return { ok: false, error: guard.error };
  const { ctx } = guard;

  const { error } = await ctx.supabase
    .from("orders")
    .update({ status: parsed.data })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  await ctx.supabase.from("order_status_history").insert({
    order_id: id,
    status: parsed.data,
    note: note?.trim() || null,
    changed_by: ctx.userId,
  });
  await writeAudit(ctx, "order.status_changed", "orders", id, {
    status: parsed.data,
    note: note?.trim() || null,
  });

  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  return { ok: true };
}

// ── Enquiries ─────────────────────────────────────────────────────────

const enquiryStatusSchema = z.enum([
  "new",
  "assigned",
  "contacted",
  "waiting_customer",
  "in_progress",
  "resolved",
  "closed",
  "spam",
]);

export async function updateEnquiryStatus(
  id: string,
  status: string,
  note?: string
): Promise<ActionResult> {
  const parsed = enquiryStatusSchema.safeParse(status);
  if (!parsed.success) return { ok: false, error: "Invalid enquiry status." };

  const guard = await requireStaff();
  if (!guard.ok) return { ok: false, error: guard.error };
  const { ctx } = guard;

  const update: Record<string, unknown> = { status: parsed.data };
  if (note?.trim()) update.internal_notes = note.trim();

  const { error } = await ctx.supabase
    .from("contact_enquiries")
    .update(update)
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  await writeAudit(ctx, "enquiry.status_changed", "contact_enquiries", id, {
    status: parsed.data,
    note: note?.trim() || null,
  });

  revalidatePath("/admin/enquiries");
  revalidatePath("/admin");
  return { ok: true };
}

// ── Products ──────────────────────────────────────────────────────────

export async function toggleProductActive(
  id: string,
  active: boolean
): Promise<ActionResult> {
  const guard = await requireStaff();
  if (!guard.ok) return { ok: false, error: guard.error };
  const { ctx } = guard;

  const { error } = await ctx.supabase
    .from("products")
    .update({ active })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  await writeAudit(
    ctx,
    active ? "product.activated" : "product.deactivated",
    "products",
    id,
    { active }
  );

  revalidatePath("/admin/products");
  return { ok: true };
}

// ── Dealers ───────────────────────────────────────────────────────────

const dealerSchema = z.object({
  name: z.string().trim().min(2, "Dealer name is required."),
  region: z.string().trim().min(2, "Select a region."),
  district: z.string().trim().optional(),
  phone: z.string().trim().min(7, "A phone number is required."),
  whatsapp: z.string().trim().optional(),
  delivery_available: z.boolean(),
  collection_available: z.boolean(),
});

export async function addDealer(input: {
  name: string;
  region: string;
  district?: string;
  phone: string;
  whatsapp?: string;
  delivery_available: boolean;
  collection_available: boolean;
}): Promise<ActionResult> {
  const parsed = dealerSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid dealer." };
  }

  const guard = await requireStaff();
  if (!guard.ok) return { ok: false, error: guard.error };
  const { ctx } = guard;

  const { data, error } = await ctx.supabase
    .from("dealers")
    .insert({
      name: parsed.data.name,
      region: parsed.data.region,
      district: parsed.data.district || null,
      phone: parsed.data.phone,
      whatsapp: parsed.data.whatsapp || null,
      delivery_available: parsed.data.delivery_available,
      collection_available: parsed.data.collection_available,
      authorised: true,
      active: true,
    })
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };

  await writeAudit(ctx, "dealer.created", "dealers", data?.id ?? null, {
    name: parsed.data.name,
    region: parsed.data.region,
  });

  revalidatePath("/admin/dealers");
  return { ok: true };
}

// ── News / posts ──────────────────────────────────────────────────────

export async function setPostStatus(
  id: string,
  status: "draft" | "review" | "published"
): Promise<ActionResult> {
  if (!["draft", "review", "published"].includes(status)) {
    return { ok: false, error: "Invalid post status." };
  }

  const guard = await requireStaff();
  if (!guard.ok) return { ok: false, error: guard.error };
  const { ctx } = guard;

  const update: Record<string, unknown> = { status };
  if (status === "published") update.published_at = new Date().toISOString();

  const { error } = await ctx.supabase.from("posts").update(update).eq("id", id);
  if (error) return { ok: false, error: error.message };

  await writeAudit(ctx, `post.${status}`, "posts", id, { status });

  revalidatePath("/admin/news");
  return { ok: true };
}

// ── Careers ───────────────────────────────────────────────────────────

const vacancySchema = z.object({
  title: z.string().trim().min(3, "A vacancy title is required."),
  department: z.string().trim().min(2, "Department is required."),
  location: z.string().trim().min(2, "Location is required."),
  employment_type: z.string().trim().min(2, "Employment type is required."),
  closes_at: z.string().trim().optional(),
  description_md: z.string().trim().optional(),
});

export async function createVacancy(input: {
  title: string;
  department: string;
  location: string;
  employment_type: string;
  closes_at?: string;
  description_md?: string;
}): Promise<ActionResult> {
  const parsed = vacancySchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid vacancy." };
  }

  const guard = await requireStaff();
  if (!guard.ok) return { ok: false, error: guard.error };
  const { ctx } = guard;

  const slug =
    parsed.data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") +
    "-" +
    Date.now().toString(36);

  const { data, error } = await ctx.supabase
    .from("vacancies")
    .insert({
      slug,
      title: parsed.data.title,
      department: parsed.data.department,
      location: parsed.data.location,
      employment_type: parsed.data.employment_type,
      closes_at: parsed.data.closes_at || null,
      description_md: parsed.data.description_md || null,
      published: false,
    })
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };

  await writeAudit(ctx, "vacancy.created", "vacancies", data?.id ?? null, {
    title: parsed.data.title,
  });

  revalidatePath("/admin/careers");
  return { ok: true };
}

export async function setVacancyPublished(
  id: string,
  published: boolean
): Promise<ActionResult> {
  const guard = await requireStaff();
  if (!guard.ok) return { ok: false, error: guard.error };
  const { ctx } = guard;

  const { error } = await ctx.supabase
    .from("vacancies")
    .update({ published })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  await writeAudit(
    ctx,
    published ? "vacancy.published" : "vacancy.unpublished",
    "vacancies",
    id,
    { published }
  );

  revalidatePath("/admin/careers");
  return { ok: true };
}

const applicationStatusSchema = z.enum([
  "new",
  "screening",
  "shortlisted",
  "interview",
  "assessment",
  "reference_check",
  "offer",
  "hired",
  "rejected",
  "withdrawn",
]);

export async function updateApplicationStatus(
  id: string,
  status: string
): Promise<ActionResult> {
  const parsed = applicationStatusSchema.safeParse(status);
  if (!parsed.success) return { ok: false, error: "Invalid application status." };

  const guard = await requireStaff();
  if (!guard.ok) return { ok: false, error: guard.error };
  const { ctx } = guard;

  const { error } = await ctx.supabase
    .from("job_applications")
    .update({ status: parsed.data })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  await writeAudit(ctx, "application.status_changed", "job_applications", id, {
    status: parsed.data,
  });

  revalidatePath("/admin/careers");
  return { ok: true };
}

// ── Settings ──────────────────────────────────────────────────────────

const SETTING_KEYS = ["announcement_bar", "sales_phone", "sales_email"] as const;

export async function upsertSiteSetting(
  key: string,
  value: string
): Promise<ActionResult> {
  if (!SETTING_KEYS.includes(key as (typeof SETTING_KEYS)[number])) {
    return { ok: false, error: "Unknown setting key." };
  }

  const guard = await requireStaff();
  if (!guard.ok) return { ok: false, error: guard.error };
  const { ctx } = guard;

  const { error } = await ctx.supabase.from("site_settings").upsert({
    key,
    value: { text: value.trim() },
    updated_by: ctx.userId,
    updated_at: new Date().toISOString(),
  });
  if (error) return { ok: false, error: error.message };

  await writeAudit(ctx, "setting.updated", "site_settings", key, {
    value: value.trim(),
  });

  revalidatePath("/admin/settings");
  return { ok: true };
}

// ── Users ─────────────────────────────────────────────────────────────

const roleSchema = z.enum([
  "super_admin",
  "marketing_admin",
  "sales_manager",
  "sales_officer",
  "technical_officer",
  "hr_admin",
  "customer_support",
  "analyst",
]);

export async function updateUserRole(
  id: string,
  role: string
): Promise<ActionResult> {
  const parsed = roleSchema.safeParse(role);
  if (!parsed.success) return { ok: false, error: "Invalid role." };

  const guard = await requireStaff();
  if (!guard.ok) return { ok: false, error: guard.error };
  const { ctx } = guard;

  if (ctx.role !== "super_admin") {
    return { ok: false, error: "Only a super administrator can change roles." };
  }
  if (id === ctx.userId && parsed.data !== "super_admin") {
    return { ok: false, error: "You cannot remove your own super admin role." };
  }

  const { error } = await ctx.supabase
    .from("profiles")
    .update({ role: parsed.data })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  await writeAudit(ctx, "user.role_changed", "profiles", id, { role: parsed.data });

  revalidatePath("/admin/users");
  return { ok: true };
}
