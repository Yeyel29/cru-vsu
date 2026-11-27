"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { GitBranch, Home, Layers, LogIn, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Home", href: "/", icon: Home },
  { label: "Tree", href: "/tree", icon: GitBranch },
  { label: "Projects", href: "/#projects", icon: Layers },
];

const CHEVRON_ALPHAS = [1, 0.78, 0.54, 0.32, 0.16] as const;

function DottedChevron({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 14 20"
      fill="currentColor"
      aria-hidden="true"
      className={className}
      style={style}
    >
      <circle cx="3" cy="3" r="1.4" />
      <circle cx="6.5" cy="6.5" r="1.4" />
      <circle cx="10" cy="10" r="1.4" />
      <circle cx="6.5" cy="13.5" r="1.4" />
      <circle cx="3" cy="17" r="1.4" />
    </svg>
  );
}

/**
 * Poulo.site-inspired floating liquid glassmorphism navbar in Cru Gold & White.
 * The top-right corner is reserved for the pull-chain lamp theme switch, so the
 * Member Portal link lives inside the capsule.
 */
export function GlassNavbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  const isPortalActive = pathname.startsWith("/dashboard");

  return (
    <>
      <header className="pointer-events-none fixed inset-x-0 top-6 z-50 flex items-center justify-between gap-1.5 pl-2.5 pr-[86px] sm:gap-2 sm:pl-3 sm:pr-[104px] md:justify-center md:gap-2.5 md:pl-6 md:pr-28">
        {/* Primary Glassmorphism Capsule */}
        <nav
          aria-label="Primary"
          className={cn(
            "group/nav glass-nav pointer-events-auto inline-flex max-w-full flex-nowrap items-center gap-1 rounded-full p-1.5 transition-shadow duration-300",
            scrolled && "shadow-[0_14px_40px_-10px_rgba(0,0,0,0.16)]"
          )}
        >
          {/* Brand Emblem */}
          <Link
            href="/"
            aria-label="Cru VSU Home"
            className="flex h-10 items-center rounded-full pl-2.5 pr-2 text-sm font-semibold tracking-tight text-cru-charcoal transition-[padding,margin,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:opacity-80 motion-reduce:transition-none dark:text-cru-ink md:px-2 md:group-hover/nav:mr-1 md:group-hover/nav:pl-3 md:group-hover/nav:pr-2.5 md:group-focus-within/nav:mr-1 md:group-focus-within/nav:pl-3 md:group-focus-within/nav:pr-2.5"
          >
            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-cru-gold text-[11px] font-bold text-cru-charcoal">
              C
            </span>
            <span className="hidden overflow-hidden whitespace-nowrap transition-[max-width,opacity,margin] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none md:inline-block md:max-w-0 md:opacity-0 md:group-hover/nav:ml-2 md:group-hover/nav:max-w-[80px] md:group-hover/nav:opacity-100 md:group-focus-within/nav:ml-2 md:group-focus-within/nav:max-w-[80px] md:group-focus-within/nav:opacity-100">
              Cru VSU
            </span>
          </Link>

          {/* Desktop Navigation Pills */}
          <div className="hidden items-center gap-1 md:flex">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "relative inline-flex h-10 items-center gap-0 rounded-full px-3 text-[14px] font-medium transition-[padding,gap,color,background-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none group-hover/nav:gap-2 group-hover/nav:px-3.5 group-focus-within/nav:gap-2 group-focus-within/nav:px-3.5",
                    isActive
                      ? "bg-white text-cru-charcoal shadow-[0_1px_3px_rgb(0_0_0/0.12)] dark:bg-white/15 dark:text-white dark:shadow-none"
                      : "text-cru-charcoal/70 hover:text-cru-charcoal dark:text-white/70 dark:hover:text-white"
                  )}
                >
                  <Icon
                    aria-hidden="true"
                    className={cn(
                      "size-4 shrink-0",
                      isActive
                        ? "text-cru-gold-hover dark:text-cru-gold"
                        : "text-current"
                    )}
                  />
                  <span className="overflow-hidden whitespace-nowrap transition-[max-width,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none max-w-0 opacity-0 group-hover/nav:max-w-[96px] group-hover/nav:opacity-100 group-focus-within/nav:max-w-[96px] group-focus-within/nav:opacity-100">
                    {item.label}
                  </span>
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="h-1.5 w-0 shrink-0 rounded-full bg-cru-gold opacity-0 transition-[width,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none group-hover/nav:w-1.5 group-hover/nav:opacity-100 group-focus-within/nav:w-1.5 group-focus-within/nav:opacity-100"
                    />
                  )}
                </Link>
              );
            })}

            <span
              aria-hidden="true"
              className="mx-0.5 h-5 w-px bg-neutral-900/10 dark:bg-white/15"
            />

            {/* Member Portal */}
            <Link
              href="/dashboard"
              aria-label="Member Portal and Sign In"
              aria-current={isPortalActive ? "page" : undefined}
              className={cn(
                "inline-flex h-10 items-center gap-0 rounded-full px-3 text-[14px] font-medium transition-[padding,gap,color,background-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none group-hover/nav:gap-2 group-hover/nav:px-3.5 group-focus-within/nav:gap-2 group-focus-within/nav:px-3.5",
                isPortalActive
                  ? "bg-white text-cru-charcoal shadow-[0_1px_3px_rgb(0_0_0/0.12)] dark:bg-white/15 dark:text-white dark:shadow-none"
                  : "text-cru-charcoal/70 hover:text-cru-charcoal dark:text-white/70 dark:hover:text-white"
              )}
            >
              <LogIn aria-hidden="true" className="size-4 shrink-0" />
              <span className="overflow-hidden whitespace-nowrap transition-[max-width,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none max-w-0 opacity-0 group-hover/nav:max-w-[72px] group-hover/nav:opacity-100 group-focus-within/nav:max-w-[72px] group-focus-within/nav:opacity-100">
                Portal
              </span>
            </Link>
          </div>

          {/* Mobile Menu Trigger */}
          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            className="grid size-10 place-items-center rounded-full text-cru-charcoal transition-colors hover:bg-white/60 dark:text-cru-ink dark:hover:bg-white/10 md:hidden"
          >
            {mobileOpen ? (
              <X aria-hidden="true" className="size-4" />
            ) : (
              <Menu aria-hidden="true" className="size-4" />
            )}
          </button>
        </nav>

        {/* Primary Cru Gold Split-Badge CTA (Poulo-style expanding pill hover) */}
        <Link
          href="/#join-cru"
          className="group relative pointer-events-auto inline-flex h-11 shrink-0 items-center overflow-hidden rounded-full bg-cru-gold pl-[42px] pr-3 text-[13px] font-semibold text-cru-charcoal shadow-[0_10px_35px_-10px_rgba(253,185,19,0.45)] transition-colors duration-200 hover:bg-cru-gold-hover active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cru-charcoal dark:focus-visible:outline-cru-ink sm:h-[52px] sm:pl-[54px] sm:pr-5 sm:text-sm"
        >
          <span
            aria-hidden="true"
            className="absolute left-1.5 top-1.5 z-10 flex h-8 w-8 items-center justify-between overflow-hidden rounded-full bg-white px-[9px] text-cru-charcoal shadow-xs transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:w-[calc(100%-12px)] motion-reduce:transition-none sm:h-10 sm:w-10 sm:px-[13px]"
          >
            {CHEVRON_ALPHAS.map((alpha, idx) => (
              <DottedChevron
                key={idx}
                style={{
                  color: `color-mix(in srgb, currentColor ${Math.round(alpha * 100)}%, transparent)`,
                  transitionDelay: idx === 0 ? "0ms" : `${idx * 30}ms`,
                }}
                className={cn(
                  "h-4 w-3.5 shrink-0 transition-all duration-300 motion-reduce:transition-none motion-reduce:transform-none",
                  idx === 0
                    ? "translate-x-0 opacity-100"
                    : "-translate-x-1.5 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                )}
              />
            ))}
          </span>
          <span>Join Cru</span>
        </Link>
      </header>

      {/* Mobile Dropdown Drawer */}
      {mobileOpen && (
        <div
          id="mobile-nav"
          className="fixed inset-x-4 top-24 z-40 rounded-[24px] border border-neutral-900/10 bg-white/97 p-4 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.2)] backdrop-blur-xl dark:border-white/10 dark:bg-cru-night-surface/97 md:hidden"
        >
          <div className="flex flex-col gap-1.5">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-cru-charcoal transition-colors hover:bg-cru-gold-soft dark:text-cru-ink dark:hover:bg-white/10"
                >
                  <Icon aria-hidden="true" className="size-4 text-cru-gold-hover" />
                  {item.label}
                </Link>
              );
            })}
            <Link
              href="/dashboard"
              onClick={() => setMobileOpen(false)}
              className="mt-1 flex items-center gap-3 rounded-2xl border border-neutral-900/[0.07] bg-white px-4 py-3 text-sm font-medium text-cru-charcoal dark:border-white/10 dark:bg-white/10 dark:text-cru-ink"
            >
              <LogIn aria-hidden="true" className="size-4 text-cru-gold-hover" />
              Member Portal
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
