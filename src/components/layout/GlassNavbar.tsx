"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  GitBranch,
  Home,
  Layers,
  UserPlus,
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
                    "relative inline-flex h-10 items-center gap-2 rounded-full px-3.5 text-[14px] font-medium transition-all duration-200",
                    isActive
                      ? "bg-white text-cru-charcoal shadow-[0_1px_3px_rgb(0_0_0/0.12)]"
                      : "text-cru-charcoal/70 hover:bg-white/50 hover:text-cru-charcoal"
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

        {/* Primary Cru Gold Split-Badge CTA */}
        <Link
          href="/#join-cru"
          className="pointer-events-auto inline-flex h-[52px] shrink-0 items-center gap-3 rounded-full bg-cru-gold p-1.5 pr-5 text-sm font-semibold text-cru-charcoal shadow-[0_10px_35px_-10px_rgba(253,185,19,0.45)] transition-all hover:bg-cru-gold-hover active:scale-[0.98]"
        >
          <span className="grid size-9 place-items-center rounded-full bg-white text-cru-charcoal shadow-xs">
            <UserPlus className="size-4" />
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
