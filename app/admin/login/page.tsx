import type { Metadata } from "next";
import Image from "next/image";

import { LoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-white px-6 py-12">
      <div className="w-full max-w-95">
        {/* ── Brand ── */}
        <div className="flex flex-col items-center text-center">
          <Image
            src="/logo.png"
            alt="Camel Cement — Amsons Group"
            width={1536}
            height={1024}
            priority
            className="h-auto w-64 sm:w-72"
          />
          <h1 className="mt-2 text-xl font-bold tracking-tight text-foreground">
            Sign in to Admin
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Use your staff account to continue.
          </p>
        </div>

        {/* ── Form ── */}
        <div className="mt-8">
          <LoginForm />
        </div>

        <p className="mt-10 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Camel Cement — a member of Amsons Group
        </p>
      </div>
    </div>
  );
}
