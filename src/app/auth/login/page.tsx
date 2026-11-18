"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogIn, Loader2, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { DraftingContainer } from "@/components/layout/DraftingGrid";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    if (!supabase) {
      setError("Supabase is not configured.");
      setLoading(false);
      return;
    }

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <main className="min-h-screen bg-white pt-32 pb-20">
      <DraftingContainer className="flex min-h-[70vh] items-center justify-center px-6 py-12">
        <div className="w-full max-w-md rounded-[28px] border border-neutral-900/[0.08] bg-cru-surface p-8 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.06)]">
          <div className="mb-6">
            <div className="mb-2 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-cru-gold-hover">
              <span className="size-2 rounded-full bg-cru-gold" />
              Cru-VSU · Member Portal
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-cru-charcoal">
              Welcome Back
            </h1>
            <p className="mt-1.5 text-sm text-cru-muted">
              Sign in to access your discipleship dashboard and family tree web.
            </p>
          </div>

          {error && (
            <div className="mb-5 flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700">
              <AlertCircle className="size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label
                htmlFor="login-email"
                className="mb-1.5 block text-xs font-medium text-cru-charcoal"
              >
                Email Address
              </label>
              <input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@vsu.edu.ph"
                className="h-11 w-full rounded-2xl border border-neutral-900/[0.09] bg-white px-4 text-sm text-cru-charcoal focus:border-cru-gold focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="mb-1.5 block text-xs font-medium text-cru-charcoal"
              >
                Password
              </label>
              <input
                id="login-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-11 w-full rounded-2xl border border-neutral-900/[0.09] bg-white px-4 text-sm text-cru-charcoal focus:border-cru-gold focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 inline-flex h-12 w-full items-center justify-center gap-2.5 rounded-full bg-cru-gold text-sm font-semibold text-cru-charcoal shadow-sm transition-colors hover:bg-cru-gold-hover disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <LogIn className="size-4" />
              )}
              <span>{loading ? "Signing In..." : "Sign In"}</span>
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-cru-muted">
            Already part of Cru VSU without an account?{" "}
            <Link
              href="/auth/register"
              className="font-semibold text-cru-charcoal underline decoration-cru-gold underline-offset-4 hover:text-cru-gold-hover"
            >
              Create Member Account
            </Link>
          </p>
        </div>
      </DraftingContainer>
    </main>
  );
}
