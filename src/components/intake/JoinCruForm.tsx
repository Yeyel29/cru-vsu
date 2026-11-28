"use client";

import { useEffect, useState, useTransition } from "react";
import { UserPlus, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { submitJoinInquiry } from "@/app/actions/join";

const QUICK_INTERESTS = [
  "Join an Action Group (Bible Study)",
  "Connect with a Discipler",
  "Explore Faith in Jesus Christ",
  "Serve in Campus Outreach",
];

/**
 * Student intake form allowing VSU students to ask to join Cru,
 * routed directly to the admin triage queue in Supabase.
 */
export function JoinCruForm() {
  const [isPending, startTransition] = useTransition();
  const [interest, setInterest] = useState("");
  const [status, setStatus] = useState<{
    type: "idle" | "success" | "error";
    message?: string;
  }>({ type: "idle" });

  useEffect(() => {
    const handlePrefill = (e: Event) => {
      const custom = e as CustomEvent<string>;
      if (custom.detail) {
        setInterest(custom.detail);
        setStatus({ type: "idle" });
      }
    };
    window.addEventListener("cru:prefill-interest", handlePrefill);
    return () =>
      window.removeEventListener("cru:prefill-interest", handlePrefill);
  }, []);

  const handleSubmit = (formData: FormData) => {
    setStatus({ type: "idle" });
    startTransition(async () => {
      const result = await submitJoinInquiry(formData);
      if (result.success) {
        setStatus({ type: "success", message: result.message });
      } else {
        setStatus({ type: "error", message: result.message });
      }
    });
  };

  if (status.type === "success") {
    return (
      <div className="rounded-[24px] border border-cru-gold/50 bg-cru-gold-soft/50 p-8 dark:bg-cru-gold/10 text-center md:p-10">
        <div className="mx-auto grid size-14 place-items-center rounded-full bg-cru-gold text-cru-charcoal shadow-xs">
          <CheckCircle2 className="size-7" />
        </div>
        <h3 className="mt-4 text-xl font-semibold text-cru-charcoal dark:text-cru-ink">
          Request Received!
        </h3>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-cru-charcoal/80 dark:text-cru-ink/80">
          {status.message}
        </p>
        <button
          type="button"
          onClick={() => {
            setInterest("");
            setStatus({ type: "idle" });
          }}
          className="mt-6 inline-flex h-10 items-center rounded-full border border-neutral-900/10 bg-white px-5 text-xs font-semibold text-cru-charcoal transition-colors hover:border-cru-gold dark:border-white/10 dark:bg-white/10 dark:text-cru-ink"
        >
          Submit Another Request
        </button>
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="space-y-5">
      {status.type === "error" && status.message && (
        <div className="flex items-center gap-2.5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700 dark:border-red-400/30 dark:bg-red-500/10 dark:text-red-300">
          <AlertCircle className="size-4 shrink-0" />
          <span>{status.message}</span>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="join-fullName"
            className="mb-1.5 block text-xs font-medium text-cru-charcoal dark:text-cru-ink"
          >
            Full Name <span className="text-cru-gold-hover dark:text-cru-gold">*</span>
          </label>
          <input
            id="join-fullName"
            name="fullName"
            type="text"
            required
            placeholder="Your full name"
            className="h-11 w-full rounded-2xl border border-neutral-900/[0.09] bg-white px-4 text-sm text-cru-charcoal placeholder:text-cru-muted/60 focus:border-cru-gold focus:outline-none dark:border-white/10 dark:bg-cru-night dark:text-cru-ink dark:placeholder:text-cru-ink-muted/70"
          />
        </div>

        <div>
          <label
            htmlFor="join-email"
            className="mb-1.5 block text-xs font-medium text-cru-charcoal dark:text-cru-ink"
          >
            Email Address <span className="text-cru-gold-hover dark:text-cru-gold">*</span>
          </label>
          <input
            id="join-email"
            name="email"
            type="email"
            required
            placeholder="you@vsu.edu.ph"
            className="h-11 w-full rounded-2xl border border-neutral-900/[0.09] bg-white px-4 text-sm text-cru-charcoal placeholder:text-cru-muted/60 focus:border-cru-gold focus:outline-none dark:border-white/10 dark:bg-cru-night dark:text-cru-ink dark:placeholder:text-cru-ink-muted/70"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="join-collegeCourseYear"
            className="mb-1.5 block text-xs font-medium text-cru-charcoal dark:text-cru-ink"
          >
            College / Degree Program &amp; Year
          </label>
          <input
            id="join-collegeCourseYear"
            name="collegeCourseYear"
            type="text"
            placeholder="e.g., BS Agriculture, 2nd Year"
            className="h-11 w-full rounded-2xl border border-neutral-900/[0.09] bg-white px-4 text-sm text-cru-charcoal placeholder:text-cru-muted/60 focus:border-cru-gold focus:outline-none dark:border-white/10 dark:bg-cru-night dark:text-cru-ink dark:placeholder:text-cru-ink-muted/70"
          />
        </div>

        <div>
          <label
            htmlFor="join-phone"
            className="mb-1.5 block text-xs font-medium text-cru-charcoal dark:text-cru-ink"
          >
            Phone / Messenger Link{" "}
            <span className="font-normal text-cru-muted dark:text-cru-ink-muted">(Optional)</span>
          </label>
          <input
            id="join-phone"
            name="phone"
            type="text"
            placeholder="Mobile number or Messenger link"
            className="h-11 w-full rounded-2xl border border-neutral-900/[0.09] bg-white px-4 text-sm text-cru-charcoal placeholder:text-cru-muted/60 focus:border-cru-gold focus:outline-none dark:border-white/10 dark:bg-cru-night dark:text-cru-ink dark:placeholder:text-cru-ink-muted/70"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="join-spiritualInterest"
          className="mb-1.5 block text-xs font-medium text-cru-charcoal dark:text-cru-ink"
        >
          How can we walk alongside you?
        </label>

        {/* Quick-select interest chips */}
        <div className="mb-2.5 flex flex-wrap gap-1.5">
          {QUICK_INTERESTS.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => setInterest(chip)}
              className="rounded-full border border-neutral-900/[0.08] bg-white px-3 py-1 text-[11px] text-cru-muted transition-colors hover:border-cru-gold hover:text-cru-charcoal dark:border-white/10 dark:bg-white/10 dark:text-cru-ink-muted dark:hover:text-cru-ink"
            >
              + {chip}
            </button>
          ))}
        </div>

        <textarea
          id="join-spiritualInterest"
          name="spiritualInterest"
          rows={3}
          value={interest}
          onChange={(e) => setInterest(e.target.value)}
          placeholder="Share how we can pray for you or help you get connected (Action Group, mentorship, or questions about faith)..."
          className="w-full rounded-2xl border border-neutral-900/[0.09] bg-white p-4 text-sm text-cru-charcoal placeholder:text-cru-muted/60 focus:border-cru-gold focus:outline-none dark:border-white/10 dark:bg-cru-night dark:text-cru-ink dark:placeholder:text-cru-ink-muted/70"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex h-12 items-center gap-3 rounded-full bg-cru-gold p-1.5 pr-6 text-sm font-semibold text-cru-charcoal shadow-sm transition-colors hover:bg-cru-gold-hover disabled:opacity-60"
      >
        <span className="grid size-9 place-items-center rounded-full bg-white text-cru-charcoal">
          {isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <UserPlus className="size-4" />
          )}
        </span>
        <span>{isPending ? "Sending Request..." : "Connect with Cru VSU"}</span>
      </button>
    </form>
  );
}
