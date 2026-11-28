"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { useTheme } from "@/components/theme/useTheme";

type ShorePlantKind = "coastal-grass" | "ink-sprout" | "wildflower";

interface ShorePlantSpec {
  leftPercent: number;
  bottomPercent: number;
  kind: ShorePlantKind;
  heightPx: number;
  growDelay: number;
  growDuration: number;
  swayDuration: number;
  swayDelay: number;
}

/**
 * Hand-sketched coastal shoots, grass tufts, and wildflowers overlaid directly
 * onto the sandy shore of the seaside drawing—positioned clear of the bench
 * and students' feet.
 */
const SHORE_PLANTS: readonly ShorePlantSpec[] = [
  { leftPercent: 17, bottomPercent: 8, kind: "coastal-grass", heightPx: 30, growDelay: 6.9, growDuration: 3.4, swayDuration: 5.8, swayDelay: 0.2 },
  { leftPercent: 22, bottomPercent: 6, kind: "wildflower", heightPx: 34, growDelay: 7.5, growDuration: 3.9, swayDuration: 6.3, swayDelay: 0.7 },
  { leftPercent: 28, bottomPercent: 5, kind: "ink-sprout", heightPx: 28, growDelay: 8.2, growDuration: 3.6, swayDuration: 6.0, swayDelay: 1.2 },
  { leftPercent: 56, bottomPercent: 5, kind: "coastal-grass", heightPx: 26, growDelay: 8.8, growDuration: 3.5, swayDuration: 5.7, swayDelay: 0.5 },
  { leftPercent: 61, bottomPercent: 4, kind: "wildflower", heightPx: 32, growDelay: 9.4, growDuration: 4.0, swayDuration: 6.5, swayDelay: 1.1 },
  { leftPercent: 85, bottomPercent: 7, kind: "ink-sprout", heightPx: 30, growDelay: 7.9, growDuration: 3.8, swayDuration: 6.1, swayDelay: 0.9 },
  { leftPercent: 90, bottomPercent: 9, kind: "coastal-grass", heightPx: 34, growDelay: 8.6, growDuration: 3.7, swayDuration: 5.9, swayDelay: 1.5 },
  { leftPercent: 94, bottomPercent: 8, kind: "wildflower", heightPx: 30, growDelay: 9.8, growDuration: 4.1, swayDuration: 6.4, swayDelay: 0.4 },
];

/** Sketched sun ray coordinates [x1, y1, x2, y2] around center (50, 50). */
const SUN_RAYS: ReadonlyArray<readonly [number, number, number, number]> = [
  [50, 8, 50, 21],
  [50, 79, 50, 92],
  [8, 50, 21, 50],
  [79, 50, 92, 50],
  [21, 21, 30, 30],
  [70, 70, 79, 79],
  [79, 21, 70, 30],
  [30, 70, 21, 79],
  [34, 15, 38, 24],
  [66, 15, 62, 24],
  [15, 34, 24, 38],
  [85, 34, 76, 38],
  [15, 66, 24, 62],
  [85, 66, 76, 62],
  [34, 85, 38, 76],
  [66, 85, 62, 76],
];

