import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { DraftingContainer, DraftingDivider } from "@/components/layout/DraftingGrid";
import {
  AdminConsoleClient,
  type EnrichedApplication,
  type EnrichedDonation,
  type EnrichedMentorship,
} from "@/components/admin/AdminConsoleClient";
import type {
  DisciplerApplication,
  Donation,
  GivingChannel,
  JoinInquiry,
  MentorshipRequest,
  MinistryProject,
  Profile,
} from "@/types/database";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const supabase = await createClient();
  if (!supabase) redirect("/auth/login");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: currentProfile } = await supabase
    .from("profiles")
    .select("*")
    .eq("auth_user_id", user.id)
    .single();

  if (!currentProfile || currentProfile.role !== "admin") {
    redirect("/dashboard");
  }

  const [appsRes, mentorRes, inqRes, projRes, profilesRes, donationsRes, channelsRes] =
    await Promise.all([
      supabase
        .from("discipler_applications")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from("mentorship_requests")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from("join_inquiries")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from("ministry_projects")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from("profiles")
        .select("*")
        .order("generation_depth", { ascending: true }),
      supabase
        .from("donations")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from("giving_channels")
        .select("*")
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: true }),
    ]);

  const allProfiles = (profilesRes.data as Profile[]) ?? [];
  const profileMap = new Map(allProfiles.map((p) => [p.id, p]));

  const applications: EnrichedApplication[] = (
    (appsRes.data as DisciplerApplication[]) ?? []
  ).map((app) => {
    const p = profileMap.get(app.applicant_id);
    return {
      ...app,
      applicantName: p?.full_name ?? "Unknown Member",
      applicantProgram: p?.college_program ?? null,
    };
  });

  const mentorships: EnrichedMentorship[] = (
    (mentorRes.data as MentorshipRequest[]) ?? []
  ).map((req) => {
    const p = profileMap.get(req.requester_id);
    return {
      ...req,
      requesterName: p?.full_name ?? "Unknown Member",
      requesterProgram: p?.college_program ?? null,
    };
  });

  const disciplers = allProfiles.filter(
    (p) => p.role === "discipler" || p.role === "admin"
  );

  const donations: EnrichedDonation[] = (
    (donationsRes.data as Donation[]) ?? []
  ).map((d) => {
    const recipientProfile = d.recipient_profile_id
      ? profileMap.get(d.recipient_profile_id)
      : null;
    const recipientName =
      d.designation_type === "general_fund"
        ? "General Ministry Fund"
        : recipientProfile?.full_name ??
          d.recipient_custom_name ??
          "Specific Member";
    return {
      ...d,
      recipientName,
    };
  });

  const givingChannels = (channelsRes.data as GivingChannel[]) ?? [];

  return (
    <main className="min-h-screen bg-white pt-32 pb-20 dark:bg-cru-night">
      <DraftingContainer className="px-6 py-8 md:px-12">
        <div className="max-w-2xl">
          <Link
            href="/dashboard"
            className="mb-3 inline-flex min-h-[44px] items-center gap-1.5 rounded-lg pr-2 text-xs font-medium text-cru-muted transition-colors hover:text-cru-charcoal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cru-gold dark:text-cru-ink-muted dark:hover:text-cru-ink"
          >
            <ArrowLeft aria-hidden="true" className="size-3.5" />
            <span>Back to Member Dashboard</span>
          </Link>
          <div className="font-mono text-[11px] uppercase tracking-widest text-cru-gold-text dark:text-cru-gold">
            Cru-VSU · Admin Console
          </div>
          <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-cru-charcoal dark:text-cru-ink md:text-3xl">
            Campus Leadership &amp; Stewardship
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-cru-muted dark:text-cru-ink-muted">
            Review discipler applications, pair students with spiritual parents,
            triage join inquiries, and verify Cru Eastern Visayas gifts.
          </p>
        </div>

        <DraftingDivider className="my-8" />

        <AdminConsoleClient
          applications={applications}
          mentorships={mentorships}
          inquiries={(inqRes.data as JoinInquiry[]) ?? []}
          projects={(projRes.data as MinistryProject[]) ?? []}
          disciplers={disciplers}
          donations={donations}
          givingChannels={givingChannels}
        />
      </DraftingContainer>
    </main>
  );
}
