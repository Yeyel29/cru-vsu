"use client";

import { useEffect } from "react";
import { DraftingContainer } from "@/components/layout/DraftingGrid";

interface HomeErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function HomeError({ error, reset }: HomeErrorProps) {
  useEffect(() => {
    console.error("HomePage error:", error);
  }, [error]);

  return (
    <main className="min-h-screen bg-white dark:bg-cru-night">
      <DraftingContainer>
        <section
          role="alert"
          className="px-6 pb-20 pt-36 md:px-12 md:pt-44"
        >
          <p className="font-mono text-xs font-medium text-cru-gold-text dark:text-cru-gold">
            Unable to load page data
          </p>
          <h1 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight text-cru-charcoal dark:text-cru-ink md:text-4xl">
            Something went wrong while loading Cru VSU.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-cru-muted dark:text-cru-ink-muted">
            We could not load the discipleship network or campus initiatives.
            Try again, or refresh the page in a moment.
          </p>
          <div className="mt-8">
            <button
              type="button"
              onClick={reset}
              className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full bg-cru-gold px-6 text-sm font-semibold text-cru-charcoal shadow-sm transition-colors hover:bg-cru-gold-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cru-charcoal dark:focus-visible:outline-cru-ink"
            >
              Try again
            </button>
          </div>
        </section>
      </DraftingContainer>
    </main>
  );
}
