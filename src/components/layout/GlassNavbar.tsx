"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  GitBranch,
  Home,
  Layers,
  LogIn,
  Menu,
  X,
} from "lucide-react";
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

  return (
    <>
      <header className="pointer-events-none fixed inset-x-0 top-6 z-50 flex items-center justify-between px-4 sm:justify-center sm:gap-2.5 sm:px-20">
        {/* Primary Glassmorphism Capsule */}
        <nav
          aria-label="Primary"
          className={cn(
            "glass-nav pointer-events-auto inline-flex max-w-full flex-nowrap items-center gap-1 rounded-full p-1.5 transition-all duration-300",
            scrolled && "shadow-[0_14px_40px_-10px_rgba(0,0,0,0.16)]"
          )}
        >
          {/* Brand Emblem */}
          <Link
            href="/"
            className="mr-1 flex h-10 items-center gap-2 rounded-full pl-3 pr-2.5 text-sm font-semibold tracking-tight text-cru-charcoal transition-opacity hover:opacity-80"
          >
            <span className="grid size-6 place-items-center rounded-full bg-cru-gold text-[11px] font-bold text-cru-charcoal">
              C
            </span>
            <span className="hidden xs:inline sm:inline">Cru VSU</span>
          </Link>

          {/* Desktop Navigation Pills */}
          <div className="hidden items-center gap-1 sm:flex">
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
                  className={cn(
                    "relative inline-flex h-10 items-center gap-2 rounded-full px-3.5 text-[14px] font-medium transition-colors duration-150",
                    isActive
                      ? "bg-white text-cru-charcoal shadow-[0_1px_3px_rgb(0_0_0/0.12)]"
                      : "text-cru-charcoal/70 hover:text-cru-charcoal"
                  )}
                >
                  <Icon
                    className={cn(
                      "size-4 shrink-0",
                      isActive ? "text-cru-gold-hover" : "text-current"
                    )}
                  />
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="size-1.5 rounded-full bg-cru-gold" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Mobile Menu Trigger */}
          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="Toggle menu"
            className="grid size-10 place-items-center rounded-full text-cru-charcoal transition-colors hover:bg-white/60 sm:hidden"
          >
            {mobileOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </nav>

        {/* Primary Cru Gold Split-Badge CTA (Poulo-style expanding pill hover) */}
        <Link
          href="/#join-cru"
          className="group relative pointer-events-auto inline-flex h-[52px] shrink-0 items-center overflow-hidden rounded-full bg-cru-gold pl-[54px] pr-5 text-sm font-semibold text-cru-charcoal shadow-[0_10px_35px_-10px_rgba(253,185,19,0.45)] transition-colors duration-200 hover:bg-cru-gold-hover active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cru-charcoal"
        >
          <span
            aria-hidden="true"
            className="absolute left-1.5 top-1.5 z-10 flex h-10 w-10 items-center justify-between overflow-hidden rounded-full bg-white px-[13px] text-cru-charcoal shadow-xs transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:w-[calc(100%-12px)] motion-reduce:transition-none"
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

      {/* Detached Right-Side Member Portal Button */}
      <Link
        href="/dashboard"
        title="Member Portal & Sign In"
        aria-label="Member Portal & Sign In"
        className="glass-nav fixed right-6 top-6 z-50 hidden size-[52px] place-items-center rounded-full text-cru-charcoal transition-transform hover:scale-105 sm:grid"
      >
        <LogIn className="size-4" />
      </Link>

      {/* Mobile Dropdown Drawer */}
      {mobileOpen && (
        <div className="glass-panel fixed inset-x-4 top-24 z-40 rounded-[24px] p-4 sm:hidden">
          <div className="flex flex-col gap-1.5">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-cru-charcoal transition-colors hover:bg-cru-gold-soft"
                >
                  <Icon className="size-4 text-cru-gold-hover" />
                  {item.label}
                </Link>
              );
            })}
            <Link
              href="/dashboard"
              onClick={() => setMobileOpen(false)}
              className="mt-1 flex items-center gap-3 rounded-2xl border border-neutral-900/[0.07] bg-white px-4 py-3 text-sm font-medium text-cru-charcoal"
            >
              <LogIn className="size-4 text-cru-gold-hover" />
              Member Portal
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
