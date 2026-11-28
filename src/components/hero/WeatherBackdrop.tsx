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
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_55%_at_50%_0%,rgba(148,163,184,0.16),transparent_72%)] dark:bg-[radial-gradient(ellipse_90%_55%_at_50%_0%,rgba(51,65,85,0.38),transparent_72%)]" />

        {/* Hand-sketched overcast ink-and-watercolor cloud bank */}
        <svg
          viewBox="0 0 1200 220"
          preserveAspectRatio="xMidYMin slice"
          fill="none"
          className="hero-anim hero-cloud absolute inset-x-0 top-0 h-[195px] w-full opacity-70 dark:opacity-45"
          style={
            {
              "--cloud-duration": "38s",
              "--cloud-delay": "0s",
            } as CSSProperties
          }
        >
          {/* Left sketched rain cloud */}
          <g>
            <path
              d="M118 112 C118 88, 146 72, 176 76 C192 54, 228 50, 250 68 C272 62, 300 76, 302 98 C316 102, 324 114, 318 124 L112 124 C106 118, 110 114, 118 112 Z"
              className="fill-[#cbd5e1]/40 stroke-[#334155]/35 dark:fill-[#334155]/50 dark:stroke-slate-300/25"
              strokeWidth="1.25"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Delicate sketchbook underside hatching */}
            <path
              d="M134 118 L292 118 M152 112 L268 112"
              strokeWidth="0.9"
              strokeLinecap="round"
              strokeDasharray="10 6 18 5"
              className="stroke-[#475569]/28 dark:stroke-slate-300/20"
            />
          </g>

          {/* Right sketched rain cloud */}
          <g>
            <path
              d="M780 98 C780 74, 808 60, 836 64 C852 42, 892 38, 916 58 C940 52, 968 68, 970 92 C984 96, 992 108, 986 118 L774 118 C768 112, 772 102, 780 98 Z"
              className="fill-[#cbd5e1]/36 stroke-[#334155]/32 dark:fill-[#334155]/45 dark:stroke-slate-300/22"
              strokeWidth="1.25"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M798 112 L964 112 M824 106 L940 106"
              strokeWidth="0.9"
              strokeLinecap="round"
              strokeDasharray="12 6 16 5"
              className="stroke-[#475569]/25 dark:stroke-slate-300/18"
            />
          </g>
        </svg>

        {/* Delicate graphite/ink diagonal rain streaks */}
        <div className="absolute inset-0">
          {RAIN_DROPS.map(([left, height, duration, delay, alpha], index) => (
            <span
              key={index}
              className="hero-anim hero-rain-drop absolute top-0 w-[1.15px] rounded-full bg-[#334155]/75 dark:bg-slate-300/65"
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
        {/* Soft watercolor sky tint on top-left + warm golden sun wash on upper-right */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_48%_at_14%_12%,rgba(56,189,248,0.11),transparent_68%),radial-gradient(ellipse_56%_50%_at_78%_18%,rgba(253,185,19,0.16),transparent_68%)] dark:bg-[radial-gradient(ellipse_58%_48%_at_14%_12%,rgba(56,189,248,0.05),transparent_68%),radial-gradient(ellipse_54%_50%_at_78%_18%,rgba(253,185,19,0.11),transparent_68%)]" />

        {/* Drifting hand-sketched ink-and-watercolor clouds */}
        <svg
          viewBox="0 0 1200 260"
          preserveAspectRatio="xMidYMin slice"
          fill="none"
          className="hero-anim hero-cloud absolute inset-x-0 top-6 h-[220px] w-full"
          style={
            {
              "--cloud-duration": "44s",
              "--cloud-delay": "-6s",
            } as CSSProperties
          }
        >
          {/* Left airy sketched cloud */}
          <g>
            <path
              d="M84 128 C84 104, 110 88, 138 92 C152 68, 190 62, 214 82 C236 74, 266 88, 268 112 C282 116, 288 126, 282 136 L78 136 C72 132, 76 128, 84 128 Z"
              className="fill-[#f8fafc]/80 stroke-[#475569]/24 dark:fill-white/[0.05] dark:stroke-white/15"
              strokeWidth="1.15"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M104 130 L256 130"
              strokeWidth="0.85"
              strokeLinecap="round"
              strokeDasharray="14 7 22 6"
              className="stroke-[#64748b]/20 dark:stroke-white/10"
            />
          </g>

          {/* Center-left distant sketched cloud */}
          <path
            d="M420 92 C420 76, 438 66, 458 69 C468 54, 492 52, 506 65 C522 61, 540 72, 542 88 C550 90, 554 96, 550 102 L416 102 C412 98, 415 94, 420 92 Z"
            className="fill-[#f8fafc]/65 stroke-[#475569]/20 dark:fill-white/[0.04] dark:stroke-white/12"
            strokeWidth="1.05"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Right warm-tinted sketched cloud */}
          <g>
            <path
              d="M876 138 C876 116, 902 102, 928 106 C942 84, 978 80, 1002 98 C1022 92, 1048 104, 1050 126 C1062 130, 1066 138, 1060 146 L870 146 C866 142, 869 138, 876 138 Z"
              className="fill-[#fffbeb]/75 stroke-[#78716c]/22 dark:fill-cru-gold/[0.06] dark:stroke-cru-gold/18"
              strokeWidth="1.15"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M896 140 L1038 140"
              strokeWidth="0.85"
              strokeLinecap="round"
              strokeDasharray="12 7 18 6"
              className="stroke-[#78716c]/18 dark:stroke-cru-gold/14"
            />
          </g>
        </svg>
      </div>
    </div>
  );
}
