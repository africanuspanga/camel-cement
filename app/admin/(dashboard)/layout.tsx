import { redirect } from "next/navigation";

import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { createClient } from "@/lib/supabase/server";

/**
 * Authenticated dashboard shell: deep green sidebar (272px), 72px top
 * header, warm concrete canvas. The parent app/admin/layout.tsx already
 * guarantees Supabase is configured before this renders.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  if (!supabase) redirect("/admin/login");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", user.id)
    .maybeSingle();

  const userName = profile?.full_name ?? "";
  const userEmail = profile?.email ?? user.email ?? "";

  return (
    <SidebarProvider style={{ "--sidebar-width": "17rem" } as React.CSSProperties}>
      <AdminSidebar userName={userName} userEmail={userEmail} />
      <SidebarInset className="bg-concrete-100">
        <AdminHeader userName={userName} userEmail={userEmail} />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
