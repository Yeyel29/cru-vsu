"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/components/theme/useTheme";
import { cn } from "@/lib/utils";

/** Pull distance (px) the chain must pass before letting go switches the lamp. */
const CATCH_DISTANCE = 26;
const MAX_PULL = 52;
/** Resting y of the chain end inside the 72x150 viewBox. */
const CHAIN_REST_Y = 86;
const SPRING_STIFFNESS = 300;
const SPRING_DAMPING = 18;

/** [x, y, radius, driftX, driftY, durationSeconds, delaySeconds] */
const DUST_MOTES: ReadonlyArray<readonly [number, number, number, number, number, number, number]> = [
  [24, 66, 1.2, -6, 40, 7, 0],
  [36, 72, 1.6, 4, 50, 9, 1.5],
  [48, 64, 1, 8, 45, 8, 3],
  [30, 86, 1.3, -8, 36, 10, 0.8],
  [42, 92, 1.1, 6, 38, 7.5, 2.2],
  [20, 102, 1, -4, 30, 9, 4],
  [54, 100, 1.4, 10, 34, 8.5, 5.2],
];

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Damped spring for the chain. While dragging, the chain follows the pointer;
 * on release it springs back to rest.
 */
function createSpring(render: (y: number) => void) {
  let y = 0;
  let velocity = 0;
  let frame = 0;
  let last = 0;
  let dragging = false;

  const tick = (now: number) => {
    const dt = Math.min((now - last) / 1000, 0.032);
    last = now;

    if (!dragging) {
      const acceleration = -SPRING_STIFFNESS * y - SPRING_DAMPING * velocity;
      velocity += acceleration * dt;
      y += velocity * dt;

      if (Math.abs(y) < 0.05 && Math.abs(velocity) < 0.05) {
        y = 0;
        velocity = 0;
        render(0);
        frame = 0;
        return;
      }
    }

    render(y);
    frame = requestAnimationFrame(tick);
  };

  const start = () => {
    if (frame) return;
    last = performance.now();
    frame = requestAnimationFrame(tick);
  };

  return {
    drag(next: number) {
      dragging = true;
      y = next;
      velocity = 0;
      render(y);
    },
    release() {
      dragging = false;
      if (prefersReducedMotion()) {
        y = 0;
        velocity = 0;
        render(0);
        return;
      }
      start();
    },
    kick(amount: number) {
      dragging = false;
      if (prefersReducedMotion()) return;
      y = amount;
      velocity = 0;
      render(y);
      start();
    },
    destroy() {
      cancelAnimationFrame(frame);
      frame = 0;
    },
  };
}

/**
 * Pull-chain desk lamp pinned to the top-right corner. It is the site's theme
 * switch: lamp on is light mode, lamp off is dark mode.
 *
 * All visual on/off differences are CSS `dark:` variants, so a saved dark theme
 * never flashes a lit lamp before hydration.
 */
