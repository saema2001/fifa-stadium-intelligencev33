"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/core/supabase/client";
import { Button } from "@/shared/components/ui/Button";
import { Panel } from "@/shared/components/ui/Panel";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? "/organizer";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const supabase = createClient();
    if (!supabase) return; // demo-mode banner covers this case

    setLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Panel className="w-full max-w-sm p-6">
        <h1 className="mb-1 font-display text-lg font-semibold">Sign in</h1>
        <p className="mb-5 text-[12.5px] text-text-dim">Stadium Intelligence Command Center</p>

        {!isSupabaseConfigured ? (
          <div className="rounded-lg border border-amber/30 bg-amber-dim px-3.5 py-3 text-[12.5px] text-amber">
            Supabase isn&apos;t configured yet, so accounts don&apos;t exist — every dashboard is
            reachable without signing in (demo mode). See{" "}
            <code className="font-mono">SETUP.md</code> to enable real auth.
            <div className="mt-3">
              <Link href="/organizer" className="underline">
                Continue to the Organizer dashboard →
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <Field label="Email">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-border bg-bg-2 px-3 py-2 text-[13px] text-text outline-none focus-visible:ring-2 focus-visible:ring-cyan"
              />
            </Field>
            <Field label="Password">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-border bg-bg-2 px-3 py-2 text-[13px] text-text outline-none focus-visible:ring-2 focus-visible:ring-cyan"
              />
            </Field>
            {error && <p className="text-[12px] text-danger">{error}</p>}
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="w-full justify-center"
            >
              {loading ? "Signing in…" : "Sign in"}
            </Button>
            <p className="text-center text-[12px] text-text-dim">
              No account?{" "}
              <Link href="/signup" className="text-cyan underline">
                Sign up
              </Link>
            </p>
          </form>
        )}
      </Panel>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block font-mono text-[10.5px] uppercase tracking-wide text-text-faint">
        {label}
      </span>
      {children}
    </label>
  );
}
