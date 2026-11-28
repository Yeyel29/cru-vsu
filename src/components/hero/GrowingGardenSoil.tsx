import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

type PlantKind = "sprout" | "wildflower" | "grass";
type FlowerTone = "cream" | "gold" | "terracotta";

interface PlantSpec {
  leftPercent: number;
  kind: PlantKind;
  heightPx: number;
  growDelay: number;
  growDuration: number;
  swayDuration: number;
  swayDelay: number;
  flowerTone?: FlowerTone;
  desktopOnly?: boolean;
}

/**
 * Staggered flat-2D pastoral plants anchored along the bottom soil strip.
 * Growth begins around 6.8s-11.2s, right as the opening rain clears into sun.
 */
const PLANTS: readonly PlantSpec[] = [
  { leftPercent: 4, kind: "grass", heightPx: 38, growDelay: 6.9, growDuration: 3.4, swayDuration: 5.8, swayDelay: 0.2 },
  { leftPercent: 9, kind: "wildflower", heightPx: 54, growDelay: 7.4, growDuration: 4.1, swayDuration: 6.4, swayDelay: 0.8, flowerTone: "cream" },
  { leftPercent: 16, kind: "sprout", heightPx: 46, growDelay: 8.1, growDuration: 3.8, swayDuration: 6.0, swayDelay: 1.4, desktopOnly: true },
  { leftPercent: 22, kind: "wildflower", heightPx: 48, growDelay: 8.8, growDuration: 4.0, swayDuration: 6.8, swayDelay: 0.5, flowerTone: "gold" },
  { leftPercent: 29, kind: "grass", heightPx: 36, growDelay: 7.7, growDuration: 3.3, swayDuration: 5.5, swayDelay: 1.9, desktopOnly: true },
  { leftPercent: 36, kind: "sprout", heightPx: 50, growDelay: 9.4, growDuration: 4.2, swayDuration: 6.6, swayDelay: 0.9 },
  { leftPercent: 44, kind: "wildflower", heightPx: 44, growDelay: 10.1, growDuration: 3.9, swayDuration: 6.1, swayDelay: 1.6, flowerTone: "terracotta", desktopOnly: true },
  { leftPercent: 53, kind: "grass", heightPx: 40, growDelay: 7.2, growDuration: 3.5, swayDuration: 5.9, swayDelay: 0.4 },
  { leftPercent: 60, kind: "wildflower", heightPx: 52, growDelay: 8.5, growDuration: 4.2, swayDuration: 6.7, swayDelay: 1.2, flowerTone: "cream", desktopOnly: true },
  { leftPercent: 68, kind: "sprout", heightPx: 46, growDelay: 9.2, growDuration: 3.9, swayDuration: 6.3, swayDelay: 0.7 },
  { leftPercent: 75, kind: "grass", heightPx: 36, growDelay: 7.9, growDuration: 3.4, swayDuration: 5.7, swayDelay: 2.1, desktopOnly: true },
  { leftPercent: 82, kind: "wildflower", heightPx: 56, growDelay: 9.8, growDuration: 4.3, swayDuration: 6.9, swayDelay: 0.3, flowerTone: "gold" },
  { leftPercent: 89, kind: "sprout", heightPx: 44, growDelay: 10.6, growDuration: 3.8, swayDuration: 6.1, swayDelay: 1.5, desktopOnly: true },
  { leftPercent: 95, kind: "wildflower", heightPx: 48, growDelay: 8.3, growDuration: 4.0, swayDuration: 6.5, swayDelay: 1.0, flowerTone: "cream" },
];

const PETAL_CLASSES: Record<FlowerTone, string> = {
  cream: "fill-[#fffbeb] dark:fill-[#fef3c7]/90",
  gold: "fill-cru-gold dark:fill-cru-gold/90",
  terracotta: "fill-[#fb923c] dark:fill-[#f59e0b]/85",
};

