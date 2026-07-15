"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient, isSupabaseConfigured } from "@/core/supabase/client";
import { Button } from "@/shared/components/ui/Button";
import { Panel } from "@/shared/components/ui/Panel";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const supabase = createClient();
    if (!supabase) return;

    setLoading(true);
    const { error: signUpError } = await supabase.auth.signUp({ email, password });
    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }
    setDone(true);
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Panel className="w-full max-w-sm p-6">
        <h1 className="mb-1 font-display text-lg font-semibold">Create account</h1>
        <p className="mb-5 text-[12.5px] text-text-dim">
          New accounts default to the <b>fan</b> role. An organizer can promote a user&apos;s role
          afterward via the <code className="font-mono">profiles</code> table.
        </p>

        {!isSupabaseConfigured ? (
          <div className="rounded-lg border border-amber/30 bg-amber-dim px-3.5 py-3 text-[12.5px] text-amber">
            Supabase isn&apos;t configured yet — see <code className="font-mono">SETUP.md</code> to
            enable real accounts.
            <div className="mt-3">
              <Link href="/organizer" className="underline">
                Continue to the Organizer dashboard →
              </Link>
            </div>
          </div>
        ) : done ? (
          <p className="text-[13px] text-turf">
            Check your email to confirm your account, then{" "}
            <Link href="/login" className="underline">
              sign in
            </Link>
            .
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <label className="block">
              <span className="mb-1 block font-mono text-[10.5px] uppercase tracking-wide text-text-faint">
                Email
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-border bg-bg-2 px-3 py-2 text-[13px] text-text outline-none focus-visible:ring-2 focus-visible:ring-cyan"
              />
            </label>
            <label className="block">
              <span className="mb-1 block font-mono text-[10.5px] uppercase tracking-wide text-text-faint">
                Password
              </span>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-border bg-bg-2 px-3 py-2 text-[13px] text-text outline-none focus-visible:ring-2 focus-visible:ring-cyan"
              />
            </label>
            {error && <p className="text-[12px] text-danger">{error}</p>}
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="w-full justify-center"
            >
              {loading ? "Creating account…" : "Sign up"}
            </Button>
            <p className="text-center text-[12px] text-text-dim">
              Already have an account?{" "}
              <Link href="/login" className="text-cyan underline">
                Sign in
              </Link>
            </p>
          </form>
        )}
      </Panel>
    </div>
  );
}
