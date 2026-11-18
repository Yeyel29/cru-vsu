"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export interface RailSection {
  id: string;
  label: string;
}

interface LeftProgressRailProps {
  sections: RailSection[];
}

function getScaleForDistance(distance: number): number {
  if (distance === 0) return 1;
  if (distance === 1) return 0.68;
  if (distance === 2) return 0.44;
  return 0.25;
}

/**
 * Fixed left-side vertical progress indicator for wide viewports (>= 1360px).
 * Displays horizontal hairline ticks with proximity-based dock-wave scaleX falloff.
 */
export function LeftProgressRail({ sections }: LeftProgressRailProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    if (sections.length === 0) return;

    const handleScroll = () => {
      const scrollMiddle = window.scrollY + window.innerHeight * 0.38;

      let currentIdx = 0;
      for (let i = 0; i < sections.length; i++) {
        const el = document.getElementById(sections[i].id);
        if (el && el.offsetTop <= scrollMiddle) {
          currentIdx = i;
        }
      }
      setActiveIndex(currentIdx);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [sections]);

  const waveCenter = hoveredIndex !== null ? hoveredIndex : activeIndex;

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <aside
      aria-label="Page sections progress"
      className="pointer-events-none fixed left-3 top-1/2 z-40 hidden -translate-y-1/2 min-[1360px]:flex"
    >
      <nav
        aria-label="Sections on this page"
        className="pointer-events-auto grid w-12 shrink-0 content-center"
        style={{ gridTemplateRows: `repeat(${sections.length}, 24px)` }}
        onMouseLeave={() => setHoveredIndex(null)}
      >
        {sections.map((section, idx) => {
          const isActive = idx === activeIndex;
          const isHovered = idx === hoveredIndex;
          const distance = Math.abs(idx - waveCenter);
          const scaleX = getScaleForDistance(distance);

          return (
            <button
              key={section.id}
              type="button"
              onClick={() => scrollToSection(section.id)}
              onMouseEnter={() => setHoveredIndex(idx)}
              aria-current={isActive ? "step" : undefined}
              aria-label={`Jump to ${section.label}`}
              className="group relative flex h-6 w-12 cursor-pointer items-center focus:outline-none"
            >
              <span
                className={cn(
                  "block h-0.5 w-12 origin-left rounded-full transition-all duration-200 ease-out",
                  isActive
                    ? "bg-cru-gold-hover"
                    : isHovered
                    ? "bg-cru-charcoal"
                    : "bg-neutral-900/20"
                )}
                style={{ transform: `scaleX(${scaleX})` }}
              />

              {/* Floating frosted pill label on hover */}
              {isHovered && (
                <span className="pointer-events-none absolute left-14 whitespace-nowrap rounded-full border border-neutral-900/10 bg-white/95 px-3 py-1 text-xs font-medium text-cru-charcoal shadow-sm backdrop-blur-md">
                  {section.label}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
