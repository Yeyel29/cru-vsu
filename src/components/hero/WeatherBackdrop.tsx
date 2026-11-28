import type { CSSProperties } from "react";

/**
 * Deterministic diagonal rain streaks:
 * [leftPercent, heightPx, durationSeconds, delaySeconds, opacity]
 */
const RAIN_DROPS: ReadonlyArray<
  readonly [number, number, number, number, number]
> = [
  [5, 24, 1.35, 0.1, 0.3],
  [10, 30, 1.15, 0.65, 0.38],
  [15, 22, 1.45, 0.35, 0.26],
  [21, 28, 1.25, 0.9, 0.34],
  [26, 20, 1.5, 0.2, 0.24],
  [31, 32, 1.18, 0.55, 0.38],
  [36, 24, 1.38, 1.05, 0.28],
  [41, 26, 1.22, 0.4, 0.32],
  [46, 30, 1.3, 0.85, 0.36],
  [52, 22, 1.48, 0.15, 0.26],
  [57, 28, 1.2, 0.72, 0.35],
  [62, 24, 1.4, 0.3, 0.28],
  [67, 32, 1.16, 0.95, 0.38],
  [72, 22, 1.44, 0.5, 0.26],
  [77, 26, 1.28, 0.05, 0.32],
  [82, 30, 1.2, 0.62, 0.36],
  [87, 24, 1.36, 1.12, 0.28],
  [92, 28, 1.24, 0.38, 0.34],
  [96, 22, 1.46, 0.8, 0.25],
  [18, 26, 1.32, 1.22, 0.3],
  [49, 25, 1.26, 1.18, 0.3],
  [79, 24, 1.42, 1.3, 0.28],
];

/**
 * Pure CSS + flat 2D SVG atmospheric backdrop cycling gently between soft rain
 * and warm sunshine. Zero JS animation loops; pauses automatically via
 * `[data-paused="true"] .hero-anim` when scrolled out of view.
 */
export function WeatherBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden select-none"
    >
      {/* RAINY LAYER (0s-7s, then softly cycles back every 18s) */}
      <div className="hero-anim hero-rain-layer absolute inset-0">
        {/* Soft overcast wash across the upper sky */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_55%_at_50%_0%,rgba(148,163,184,0.18),transparent_72%)] dark:bg-[radial-gradient(ellipse_90%_55%_at_50%_0%,rgba(51,65,85,0.42),transparent_72%)]" />

        {/* Subtle flat overcast cloud bank */}
        <svg
          viewBox="0 0 1200 220"
          preserveAspectRatio="xMidYMin slice"
          className="hero-anim hero-cloud absolute inset-x-0 top-0 h-[190px] w-full opacity-55 dark:opacity-35"
          style={
            {
              "--cloud-duration": "38s",
              "--cloud-delay": "0s",
            } as CSSProperties
          }
        >
          <path
            d="M120 110 C120 84, 148 68, 178 72 C192 50, 228 46, 250 64 C272 58, 300 72, 302 96 C318 100, 326 112, 320 124 L112 124 C106 118, 110 112, 120 110 Z"
            className="fill-[#cbd5e1]/55 dark:fill-[#334155]/60"
          />
          <path
            d="M780 96 C780 72, 808 58, 836 62 C852 40, 892 36, 916 56 C940 50, 968 66, 970 90 C986 94, 994 106, 988 118 L774 118 C768 110, 772 100, 780 96 Z"
            className="fill-[#cbd5e1]/50 dark:fill-[#334155]/55"
          />
        </svg>

        {/* Delicate diagonal rain streaks */}
        <div className="absolute inset-0">
          {RAIN_DROPS.map(([left, height, duration, delay, alpha], index) => (
            <span
              key={index}
              className="hero-anim hero-rain-drop absolute top-0 w-[1.25px] rounded-full bg-slate-500/80 dark:bg-slate-300/70"
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

      {/* SUNNY LAYER (rises as rain clears, warming the garden) */}
      <div className="hero-anim hero-sun-layer absolute inset-0">
        {/* Soft cerulean sky wash on top-left + warm golden sun glow on top-right */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_62%_50%_at_14%_12%,rgba(56,189,248,0.13),transparent_68%),radial-gradient(ellipse_58%_52%_at_84%_14%,rgba(253,185,19,0.20),transparent_68%)] dark:bg-[radial-gradient(ellipse_60%_50%_at_14%_12%,rgba(56,189,248,0.06),transparent_68%),radial-gradient(ellipse_56%_52%_at_84%_14%,rgba(253,185,19,0.14),transparent_68%)]" />

        {/* Subtle flat 2D sun/dawn orb (positioned clear of the top-right PullChainLamp) */}
        <div className="absolute right-[13%] top-[14%] size-20 rounded-full bg-[#fde68a]/55 dark:bg-cru-gold/20 sm:size-24" />
        <div className="absolute right-[13%] top-[14%] size-20 scale-150 rounded-full bg-[#fef3c7]/35 blur-xl dark:bg-cru-gold/10 sm:size-24" />

        {/* Drifting flat 2D pastoral clouds */}
        <svg
          viewBox="0 0 1200 260"
          preserveAspectRatio="xMidYMin slice"
          className="hero-anim hero-cloud absolute inset-x-0 top-6 h-[220px] w-full"
          style={
            {
              "--cloud-duration": "44s",
              "--cloud-delay": "-6s",
            } as CSSProperties
          }
        >
          {/* Left fluffy flat cloud */}
          <path
            d="M84 128 C84 104, 110 88, 138 92 C152 68, 190 62, 214 82 C236 74, 266 88, 268 112 C284 116, 290 126, 284 136 L78 136 C72 132, 76 128, 84 128 Z"
            className="fill-[#f8fafc] dark:fill-white/[0.06]"
          />
          {/* Center-left distant small cloud */}
          <path
            d="M420 92 C420 76, 438 66, 458 69 C468 54, 492 52, 506 65 C522 61, 540 72, 542 88 C550 90, 554 96, 550 102 L416 102 C412 98, 415 94, 420 92 Z"
            className="fill-[#f8fafc]/80 dark:fill-white/[0.05]"
          />
          {/* Right warm-lit flat cloud */}
          <path
            d="M876 138 C876 116, 902 102, 928 106 C942 84, 978 80, 1002 98 C1022 92, 1048 104, 1050 126 C1064 130, 1068 138, 1062 146 L870 146 C866 142, 869 138, 876 138 Z"
            className="fill-[#fffbeb]/85 dark:fill-cru-gold/[0.07]"
          />
        </svg>
      </div>
    </div>
  );
}
