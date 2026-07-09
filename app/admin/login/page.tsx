import type { Metadata } from "next";
import Image from "next/image";
import { BarChart3, FileText, Package } from "lucide-react";

import { LoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = {
  title: "Sign in",
};

const FEATURES = [
  { icon: Package, label: "Manage products and content" },
  { icon: FileText, label: "Track quotations and orders" },
  { icon: BarChart3, label: "Understand performance" },
];

export default function AdminLoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-[1.05fr_1fr]">
      {/* ── Brand panel ── */}
      <div className="relative hidden overflow-hidden bg-camel-green-900 lg:flex lg:flex-col lg:justify-between lg:p-12">
        {/* Concrete texture + depth via layered gradients */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            backgroundImage: [
              "radial-gradient(60rem 32rem at 110% -12%, rgba(255,172,0,0.16), transparent 58%)",
              "radial-gradient(48rem 30rem at -18% 112%, rgba(0,135,44,0.55), transparent 62%)",
              "linear-gradient(115deg, rgba(255,255,255,0.045) 0%, transparent 34%)",
              "repeating-linear-gradient(45deg, rgba(255,255,255,0.014) 0px, rgba(255,255,255,0.014) 2px, transparent 2px, transparent 7px)",
              "repeating-linear-gradient(-45deg, rgba(0,0,0,0.05) 0px, rgba(0,0,0,0.05) 1px, transparent 1px, transparent 9px)",
            ].join(", "),
          }}
        />

        <div className="relative flex items-center gap-3.5">
          <span className="flex size-13 items-center justify-center rounded-2xl bg-white p-2 shadow-card">
            <Image
              src="/logo.png"
              alt="Camel Cement"
              width={40}
              height={40}
              className="size-10 object-contain"
              priority
            />
          </span>
          <span className="leading-tight">
            <span className="block text-lg font-bold text-white">
              Camel Cement
            </span>
            <span className="block text-xs font-semibold tracking-[0.16em] text-camel-yellow-500 uppercase">
              A member of Amsons Group
            </span>
          </span>
        </div>

        <div className="relative max-w-md">
          <p className="text-eyebrow text-camel-yellow-500">
            Administration platform
          </p>
          <h1 className="mt-4 text-[44px] leading-[1.05] font-bold tracking-tight text-white">
            We Build
            <br />
            Stronger.
          </h1>
          <p className="mt-5 text-[15px] leading-relaxed text-white/72">
            One calm, controlled workspace for the teams behind Tanzania&rsquo;s
            dependable cement — from quotations and orders to dealers, content
            and insight.
          </p>
        </div>

        <ul className="relative space-y-3.5">
          {FEATURES.map((feature) => (
            <li key={feature.label} className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-xl bg-white/10 text-camel-yellow-500 ring-1 ring-white/15">
                <feature.icon className="size-4" aria-hidden />
              </span>
              <span className="text-sm font-medium text-white/85">
                {feature.label}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* ── Form panel ── */}
      <div className="flex items-center justify-center bg-concrete-50 px-6 py-12">
        <div className="w-full max-w-100">
          {/* Mobile-only brand mark */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <span className="flex size-11 items-center justify-center rounded-xl bg-camel-green-900 p-1.5">
              <Image
                src="/logo.png"
                alt="Camel Cement"
                width={32}
                height={32}
                className="size-8 rounded-md bg-white object-contain p-0.5"
              />
            </span>
            <span className="leading-tight">
              <span className="block text-base font-bold text-foreground">
                Camel Cement
              </span>
              <span className="block text-[11px] font-semibold tracking-[0.14em] text-camel-green-700 uppercase">
                Admin
              </span>
            </span>
          </div>

          <div className="rounded-3xl border border-concrete-200 bg-white p-8 shadow-card sm:p-10">
            <h2 className="text-[22px] font-bold tracking-tight text-foreground">
              Sign in to Camel Cement Admin
            </h2>
            <p className="mt-1.5 mb-7 text-sm text-muted-foreground">
              Use your staff account to continue.
            </p>
            <LoginForm />
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} Camel Cement — a member of Amsons
            Group
          </p>
        </div>
      </div>
    </div>
  );
}
