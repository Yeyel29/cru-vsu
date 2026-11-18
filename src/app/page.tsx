import Link from "next/link";
import { GitBranch, Layers, UserPlus, Sparkles, ArrowRight } from "lucide-react";
import {
  DraftingContainer,
  DraftingDivider,
} from "@/components/layout/DraftingGrid";
import {
  LeftProgressRail,
  type RailSection,
} from "@/components/layout/LeftProgressRail";
import { DiscipleshipExplorer } from "@/components/graph/DiscipleshipExplorer";
import { fetchDiscipleshipGraphData } from "@/lib/graph/queries";

export const dynamic = "force-dynamic";

const HOME_SECTIONS: RailSection[] = [
  { id: "overview", label: "Overview" },
  { id: "discipleship-tree", label: "Discipleship Tree" },
  { id: "projects", label: "Ministry Projects" },
  { id: "join-cru", label: "Join Cru" },
];

export default async function HomePage() {
  const graphData = await fetchDiscipleshipGraphData();

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
            A student-led campus movement built on authentic relationships—where
            spiritual moms and dads walk alongside disciples, rooted in Jesus at
            the center of it all.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              href="/tree"
              className="inline-flex h-12 items-center gap-3 rounded-full bg-cru-gold p-1.5 pr-6 text-sm font-semibold text-cru-charcoal shadow-sm transition-colors hover:bg-cru-gold-hover"
            >
              <span className="grid size-9 place-items-center rounded-full bg-white text-cru-charcoal">
                <GitBranch className="size-4" />
              </span>
              Explore Discipleship Tree
            </Link>

            <Link
              href="#projects"
              className="inline-flex h-12 items-center gap-2 rounded-full border border-neutral-900/[0.08] bg-cru-surface px-5 text-sm font-medium text-cru-charcoal transition-colors hover:border-cru-gold/60"
            >
              <span>Campus Activities</span>
              <ArrowRight className="size-4 text-cru-gold-hover" />
            </Link>
          </div>
        </section>

        <DraftingDivider />

        {/* Section 2: Interactive Obsidian-Style Discipleship Tree */}
        <section id="discipleship-tree" className="px-6 py-24 md:px-12">
          <div className="mb-3 font-mono text-xs uppercase tracking-widest text-cru-gold-hover">
            01 · Spiritual Family Tree
          </div>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-medium tracking-tight text-cru-charcoal md:text-[32px] md:leading-[42px]">
                Obsidian-Style Discipleship Network
              </h2>
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-cru-muted">
                Every student&apos;s spiritual walk connects back through their
                discipler—their spiritual mom or dad—to Jesus Christ at the center.
              </p>
            </div>
            <Link
              href="/tree"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-cru-charcoal transition-colors hover:text-cru-gold-hover"
            >
              <span>Open Full Explorer</span>
              <ArrowRight className="size-4" />
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

        {/* Section 3: Ministry Projects Placeholder (Built in Step 4) */}
        <section id="projects" className="px-6 py-24 md:px-12">
          <div className="mb-3 font-mono text-xs uppercase tracking-widest text-cru-gold-hover">
            02 · Campus Ministry
          </div>
          <h2 className="text-2xl font-medium tracking-tight text-cru-charcoal md:text-[32px] md:leading-[42px]">
            What We Do at VSU
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-cru-muted">
            Weekly College Life gatherings, small-group Action Groups, and
            campus outreaches designed for real community.
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              {
                title: "College Life Fellowship",
                tag: "Weekly Large Group",
                desc: "Worship, biblical teaching, and vibrant student community every week.",
              },
              {
                title: "Action Groups",
                tag: "Small-Group Discipleship",
                desc: "Life-on-life mentorship cohorts across VSU colleges and dorms.",
              },
              {
                title: "Campus Outreaches",
                tag: "Win · Build · Send",
                desc: "Creative spiritual conversations and freshmen welcome initiatives.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-[24px] border border-neutral-900/[0.07] bg-cru-surface p-7 transition-colors hover:border-cru-gold/50"
              >
                <div className="mb-4 flex items-center justify-between">
                  <span className="grid size-10 place-items-center rounded-full bg-cru-gold-soft text-cru-gold-hover">
                    <Layers className="size-4" />
                  </span>
                  <span className="font-mono text-[11px] text-cru-muted">
                    {item.tag}
                  </span>
                </div>
                <h3 className="text-lg font-medium text-cru-charcoal">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-cru-muted">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        <DraftingDivider />

        {/* Section 4: Join Cru Placeholder (Built in Step 4) */}
        <section id="join-cru" className="px-6 py-24 md:px-12">
          <div className="rounded-[24px] border border-neutral-900/[0.07] bg-cru-surface p-8 md:p-12">
            <div className="mb-3 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-cru-gold-hover">
              <Sparkles className="size-3.5" />
              03 · Get Connected
            </div>
            <h2 className="text-2xl font-medium tracking-tight text-cru-charcoal md:text-[32px]">
              Ask to Join Cru VSU
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-cru-muted">
              Looking for a Bible study, a spiritual mentor, or a welcoming
              campus family? Reach out and we&apos;ll connect you with a
              discipler.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-cru-gold px-5 py-2.5 text-sm font-semibold text-cru-charcoal">
              <UserPlus className="size-4" />
              Intake Form Coming in Step 4
            </div>
          </div>
        </section>
      </DraftingContainer>
    </main>
  );
}
