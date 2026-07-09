import type { Metadata } from "next";
import { Users } from "lucide-react";

import { EmptyState } from "@/components/admin/empty-state";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { UserRoleSelect } from "@/components/admin/user-role-select";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { initials, relativeTime } from "@/lib/admin/format";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Users",
};

interface ProfileRow {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string;
  active: boolean;
  created_at: string;
}

export default async function UsersPage() {
  const supabase = await createClient();

  let rows: ProfileRow[] = [];
  let viewerIsSuperAdmin = false;
  let viewerId: string | null = null;

  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    viewerId = user?.id ?? null;

    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, email, role, active, created_at")
      .order("created_at", { ascending: true });
    rows = (data ?? []) as ProfileRow[];

    viewerIsSuperAdmin =
      rows.find((row) => row.id === viewerId)?.role === "super_admin";
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Users"
        description="Staff accounts and their platform roles. Only a super administrator can change roles."
      />

      <Card className="gap-0 overflow-hidden rounded-2xl border-concrete-200 bg-white py-0 shadow-none">
        {rows.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No staff accounts yet"
            body="Run scripts/seed-admin.ts to create the first super administrator."
          />
        ) : (
          <Table>
            <TableHeader className="bg-concrete-50">
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-5">User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="hidden sm:table-cell">Status</TableHead>
                <TableHead className="hidden pr-5 md:table-cell">Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id} className="h-12">
                  <TableCell className="pl-5">
                    <span className="flex items-center gap-3">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-camel-green-900 text-[11px] font-bold text-white">
                        {initials(row.full_name || row.email)}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium">
                          {row.full_name || "—"}
                          {row.id === viewerId ? (
                            <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                              (you)
                            </span>
                          ) : null}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {row.email}
                        </span>
                      </span>
                    </span>
                  </TableCell>
                  <TableCell>
                    <UserRoleSelect
                      id={row.id}
                      email={row.email ?? ""}
                      role={row.role}
                      canEdit={viewerIsSuperAdmin}
                    />
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <StatusBadge
                      status={row.active ? "active" : "inactive"}
                      label={row.active ? "Active" : "Disabled"}
                    />
                  </TableCell>
                  <TableCell className="hidden pr-5 text-muted-foreground tabular-nums md:table-cell">
                    {relativeTime(row.created_at)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
