"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { GitBranch } from "lucide-react";
import { WeatherBackdrop } from "./WeatherBackdrop";
import { SeasideHeroScene } from "./SeasideHeroScene";

/**
 * Full-bleed 2-column animated landing hero.
 * Left: blur-fading "Isolation hurts, Community heals" <-> "Journey Together" + intro & CTAs.
 * Right: ink-and-watercolor seaside fellowship scene with interactive Sun/Moon theme toggle
 * and growing coastal plants.
 * Uses IntersectionObserver to pause descendant CSS animations while scrolled off-screen.
 */
export function HeroLanding() {
  const sectionRef = useRef<HTMLElement>(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setPaused(!entry.isIntersecting);
      },
      { threshold: 0.05 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="overview"
      data-paused={paused ? "true" : "false"}
      className="relative flex min-h-[100svh] w-full flex-col justify-center overflow-hidden border-b border-neutral-900/[0.06] bg-white dark:border-white/[0.08] dark:bg-cru-night"
    >
      {/* Ambient rain <-> sun sky backdrop */}
      <WeatherBackdrop />

      {/* Foreground 2-column editorial layout */}
      <div className="relative z-10 mx-auto grid w-full max-w-[1240px] grid-cols-1 items-center gap-10 px-6 pb-16 pt-28 md:px-12 lg:grid-cols-12 lg:gap-8 lg:pb-16 lg:pt-24">
        {/* Left column: eyebrow, blur-fading headline, Cru VSU intro, CTA pills */}
        <div className="lg:col-span-5">
          <p className="mb-4 text-xs font-medium tracking-wide text-cru-gold-text dark:text-cru-gold">
            Cru · Visayas State University
          </p>

          <h1 className="text-3xl font-semibold tracking-tight text-cru-charcoal dark:text-cru-ink sm:text-4xl lg:text-[44px] lg:leading-[1.1]">
            <span className="sr-only">
              Isolation hurts, Community heals — Journey Together
            </span>
            <span
              aria-hidden="true"
              className="grid items-center motion-reduce:flex motion-reduce:flex-col motion-reduce:items-start motion-reduce:gap-2"
            >
              <span className="hero-anim hero-phrase-a col-start-1 row-start-1">
                Isolation hurts, Community heals
              </span>
              <span className="hero-anim hero-phrase-b col-start-1 row-start-1 motion-reduce:text-xl motion-reduce:font-medium motion-reduce:text-cru-muted dark:motion-reduce:text-cru-ink-muted">
                Journey Together
              </span>
            </span>
          </h1>

          <p className="mt-5 max-w-md text-sm leading-relaxed text-cru-muted dark:text-cru-ink-muted sm:text-[15px]">
            Here in Cru VSU Student LinC, we are privileged to walk alongside
            students as they grow in their relationship with Christ and step
            into their calling as leaders in His kingdom.
          </p>

          <p className="mt-4 font-mono text-[11px] tracking-wider text-cru-gold-text/90 dark:text-cru-gold/90">
            WIN · BUILD · SEND
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              href="/tree"
              className="inline-flex h-11 items-center gap-2.5 rounded-full bg-cru-gold p-1.5 pr-5 text-sm font-semibold text-cru-charcoal shadow-sm transition-colors hover:bg-cru-gold-hover"
            >
              <span className="grid size-8 place-items-center rounded-full bg-white text-cru-charcoal">
                <GitBranch className="size-3.5" aria-hidden="true" />
              </span>
              View Discipleship Tree
            </Link>

            <Link
              href="#projects"
              className="inline-flex h-11 items-center rounded-full border border-neutral-900/[0.08] bg-white/80 px-4 text-sm font-medium text-cru-charcoal backdrop-blur-xs transition-colors hover:border-cru-gold/60 dark:border-white/10 dark:bg-cru-night-surface/80 dark:text-cru-ink dark:hover:border-cru-gold/60"
            >
              Explore Ministries
            </Link>
          </div>
        </div>

        {/* Right column: seaside ink-and-watercolor community drawing + Sun/Moon toggle + shore plants */}
        <div className="lg:col-span-7">
          <SeasideHeroScene />
        </div>
      </div>
    </section>
  );
}
