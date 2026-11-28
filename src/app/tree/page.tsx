import { fetchDiscipleshipGraphData } from "@/lib/graph/queries";
import { DiscipleshipExplorer } from "@/components/graph/DiscipleshipExplorer";
import { DraftingContainer } from "@/components/layout/DraftingGrid";

export const dynamic = "force-dynamic";

export default async function TreePage() {
  const graphData = await fetchDiscipleshipGraphData();
  const totalMembers = Math.max(0, graphData.nodes.length - 1);

  return (
    <main className="min-h-screen bg-white pt-28 pb-12 dark:bg-cru-night">
      <DraftingContainer className="px-4 py-6 md:px-8">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-widest text-cru-gold-text dark:text-cru-gold">
              Cru VSU · Spiritual Multiplication
            </div>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-cru-charcoal dark:text-cru-ink md:text-3xl">
              Discipleship Family Tree
            </h1>
          </div>

          <div className="inline-flex items-center gap-3 rounded-full border border-neutral-900/[0.08] bg-cru-surface px-4 py-2 font-mono text-xs text-cru-muted dark:border-white/10 dark:bg-cru-night-surface dark:text-cru-ink-muted">
            <span className="size-2 rounded-full bg-cru-gold" />
            <span>{totalMembers} disciples connected to Jesus</span>
          </div>
        </div>

        <DiscipleshipExplorer data={graphData} />
      </DraftingContainer>
    </main>
  );
}
