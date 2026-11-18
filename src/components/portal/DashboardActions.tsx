"use client";

import { useState, useTransition } from "react";
import {
  HeartHandshake,
  Sparkles,
  CheckCircle2,
  Clock,
  Loader2,
  Edit3,
} from "lucide-react";
import {
  applyAsDiscipler,
  requestDiscipler,
  updateMyProfile,
} from "@/app/actions/portal";
import type {
  DisciplerApplication,
  MentorshipRequest,
  Profile,
} from "@/types/database";

interface DashboardActionsProps {
  profile: Profile;
  pendingMentorship: MentorshipRequest | null;
  pendingApplication: DisciplerApplication | null;
}

/**
 * Interactive member portal cards: profile editor, Request a Discipler,
 * and Apply to Become a Discipler.
 */
export function DashboardActions({
  profile,
  pendingMentorship,
  pendingApplication,
}: DashboardActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [editingProfile, setEditingProfile] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleProfileSave = (formData: FormData) => {
    setFeedback(null);
    startTransition(async () => {
      const res = await updateMyProfile(formData);
      setFeedback(res.message);
      if (res.success) setEditingProfile(false);
    });
  };

  const handleMentorshipRequest = (formData: FormData) => {
    setFeedback(null);
    startTransition(async () => {
      const res = await requestDiscipler(formData);
      setFeedback(res.message);
    });
  };

  const handleDisciplerApply = (formData: FormData) => {
    setFeedback(null);
    startTransition(async () => {
      const res = await applyAsDiscipler(formData);
      setFeedback(res.message);
    });
  };

  return (
    <div className="space-y-6">
      {feedback && (
        <div className="flex items-center gap-2.5 rounded-2xl border border-cru-gold/50 bg-cru-gold-soft/70 px-4 py-3 text-xs font-medium text-cru-charcoal">
          <CheckCircle2 className="size-4 shrink-0 text-cru-gold-hover" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Profile Editor Card */}
      <div className="rounded-[24px] border border-neutral-900/[0.07] bg-cru-surface p-7">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-cru-charcoal">
              My Faith &amp; Campus Profile
            </h2>
            <p className="mt-1 text-xs text-cru-muted">
              Displayed when anyone clicks your node on the Cru-VSU Family Tree.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setEditingProfile((prev) => !prev)}
            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-neutral-900/[0.08] bg-white px-4 text-xs font-medium text-cru-charcoal transition-colors hover:border-cru-gold"
          >
            <Edit3 className="size-3.5" />
            <span>{editingProfile ? "Cancel" : "Edit Profile"}</span>
          </button>
        </div>

        {editingProfile ? (
          <form action={handleProfileSave} className="mt-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-cru-charcoal">
                  Full Name
                </label>
                <input
                  name="fullName"
                  defaultValue={profile.full_name}
                  required
                  className="h-10 w-full rounded-xl border border-neutral-900/10 bg-white px-3.5 text-sm focus:border-cru-gold focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-cru-charcoal">
                  College / Program &amp; Year
                </label>
                <input
                  name="collegeProgram"
                  defaultValue={profile.college_program ?? ""}
                  placeholder="e.g., BS Agriculture, 2nd Year"
                  className="h-10 w-full rounded-xl border border-neutral-900/10 bg-white px-3.5 text-sm focus:border-cru-gold focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-cru-charcoal">
                Favorite Bible Verse
              </label>
              <input
                name="favoriteVerse"
                defaultValue={profile.favorite_verse ?? ""}
                placeholder="e.g., 2 Timothy 2:2"
                className="h-10 w-full rounded-xl border border-neutral-900/10 bg-white px-3.5 text-sm focus:border-cru-gold focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-cru-charcoal">
                Testimony / Faith Story
              </label>
              <textarea
                name="testimony"
                rows={3}
                defaultValue={profile.testimony ?? ""}
                placeholder="Share a brief testimony or what God is teaching you..."
                className="w-full rounded-xl border border-neutral-900/10 bg-white p-3.5 text-sm focus:border-cru-gold focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="inline-flex h-10 items-center gap-2 rounded-full bg-cru-gold px-5 text-xs font-semibold text-cru-charcoal hover:bg-cru-gold-hover disabled:opacity-60"
            >
              {isPending && <Loader2 className="size-3.5 animate-spin" />}
              <span>Save Changes</span>
            </button>
          </form>
        ) : (
          <div className="mt-5 grid gap-4 border-t border-neutral-900/[0.06] pt-5 sm:grid-cols-2">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-cru-muted">
                College Program
              </div>
              <div className="mt-1 text-sm font-medium text-cru-charcoal">
                {profile.college_program || "Not set yet"}
              </div>
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-cru-muted">
                Life Verse
              </div>
              <div className="mt-1 text-sm font-medium text-cru-charcoal">
                {profile.favorite_verse || "Not set yet"}
              </div>
            </div>
            <div className="sm:col-span-2">
              <div className="font-mono text-[10px] uppercase tracking-wider text-cru-muted">
                Testimony
              </div>
              <div className="mt-1 text-sm text-cru-charcoal/85">
                {profile.testimony ||
                  "Click Edit Profile to share your story with the Cru VSU family."}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Row: Request a Discipler & Apply as Discipler */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Card 1: Ask for a Discipler (when not yet paired) */}
        {!profile.discipler_id && (
          <div className="rounded-[24px] border border-neutral-900/[0.07] bg-cru-surface p-7">
            <div className="mb-3 grid size-10 place-items-center rounded-full bg-cru-gold-soft text-cru-gold-hover">
              <HeartHandshake className="size-5" />
            </div>
            <h3 className="text-lg font-semibold text-cru-charcoal">
              Request a Discipler
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-cru-muted">
              New to Cru or don&apos;t have a spiritual mom/dad yet? Request to
              be paired with an active discipler on campus.
            </p>

            {pendingMentorship ? (
              <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-cru-gold/40 bg-white px-4 py-2 text-xs font-medium text-amber-800">
                <Clock className="size-3.5 text-cru-gold-hover" />
                <span>Mentorship Request Pending Review</span>
              </div>
            ) : (
              <form action={handleMentorshipRequest} className="mt-4 space-y-3">
                <textarea
                  name="preferredNotes"
                  rows={2}
                  placeholder="Optional: preferred schedule, dorm, or college..."
                  className="w-full rounded-xl border border-neutral-900/10 bg-white p-3 text-xs focus:border-cru-gold focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex h-10 items-center gap-2 rounded-full bg-cru-gold px-5 text-xs font-semibold text-cru-charcoal hover:bg-cru-gold-hover disabled:opacity-60"
                >
                  {isPending && <Loader2 className="size-3.5 animate-spin" />}
                  <span>Ask for a Discipler</span>
                </button>
              </form>
            )}
          </div>
        )}

        {/* Card 2: Become a Discipler (for disciples ready to multiply) */}
        {(profile.role === "disciple" || profile.role === "seeker") && (
          <div className="rounded-[24px] border border-neutral-900/[0.07] bg-cru-surface p-7">
            <div className="mb-3 grid size-10 place-items-center rounded-full bg-cru-gold-soft text-cru-gold-hover">
              <Sparkles className="size-5" />
            </div>
            <h3 className="text-lg font-semibold text-cru-charcoal">
              Become a Discipler
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-cru-muted">
              Ready to step up as a spiritual mom or dad and build your own
              discipleship family tree? Submit a request for leadership
              confirmation.
            </p>

            {pendingApplication ? (
              <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-cru-gold/40 bg-white px-4 py-2 text-xs font-medium text-amber-800">
                <Clock className="size-3.5 text-cru-gold-hover" />
                <span>Discipler Confirmation Pending</span>
              </div>
            ) : (
              <form action={handleDisciplerApply} className="mt-4 space-y-3">
                <textarea
                  name="notes"
                  rows={2}
                  placeholder="Share why you feel ready to disciple others..."
                  className="w-full rounded-xl border border-neutral-900/10 bg-white p-3 text-xs focus:border-cru-gold focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex h-10 items-center gap-2 rounded-full border border-neutral-900/10 bg-white px-5 text-xs font-semibold text-cru-charcoal transition-colors hover:border-cru-gold hover:bg-cru-gold-soft disabled:opacity-60"
                >
                  {isPending && <Loader2 className="size-3.5 animate-spin" />}
                  <span>Apply to Become a Discipler</span>
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
