import type { Metadata } from "next";
import Image from "next/image";

import { LoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function AdminLoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* ── Brand panel (stacks on top on mobile) ── */}
      <div className="flex flex-col items-center justify-center bg-white px-6 py-12 lg:py-0">
        <Image
          src="/logo.png"
          alt="Camel Cement — Amsons Group"
          width={1536}
          height={1024}
          priority
          className="h-auto w-64 sm:w-72 lg:w-96"
        />
        <p className="text-xs font-semibold tracking-[0.18em] text-camel-green-700 uppercase">
          We Build Stronger
        </p>
      </div>

      {/* ── Form panel ── */}
      <div className="flex flex-col items-center justify-center border-concrete-200 bg-concrete-50 px-6 py-12 lg:border-l">
        <div className="w-full max-w-95">
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Sign in to Admin
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Use your staff account to continue.
          </p>

          <div className="mt-7">
            <LoginForm />
          </div>

          <p className="mt-10 text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} Camel Cement — a member of Amsons
            Group
          </p>
        </div>
      </div>
    </div>
  );
}
