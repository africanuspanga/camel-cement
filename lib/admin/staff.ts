import { createClient } from "@/lib/supabase/server";

/**
 * Shared staff guard + audit helpers for the resource and dealer-import
 * modules. Mirrors the guard used across the rest of the admin: valid
 * session + active profiles row (RLS also enforces this at the database
 * layer — this keeps error messages friendly).
 */

export type StaffContext = {
  supabase: NonNullable<Awaited<ReturnType<typeof createClient>>>;
  userId: string;
  role: string;
};

export async function requireStaff(): Promise<
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

export async function writeAudit(
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
