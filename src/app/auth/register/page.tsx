"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { UserPlus, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { DraftingContainer } from "@/components/layout/DraftingGrid";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [collegeProgram, setCollegeProgram] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsEmailConfirm, setNeedsEmailConfirm] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    if (!supabase) {
      setError("Supabase is not configured.");
      setLoading(false);
      return;
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
          college_program: collegeProgram.trim(),
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (data.user && data.session) {
      // Create their public.profiles row right away
      await supabase.from("profiles").insert({
        auth_user_id: data.user.id,
        full_name: fullName.trim(),
        college_program: collegeProgram.trim() || null,
        role: "disciple",
        generation_depth: 1,
      });

      router.push("/dashboard");
      router.refresh();
      return;
    }

    setNeedsEmailConfirm(true);
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-white pt-32 pb-20">
      <DraftingContainer className="flex min-h-[70vh] items-center justify-center px-6 py-12">
        <div className="w-full max-w-md rounded-[28px] border border-neutral-900/[0.08] bg-cru-surface p-8 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.06)]">
          <div className="mb-6">
            <div className="mb-2 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-cru-gold-hover">
              <span className="size-2 rounded-full bg-cru-gold" />
              Cru-VSU · Member Registration
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-cru-charcoal">
              Join the Member Portal
            </h1>
            <p className="mt-1.5 text-sm text-cru-muted">
              Create your account to request a discipler, apply as a discipler,
              or build your spiritual family tree.
            </p>
          </div>

          {needsEmailConfirm ? (
            <div className="rounded-2xl border border-cru-gold/50 bg-cru-gold-soft/60 p-6 text-center">
              <CheckCircle2 className="mx-auto size-8 text-cru-gold-hover" />
              <h2 className="mt-3 text-base font-semibold text-cru-charcoal">
                Check Your Email
              </h2>
              <p className="mt-1.5 text-xs leading-relaxed text-cru-charcoal/80">
                We sent a confirmation link to <strong>{email}</strong>. Once
                confirmed, sign in to enter your Member Dashboard.
              </p>
              <Link
                href="/auth/login"
                className="mt-5 inline-flex h-10 items-center rounded-full bg-cru-gold px-5 text-xs font-semibold text-cru-charcoal"
              >
                Go to Sign In
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-5 flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label
                    htmlFor="reg-name"
                    className="mb-1.5 block text-xs font-medium text-cru-charcoal"
                  >
                    Full Name
                  </label>
                  <input
                    id="reg-name"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g., Maria Santos"
                    className="h-11 w-full rounded-2xl border border-neutral-900/[0.09] bg-white px-4 text-sm text-cru-charcoal focus:border-cru-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="reg-program"
                    className="mb-1.5 block text-xs font-medium text-cru-charcoal"
                  >
                    College / Degree Program &amp; Year
                  </label>
                  <input
                    id="reg-program"
                    type="text"
                    value={collegeProgram}
                    onChange={(e) => setCollegeProgram(e.target.value)}
                    placeholder="e.g., BS Computer Science, 2nd Year"
                    className="h-11 w-full rounded-2xl border border-neutral-900/[0.09] bg-white px-4 text-sm text-cru-charcoal focus:border-cru-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="reg-email"
                    className="mb-1.5 block text-xs font-medium text-cru-charcoal"
                  >
                    Email Address
                  </label>
                  <input
                    id="reg-email"
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
                    htmlFor="reg-password"
                    className="mb-1.5 block text-xs font-medium text-cru-charcoal"
                  >
                    Password (min 6 characters)
                  </label>
                  <input
                    id="reg-password"
                    type="password"
                    required
                    minLength={6}
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
                    <UserPlus className="size-4" />
                  )}
                  <span>
                    {loading ? "Creating Account..." : "Create Member Account"}
                  </span>
                </button>
              </form>

              <p className="mt-6 text-center text-xs text-cru-muted">
                Already have an account?{" "}
                <Link
                  href="/auth/login"
                  className="font-semibold text-cru-charcoal underline decoration-cru-gold underline-offset-4 hover:text-cru-gold-hover"
                >
                  Sign In
                </Link>
              </p>
            </>
          )}
        </div>
      </DraftingContainer>
    </main>
  );
}
