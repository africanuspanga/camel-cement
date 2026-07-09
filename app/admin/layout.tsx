import type { Metadata } from "next";
import Image from "next/image";
import { Database, KeyRound, RefreshCcw, TerminalSquare } from "lucide-react";

import { isSupabaseConfigured } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: {
    default: "Admin | Camel Cement",
    template: "%s | Camel Cement Admin",
  },
  robots: { index: false, follow: false },
};

const SETUP_STEPS = [
  {
    icon: KeyRound,
    title: "Add Supabase credentials",
    body: (
      <>
        Copy <code>.env.example</code> to <code>.env.local</code> and fill in{" "}
        <code>NEXT_PUBLIC_SUPABASE_URL</code>,{" "}
        <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> and{" "}
        <code>SUPABASE_SERVICE_ROLE_KEY</code> from your Supabase project
        settings.
      </>
    ),
  },
  {
    icon: Database,
    title: "Run the database migration",
    body: (
      <>
        Apply <code>supabase/migrations/0001_init.sql</code> — either with{" "}
        <code>supabase db push</code> or by pasting it into the Supabase SQL
        editor. This creates all tables, policies and reference sequences.
      </>
    ),
  },
  {
    icon: TerminalSquare,
    title: "Seed the admin account and content",
    body: (
      <>
        Run <code>npx dotenv -e .env.local -- npx tsx scripts/seed-admin.ts</code>{" "}
        to create the super admin, then{" "}
        <code>npx dotenv -e .env.local -- npx tsx scripts/seed-content.ts</code>{" "}
        to load products, articles and launch content.
      </>
    ),
  },
  {
    icon: RefreshCcw,
    title: "Restart the dev server",
    body: (
      <>
        Stop and restart <code>npm run dev</code> so the new environment
        variables are picked up, then return to <code>/admin</code> and sign
        in.
      </>
    ),
  },
];

function SetupRequired() {
  return (
    <div className="flex min-h-svh flex-col bg-concrete-100">
      <div className="relative overflow-hidden bg-camel-green-900 px-6 pt-14 pb-24">
        <div
          aria-hidden
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(52rem 26rem at 85% -10%, rgba(255,172,0,0.14), transparent 60%), radial-gradient(40rem 20rem at 0% 110%, rgba(0,135,44,0.5), transparent 65%)",
          }}
        />
        <div className="relative mx-auto flex w-full max-w-3xl flex-col items-start gap-6">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-white p-2 shadow-card">
            <Image
              src="/logo.png"
              alt="Camel Cement"
              width={44}
              height={44}
              className="size-11 object-contain"
            />
          </span>
          <div>
            <p className="text-eyebrow text-camel-yellow-500">
              Camel Cement Admin
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">
              Setup required
            </h1>
            <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-white/75">
              The administration dashboard is ready, but Supabase is not
              connected yet. Complete the four steps below and this screen will
              be replaced by the sign-in page.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto -mt-14 mb-16 w-full max-w-3xl px-6">
        <ol className="space-y-4">
          {SETUP_STEPS.map((step, index) => (
            <li
              key={step.title}
              className="flex gap-4 rounded-2xl border border-concrete-200 bg-white p-5 shadow-card"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-camel-green-50 text-camel-green-700">
                <step.icon className="size-5" aria-hidden />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-foreground">
                  <span className="mr-1.5 text-camel-green-700 tabular-nums">
                    {index + 1}.
                  </span>
                  {step.title}
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground [&_code]:rounded-md [&_code]:bg-concrete-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[12.5px] [&_code]:text-camel-green-800">
                  {step.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Full instructions live in <span className="font-mono">README.md</span>{" "}
          and <span className="font-mono">docs/</span>. We Build Stronger.
        </p>
      </div>
    </div>
  );
}

/**
 * Passthrough layout for all /admin routes (including /admin/login). Its only
 * job is the environment check — auth and the dashboard shell live in the
 * (dashboard) route group so the login page can render standalone.
 */
export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isSupabaseConfigured()) {
    return <SetupRequired />;
  }
  return children;
}