function PlantSvg({
  kind,
  heightPx,
  flowerTone = "cream",
  bloomDelay,
}: {
  kind: PlantKind;
  heightPx: number;
  flowerTone?: FlowerTone;
  bloomDelay: number;
}) {
  if (kind === "grass") {
    return (
      <svg
        viewBox="0 0 36 48"
        width={Math.round(heightPx * 0.75)}
        height={heightPx}
        fill="none"
        className="overflow-visible"
      >
        <path
          d="M18 48 C17 34, 12 22, 6 12 C13 18, 17 29, 19 48 Z"
          className="fill-[#7cb342] dark:fill-[#3f6212]"
        />
        <path
          d="M18 48 C18 30, 19 16, 18 4 C21 15, 22 30, 20 48 Z"
          className="fill-[#65a30d] dark:fill-[#4d7c0f]"
        />
        <path
          d="M19 48 C21 34, 26 23, 31 15 C25 22, 22 32, 21 48 Z"
          className="fill-[#8bc34a] dark:fill-[#365314]"
        />
      </svg>
    );
  }

  if (kind === "sprout") {
    return (
      <svg
        viewBox="0 0 40 56"
        width={Math.round(heightPx * 0.72)}
        height={heightPx}
        fill="none"
        className="overflow-visible"
      >
        {/* Slender stem */}
        <path
          d="M20 56 C20 40, 19 26, 20 12"
          strokeWidth="2.4"
          strokeLinecap="round"
          className="stroke-[#558b2f] dark:stroke-[#4d7c0f]"
        />
        {/* Left leaf */}
        <path
          d="M19.5 29 C11 27, 6 21, 7 15 C14 15, 19 20, 19.5 29 Z"
          className="fill-[#7cb342] dark:fill-[#4d7c0f]"
        />
        {/* Right leaf */}
        <path
          d="M20.5 22 C28 19, 34 13, 33 7 C26 7, 21 13, 20.5 22 Z"
          className="fill-[#9ccc65] dark:fill-[#65a30d]"
        />
        {/* Tiny crown bud */}
        <ellipse
          cx="20"
          cy="10"
          rx="2.6"
          ry="4.2"
          className="fill-[#aed581] dark:fill-[#84cc16]"
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 40 60"
      width={Math.round(heightPx * 0.68)}
      height={heightPx}
      fill="none"
      className="overflow-visible"
    >
      {/* Stem */}
      <path
        d="M20 60 C20 43, 18.5 28, 20 14"
        strokeWidth="2.2"
        strokeLinecap="round"
        className="stroke-[#558b2f] dark:stroke-[#4d7c0f]"
      />
      {/* Basal leaves */}
      <path
        d="M19.5 42 C12 40, 8 34, 9 29 C15 30, 19 35, 19.5 42 Z"
        className="fill-[#7cb342] dark:fill-[#3f6212]"
      />
      <path
        d="M20.5 36 C27 33, 31 28, 30 23 C24 24, 21 29, 20.5 36 Z"
        className="fill-[#8bc34a] dark:fill-[#4d7c0f]"
      />
      {/* Flat 2D wildflower blossom */}
      <g
        className="hero-anim hero-bloom-pop"
        style={{ "--bloom-delay": `${bloomDelay}s` } as CSSProperties}
      >
        <circle cx="20" cy="8.5" r="3.4" className={PETAL_CLASSES[flowerTone]} />
        <circle cx="20" cy="17.5" r="3.4" className={PETAL_CLASSES[flowerTone]} />
        <circle cx="15.5" cy="13" r="3.4" className={PETAL_CLASSES[flowerTone]} />
        <circle cx="24.5" cy="13" r="3.4" className={PETAL_CLASSES[flowerTone]} />
        <circle
          cx="20"
          cy="13"
          r="2.4"
          className={
            flowerTone === "gold"
              ? "fill-[#92400e] dark:fill-[#78350f]"
              : "fill-cru-gold"
          }
        />
      </g>
    </svg>
  );
}

/**
 * Edge-to-edge curved flat-2D soil strip with staggered pastoral plants that
 * slowly grow upward after the opening rain and gently sway thereafter.
 */
export function GrowingGardenSoil() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-28 overflow-hidden select-none"
    >
      {/* Staggered fixed-aspect plant clusters seated into the soil ridge */}
      <div className="absolute inset-x-0 bottom-[22px] sm:bottom-[26px]">
        {PLANTS.map((plant, index) => (
          <div
            key={index}
            style={{ left: `${plant.leftPercent}%` }}
            className={cn(
              "absolute bottom-0 -translate-x-1/2",
              plant.desktopOnly && "hidden sm:block"
            )}
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
                <PlantSvg
                  kind={plant.kind}
                  heightPx={plant.heightPx}
                  flowerTone={plant.flowerTone}
                  bloomDelay={Number((plant.growDelay + plant.growDuration * 0.62).toFixed(2))}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Full-bleed curved flat-2D grass lip & layered soil base */}
      <svg
        viewBox="0 0 1440 56"
        preserveAspectRatio="none"
        className="absolute inset-x-0 bottom-0 h-[34px] w-full sm:h-[40px]"
      >
        {/* Subtle grassy ridge peeking above the soil */}
        <path
          d="M0 24 Q180 8, 360 20 T720 18 T1080 14 T1440 22 L1440 56 L0 56 Z"
          className="fill-[#8cc24b] dark:fill-[#334d1f]"
        />
        {/* Upper warm earth soil */}
        <path
          d="M0 29 Q220 17, 460 27 T960 24 T1440 28 L1440 56 L0 56 Z"
          className="fill-[#7c5c43] dark:fill-[#3b2d22]"
        />
        {/* Deeper soil bed */}
        <path
          d="M0 39 Q320 32, 680 39 T1440 37 L1440 56 L0 56 Z"
          className="fill-[#624733] dark:fill-[#2a2018]"
        />
        {/* Subtle flat soil pebbles / loam texture */}
        <ellipse cx="190" cy="43" rx="16" ry="3.2" className="fill-[#8d6b50]/55 dark:fill-[#4a392b]/65" />
        <ellipse cx="520" cy="46" rx="22" ry="3.5" className="fill-[#523b2a]/55 dark:fill-[#1f1712]/70" />
        <ellipse cx="890" cy="42" rx="18" ry="3" className="fill-[#8d6b50]/50 dark:fill-[#4a392b]/60" />
        <ellipse cx="1230" cy="45" rx="20" ry="3.4" className="fill-[#523b2a]/50 dark:fill-[#1f1712]/70" />
      </svg>
    </div>
  );
}
