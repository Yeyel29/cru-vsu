import type { CSSProperties } from "react";

/**
 * Deterministic delicate ink-stroke diagonal rain streaks:
 * [leftPercent, heightPx, durationSeconds, delaySeconds, opacity]
 */
const RAIN_DROPS: ReadonlyArray<
  readonly [number, number, number, number, number]
> = [
  [5, 22, 1.35, 0.1, 0.28],
  [10, 28, 1.15, 0.65, 0.34],
  [15, 20, 1.45, 0.35, 0.24],
  [21, 26, 1.25, 0.9, 0.32],
  [26, 19, 1.5, 0.2, 0.22],
  [31, 30, 1.18, 0.55, 0.34],
  [36, 22, 1.38, 1.05, 0.26],
  [41, 25, 1.22, 0.4, 0.3],
  [46, 28, 1.3, 0.85, 0.32],
  [52, 20, 1.48, 0.15, 0.24],
  [57, 26, 1.2, 0.72, 0.32],
  [62, 22, 1.4, 0.3, 0.26],
  [67, 30, 1.16, 0.95, 0.34],
  [72, 20, 1.44, 0.5, 0.24],
  [77, 25, 1.28, 0.05, 0.3],
  [82, 28, 1.2, 0.62, 0.32],
  [87, 22, 1.36, 1.12, 0.26],
  [92, 26, 1.24, 0.38, 0.3],
  [96, 20, 1.46, 0.8, 0.24],
  [18, 24, 1.32, 1.22, 0.28],
  [49, 24, 1.26, 1.18, 0.28],
  [79, 22, 1.42, 1.3, 0.26],
];

/**
 * Pure CSS + hand-sketched ink-and-watercolor SVG atmospheric backdrop cycling
 * gently between soft rain and warm sunshine. Zero JS animation loops; pauses
 * automatically via `[data-paused="true"] .hero-anim` when scrolled off-screen.
 */
export function WeatherBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden select-none"
    >
      {/* RAINY LAYER (0s-7s, then softly cycles back every 18s) */}
      <div className="hero-anim hero-rain-layer absolute inset-0">
        {/* Soft watercolor overcast wash across the upper sky */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_55%_at_50%_0%,rgba(148,163,184,0.14),transparent_72%)] dark:bg-[radial-gradient(ellipse_90%_55%_at_50%_0%,rgba(30,41,59,0.42),transparent_72%)]" />

        {/* Subtle hand-sketched overcast clouds tucked cleanly in the upper-left sky */}
        <svg
          viewBox="0 0 1200 200"
          preserveAspectRatio="xMidYMin slice"
          fill="none"
          className="hero-anim hero-cloud absolute inset-x-0 top-12 h-[150px] w-full opacity-50 dark:opacity-35"
          style={
            {
              "--cloud-duration": "42s",
              "--cloud-delay": "0s",
            } as CSSProperties
          }
        >
          <g>
            <path
              d="M90 92 C90 74, 110 62, 132 66 C144 50, 172 48, 188 61 C204 56, 226 68, 228 84 C238 87, 244 95, 239 102 L86 102 C82 98, 84 94, 90 92 Z"
              className="fill-[#cbd5e1]/35 stroke-[#334155]/28 dark:fill-[#334155]/45 dark:stroke-slate-300/20"
              strokeWidth="1.1"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M104 97 L220 97"
              strokeWidth="0.85"
              strokeLinecap="round"
              strokeDasharray="10 6 14 5"
              className="stroke-[#475569]/22 dark:stroke-slate-300/16"
            />
          </g>

          <path
            d="M350 74 C350 62, 364 54, 380 56 C388 45, 408 43, 419 53 C431 50, 446 58, 448 70 C454 72, 458 77, 454 82 L346 82 C343 79, 346 76, 350 74 Z"
            className="fill-[#cbd5e1]/30 stroke-[#334155]/24 dark:fill-[#334155]/35 dark:stroke-slate-300/18"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {/* Delicate graphite/ink diagonal rain streaks */}
        <div className="absolute inset-0">
          {RAIN_DROPS.map(([left, height, duration, delay, alpha], index) => (
            <span
              key={index}
              className="hero-anim hero-rain-drop absolute top-0 w-[1.15px] rounded-full bg-[#334155]/70 dark:bg-slate-300/60"
              style={
                {
                  left: `${left}%`,
                  height: `${height}px`,
                  "--rain-duration": `${duration}s`,
                  "--rain-delay": `${delay}s`,
                  "--rain-alpha": alpha,
                } as CSSProperties
              }
            />
          ))}
        </div>
      </div>

      {/* SUNNY LAYER (rises as rain clears, warming the seaside drawing) */}
      <div className="hero-anim hero-sun-layer absolute inset-0">
        {/* Soft watercolor sky tint on top-left + subtle warm golden sun wash on upper-right */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_14%_12%,rgba(56,189,248,0.09),transparent_68%),radial-gradient(ellipse_52%_48%_at_76%_18%,rgba(253,185,19,0.14),transparent_68%)] dark:bg-[radial-gradient(ellipse_55%_45%_at_14%_12%,rgba(56,189,248,0.04),transparent_68%),radial-gradient(ellipse_52%_48%_at_76%_18%,rgba(253,185,19,0.08),transparent_68%)]" />

        {/* Subtle drifting hand-sketched watercolor clouds on the left open sky */}
        <svg
          viewBox="0 0 1200 220"
          preserveAspectRatio="xMidYMin slice"
          fill="none"
          className="hero-anim hero-cloud absolute inset-x-0 top-10 h-[160px] w-full"
          style={
            {
              "--cloud-duration": "48s",
              "--cloud-delay": "-6s",
            } as CSSProperties
          }
        >
          <g>
            <path
              d="M84 104 C84 86, 104 74, 126 78 C138 60, 166 56, 184 71 C202 65, 224 76, 226 94 C236 97, 240 104, 236 111 L80 111 C76 108, 78 105, 84 104 Z"
              className="fill-[#f8fafc]/75 stroke-[#475569]/20 dark:fill-white/[0.04] dark:stroke-white/12"
              strokeWidth="1.05"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M98 106 L216 106"
              strokeWidth="0.8"
              strokeLinecap="round"
              strokeDasharray="12 6 16 5"
              className="stroke-[#64748b]/18 dark:stroke-white/10"
            />
          </g>

          <path
            d="M336 80 C336 68, 350 60, 366 63 C374 51, 394 49, 405 59 C418 56, 432 64, 434 76 C440 78, 443 83, 440 88 L332 88 C329 85, 331 82, 336 80 Z"
            className="fill-[#f8fafc]/60 stroke-[#475569]/18 dark:fill-white/[0.03] dark:stroke-white/10"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}
