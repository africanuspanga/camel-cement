/**
 * Creates the Camel Cement super admin account in Supabase Auth and promotes
 * it in public.profiles.
 *
 * Usage:
 *   npx dotenv -e .env.local -- npx tsx scripts/seed-admin.ts
 * (or)
 *   source <(grep -v '^#' .env.local | sed 's/^/export /') && npx tsx scripts/seed-admin.ts
 */
import { createClient } from "@supabase/supabase-js";

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_SEED_PASSWORD;

  if (!url || !serviceKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local"
    );
  }
  if (!email || !password) {
    throw new Error("ADMIN_EMAIL and ADMIN_SEED_PASSWORD must be set in .env.local");
  }

  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: created, error: createError } =
    await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: "Camel Cement Administrator" },
    });

  let userId = created?.user?.id;

  if (createError) {
    if (!createError.message.toLowerCase().includes("already")) {
      throw createError;
    }
    console.log(`Auth user ${email} already exists, updating password...`);
    const { data: list, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) throw listError;
    const existing = list.users.find((u) => u.email === email);
    if (!existing) throw new Error("Could not locate existing admin user");
    userId = existing.id;
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      userId,
      { password, email_confirm: true }
    );
    if (updateError) throw updateError;
  }

  if (!userId) throw new Error("No user id returned");

  const { error: profileError } = await supabase.from("profiles").upsert({
    id: userId,
    email,
    full_name: "Camel Cement Administrator",
    role: "super_admin",
    active: true,
  });
  if (profileError) throw profileError;

  console.log(`✔ Super admin ready: ${email}`);
  console.log("  Sign in at /admin/login");
}

main().catch((err) => {
  console.error("Seed failed:", err.message ?? err);
  process.exit(1);
});
