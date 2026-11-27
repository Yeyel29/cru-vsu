import { DraftingContainer } from "@/components/layout/DraftingGrid";

export default function HomeLoading() {
  return (
    <main className="min-h-screen bg-white dark:bg-cru-night" aria-busy="true" aria-live="polite">
      <DraftingContainer>
        <section className="px-6 pb-20 pt-36 md:px-12 md:pt-44">
          <p className="font-mono text-xs font-medium text-cru-gold-text dark:text-cru-gold">
            Loading Cru VSU discipleship network and campus initiatives...
          </p>
          <div className="mt-6 h-12 w-3/4 max-w-2xl animate-pulse rounded-xl bg-neutral-900/[0.06] dark:bg-white/[0.08]" />
          <div className="mt-4 h-6 w-2/3 max-w-xl animate-pulse rounded-lg bg-neutral-900/[0.05] dark:bg-white/[0.06]" />
          <div className="mt-16 grid grid-cols-2 gap-4 border-t border-neutral-900/[0.06] dark:border-white/[0.08] pt-10 md:grid-cols-3 md:gap-8">
            <div className="h-14 animate-pulse rounded-xl bg-neutral-900/[0.05] dark:bg-white/[0.06]" />
            <div className="h-14 animate-pulse rounded-xl bg-neutral-900/[0.05] dark:bg-white/[0.06]" />
            <div className="col-span-2 h-14 animate-pulse rounded-xl bg-neutral-900/[0.05] dark:bg-white/[0.06] md:col-span-1" />
          </div>
        </section>
      </DraftingContainer>
    </main>
  );
}
