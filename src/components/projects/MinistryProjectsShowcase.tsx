"use client";

import { useMemo, useState } from "react";
import { Calendar, Layers, ArrowUpRight, X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MinistryProject } from "@/types/database";

interface MinistryProjectsShowcaseProps {
  projects: MinistryProject[];
}

/**
 * Interactive campus ministry projects grid with Poulo-inspired segmented pill
 * category filters and a glassmorphism project detail modal.
 */
export function MinistryProjectsShowcase({
  projects,
}: MinistryProjectsShowcaseProps) {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [selectedProject, setSelectedProject] =
    useState<MinistryProject | null>(null);

  const categories = useMemo(() => {
    const unique = Array.from(new Set(projects.map((p) => p.category)));
    return ["All", ...unique];
  }, [projects]);

  const filteredProjects = useMemo(() => {
    if (activeCategory === "All") return projects;
    return projects.filter((p) => p.category === activeCategory);
  }, [projects, activeCategory]);

  const handleGetInvolved = (projectTitle: string) => {
    setSelectedProject(null);
    window.dispatchEvent(
      new CustomEvent("cru:prefill-interest", {
        detail: `Interested in volunteering / joining: ${projectTitle}`,
      })
    );
    const joinEl = document.getElementById("join-cru");
    joinEl?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div>
      {/* Segmented Pill Category Switcher */}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <div
          role="tablist"
          aria-label="Filter ministry projects by category"
          className="inline-flex flex-wrap items-center gap-1 rounded-full bg-neutral-900/[0.04] p-1"
        >
          {categories.map((cat) => {
            const count =
              cat === "All"
                ? projects.length
                : projects.filter((p) => p.category === cat).length;
            const isActive = activeCategory === cat;

            return (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "inline-flex h-8 items-center gap-2 rounded-full px-3.5 text-xs font-medium transition-all",
                  isActive
                    ? "bg-white text-cru-charcoal shadow-[0_1px_3px_rgb(0_0_0/0.12)]"
                    : "text-cru-muted hover:text-cru-charcoal"
                )}
              >
                <span>{cat}</span>
                <span
                  className={cn(
                    "font-mono text-[10px] tabular-nums",
                    isActive ? "text-cru-gold-hover" : "text-cru-muted/70"
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Projects Grid */}
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {filteredProjects.map((project) => (
          <article
            key={project.id}
            className="group flex flex-col justify-between rounded-[24px] border border-neutral-900/[0.07] bg-cru-surface p-7 transition-all hover:border-cru-gold/60 hover:bg-white hover:shadow-[0_16px_40px_-15px_rgba(0,0,0,0.08)]"
          >
            <div>
              <div className="mb-5 flex items-center justify-between gap-2">
                <span className="grid size-10 place-items-center rounded-full bg-cru-gold-soft text-cru-gold-hover transition-colors group-hover:bg-cru-gold group-hover:text-cru-charcoal">
                  <Layers className="size-4" />
                </span>
                <span className="rounded-full border border-neutral-900/[0.06] bg-white px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-cru-muted">
                  {project.category}
                </span>
              </div>

              <h3 className="text-lg font-semibold tracking-tight text-cru-charcoal">
                {project.title}
              </h3>

              <p className="mt-2.5 text-sm leading-relaxed text-cru-muted">
                {project.summary}
              </p>
            </div>

            <div className="mt-6 border-t border-neutral-900/[0.06] pt-4">
              {project.schedule && (
                <div className="mb-4 flex items-center gap-2 font-mono text-[11px] text-cru-muted">
                  <Calendar className="size-3.5 shrink-0 text-cru-gold-hover" />
                  <span className="truncate">{project.schedule}</span>
                </div>
              )}

              <button
                type="button"
                onClick={() => setSelectedProject(project)}
                className="inline-flex w-full items-center justify-between rounded-full border border-neutral-900/[0.08] bg-white px-4 py-2.5 text-xs font-semibold text-cru-charcoal transition-colors hover:border-cru-gold hover:bg-cru-gold-soft/60"
              >
                <span>View Details &amp; Get Involved</span>
                <ArrowUpRight className="size-3.5 text-cru-gold-hover" />
              </button>
            </div>
          </article>
        ))}
      </div>

      {/* Project Detail Modal */}
      {selectedProject && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/35 p-4 backdrop-blur-xs"
          onClick={() => setSelectedProject(null)}
        >
          <div
            className="glass-panel relative w-full max-w-lg rounded-[28px] p-7 md:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-cru-gold-soft px-3 py-1 font-mono text-[10px] font-medium uppercase tracking-wider text-amber-800">
                  <Sparkles className="size-3" />
                  {selectedProject.category}
                </span>
                <h3 className="mt-3 text-2xl font-semibold tracking-tight text-cru-charcoal">
                  {selectedProject.title}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setSelectedProject(null)}
                aria-label="Close modal"
                className="grid size-9 shrink-0 place-items-center rounded-full border border-neutral-900/[0.08] bg-white text-cru-muted transition-colors hover:text-cru-charcoal"
              >
                <X className="size-4" />
              </button>
            </div>

            {selectedProject.schedule && (
              <div className="mt-4 flex items-center gap-2 rounded-2xl border border-neutral-900/[0.06] bg-white px-4 py-3 font-mono text-xs text-cru-charcoal">
                <Calendar className="size-4 text-cru-gold-hover" />
                <span>{selectedProject.schedule}</span>
              </div>
            )}

            <p className="mt-5 text-sm leading-relaxed text-cru-charcoal/85">
              {selectedProject.description}
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedProject(null)}
                className="h-11 rounded-full px-5 text-xs font-medium text-cru-muted transition-colors hover:text-cru-charcoal"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => handleGetInvolved(selectedProject.title)}
                className="inline-flex h-11 items-center gap-2 rounded-full bg-cru-gold px-6 text-xs font-semibold text-cru-charcoal shadow-sm transition-colors hover:bg-cru-gold-hover"
              >
                <span>I&apos;m Interested in This Project</span>
                <ArrowUpRight className="size-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
