import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { DraftingContainer, DraftingDivider } from "@/components/layout/DraftingGrid";
import {
  AdminConsoleClient,
  type EnrichedApplication,
  type EnrichedMentorship,
} from "@/components/admin/AdminConsoleClient";
import type {
  DisciplerApplication,
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

  const [appsRes, mentorRes, inqRes, projRes, profilesRes] = await Promise.all([
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

  return (
    <main className="min-h-screen bg-white pt-32 pb-20">
      <DraftingContainer className="px-6 py-10 md:px-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Link
              href="/dashboard"
              className="mb-3 inline-flex items-center gap-1.5 text-xs font-medium text-cru-muted transition-colors hover:text-cru-charcoal"
            >
              <ArrowLeft className="size-3.5" />
              <span>Back to Member Dashboard</span>
            </Link>
            <div className="flex items-center gap-2.5">
              <span className="grid size-9 place-items-center rounded-full bg-cru-gold text-cru-charcoal">
                <ShieldCheck className="size-4" />
              </span>
              <h1 className="text-2xl font-semibold tracking-tight text-cru-charcoal md:text-3xl">
                Campus Leadership &amp; Admin Console
              </h1>
            </div>
            <p className="mt-2 text-sm text-cru-muted">
              Confirm new disciplers, pair students with spiritual moms &amp;
              dads, triage incoming inquiries, and publish ministry projects.
            </p>
          </div>
        </div>

        <DraftingDivider className="my-8" />

        <AdminConsoleClient
          applications={applications}
          mentorships={mentorships}
          inquiries={(inqRes.data as JoinInquiry[]) ?? []}
          projects={(projRes.data as MinistryProject[]) ?? []}
          disciplers={disciplers}
        />
      </DraftingContainer>
    </main>
  );
}
