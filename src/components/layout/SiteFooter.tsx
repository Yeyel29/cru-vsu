import Link from "next/link";
import { DraftingContainer, DraftingDivider } from "./DraftingGrid";

/**
 * Clean architectural footer grounded inside the 1200px drafting grid.
 */
export function SiteFooter() {
  return (
    <footer className="bg-white">
      <DraftingContainer>
        <DraftingDivider />
        <div className="flex flex-col justify-between gap-8 px-6 py-12 md:flex-row md:items-center md:px-12">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="grid size-6 place-items-center rounded-full bg-cru-gold text-[11px] font-bold text-cru-charcoal">
                C
              </span>
              <span className="text-sm font-semibold tracking-tight text-cru-charcoal">
                Cru · Visayas State University
              </span>
            </div>
            <p className="mt-2 max-w-md text-xs leading-relaxed text-cru-muted">
              A caring campus community passionate about connecting VSU students
              to Jesus Christ, building them in faith, and sending spiritual
              multipliers.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs font-medium text-cru-muted">
            <Link
              href="/tree"
              className="transition-colors hover:text-cru-charcoal"
            >
              Discipleship Tree
            </Link>
            <Link
              href="/#projects"
              className="transition-colors hover:text-cru-charcoal"
            >
              Ministry Projects
            </Link>
            <Link
              href="/#join-cru"
              className="transition-colors hover:text-cru-charcoal"
            >
              Join Cru
            </Link>
            <Link
              href="/dashboard"
              className="transition-colors hover:text-cru-charcoal"
            >
              Member Portal
            </Link>
          </div>
        </div>
        <div className="border-t border-neutral-900/[0.06] px-6 py-5 text-center font-mono text-[11px] text-cru-muted md:flex md:justify-between md:px-12 md:text-left">
          <span>WIN · BUILD · SEND</span>
          <span>Jesus at the center · Cru VSU</span>
        </div>
      </DraftingContainer>
    </footer>
  );
}