function ShorePlantSvg({
  kind,
  heightPx,
  bloomDelay,
}: {
  kind: ShorePlantKind;
  heightPx: number;
  bloomDelay: number;
}) {
  if (kind === "coastal-grass") {
    return (
      <svg
        viewBox="0 0 34 44"
        width={Math.round(heightPx * 0.78)}
        height={heightPx}
        fill="none"
        className="overflow-visible"
      >
        <path
          d="M17 44 C15 31, 10 20, 4 11"
          strokeWidth="1.4"
          strokeLinecap="round"
          className="stroke-[#2c3325] dark:stroke-[#a3b899]"
        />
        <path
          d="M17 44 C17 29, 18 16, 17 4"
          strokeWidth="1.5"
          strokeLinecap="round"
          className="stroke-[#2c3325] dark:stroke-[#b7ccb0]"
        />
        <path
          d="M18 44 C20 32, 25 22, 30 14"
          strokeWidth="1.35"
          strokeLinecap="round"
          className="stroke-[#2c3325] dark:stroke-[#9ab090]"
        />
        {/* Soft watercolor sage tint behind blades */}
        <path
          d="M16 44 C14 33, 10 24, 7 16 C12 22, 16 32, 18 44 Z"
          className="fill-[#8ba86e]/45 dark:fill-[#6f8f54]/35"
        />
        <path
          d="M18 44 C20 33, 24 25, 28 18 C23 24, 20 33, 19 44 Z"
          className="fill-[#7c9c5e]/45 dark:fill-[#5e7d45]/35"
        />
      </svg>
    );
  }

  if (kind === "ink-sprout") {
    return (
      <svg
        viewBox="0 0 36 48"
        width={Math.round(heightPx * 0.75)}
        height={heightPx}
        fill="none"
        className="overflow-visible"
      >
        <path
          d="M18 48 C18 35, 17 24, 18 10"
          strokeWidth="1.5"
          strokeLinecap="round"
          className="stroke-[#2c3325] dark:stroke-[#b7ccb0]"
        />
        <path
          d="M17.5 27 C10 25, 6 20, 7 14 C13 15, 17 19, 17.5 27 Z"
          strokeWidth="1.2"
          className="fill-[#95b278]/70 stroke-[#2c3325] dark:fill-[#65844a]/65 dark:stroke-[#b7ccb0]"
        />
        <path
          d="M18.5 20 C25 18, 30 13, 29 7 C23 8, 19 13, 18.5 20 Z"
          strokeWidth="1.2"
          className="fill-[#a9c48c]/70 stroke-[#2c3325] dark:fill-[#769958]/65 dark:stroke-[#b7ccb0]"
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 36 52"
      width={Math.round(heightPx * 0.7)}
      height={heightPx}
      fill="none"
      className="overflow-visible"
    >
      <path
        d="M18 52 C18 38, 17 26, 18 14"
        strokeWidth="1.4"
        strokeLinecap="round"
        className="stroke-[#2c3325] dark:stroke-[#b7ccb0]"
      />
      <path
        d="M17.5 36 C11 34, 8 30, 9 25 C14 26, 17 30, 17.5 36 Z"
        strokeWidth="1.1"
        className="fill-[#8ba86e]/65 stroke-[#2c3325] dark:fill-[#5e7d45]/60 dark:stroke-[#b7ccb0]"
      />
      <g
        className="hero-anim hero-bloom-pop"
        style={{ "--bloom-delay": `${bloomDelay}s` } as CSSProperties}
      >
        <circle
          cx="18"
          cy="9"
          r="2.8"
          strokeWidth="0.9"
          className="fill-[#fef3c7] stroke-[#2c3325] dark:fill-[#fde68a]/85 dark:stroke-[#d6d3d1]"
        />
        <circle
          cx="18"
          cy="16.5"
          r="2.8"
          strokeWidth="0.9"
          className="fill-[#fef3c7] stroke-[#2c3325] dark:fill-[#fde68a]/85 dark:stroke-[#d6d3d1]"
        />
        <circle
          cx="14.2"
          cy="12.8"
          r="2.8"
          strokeWidth="0.9"
          className="fill-[#fef3c7] stroke-[#2c3325] dark:fill-[#fde68a]/85 dark:stroke-[#d6d3d1]"
        />
        <circle
          cx="21.8"
          cy="12.8"
          r="2.8"
          strokeWidth="0.9"
          className="fill-[#fef3c7] stroke-[#2c3325] dark:fill-[#fde68a]/85 dark:stroke-[#d6d3d1]"
        />
        <circle cx="18" cy="12.8" r="2" className="fill-cru-gold" />
      </g>
    </svg>
  );
}

/**
 * Right-side ink-and-watercolor seaside fellowship scene with:
 * - Seamless light/dark canvas blending
 * - Interactive sketched Sun <-> Moon button for light/dark theme switching
 * - Staggered ink-and-watercolor coastal plants growing along the sandy shore
 */
export function SeasideHeroScene() {
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === "light";

  return (
    <div className="relative mx-auto w-full max-w-[680px] aspect-[4/3] select-none">
      {/* Custom ink-and-watercolor seaside community drawing */}
      <Image
        src="/images/hero-seaside.jpg"
        alt="Hand-drawn ink and watercolor illustration of four Cru VSU students by the seaside—two sitting on a bench and two standing nearby with an acoustic guitar and a Bible, facing out toward the ocean"
        fill
        priority
        sizes="(max-width: 1024px) 100vw, 58vw"
        className="pointer-events-none object-contain mix-blend-multiply transition-[filter] duration-500 dark:mix-blend-screen dark:invert dark:hue-rotate-180 dark:brightness-[0.86] dark:saturate-[0.82]"
      />

      {/* Interactive sketched Sun (light) <-> Crescent Moon (dark) theme switch */}
      <button
        type="button"
        role="switch"
        aria-checked={isLight}
        aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"}
        title={isLight ? "Click the sun for night mode" : "Click the moon for daylight mode"}
        onClick={toggleTheme}
        className="group absolute left-[64.5%] top-[17.5%] z-20 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full transition-transform duration-300 ease-out hover:scale-110 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cru-charcoal dark:focus-visible:outline-cru-gold sm:size-20 md:size-24"
      >
        <svg
          viewBox="0 0 100 100"
          fill="none"
          aria-hidden="true"
          className="size-full overflow-visible"
        >
          {/* Daylight Sun (hidden in dark mode via CSS so zero hydration flash) */}
          <g className="dark:hidden">
            {/* Soft watercolor golden halo */}
            <circle
              cx="50"
              cy="50"
              r="34"
              className="fill-[#fde68a]/50 transition-opacity duration-300 group-hover:fill-[#fde68a]/75"
            />
            <circle
              cx="50"
              cy="50"
              r="24"
              className="fill-[#fcd34d]/45"
            />
            {/* Hand-sketched radiating rays */}
            <g className="origin-center transition-transform duration-500 ease-out group-hover:rotate-12">
              {SUN_RAYS.map(([x1, y1, x2, y2], idx) => (
                <line
                  key={idx}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  strokeWidth={idx < 4 ? "1.6" : idx < 8 ? "1.35" : "1.05"}
                  strokeLinecap="round"
                  className="stroke-[#27272a]/80"
                />
              ))}
            </g>
            {/* Sketched sun disc */}
            <circle
              cx="50"
              cy="50"
              r="14.5"
              strokeWidth="1.8"
              className="fill-[#fef08a] stroke-[#27272a]"
            />
          </g>

          {/* Night Crescent Moon (shown in dark mode) */}
          <g className="hidden dark:block">
            {/* Soft moonlit Cru-gold halo */}
            <circle
              cx="50"
              cy="50"
              r="30"
              className="fill-cru-gold/15 transition-opacity duration-300 group-hover:fill-cru-gold/25"
            />
            {/* Sketched crescent moon */}
            <path
              d="M57 32 C45 32, 36 41, 36 53 C36 65, 45 74, 57 74 C61 74, 65 72.8, 68 70.6 C58.5 70.2, 51 62.4, 51 53 C51 43.6, 58.5 35.8, 68 35.4 C65 33.2, 61 32, 57 32 Z"
              strokeWidth="1.7"
              strokeLinejoin="round"
              className="fill-[#fde68a]/85 stroke-[#fef3c7]"
            />
            {/* Delicate hand-drawn stars */}
            <path
              d="M72 28 L73.2 31.8 L77 33 L73.2 34.2 L72 38 L70.8 34.2 L67 33 L70.8 31.8 Z"
              className="fill-[#fef3c7]/85"
            />
            <circle cx="30" cy="34" r="1.4" className="fill-[#fef3c7]/70" />
            <circle cx="76" cy="54" r="1.2" className="fill-[#fde68a]/75" />
          </g>
        </svg>
      </button>

      {/* Growing ink-and-watercolor coastal plants directly along the sandy shore */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 overflow-hidden"
      >
        {SHORE_PLANTS.map((plant, index) => (
          <div
            key={index}
            style={{
              left: `${plant.leftPercent}%`,
              bottom: `${plant.bottomPercent}%`,
            }}
            className="absolute -translate-x-1/2"
          >
            <div
              className="hero-anim hero-plant-grow"
              style={
                {
                  "--grow-delay": `${plant.growDelay}s`,
                  "--grow-duration": `${plant.growDuration}s`,
                } as CSSProperties
              }
            >
              <div
                className="hero-anim hero-plant-sway"
                style={
                  {
                    "--sway-duration": `${plant.swayDuration}s`,
                    "--sway-delay": `${plant.swayDelay}s`,
                  } as CSSProperties
                }
              >
                <ShorePlantSvg
                  kind={plant.kind}
                  heightPx={plant.heightPx}
                  bloomDelay={Number(
                    (plant.growDelay + plant.growDuration * 0.62).toFixed(2)
                  )}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
