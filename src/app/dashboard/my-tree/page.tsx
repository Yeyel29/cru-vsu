import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, GitBranch } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { extractPersonalSubtree } from "@/lib/graph/transform";
import { DraftingContainer } from "@/components/layout/DraftingGrid";
import { DisciplerWebWorkspace } from "@/components/portal/DisciplerWebWorkspace";
import type { Profile } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function MyTreePage() {
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

  if (!currentProfile) redirect("/dashboard");

  const typedProfile = currentProfile as Profile;
  if (typedProfile.role !== "discipler" && typedProfile.role !== "admin") {
    redirect("/dashboard");
  }

  const { data: allProfiles } = await supabase
    .from("profiles")
    .select("*")
    .order("generation_depth", { ascending: true });

  const subtreeData = extractPersonalSubtree(
    typedProfile.id,
    (allProfiles as Profile[]) ?? [typedProfile]
  );

  const downlineCount = Math.max(0, subtreeData.nodes.length - 1);

  return (
    <main className="min-h-screen bg-white pt-32 pb-20">
      <DraftingContainer className="px-6 py-8 md:px-10">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <Link
              href="/dashboard"
              className="mb-3 inline-flex items-center gap-1.5 text-xs font-medium text-cru-muted transition-colors hover:text-cru-charcoal"
            >
              <ArrowLeft className="size-3.5" />
              <span>Back to Member Dashboard</span>
            </Link>
            <h1 className="text-2xl font-semibold tracking-tight text-cru-charcoal md:text-3xl">
              My Spiritual Family Tree Web
            </h1>
            <p className="mt-1 text-sm text-cru-muted">
              Manage your personal discipleship branch—every disciple added here
              syncs directly into the main Cru-VSU tree rooted in Jesus.
            </p>
          </div>

          <div className="inline-flex items-center gap-2.5 rounded-full border border-neutral-900/[0.08] bg-cru-surface px-4 py-2 font-mono text-xs text-cru-charcoal">
            <GitBranch className="size-3.5 text-cru-gold-hover" />
            <span>{downlineCount} disciples in your downline</span>
          </div>
        </div>

        <DisciplerWebWorkspace
          subtreeData={subtreeData}
          disciplerName={typedProfile.full_name}
        />
      </DraftingContainer>
    </main>
  );
}
