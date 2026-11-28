"use client";

import { useState, useTransition } from "react";
import { UserPlus, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { DiscipleshipExplorer } from "@/components/graph/DiscipleshipExplorer";
import { addDiscipleToMyTree } from "@/app/actions/portal";
import type { DiscipleshipGraphData } from "@/types/database";

interface DisciplerWebWorkspaceProps {
  subtreeData: DiscipleshipGraphData;
  disciplerName: string;
}

/**
 * Discipler's personal Family Tree Web workspace: visualizes their downline
 * branch and allows adding new disciples directly into the unified tree.
 */
export function DisciplerWebWorkspace({
  subtreeData,
  disciplerName,
}: DisciplerWebWorkspaceProps) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<{
    type: "idle" | "success" | "error";
    message?: string;
  }>({ type: "idle" });

  const handleAddDisciple = (formData: FormData) => {
    setStatus({ type: "idle" });
    startTransition(async () => {
      const res = await addDiscipleToMyTree(formData);
      setStatus({
        type: res.success ? "success" : "error",
        message: res.message,
      });
    });
  };

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      {/* Left 2 Columns: Personal Family Tree Graph */}
      <div className="lg:col-span-2">
        <DiscipleshipExplorer data={subtreeData} compact fullScreenHref="/tree" />
      </div>

      {/* Right Column: Add Disciple to My Tree Form */}
      <div className="rounded-[24px] border border-neutral-900/[0.07] bg-cru-surface p-7 dark:border-white/10 dark:bg-cru-night-surface">
        <div className="mb-4 flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-full bg-cru-gold text-cru-charcoal">
            <UserPlus className="size-4" />
          </span>
          <div>
            <h2 className="text-base font-semibold text-cru-charcoal dark:text-cru-ink">
              Add a Disciple
            </h2>
            <p className="text-[11px] text-cru-muted dark:text-cru-ink-muted">
              Connects directly under {disciplerName}
            </p>
          </div>
        </div>

        {status.type === "success" && status.message && (
          <div className="mb-4 flex items-start gap-2 rounded-2xl border border-cru-gold/50 bg-cru-gold-soft/70 px-3.5 py-3 text-xs text-cru-charcoal dark:bg-cru-gold/15 dark:text-cru-ink">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-cru-gold-hover dark:text-cru-gold" />
            <span>{status.message}</span>
          </div>
        )}

        {status.type === "error" && status.message && (
          <div className="mb-4 flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-3.5 py-3 text-xs text-red-700 dark:border-red-400/30 dark:bg-red-500/10 dark:text-red-300">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>{status.message}</span>
          </div>
        )}

        <form action={handleAddDisciple} className="space-y-4">
          <div>
            <label
              htmlFor="disciple-name"
              className="mb-1 block text-xs font-medium text-cru-charcoal dark:text-cru-ink"
            >
              Disciple Full Name <span className="text-cru-gold-hover dark:text-cru-gold">*</span>
            </label>
            <input
              id="disciple-name"
              name="fullName"
              type="text"
              required
              placeholder="e.g., Caleb Bautista"
              className="h-10 w-full rounded-xl border border-neutral-900/10 bg-white px-3.5 text-sm text-cru-charcoal focus:border-cru-gold focus:outline-none dark:border-white/10 dark:bg-cru-night dark:text-cru-ink"
            />
          </div>

          <div>
            <label
              htmlFor="disciple-program"
              className="mb-1 block text-xs font-medium text-cru-charcoal dark:text-cru-ink"
            >
              College / Program &amp; Year
            </label>
            <input
              id="disciple-program"
              name="collegeProgram"
              type="text"
              placeholder="e.g., BS Forestry, 1st Year"
              className="h-10 w-full rounded-xl border border-neutral-900/10 bg-white px-3.5 text-sm text-cru-charcoal focus:border-cru-gold focus:outline-none dark:border-white/10 dark:bg-cru-night dark:text-cru-ink"
            />
          </div>

          <div>
            <label
              htmlFor="disciple-verse"
              className="mb-1 block text-xs font-medium text-cru-charcoal dark:text-cru-ink"
            >
              Favorite Verse
            </label>
            <input
              id="disciple-verse"
              name="favoriteVerse"
              type="text"
              placeholder="e.g., Philippians 4:13"
              className="h-10 w-full rounded-xl border border-neutral-900/10 bg-white px-3.5 text-sm text-cru-charcoal focus:border-cru-gold focus:outline-none dark:border-white/10 dark:bg-cru-night dark:text-cru-ink"
            />
          </div>

          <div>
            <label
              htmlFor="disciple-testimony"
              className="mb-1 block text-xs font-medium text-cru-charcoal dark:text-cru-ink"
            >
              Discipleship Note / Testimony
            </label>
            <textarea
              id="disciple-testimony"
              name="testimony"
              rows={3}
              placeholder="How you met or what you're studying together..."
              className="w-full rounded-xl border border-neutral-900/10 bg-white p-3 text-sm text-cru-charcoal focus:border-cru-gold focus:outline-none dark:border-white/10 dark:bg-cru-night dark:text-cru-ink"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-cru-gold text-xs font-semibold text-cru-charcoal shadow-xs transition-colors hover:bg-cru-gold-hover disabled:opacity-60"
          >
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <UserPlus className="size-4" />
            )}
            <span>{isPending ? "Adding..." : "Add to Family Tree"}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
