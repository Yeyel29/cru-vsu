import Link from "next/link";
import { GitBranch, ArrowRight } from "lucide-react";
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
    <main className="min-h-screen bg-white dark:bg-cru-night">
      <LeftProgressRail sections={HOME_SECTIONS} />

      <DraftingContainer>
        {/* Section 1: Hero / Overview */}
        <section id="overview" className="px-6 pb-20 pt-36 md:px-12 md:pt-44">
          <p className="mb-4 text-sm font-medium text-cru-gold-text dark:text-cru-gold">
            Cru · Visayas State University
          </p>

          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-cru-charcoal dark:text-cru-ink md:text-6xl md:leading-[1.08]">
            Helping VSU students know{" "}
            <span className="relative inline-block">
              <span className="relative z-10">Jesus</span>
              <span className="absolute bottom-1 left-0 right-0 -z-0 h-3 rounded-sm bg-cru-gold/40" />
            </span>
            , grow in faith, and multiply.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-cru-muted dark:text-cru-ink-muted">
            Here in Cru VSU Student LinC, we are privileged to walk alongside
            students as they grow in their relationship with Christ and step
            into their calling as leaders in His kingdom.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              href="/tree"
              className="inline-flex h-12 items-center gap-3 rounded-full bg-cru-gold p-1.5 pr-6 text-sm font-semibold text-cru-charcoal shadow-sm transition-colors hover:bg-cru-gold-hover"
            >
              <span className="grid size-9 place-items-center rounded-full bg-white text-cru-charcoal">
                <GitBranch className="size-4" aria-hidden="true" />
              </span>
              View Discipleship Tree
            </Link>

            <Link
              href="#projects"
              className="inline-flex h-12 items-center rounded-full border border-neutral-900/[0.08] bg-cru-surface px-5 text-sm font-medium text-cru-charcoal transition-colors hover:border-cru-gold/60 dark:border-white/10 dark:bg-cru-night-surface dark:text-cru-ink dark:hover:border-cru-gold/60"
            >
              Explore Campus Ministries
            </Link>
          </div>

          {/* Architectural Metric Strip */}
          <div className="mt-16 grid grid-cols-2 gap-4 border-t border-neutral-900/[0.06] dark:border-white/[0.08] pt-10 md:grid-cols-3 md:gap-8">
            <div>
              <div className="font-mono text-3xl font-semibold tracking-tight tabular-nums text-cru-charcoal dark:text-cru-ink md:text-4xl">
                {totalMembers}
              </div>
              <div className="mt-1 text-xs font-medium text-cru-muted dark:text-cru-ink-muted">
                Connected Disciples
              </div>
            </div>
            <div>
              <div className="font-mono text-3xl font-semibold tracking-tight tabular-nums text-cru-charcoal dark:text-cru-ink md:text-4xl">
                {maxGeneration}
              </div>
              <div className="mt-1 text-xs font-medium text-cru-muted dark:text-cru-ink-muted">
                Spiritual Generations
              </div>
            </div>
            <div className="col-span-2 md:col-span-1">
              <div className="font-mono text-3xl font-semibold tracking-tight tabular-nums text-cru-charcoal dark:text-cru-ink md:text-4xl">
                {projects.length}
              </div>
              <div className="mt-1 text-xs font-medium text-cru-muted dark:text-cru-ink-muted">
                Active Campus Initiatives
              </div>
            </div>
          </div>
        </section>

        <DraftingDivider />

        {/* Section 2: Interactive Discipleship Tree */}
        <section id="discipleship-tree" className="px-6 py-16 md:px-12 md:py-20">
          <div className="mb-3 font-mono text-xs font-medium text-cru-gold-text dark:text-cru-gold">
            01 · Spiritual Multiplication
          </div>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-medium tracking-tight text-cru-charcoal dark:text-cru-ink md:text-[32px] md:leading-[42px]">
                Generations of Discipleship
              </h2>
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-cru-muted dark:text-cru-ink-muted">
                Trace how the Gospel multiplies across Visayas State University
                through intentional, life-on-life mentorship, with every
                spiritual generation rooted in Jesus Christ (2 Timothy 2:2).
              </p>
            </div>
            <Link
              href="/tree"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-cru-charcoal transition-colors dark:text-cru-ink hover:text-cru-gold-text dark:hover:text-cru-gold"
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
        <section id="projects" className="px-6 py-20 md:px-12 md:py-24">
          <div className="md:flex md:items-end md:justify-between md:gap-8">
            <div>
              <div className="mb-3 font-mono text-xs font-medium text-cru-gold-text dark:text-cru-gold">
                02 · Campus Ministries
              </div>
              <h2 className="text-2xl font-medium tracking-tight text-cru-charcoal dark:text-cru-ink md:text-[32px] md:leading-[42px]">
                What We Do at VSU
              </h2>
            </div>
            <p className="mt-3 max-w-md text-base leading-relaxed text-cru-muted dark:text-cru-ink-muted md:mt-0">
              Weekly College Life Meetings, small-group Action Groups, and
              Gospel-centered campus outreach rooted in Scripture and fellowship.
            </p>
          </div>

          <MinistryProjectsShowcase projects={projects} />
        </section>

        <DraftingDivider />

        {/* Section 4: Join Cru Intake Form */}
        <section id="join-cru" className="px-6 pb-24 pt-16 md:px-12 md:pb-28 md:pt-20">
          <div className="grid gap-10 rounded-[28px] border border-neutral-900/[0.07] bg-cru-surface p-7 dark:border-white/10 dark:bg-cru-night-surface md:grid-cols-5 md:p-12">
            <div className="md:col-span-2">
              <div className="mb-3 font-mono text-xs font-medium text-cru-gold-text dark:text-cru-gold">
                03 · Get Connected
              </div>
              <h2 className="text-2xl font-medium tracking-tight text-cru-charcoal dark:text-cru-ink md:text-[32px] md:leading-[40px]">
                Connect with Cru VSU
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-cru-muted dark:text-cru-ink-muted">
                Whether you want to discover and begin your walk of faith, grow
                deeper in your relationship with the Lord, or find a
                Christ-centered community to journey with at VSU, we would be
                honored to walk alongside you.
              </p>

              <div className="mt-8 space-y-3 border-t border-neutral-900/[0.06] pt-6 dark:border-white/[0.08]">
                <div className="text-xs leading-relaxed text-cru-charcoal dark:text-cru-ink">
                  <strong className="font-semibold">Win:</strong> Sharing the
                  Gospel of Jesus Christ across campus
                </div>
                <div className="text-xs leading-relaxed text-cru-charcoal dark:text-cru-ink">
                  <strong className="font-semibold">Build:</strong> Deepening
                  faith and character through Action Groups
                </div>
                <div className="text-xs leading-relaxed text-cru-charcoal dark:text-cru-ink">
                  <strong className="font-semibold">Send:</strong> Equipping
                  disciples to mentor and multiply others
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
