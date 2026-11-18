import { Sparkles, GitBranch, HeartHandshake, ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto min-h-screen w-full max-w-[1200px] border-x border-neutral-900/[0.06] px-6 py-24 md:px-12">
        {/* Step 1 Foundation Badge */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-neutral-900/[0.08] bg-cru-surface px-4 py-1.5 text-xs font-mono uppercase tracking-wider text-cru-muted">
          <span className="size-2 rounded-full bg-cru-gold" />
          Cru-VSU · Phase 1 Scaffold & Theme Active
        </div>

        {/* Hero Typography & Palette Preview */}
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-cru-charcoal md:text-6xl md:leading-[1.08]">
          Helping VSU students know{" "}
          <span className="relative inline-block">
            <span className="relative z-10">Jesus</span>
            <span className="absolute bottom-1 left-0 right-0 h-3 bg-cru-gold/35 -z-0 rounded-sm" />
          </span>
          , grow in faith, and multiply.
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-cru-muted">
          Foundation scaffold for the Cru Visayas State University platform—built
          with Next.js 15, Tailwind CSS, Supabase schemas, and our signature Cru
          Gold &amp; crisp white design system.
        </p>

        {/* Primary Cru Gold Split-Badge CTA Preview */}
        <div className="mt-10 flex flex-wrap items-center gap-4">
          <button
            type="button"
            className="inline-flex h-12 items-center gap-3 rounded-full bg-cru-gold p-1.5 pr-6 text-sm font-semibold text-cru-charcoal shadow-sm transition-colors hover:bg-cru-gold-hover"
          >
            <span className="grid size-9 place-items-center rounded-full bg-white text-cru-charcoal">
              <GitBranch className="size-4" />
            </span>
            Explore Discipleship Tree
          </button>

          <div className="glass-nav inline-flex h-12 items-center gap-2 rounded-full px-5 text-sm font-medium text-cru-charcoal">
            <span>Glassmorphism Surface Ready</span>
            <ArrowRight className="size-4 text-cru-gold-hover" />
          </div>
        </div>

        {/* Architectural Divider */}
        <div className="relative my-16 h-px bg-neutral-900/[0.06]">
          <div className="absolute left-0 top-1/2 grid size-5 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white">
            <span className="size-1 rounded-full bg-cru-gold" />
          </div>
          <div className="absolute right-0 top-1/2 grid size-5 translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white">
            <span className="size-1 rounded-full bg-cru-gold" />
          </div>
        </div>

        {/* Theme Token Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-[24px] border border-neutral-900/[0.07] bg-cru-surface p-7 transition-colors hover:border-cru-gold/50">
            <div className="mb-4 grid size-10 place-items-center rounded-full bg-cru-gold-soft text-cru-gold-hover">
              <Sparkles className="size-5" />
            </div>
            <h2 className="text-lg font-medium text-cru-charcoal">
              Win · Build · Send
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-cru-muted">
              Grounded in Cru&apos;s spiritual multiplication model and Cru-VSU&apos;s
              &ldquo;mom/dad&rdquo; relational family tree culture.
            </p>
          </div>

          <div className="rounded-[24px] border border-neutral-900/[0.07] bg-cru-surface p-7 transition-colors hover:border-cru-gold/50">
            <div className="mb-4 grid size-10 place-items-center rounded-full bg-cru-gold-soft text-cru-gold-hover">
              <GitBranch className="size-5" />
            </div>
            <h2 className="text-lg font-medium text-cru-charcoal">
              Supabase Schema Ready
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-cru-muted">
              PostgreSQL tables, RLS policies, and seed data prepared for
              profiles, lineages, ministry projects, and inquiries.
            </p>
          </div>

          <div className="rounded-[24px] border border-neutral-900/[0.07] bg-cru-surface p-7 transition-colors hover:border-cru-gold/50">
            <div className="mb-4 grid size-10 place-items-center rounded-full bg-cru-gold-soft text-cru-gold-hover">
              <HeartHandshake className="size-5" />
            </div>
            <h2 className="text-lg font-medium text-cru-charcoal">
              Cru Yellow &amp; White Tokens
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-cru-muted">
              Configured custom Tailwind v4 tokens (`#FDB913`, `#EAA400`),
              frosted glass utilities, and architectural hairline borders.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
