import type { Metadata } from "next";
import { BookOpen, CircleCheck, CircleAlert, UserRound } from "lucide-react";

import { PageHeader } from "@/components/admin/page-header";
import {
  SettingsEditor,
  type SettingDefinition,
} from "@/components/admin/settings-editor";
import { StatusBadge } from "@/components/admin/status-badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { humaniseStatus } from "@/lib/admin/format";
import { site } from "@/lib/site";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Settings",
};

const SETTING_DEFS = [
  {
    key: "announcement_bar",
    label: "Announcement bar",
    description: "The message shown in the announcement strip on the public site.",
    fallback: site.announcement,
  },
  {
    key: "sales_phone",
    label: "Sales phone",
    description: "Primary sales phone number shown across the website.",
    fallback: site.phone,
  },
  {
    key: "sales_email",
    label: "Sales email",
    description: "Primary sales email for quotations and enquiries.",
    fallback: site.salesEmail,
  },
] as const;

function EnvRow({ label, present }: { label: string; present: boolean }) {
  return (
    <li className="flex items-center justify-between gap-4 py-2.5">
      <span className="flex items-center gap-2.5 text-sm font-medium">
        {present ? (
          <CircleCheck className="size-4 text-camel-green-700" aria-hidden />
        ) : (
          <CircleAlert className="size-4 text-amber-500" aria-hidden />
        )}
        {label}
      </span>
      <StatusBadge
        status={present ? "active" : "inactive"}
        label={present ? "Configured" : "Missing"}
      />
    </li>
  );
}

export default async function SettingsPage() {
  const supabaseConfigured = isSupabaseConfigured();
  const serviceRolePresent = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
  const moonshotPresent = Boolean(process.env.MOONSHOT_API_KEY);

  const supabase = await createClient();

  let account: { name: string; email: string; role: string } | null = null;
  const storedValues = new Map<string, string>();

  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, email, role")
        .eq("id", user.id)
        .maybeSingle();
      account = {
        name: profile?.full_name ?? "",
        email: profile?.email ?? user.email ?? "",
        role: profile?.role ?? "analyst",
      };
    }

    const { data: settingsRows } = await supabase
      .from("site_settings")
      .select("key, value")
      .in(
        "key",
        SETTING_DEFS.map((def) => def.key)
      );
    for (const row of settingsRows ?? []) {
      const value = row.value as { text?: string } | null;
      if (value?.text) storedValues.set(row.key as string, value.text);
    }
  }

  const editorSettings: SettingDefinition[] = SETTING_DEFS.map((def) => ({
    key: def.key,
    label: def.label,
    description: def.description,
    value: storedValues.get(def.key) ?? def.fallback,
  }));

  return (
    <div className="space-y-5">
      <PageHeader
        title="Settings"
        description="Environment health, your account and site-wide values used across the public website."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="gap-4 rounded-2xl border-concrete-200 bg-white shadow-none">
          <CardHeader>
            <CardTitle className="text-base">Environment</CardTitle>
            <CardDescription>
              Presence checks only — values are never displayed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-concrete-200">
              <EnvRow label="Supabase connection" present={supabaseConfigured} />
              <EnvRow label="Supabase service role" present={serviceRolePresent} />
              <EnvRow label="Moonshot AI key" present={moonshotPresent} />
            </ul>
          </CardContent>
        </Card>

        <Card className="gap-4 rounded-2xl border-concrete-200 bg-white shadow-none">
          <CardHeader>
            <CardTitle className="text-base">Your account</CardTitle>
            <CardDescription>The staff account you are signed in with.</CardDescription>
          </CardHeader>
          <CardContent>
            {account ? (
              <div className="flex items-center gap-3">
                <span className="flex size-11 items-center justify-center rounded-full bg-camel-green-900 text-sm font-bold text-white">
                  <UserRound className="size-5" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">
                    {account.name || "Camel Cement staff"}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {account.email}
                  </p>
                  <StatusBadge
                    status="active"
                    label={humaniseStatus(account.role)}
                    className="mt-1.5"
                  />
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Account details are available once Supabase is connected.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="gap-4 rounded-2xl border-concrete-200 bg-white shadow-none">
          <CardHeader>
            <CardTitle className="text-base">Documentation</CardTitle>
            <CardDescription>Everything lives in the repository.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2.5 text-sm">
              {[
                ["Design system", "docs/camel-cement-design.md"],
                ["Master build brief", "docs/camel-cement-master-build-prompt.md"],
                ["Database schema", "supabase/migrations/0001_init.sql"],
                ["Seed scripts", "scripts/"],
              ].map(([label, path]) => (
                <li key={path} className="flex items-center gap-2.5">
                  <BookOpen
                    className="size-4 shrink-0 text-camel-green-700"
                    aria-hidden
                  />
                  <span className="font-medium">{label}</span>
                  <code className="ml-auto rounded-md bg-concrete-100 px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
                    {path}
                  </code>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card className="gap-4 rounded-2xl border-concrete-200 bg-white shadow-none">
        <CardHeader>
          <CardTitle className="text-base">Site values</CardTitle>
          <CardDescription>
            Stored in <code className="font-mono text-xs">site_settings</code>{" "}
            and read by the public website. Changes are audited.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SettingsEditor settings={editorSettings} />
        </CardContent>
      </Card>
    </div>
  );
}