export function PullChainLamp() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [hiddenForHero, setHiddenForHero] = useState(pathname === "/");

  const handleRef = useRef<SVGGElement>(null);
  const chainRef = useRef<SVGLineElement>(null);
  const springRef = useRef<ReturnType<typeof createSpring> | null>(null);
  const gesture = useRef({ active: false, startY: 0, maxPull: 0, moved: 0 });

  useEffect(() => {
    if (pathname !== "/") {
      setHiddenForHero(false);
      return;
    }

    const hero = document.getElementById("overview");
    if (!hero || typeof IntersectionObserver === "undefined") {
      setHiddenForHero(false);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setHiddenForHero(entry.isIntersecting);
      },
      { threshold: 0.12 }
    );

    observer.observe(hero);
    return () => observer.disconnect();
  }, [pathname]);

  useEffect(() => {
    const spring = createSpring((y) => {
      handleRef.current?.style.setProperty("transform", `translateY(${y}px)`);
      chainRef.current?.setAttribute("y2", String(CHAIN_REST_Y + y));
    });
    springRef.current = spring;
    return () => {
      spring.destroy();
      springRef.current = null;
    };
  }, []);

  const handlePointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    gesture.current = { active: true, startY: event.clientY, maxPull: 0, moved: 0 };
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    const g = gesture.current;
    if (!g.active) return;
    const dy = event.clientY - g.startY;
    const pull = Math.min(Math.max(dy, 0), MAX_PULL);
    g.moved = Math.max(g.moved, Math.abs(dy));
    g.maxPull = Math.max(g.maxPull, pull);
    springRef.current?.drag(pull);
  };

  const handlePointerUp = () => {
    const g = gesture.current;
    if (!g.active) return;
    g.active = false;

    const isTap = g.moved < 5;
    if (isTap) {
      springRef.current?.kick(20);
      toggleTheme();
    } else {
      springRef.current?.release();
      if (g.maxPull >= CATCH_DISTANCE) toggleTheme();
    }
  };

  const handlePointerCancel = () => {
    gesture.current.active = false;
    springRef.current?.release();
  };

  /** Keyboard activation only (detail 0); pointer input is handled above. */
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (event.detail !== 0) return;
    springRef.current?.kick(28);
    toggleTheme();
  };

  return (
    // The outer box clips at the viewport edge so the light cone never adds horizontal scroll.
    // On the landing page, the lamp stays tucked away while the hero Sun/Moon toggle is in view.
    <div
      aria-hidden={hiddenForHero || undefined}
      className={cn(
        "pointer-events-none fixed right-0 top-0 z-[60] h-[170px] w-[160px] overflow-hidden transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
        hiddenForHero ? "-translate-y-full opacity-0" : "translate-y-0 opacity-100"
      )}
    >
      <div className="absolute right-1.5 top-0 h-[150px] w-[72px] sm:right-6">
        <svg
          viewBox="0 0 72 150"
          width="72"
          height="150"
          aria-hidden="true"
          focusable="false"
          className="absolute inset-0 overflow-visible"
        >
        <defs>
          <linearGradient id="lamp-cone" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fdb913" stopOpacity="0.26" />
            <stop offset="1" stopColor="#fdb913" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Light cone and drifting dust: only rendered while the lamp is on */}
        <g className="dark:hidden">
          <polygon points="10,53 62,53 118,150 -46,150" fill="url(#lamp-cone)" />
          {DUST_MOTES.map(([cx, cy, r, dx, dy, duration, delay], index) => (
            <circle
              key={index}
              cx={cx}
              cy={cy}
              r={r}
              fill="#eaa400"
              className="lamp-dust"
              style={
                {
                  "--dust-dx": `${dx}px`,
                  "--dust-dy": `${dy}px`,
                  "--dust-duration": `${duration}s`,
                  "--dust-delay": `${delay}s`,
                } as React.CSSProperties
              }
            />
          ))}
        </g>

        {/* Ceiling cord and shade */}
        <line x1="36" y1="0" x2="36" y2="22" strokeWidth="1.5" className="stroke-zinc-500" />
        <path
          d="M8 52 C8 32 20 22 36 22 C52 22 64 32 64 52 Z"
          className="fill-zinc-500"
        />
        <ellipse
          cx="36"
          cy="52"
          rx="28"
          ry="3.5"
          className="fill-[#fff3c4] dark:fill-zinc-600"
        />

        {/* Pull chain and handle */}
        <line
          ref={chainRef}
          x1="50"
          y1="53"
          x2="50"
          y2={CHAIN_REST_Y}
          strokeWidth="1.5"
          className="stroke-zinc-500"
        />
        <g ref={handleRef}>
          <circle cx="50" cy={CHAIN_REST_Y} r="2.2" className="fill-cru-charcoal dark:fill-cru-ink" />
          <polygon points="50,89 43.5,102 56.5,102" className="fill-cru-charcoal dark:fill-cru-ink" />
        </g>
      </svg>

      <button
        type="button"
        role="switch"
        aria-checked={theme === "light"}
        aria-label="Light mode"
        title="Pull the chain to switch between light and dark"
        tabIndex={hiddenForHero ? -1 : 0}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onClick={handleClick}
        className={cn(
          "absolute left-[28px] top-[76px] h-[56px] w-[44px] touch-none select-none rounded-md cursor-grab active:cursor-grabbing focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cru-charcoal dark:focus-visible:outline-cru-ink",
          hiddenForHero ? "pointer-events-none" : "pointer-events-auto"
        )}
      />
      </div>
    </div>
  );
}
