import Link from "next/link";
import { GitBranch, Sparkles, ArrowRight } from "lucide-react";
import {
  DraftingContainer,
  DraftingDivider,
} from "@/components/layout/DraftingGrid";
import {
  LeftProgressRail,
  type RailSection,
} from "@/components/layout/LeftProgressRail";
import { DiscipleshipExplorer } from "@/components/graph/DiscipleshipExplorer";
import { MinistryProjectsShowcase } from "@/components/projects/MinistryProjectsShowcase";
import { JoinCruForm } from "@/components/intake/JoinCruForm";
import { fetchDiscipleshipGraphData } from "@/lib/graph/queries";
import { fetchActiveProjects } from "@/lib/projects/queries";

export const dynamic = "force-dynamic";

const HOME_SECTIONS: RailSection[] = [
  { id: "overview", label: "Overview" },
  { id: "discipleship-tree", label: "Discipleship Tree" },
  { id: "projects", label: "Ministry Projects" },
  { id: "join-cru", label: "Join Cru" },
];

export default async function HomePage() {
  const [graphData, projects] = await Promise.all([
    fetchDiscipleshipGraphData(),
    fetchActiveProjects(),
  ]);

  const totalMembers = Math.max(0, graphData.nodes.length - 1);
  const maxGeneration = Math.max(
    1,
    ...graphData.nodes.map((n) => n.generationDepth)
  );

  return (
    <main className="min-h-screen bg-white">
      <LeftProgressRail sections={HOME_SECTIONS} />

      <DraftingContainer>
        {/* Section 1: Hero / Overview */}
        <section id="overview" className="px-6 pb-20 pt-36 md:px-12 md:pt-44">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-neutral-900/[0.08] bg-cru-surface px-4 py-1.5 font-mono text-[11px] uppercase tracking-wider text-cru-muted">
            <span className="size-2 rounded-full bg-cru-gold" />
            Cru · Visayas State University
          </div>

          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-cru-charcoal md:text-6xl md:leading-[1.08]">
            Helping VSU students know{" "}
            <span className="relative inline-block">
              <span className="relative z-10">Jesus</span>
              <span className="absolute bottom-1 left-0 right-0 -z-0 h-3 rounded-sm bg-cru-gold/40" />
            </span>
            , grow in faith, and multiply.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-cru-muted">
            A student-led campus movement built on authentic relationships, where
            spiritual moms and dads walk alongside disciples, rooted in Jesus at
            the center of it all.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              href="/tree"
              className="inline-flex h-12 items-center gap-3 rounded-full bg-cru-gold p-1.5 pr-6 text-sm font-semibold text-cru-charcoal shadow-sm transition-colors hover:bg-cru-gold-hover"
            >
              <span className="grid size-9 place-items-center rounded-full bg-white text-cru-charcoal">
                <GitBranch className="size-4" aria-hidden="true" />
              </span>
              Explore Discipleship Tree
            </Link>

            <Link
              href="#projects"
              className="inline-flex h-12 items-center gap-2 rounded-full border border-neutral-900/[0.08] bg-cru-surface px-5 text-sm font-medium text-cru-charcoal transition-colors hover:border-cru-gold/60"
            >
              <span>Campus Activities</span>
              <ArrowRight className="size-4 text-cru-gold-hover" aria-hidden="true" />
            </Link>
          </div>

          {/* Architectural Metric Strip */}
          <div className="mt-16 grid grid-cols-2 gap-4 border-t border-neutral-900/[0.06] pt-10 md:grid-cols-3 md:gap-8">
            <div>
              <div className="text-3xl font-semibold tracking-tight text-cru-charcoal md:text-4xl">
                {totalMembers}
              </div>
              <div className="mt-1 font-mono text-[11px] uppercase tracking-wider text-cru-muted">
                Connected Disciples
              </div>
            </div>
            <div>
              <div className="text-3xl font-semibold tracking-tight text-cru-charcoal md:text-4xl">
                {maxGeneration}
              </div>
              <div className="mt-1 font-mono text-[11px] uppercase tracking-wider text-cru-muted">
                Spiritual Generations
              </div>
            </div>
            <div className="col-span-2 md:col-span-1">
              <div className="text-3xl font-semibold tracking-tight text-cru-charcoal md:text-4xl">
                {projects.length}
              </div>
              <div className="mt-1 font-mono text-[11px] uppercase tracking-wider text-cru-muted">
                Active Campus Initiatives
              </div>
            </div>
          </div>
        </section>

        <DraftingDivider />

        {/* Section 2: Interactive Obsidian-Style Discipleship Tree */}
        <section id="discipleship-tree" className="px-6 py-24 md:px-12">
          <div className="mb-3 font-mono text-xs uppercase tracking-widest text-[#8a5a00]">
            01 · Spiritual Family Tree
          </div>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-medium tracking-tight text-cru-charcoal md:text-[32px] md:leading-[42px]">
                Obsidian-Style Discipleship Network
              </h2>
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-cru-muted">
                Every student&apos;s spiritual walk connects back through their
                discipler (their spiritual mom or dad) to Jesus Christ at the center.
              </p>
            </div>
            <Link
              href="/tree"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-cru-charcoal transition-colors hover:text-[#8a5a00]"
            >
              <span>Open Full Explorer</span>
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-8">
            <DiscipleshipExplorer
              data={graphData}
              compact
              fullScreenHref="/tree"
            />
          </div>
        </section>

        <DraftingDivider />

        {/* Section 3: Ministry Projects Showcase */}
        <section id="projects" className="px-6 py-24 md:px-12">
          <div className="mb-3 font-mono text-xs uppercase tracking-widest text-[#8a5a00]">
            02 · Campus Ministry
          </div>
          <h2 className="text-2xl font-medium tracking-tight text-cru-charcoal md:text-[32px] md:leading-[42px]">
            What We Do at VSU
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-cru-muted">
            Weekly College Life gatherings, small-group Action Groups, and
            campus outreaches designed for real community.
          </p>

          <MinistryProjectsShowcase projects={projects} />
        </section>

        <DraftingDivider />

        {/* Section 4: Join Cru Intake Form */}
        <section id="join-cru" className="px-6 py-24 md:px-12">
          <div className="grid gap-10 rounded-[28px] border border-neutral-900/[0.07] bg-cru-surface p-7 md:grid-cols-5 md:p-12">
            <div className="md:col-span-2">
              <div className="mb-3 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[#8a5a00]">
                <Sparkles className="size-3.5" aria-hidden="true" />
                03 · Get Connected
              </div>
              <h2 className="text-2xl font-medium tracking-tight text-cru-charcoal md:text-[32px] md:leading-[40px]">
                Ask to Join Cru VSU
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-cru-muted">
                Whether you&apos;re a freshman looking for friends, wanting to
                explore Christianity, or seeking a spiritual mom or dad to walk
                with you through college, we&apos;d love to meet you.
              </p>

              <div className="mt-8 space-y-3 border-t border-neutral-900/[0.06] pt-6">
                <div className="flex items-center gap-2.5 text-xs text-cru-charcoal">
                  <span className="size-2 rounded-full bg-cru-gold" />
                  <span>
                    <strong>Win:</strong> Welcoming conversations &amp; outreach
                  </span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-cru-charcoal">
                  <span className="size-2 rounded-full bg-cru-gold" />
                  <span>
                    <strong>Build:</strong> Life-on-life Action Groups
                  </span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-cru-charcoal">
                  <span className="size-2 rounded-full bg-cru-gold" />
                  <span>
                    <strong>Send:</strong> Growing as a campus multiplier
                  </span>
                </div>
              </div>
            </div>

            <div className="md:col-span-3">
              <JoinCruForm />
            </div>
          </div>
        </section>
      </DraftingContainer>
    </main>
  );
}
