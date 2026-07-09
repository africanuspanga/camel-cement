"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CircleAlert, TriangleAlert } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);

  const configured = isSupabaseConfigured();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const supabase = createClient();
    if (!supabase) {
      setError("Supabase is not configured yet. Follow the setup notice below.");
      return;
    }

    setPending(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (signInError) {
      setPending(false);
      setError(
        signInError.message === "Invalid login credentials"
          ? "That email and password combination was not recognised."
          : signInError.message
      );
      return;
    }

    router.push("/admin");
    router.refresh();
  };

  return (
    <div className="space-y-5">
      {!configured && (
        <Alert className="border-amber-300 bg-amber-50 text-amber-900">
          <TriangleAlert className="size-4 text-amber-600" />
          <AlertTitle>Supabase is not connected</AlertTitle>
          <AlertDescription className="text-amber-800">
            Connect Supabase in <code className="font-mono">.env.local</code>,
            run the migration and{" "}
            <code className="font-mono">npx tsx scripts/seed-admin.ts</code>,
            then sign in with{" "}
            <code className="font-mono">cement@amsonsgroup.net</code>.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" role="alert">
          <CircleAlert className="size-4" />
          <AlertTitle>Sign in failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="space-y-2">
          <Label htmlFor="admin-email" className="text-sm font-semibold">
            Email address
          </Label>
          <Input
            id="admin-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@amsonsgroup.net"
            className="h-13 rounded-xl border-concrete-300 px-4 text-[15px] focus-visible:border-camel-green-700 focus-visible:ring-camel-green-700/25 focus-visible:ring-[3px]"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="admin-password" className="text-sm font-semibold">
            Password
          </Label>
          <Input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••••"
            className="h-13 rounded-xl border-concrete-300 px-4 text-[15px] focus-visible:border-camel-green-700 focus-visible:ring-camel-green-700/25 focus-visible:ring-[3px]"
          />
        </div>
        <Button
          type="submit"
          disabled={pending || !email || !password}
          className="h-12 w-full rounded-full bg-camel-green-700 text-[15px] font-semibold text-white hover:bg-camel-green-800 focus-visible:ring-camel-green-700/40"
        >
          {pending ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <p className="text-center text-xs text-muted-foreground">
        Staff access only. Sessions are protected and all changes are recorded
        in the audit log.
      </p>
    </div>
  );
}
