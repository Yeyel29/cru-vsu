"use client";

import Link from "next/link";
import {
  X,
  BookOpen,
  GraduationCap,
  Heart,
  HeartHandshake,
  Users,
  ArrowUpRight,
} from "lucide-react";
import {
  getDirectDisciples,
  getGenerationColor,
  getGenerationLabel,
} from "@/lib/graph/transform";
import type { GraphNode } from "@/types/database";

interface MemberProfileDrawerProps {
  node: GraphNode | null;
  allNodes: GraphNode[];
  onClose: () => void;
  onSelectNode: (node: GraphNode) => void;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

/**
 * Slide-out drawer showing a member's spiritual lineage ("mom/dad" & disciples),
 * campus program, favorite verse, and testimony.
 */
export function MemberProfileDrawer({
  node,
  allNodes,
  onClose,
  onSelectNode,
}: MemberProfileDrawerProps) {
  if (!node) return null;

  const color = getGenerationColor(node.generationDepth, node.isRootJesus);
  const genLabel = getGenerationLabel(node.generationDepth, node.isRootJesus);

  const discipler = node.disciplerId
    ? allNodes.find((n) => n.id === node.disciplerId) ?? null
    : null;
  const disciples = getDirectDisciples(node.id, allNodes);

  return (
    <div className="glass-panel fixed bottom-4 right-4 top-24 z-40 flex w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-[24px] transition-all duration-300">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-neutral-900/[0.06] p-6 dark:border-white/10">
        <div className="flex items-center gap-3.5">
          <div
            className="grid size-12 shrink-0 place-items-center rounded-full text-sm font-bold text-white shadow-sm"
            style={{ backgroundColor: color }}
          >
            {node.isRootJesus ? "✝" : getInitials(node.name)}
          </div>
          <div>
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider"
              style={{
                backgroundColor: `${color}18`,
                color: node.isRootJesus ? "#B45309" : color,
              }}
            >
              <span
                className="size-1.5 rounded-full"
                style={{ backgroundColor: color }}
              />
              {genLabel}
            </span>
            <h3 className="mt-1 text-lg font-semibold leading-tight text-cru-charcoal dark:text-cru-ink">
              {node.name}
            </h3>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close profile drawer"
          className="grid size-8 place-items-center rounded-full text-cru-muted transition-colors hover:bg-neutral-900/5 hover:text-cru-charcoal dark:text-cru-ink-muted dark:hover:bg-white/10 dark:hover:text-cru-ink"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Scrollable Body */}
      <div className="flex-1 space-y-5 overflow-y-auto p-6">
        {node.collegeProgram && (
          <div className="flex items-center gap-2.5 text-sm text-cru-charcoal/85 dark:text-cru-ink/85">
            <GraduationCap className="size-4 shrink-0 text-cru-gold-hover" />
            <span>{node.collegeProgram}</span>
          </div>
        )}

        {/* Spiritual Parent ("Mom / Dad") */}
        {discipler && (
          <div>
            <div className="mb-2 font-mono text-[11px] uppercase tracking-wider text-cru-muted dark:text-cru-ink-muted">
              Spiritual Parent (Mom / Dad)
            </div>
            <button
              type="button"
              onClick={() => onSelectNode(discipler)}
              className="flex w-full items-center justify-between rounded-2xl border border-neutral-900/[0.07] bg-white px-4 py-3 text-left transition-colors hover:border-cru-gold dark:border-white/10 dark:bg-white/10"
            >
              <div className="flex items-center gap-3">
                <span
                  className="grid size-8 place-items-center rounded-full text-xs font-bold text-white"
                  style={{
                    backgroundColor: getGenerationColor(
                      discipler.generationDepth,
                      discipler.isRootJesus
                    ),
                  }}
                >
                  {discipler.isRootJesus ? "✝" : getInitials(discipler.name)}
                </span>
                <div>
                  <div className="text-sm font-medium text-cru-charcoal dark:text-cru-ink">
                    {discipler.name}
                  </div>
                  <div className="text-xs text-cru-muted dark:text-cru-ink-muted">
                    {discipler.collegeProgram || "Discipler"}
                  </div>
                </div>
              </div>
              <ArrowUpRight className="size-4 text-cru-muted dark:text-cru-ink-muted" />
            </button>
          </div>
        )}

        {/* Favorite Verse */}
        {node.favoriteVerse && (
          <div className="rounded-2xl border border-cru-gold/30 bg-cru-gold-soft/60 p-4 dark:bg-cru-gold/10">
            <div className="mb-1.5 flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-wider text-amber-800 dark:text-cru-gold">
              <BookOpen className="size-3.5" />
              Life Verse · {node.favoriteVerse}
            </div>
            {node.testimony && (
              <p className="text-sm leading-relaxed text-cru-charcoal/90 dark:text-cru-ink/90">
                &ldquo;{node.testimony}&rdquo;
              </p>
            )}
          </div>
        )}

        {/* Testimony (if no verse) */}
        {!node.favoriteVerse && node.testimony && (
          <div className="rounded-2xl border border-neutral-900/[0.07] bg-white p-4 dark:border-white/10 dark:bg-white/10">
            <div className="mb-1.5 flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-cru-muted dark:text-cru-ink-muted">
              <Heart className="size-3.5 text-cru-gold-hover" />
              Faith Journey
            </div>
            <p className="text-sm leading-relaxed text-cru-charcoal/85 dark:text-cru-ink/85">
              {node.testimony}
            </p>
          </div>
        )}

        {/* Direct Disciples ("Spiritual Children") */}
        <div>
          <div className="mb-2 flex items-center justify-between font-mono text-[11px] uppercase tracking-wider text-cru-muted dark:text-cru-ink-muted">
            <span className="flex items-center gap-1.5">
              <Users className="size-3.5" />
              Direct Disciples ({disciples.length})
            </span>
          </div>

          {disciples.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-neutral-900/10 bg-white/50 p-4 dark:border-white/15 dark:bg-white/5 text-xs text-cru-muted dark:text-cru-ink-muted">
              {node.isRootJesus
                ? "All campus leaders and generations flow out from Christ."
                : "Currently growing in faith as a disciple."}
            </p>
          ) : (
            <div className="space-y-2">
              {disciples.map((child) => (
                <button
                  key={child.id}
                  type="button"
                  onClick={() => onSelectNode(child)}
                  className="flex w-full items-center justify-between rounded-2xl border border-neutral-900/[0.07] bg-white px-4 py-2.5 text-left transition-colors hover:border-cru-gold dark:border-white/10 dark:bg-white/10"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="grid size-7 place-items-center rounded-full text-[11px] font-bold text-white"
                      style={{
                        backgroundColor: getGenerationColor(
                          child.generationDepth
                        ),
                      }}
                    >
                      {getInitials(child.name)}
                    </span>
                    <div>
                      <div className="text-sm font-medium text-cru-charcoal dark:text-cru-ink">
                        {child.name}
                      </div>
                      <div className="text-[11px] text-cru-muted dark:text-cru-ink-muted">
                        {child.collegeProgram || `Gen ${child.generationDepth}`}
                      </div>
                    </div>
                  </div>
                  <ArrowUpRight className="size-4 text-cru-muted dark:text-cru-ink-muted" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {!node.isRootJesus && (
        <div className="border-t border-neutral-900/[0.06] p-4 dark:border-white/10">
          <Link
            href={`/give?to=${encodeURIComponent(node.id)}`}
            className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full border border-neutral-900/10 bg-white px-4 py-2.5 text-xs font-semibold text-cru-charcoal transition-colors hover:border-cru-gold hover:bg-cru-gold-soft/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cru-gold dark:border-white/15 dark:bg-white/10 dark:text-cru-ink dark:hover:border-cru-gold"
          >
            <HeartHandshake
              aria-hidden="true"
              className="size-3.5 text-cru-gold-text dark:text-cru-gold"
            />
            <span>Sow into {node.name.split(/\s+/)[0]}&apos;s ministry</span>
          </Link>
        </div>
      )}
    </div>
  );
}
