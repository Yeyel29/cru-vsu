import type { Metadata } from "next";
import {
  fetchActiveGivingChannels,
  fetchRecipientProfiles,
} from "@/lib/giving/queries";
import {
  DraftingContainer,
  DraftingDivider,
} from "@/components/layout/DraftingGrid";
import { GiveLedgerWorkspace } from "@/components/give/GiveLedgerWorkspace";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Give & Sow | Cru VSU",
  description:
    "Partner financially with Cru at Visayas State University or sow into a specific campus leader or disciple through Cru Eastern Visayas.",
};

interface GivePageProps {
  searchParams: Promise<{ to?: string }>;
}

export default async function GivePage({ searchParams }: GivePageProps) {
  const { to } = await searchParams;
  const [channels, recipients] = await Promise.all([
    fetchActiveGivingChannels(),
    fetchRecipientProfiles(),
  ]);

  const initialRecipientId =
    to && recipients.some((r) => r.id === to) ? to : null;

  return (
    <main className="min-h-screen bg-white pt-32 pb-20 dark:bg-cru-night">
      <DraftingContainer className="px-6 py-8 md:px-12">
        <div className="max-w-2xl">
          <div className="font-mono text-[11px] uppercase tracking-widest text-cru-gold-text dark:text-cru-gold">
            Cru-VSU · Stewardship &amp; Partnership
          </div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-cru-charcoal dark:text-cru-ink md:text-4xl">
            Partner with Cru VSU
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-cru-muted dark:text-cru-ink-muted md:text-base">
            All financial gifts are received centrally by Cru Eastern Visayas
            (Cru EV). Send your transfer using the Cru EV account or QR code on
            the left, then record your gift on the right so our team can verify
            it and route it to the ministry fund or person you designate.
          </p>
        </div>

        <DraftingDivider className="my-8" />

        <GiveLedgerWorkspace
          channels={channels}
          recipients={recipients}
          initialRecipientId={initialRecipientId}
        />
      </DraftingContainer>
    </main>
  );
}
