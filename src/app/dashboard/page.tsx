import Link from "next/link";
import { redirect } from "next/navigation";
import { GitBranch, LogOut, ShieldCheck, ArrowRight, UserCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { DraftingContainer, DraftingDivider } from "@/components/layout/DraftingGrid";
import { DashboardActions } from "@/components/portal/DashboardActions";
import { signOutAction } from "@/app/actions/portal";
import type {
  DisciplerApplication,
  MentorshipRequest,
  Profile,
} from "@/types/database";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  if (!supabase) {
    redirect("/auth/login");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch or auto-provision profile for newly confirmed auth users
  let { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("auth_user_id", user.id)
    .single();

  if (!profile) {
    const meta = user.user_metadata ?? {};
    const { data: created } = await supabase
      .from("profiles")
      .insert({
        auth_user_id: user.id,
        full_name: meta.full_name || user.email?.split("@")[0] || "Cru Member",
        college_program: meta.college_program || null,
        role: "disciple",
        generation_depth: 1,
      })
      .select("*")
      .single();
    profile = created;
  }

  if (!profile) {
    return (
      <main className="min-h-screen bg-white pt-36 pb-20">
        <DraftingContainer className="px-6 py-12">
          <p className="text-sm text-cru-muted">
            Could not load member profile. Please try signing in again.
          </p>
        </DraftingContainer>
      </main>
    );
  }

  const typedProfile = profile as Profile;

  const [disciplerRes, mentorshipRes, applicationRes] = await Promise.all([
    typedProfile.discipler_id
      ? supabase
          .from("profiles")
          .select("id, full_name, college_program")
          .eq("id", typedProfile.discipler_id)
          .single()
      : Promise.resolve({ data: null }),
    supabase
      .from("mentorship_requests")
      .select("*")
      .eq("requester_id", typedProfile.id)
      .eq("status", "pending")
      .maybeSingle(),
    supabase
      .from("discipler_applications")
      .select("*")
      .eq("applicant_id", typedProfile.id)
      .eq("status", "pending")
      .maybeSingle(),
  ]);

  const discipler = disciplerRes.data;
  const pendingMentorship =
    (mentorshipRes.data as MentorshipRequest | null) ?? null;
  const pendingApplication =
    (applicationRes.data as DisciplerApplication | null) ?? null;

  const isDisciplerOrAdmin =
    typedProfile.role === "discipler" || typedProfile.role === "admin";

  return (
    <main className="min-h-screen bg-white pt-32 pb-20">
      <DraftingContainer className="px-6 py-10 md:px-12">
        {/* Top Member Header */}
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-neutral-900/[0.08] bg-cru-surface px-3.5 py-1 font-mono text-[11px] uppercase tracking-wider text-cru-charcoal">
              <span className="size-2 rounded-full bg-cru-gold" />
              Role: {typedProfile.role} · Gen {typedProfile.generation_depth}
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-cru-charcoal">
              Welcome, {typedProfile.full_name}
            </h1>
            <p className="mt-1 text-sm text-cru-muted">
              {user.email}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {isDisciplerOrAdmin && (
              <Link
                href="/dashboard/my-tree"
                className="inline-flex h-11 items-center gap-2.5 rounded-full bg-cru-gold p-1.5 pr-5 text-xs font-semibold text-cru-charcoal shadow-xs transition-colors hover:bg-cru-gold-hover"
              >
                <span className="grid size-8 place-items-center rounded-full bg-white text-cru-charcoal">
                  <GitBranch className="size-4" />
                </span>
                <span>My Family Tree Web</span>
              </Link>
            )}

            {typedProfile.role === "admin" && (
              <Link
                href="/admin"
                className="inline-flex h-11 items-center gap-2 rounded-full border border-neutral-900/10 bg-cru-surface px-4 text-xs font-semibold text-cru-charcoal transition-colors hover:border-cru-gold"
              >
                <ShieldCheck className="size-4 text-cru-gold-hover" />
                <span>Admin Console</span>
              </Link>
            )}

            <form action={signOutAction}>
              <button
                type="submit"
                className="inline-flex h-11 items-center gap-2 rounded-full border border-neutral-900/10 bg-white px-4 text-xs font-medium text-cru-muted transition-colors hover:text-cru-charcoal"
              >
                <LogOut className="size-3.5" />
                <span>Sign Out</span>
              </button>
            </form>
          </div>
        </div>

        {/* Spiritual Parent Banner */}
        {discipler && (
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-[20px] border border-cru-gold/40 bg-cru-gold-soft/50 px-6 py-4">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-full bg-cru-gold text-cru-charcoal">
                <UserCheck className="size-5" />
              </span>
              <div>
                <div className="font-mono text-[10px] uppercase tracking-wider text-amber-800">
                  Your Spiritual Parent (Mom / Dad)
                </div>
                <div className="text-sm font-semibold text-cru-charcoal">
                  {discipler.full_name}
                  {discipler.college_program && (
                    <span className="ml-2 font-normal text-cru-muted">
                      · {discipler.college_program}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <Link
              href="/tree"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-cru-charcoal hover:text-cru-gold-hover"
            >
              <span>View in Main Tree</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        )}

        <DraftingDivider className="my-10" />

        <DashboardActions
          profile={typedProfile}
          pendingMentorship={pendingMentorship}
          pendingApplication={pendingApplication}
        />
      </DraftingContainer>
    </main>
  );
}
