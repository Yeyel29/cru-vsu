"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  AlertCircle,
  Building2,
  Check,
  CheckCircle2,
  Copy,
  Download,
  Loader2,
  Maximize2,
  Search,
  Smartphone,
  Upload,
  User,
  Users,
  X,
} from "lucide-react";
import { submitDonationRecord } from "@/app/actions/give";
import { cn } from "@/lib/utils";
import type {
  DonationDesignationType,
  GivingChannel,
  RecipientOption,
} from "@/types/database";

interface GiveLedgerWorkspaceProps {
  channels: GivingChannel[];
  recipients: RecipientOption[];
  initialRecipientId: string | null;
}

const QUICK_AMOUNTS = [100, 250, 500, 1000] as const;
const MAX_RECEIPT_BYTES = 5 * 1024 * 1024;

interface SubmittedSummary {
  referenceCode: string;
  designationLabel: string;
  amountPhp: number;
  channelName: string;
  donorLabel: string;
}

export function GiveLedgerWorkspace({
  channels,
  recipients,
  initialRecipientId,
}: GiveLedgerWorkspaceProps) {
  const initialRecipient = useMemo(
    () =>
      initialRecipientId
        ? recipients.find((r) => r.id === initialRecipientId) ?? null
        : null,
    [initialRecipientId, recipients]
  );

  // Left ledger: active Cru EV payment channel
  const [selectedChannelId, setSelectedChannelId] = useState<string>(
    channels[0]?.id ?? ""
  );
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [qrModalChannel, setQrModalChannel] = useState<GivingChannel | null>(
    null
  );

  // Right form: designation & transfer details
  const [designationType, setDesignationType] =
    useState<DonationDesignationType>(
      initialRecipient ? "specific_person" : "general_fund"
    );
  const [recipientSearch, setRecipientSearch] = useState("");
  const [selectedRecipientId, setSelectedRecipientId] = useState<string>(
    initialRecipient?.id ?? ""
  );
  const [useManualRecipient, setUseManualRecipient] = useState(false);
  const [recipientCustomName, setRecipientCustomName] = useState("");

  const [amountPhp, setAmountPhp] = useState<string>("");
  const [channelUsedName, setChannelUsedName] = useState<string>(
    channels[0]?.provider_name ?? ""
  );
  const [referenceNumber, setReferenceNumber] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [isAnonymous, setIsAnonymous] = useState(false);
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [donorPhone, setDonorPhone] = useState("");
  const [message, setMessage] = useState("");

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<SubmittedSummary | null>(null);
  const [isPending, startTransition] = useTransition();

  const activeChannel = useMemo(
    () => channels.find((c) => c.id === selectedChannelId) ?? channels[0] ?? null,
    [channels, selectedChannelId]
  );

  const selectedRecipient = useMemo(
    () => recipients.find((r) => r.id === selectedRecipientId) ?? null,
    [recipients, selectedRecipientId]
  );

  const filteredRecipients = useMemo(() => {
    const q = recipientSearch.trim().toLowerCase();
    if (!q) return recipients;
    return recipients.filter(
      (r) =>
        r.full_name.toLowerCase().includes(q) ||
        (r.college_program ?? "").toLowerCase().includes(q) ||
        r.role.toLowerCase().includes(q)
    );
  }, [recipients, recipientSearch]);

  useEffect(() => {
    if (!qrModalChannel) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setQrModalChannel(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [qrModalChannel]);

  const handleSelectChannel = (channel: GivingChannel) => {
    setSelectedChannelId(channel.id);
    setChannelUsedName(channel.provider_name);
  };

  const handleCopyAccount = async (channel: GivingChannel) => {
    try {
      await navigator.clipboard.writeText(channel.account_number);
      setCopiedId(channel.id);
      setTimeout(() => {
        setCopiedId((prev) => (prev === channel.id ? null : prev));
      }, 2200);
    } catch {
      setErrorMessage(
        "Could not copy to clipboard automatically. Please select and copy the account number."
      );
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    const file = event.target.files?.[0] ?? null;
    if (!file) {
      setReceiptFile(null);
      return;
    }
    if (file.size > MAX_RECEIPT_BYTES) {
      setErrorMessage("Receipt file must be 5 MB or smaller.");
      event.target.value = "";
      setReceiptFile(null);
      return;
    }
    setReceiptFile(file);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    const parsedAmount = Number(amountPhp);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setErrorMessage("Please enter a valid gift amount in PHP.");
      return;
    }

    if (designationType === "specific_person") {
      if (useManualRecipient && !recipientCustomName.trim()) {
        setErrorMessage("Please enter the name of the person you are supporting.");
        return;
      }
      if (!useManualRecipient && !selectedRecipientId) {
        setErrorMessage("Please choose a person from the list or switch to manual entry.");
        return;
      }
    }

    if (!channelUsedName.trim()) {
      setErrorMessage("Please specify which Cru EV channel you transferred to.");
      return;
    }

    if (!isAnonymous && donorName.trim().length < 2) {
      setErrorMessage("Please enter your name, or check Give anonymously.");
      return;
    }

    const formData = new FormData();
    formData.set("designationType", designationType);
    if (designationType === "specific_person") {
      if (!useManualRecipient && selectedRecipientId) {
        formData.set("recipientProfileId", selectedRecipientId);
      } else {
        formData.set("recipientCustomName", recipientCustomName.trim());
      }
    }
    formData.set("amountPhp", String(parsedAmount));
    if (activeChannel) {
      formData.set("channelId", activeChannel.id);
    }
    formData.set("channelNameSnapshot", channelUsedName.trim());
    formData.set("referenceNumber", referenceNumber.trim());
    formData.set("isAnonymous", isAnonymous ? "true" : "false");
    formData.set("donorName", isAnonymous ? "" : donorName.trim());
    formData.set("donorEmail", donorEmail.trim());
    formData.set("donorPhone", donorPhone.trim());
    formData.set("message", message.trim());
    if (receiptFile) {
      formData.set("receiptFile", receiptFile);
    }

    const designationLabel =
      designationType === "general_fund"
        ? "Cru-VSU General Ministry Fund"
        : useManualRecipient
        ? recipientCustomName.trim()
        : selectedRecipient?.full_name ?? "Specific Ministry Member";

    startTransition(async () => {
      const res = await submitDonationRecord(formData);
      if (!res.success) {
        setErrorMessage(res.message);
        return;
      }

      setSubmitted({
        referenceCode: res.referenceCode ?? "LOGGED",
        designationLabel,
        amountPhp: parsedAmount,
        channelName: channelUsedName.trim(),
        donorLabel: isAnonymous ? "Anonymous" : donorName.trim(),
      });
    });
  };

  const handleReset = () => {
    setSubmitted(null);
    setErrorMessage(null);
    setAmountPhp("");
    setReferenceNumber("");
    setReceiptFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setMessage("");
  };

  return (
    <>
      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[5fr_7fr] lg:gap-10">
        {/* LEFT COLUMN: Cru Eastern Visayas Payment Channels (Sticky on Desktop) */}
        <section
          aria-labelledby="cru-ev-channels-heading"
          className="rounded-[24px] border border-neutral-900/[0.08] bg-cru-surface p-6 dark:border-white/10 dark:bg-cru-night-surface lg:sticky lg:top-28"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-[11px] uppercase tracking-widest text-cru-gold-text dark:text-cru-gold">
              01 · Send to Cru Eastern Visayas
            </span>
          </div>
          <h2
            id="cru-ev-channels-heading"
            className="mt-1.5 text-lg font-semibold text-cru-charcoal dark:text-cru-ink"
          >
            Centralized Bank &amp; QR Details
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-cru-muted dark:text-cru-ink-muted">
            Transfer directly using any active Cru EV channel below, then log
            your transfer in the form.
          </p>

          {channels.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-neutral-900/15 bg-white p-6 text-center dark:border-white/15 dark:bg-cru-night">
              <Building2
                aria-hidden="true"
                className="mx-auto size-6 text-cru-muted dark:text-cru-ink-muted"
              />
              <p className="mt-3 text-sm font-medium text-cru-charcoal dark:text-cru-ink">
                Cru EV payment channels have not been published yet.
              </p>
              <p className="mt-1 text-xs leading-relaxed text-cru-muted dark:text-cru-ink-muted">
                An administrator can add Cru Eastern Visayas bank accounts and
                QR codes in the Admin Console. You can still record an offline
                transfer on the right.
              </p>
            </div>
          ) : (
            <div className="mt-5 space-y-5">
              {/* Channel Selector Tabs */}
              <div
                role="tablist"
                aria-label="Cru EV payment channels"
                className="flex flex-wrap gap-1.5 rounded-2xl bg-neutral-900/[0.04] p-1.5 dark:bg-white/[0.06]"
              >
                {channels.map((channel) => {
                  const isSelected = activeChannel?.id === channel.id;
                  const Icon =
                    channel.channel_type === "ewallet"
                      ? Smartphone
                      : Building2;
                  return (
                    <button
                      key={channel.id}
                      type="button"
                      role="tab"
                      aria-selected={isSelected}
                      onClick={() => handleSelectChannel(channel)}
                      className={cn(
                        "inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl px-3.5 py-2 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cru-gold",
                        isSelected
                          ? "bg-white text-cru-charcoal shadow-xs dark:bg-cru-night dark:text-cru-ink"
                          : "text-cru-muted hover:text-cru-charcoal dark:text-cru-ink-muted dark:hover:text-cru-ink"
                      )}
                    >
                      <Icon
                        aria-hidden="true"
                        className={cn(
                          "size-3.5 shrink-0",
                          isSelected
                            ? "text-cru-gold-text dark:text-cru-gold"
                            : "text-current"
                        )}
                      />
                      <span>{channel.provider_name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Active Channel Details Card */}
              {activeChannel && (
                <div className="space-y-4 rounded-2xl border border-neutral-900/[0.08] bg-white p-5 dark:border-white/10 dark:bg-cru-night">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="font-mono text-[10px] uppercase tracking-wider text-cru-muted dark:text-cru-ink-muted">
                        {activeChannel.channel_type === "ewallet"
                          ? "E-Wallet"
                          : "Bank Transfer"}
                      </span>
                      <h3 className="text-base font-semibold text-cru-charcoal dark:text-cru-ink">
                        {activeChannel.provider_name}
                      </h3>
                    </div>
                  </div>

                  <dl className="space-y-3 text-sm">
                    <div>
                      <dt className="text-xs text-cru-muted dark:text-cru-ink-muted">
                        Account Name
                      </dt>
                      <dd className="mt-0.5 font-medium text-cru-charcoal dark:text-cru-ink">
                        {activeChannel.account_name}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-xs text-cru-muted dark:text-cru-ink-muted">
                        Account / Mobile Number
                      </dt>
                      <dd className="mt-1 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-neutral-900/[0.08] bg-cru-surface px-3.5 py-2.5 dark:border-white/10 dark:bg-cru-night-surface">
                        <span className="font-mono text-sm font-medium tracking-wide text-cru-charcoal dark:text-cru-ink">
                          {activeChannel.account_number}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyAccount(activeChannel)}
                          className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-neutral-900/10 bg-white px-2.5 py-1 text-xs font-medium text-cru-charcoal transition-colors hover:border-cru-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cru-gold dark:border-white/15 dark:bg-cru-night dark:text-cru-ink"
                        >
                          {copiedId === activeChannel.id ? (
                            <>
                              <Check
                                aria-hidden="true"
                                className="size-3.5 text-emerald-600 dark:text-emerald-400"
                              />
                              <span>Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy aria-hidden="true" className="size-3.5" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </dd>
                    </div>
                  </dl>

                  {activeChannel.qr_image_url && (
                    <div className="border-t border-neutral-900/[0.06] pt-4 dark:border-white/10">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs font-medium text-cru-charcoal dark:text-cru-ink">
                          Scan QR Code
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setQrModalChannel(activeChannel)}
                            className="inline-flex min-h-[36px] items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-cru-muted transition-colors hover:text-cru-charcoal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cru-gold dark:text-cru-ink-muted dark:hover:text-cru-ink"
                          >
                            <Maximize2 aria-hidden="true" className="size-3.5" />
                            <span>Enlarge</span>
                          </button>
                          <a
                            href={activeChannel.qr_image_url}
                            download={`${activeChannel.provider_name.toLowerCase()}-qr.png`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex min-h-[36px] items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-cru-muted transition-colors hover:text-cru-charcoal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cru-gold dark:text-cru-ink-muted dark:hover:text-cru-ink"
                          >
                            <Download aria-hidden="true" className="size-3.5" />
                            <span>Save</span>
                          </a>
                        </div>
                      </div>

                      {/* Always keep a pure white frame around QR codes so scanners work in dark mode */}
                      <div className="mx-auto w-fit rounded-2xl border border-neutral-900/[0.08] bg-white p-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={activeChannel.qr_image_url}
                          alt={`${activeChannel.provider_name} QR code for ${activeChannel.account_name}`}
                          width={220}
                          height={220}
                          className="size-[220px] object-contain"
                        />
                      </div>
                    </div>
                  )}

                  {activeChannel.instructions && (
                    <p className="rounded-xl bg-cru-gold-soft/60 px-3.5 py-2.5 text-xs leading-relaxed text-cru-charcoal dark:bg-cru-gold/10 dark:text-cru-ink">
                      {activeChannel.instructions}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </section>

        {/* RIGHT COLUMN: Gift Tracking & Designation Form */}
        <section
          aria-labelledby="record-gift-heading"
          className="rounded-[24px] border border-neutral-900/[0.08] bg-white p-6 dark:border-white/10 dark:bg-cru-night-surface md:p-8"
        >
          <span className="font-mono text-[11px] uppercase tracking-widest text-cru-gold-text dark:text-cru-gold">
            02 · Record Your Gift
          </span>
          <h2
            id="record-gift-heading"
            className="mt-1.5 text-lg font-semibold text-cru-charcoal dark:text-cru-ink"
          >
            Designation &amp; Transfer Details
          </h2>

          {submitted ? (
            <div
              role="status"
              aria-live="polite"
              className="mt-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.06] p-6 dark:bg-emerald-500/10"
            >
              <div className="flex items-start gap-3">
                <CheckCircle2
                  aria-hidden="true"
                  className="mt-0.5 size-5 shrink-0 text-emerald-700 dark:text-emerald-400"
                />
                <div>
                  <h3 className="text-base font-semibold text-cru-charcoal dark:text-cru-ink">
                    Gift recorded for tracking
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-cru-muted dark:text-cru-ink-muted">
                    Thank you for partnering with Cru VSU. Our stewardship team
                    will verify your transfer with Cru Eastern Visayas.
                  </p>
                </div>
              </div>

              <dl className="mt-5 grid grid-cols-1 gap-3 rounded-xl border border-neutral-900/[0.07] bg-white p-4 text-xs dark:border-white/10 dark:bg-cru-night sm:grid-cols-2">
                <div>
                  <dt className="text-cru-muted dark:text-cru-ink-muted">
                    Tracking Code
                  </dt>
                  <dd className="mt-0.5 font-mono font-semibold text-cru-charcoal dark:text-cru-ink">
                    CRU-{submitted.referenceCode}
                  </dd>
                </div>
                <div>
                  <dt className="text-cru-muted dark:text-cru-ink-muted">
                    Amount
                  </dt>
                  <dd className="mt-0.5 font-mono font-semibold tabular-nums text-cru-charcoal dark:text-cru-ink">
                    PHP {submitted.amountPhp.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </dd>
                </div>
                <div>
                  <dt className="text-cru-muted dark:text-cru-ink-muted">
                    Designated For
                  </dt>
                  <dd className="mt-0.5 font-medium text-cru-charcoal dark:text-cru-ink">
                    {submitted.designationLabel}
                  </dd>
                </div>
                <div>
                  <dt className="text-cru-muted dark:text-cru-ink-muted">
                    Channel &amp; Donor
                  </dt>
                  <dd className="mt-0.5 font-medium text-cru-charcoal dark:text-cru-ink">
                    {submitted.channelName} · {submitted.donorLabel}
                  </dd>
                </div>
              </dl>

              <button
                type="button"
                onClick={handleReset}
                className="mt-5 inline-flex min-h-[44px] items-center justify-center rounded-full border border-neutral-900/15 bg-white px-5 py-2.5 text-xs font-semibold text-cru-charcoal transition-colors hover:border-cru-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cru-gold dark:border-white/15 dark:bg-cru-night dark:text-cru-ink"
              >
                Record another gift
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-6" noValidate>
              {errorMessage && (
                <div
                  role="alert"
                  className="flex items-start gap-2.5 rounded-2xl border border-red-500/30 bg-red-500/[0.06] px-4 py-3 text-xs font-medium text-red-700 dark:bg-red-500/10 dark:text-red-300"
                >
                  <AlertCircle
                    aria-hidden="true"
                    className="mt-0.5 size-4 shrink-0"
                  />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Designation Choice */}
              <fieldset className="space-y-3">
                <legend className="text-xs font-semibold uppercase tracking-wider text-cru-charcoal dark:text-cru-ink">
                  Who is this gift for?
                </legend>
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setDesignationType("general_fund")}
                    aria-pressed={designationType === "general_fund"}
                    className={cn(
                      "flex min-h-[52px] items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cru-gold",
                      designationType === "general_fund"
                        ? "border-cru-gold bg-cru-gold-soft/60 text-cru-charcoal dark:bg-cru-gold/15 dark:text-cru-ink"
                        : "border-neutral-900/10 bg-cru-surface text-cru-muted hover:text-cru-charcoal dark:border-white/10 dark:bg-cru-night dark:text-cru-ink-muted dark:hover:text-cru-ink"
                    )}
                  >
                    <Users
                      aria-hidden="true"
                      className={cn(
                        "size-4 shrink-0",
                        designationType === "general_fund"
                          ? "text-cru-gold-text dark:text-cru-gold"
                          : "text-current"
                      )}
                    />
                    <div>
                      <div className="text-xs font-semibold">
                        General Ministry Fund
                      </div>
                      <div className="text-[11px] opacity-80">
                        Cru-VSU campus outreach &amp; events
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDesignationType("specific_person")}
                    aria-pressed={designationType === "specific_person"}
                    className={cn(
                      "flex min-h-[52px] items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cru-gold",
                      designationType === "specific_person"
                        ? "border-cru-gold bg-cru-gold-soft/60 text-cru-charcoal dark:bg-cru-gold/15 dark:text-cru-ink"
                        : "border-neutral-900/10 bg-cru-surface text-cru-muted hover:text-cru-charcoal dark:border-white/10 dark:bg-cru-night dark:text-cru-ink-muted dark:hover:text-cru-ink"
                    )}
                  >
                    <User
                      aria-hidden="true"
                      className={cn(
                        "size-4 shrink-0",
                        designationType === "specific_person"
                          ? "text-cru-gold-text dark:text-cru-gold"
                          : "text-current"
                      )}
                    />
                    <div>
                      <div className="text-xs font-semibold">
                        Specific Person
                      </div>
                      <div className="text-[11px] opacity-80">
                        Support a leader, disciple, or member
                      </div>
                    </div>
                  </button>
                </div>

                {designationType === "specific_person" && (
                  <div className="space-y-3 rounded-2xl border border-neutral-900/[0.08] bg-cru-surface p-4 dark:border-white/10 dark:bg-cru-night">
                    {!useManualRecipient ? (
                      <>
                        <div className="flex items-center justify-between gap-2">
                          <label
                            htmlFor="recipient-search"
                            className="text-xs font-medium text-cru-charcoal dark:text-cru-ink"
                          >
                            Select recipient from Cru VSU
                          </label>
                          <button
                            type="button"
                            onClick={() => setUseManualRecipient(true)}
                            className="text-xs font-medium text-cru-gold-text underline underline-offset-2 hover:opacity-80 dark:text-cru-gold"
                          >
                            Person not listed?
                          </button>
                        </div>

                        <div className="relative">
                          <Search
                            aria-hidden="true"
                            className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-cru-muted dark:text-cru-ink-muted"
                          />
                          <input
                            id="recipient-search"
                            type="text"
                            value={recipientSearch}
                            onChange={(e) => setRecipientSearch(e.target.value)}
                            placeholder="Search by name, role, or degree program..."
                            className="h-11 w-full rounded-xl border border-neutral-900/10 bg-white pl-10 pr-3.5 text-sm text-cru-charcoal placeholder:text-cru-muted focus:border-cru-gold focus:outline-none dark:border-white/10 dark:bg-cru-night-surface dark:text-cru-ink dark:placeholder:text-cru-ink-muted"
                          />
                        </div>

                        {selectedRecipient && (
                          <div className="flex items-center justify-between gap-2 rounded-xl border border-cru-gold/50 bg-cru-gold-soft/70 px-3.5 py-2 text-xs dark:bg-cru-gold/15">
                            <span className="font-medium text-cru-charcoal dark:text-cru-ink">
                              Selected: {selectedRecipient.full_name}
                              {selectedRecipient.college_program
                                ? ` (${selectedRecipient.college_program})`
                                : ""}
                            </span>
                            <button
                              type="button"
                              onClick={() => setSelectedRecipientId("")}
                              className="font-medium text-cru-muted hover:text-cru-charcoal dark:text-cru-ink-muted dark:hover:text-cru-ink"
                            >
                              Clear
                            </button>
                          </div>
                        )}

                        <div
                          role="listbox"
                          aria-label="Cru VSU recipients"
                          className="max-h-44 space-y-1 overflow-y-auto pr-1"
                        >
                          {filteredRecipients.length === 0 ? (
                            <p className="py-3 text-center text-xs text-cru-muted dark:text-cru-ink-muted">
                              No matching members found. You can enter their
                              name manually above.
                            </p>
                          ) : (
                            filteredRecipients.map((person) => {
                              const isChosen =
                                selectedRecipientId === person.id;
                              return (
                                <button
                                  key={person.id}
                                  type="button"
                                  role="option"
                                  aria-selected={isChosen}
                                  onClick={() =>
                                    setSelectedRecipientId(person.id)
                                  }
                                  className={cn(
                                    "flex min-h-[44px] w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cru-gold",
                                    isChosen
                                      ? "bg-white font-semibold text-cru-charcoal ring-1 ring-cru-gold dark:bg-cru-night-surface dark:text-cru-ink"
                                      : "text-cru-charcoal hover:bg-white/80 dark:text-cru-ink dark:hover:bg-white/5"
                                  )}
                                >
                                  <span>{person.full_name}</span>
                                  <span className="font-mono text-[10px] uppercase text-cru-muted dark:text-cru-ink-muted">
                                    {person.role}
                                  </span>
                                </button>
                              );
                            })
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <label
                            htmlFor="recipient-custom-name"
                            className="text-xs font-medium text-cru-charcoal dark:text-cru-ink"
                          >
                            Recipient Name
                          </label>
                          <button
                            type="button"
                            onClick={() => setUseManualRecipient(false)}
                            className="text-xs font-medium text-cru-gold-text underline underline-offset-2 hover:opacity-80 dark:text-cru-gold"
                          >
                            Choose from list instead
                          </button>
                        </div>
                        <input
                          id="recipient-custom-name"
                          type="text"
                          value={recipientCustomName}
                          onChange={(e) =>
                            setRecipientCustomName(e.target.value)
                          }
                          placeholder="Full name of the leader, disciple, or member"
                          className="h-11 w-full rounded-xl border border-neutral-900/10 bg-white px-3.5 text-sm text-cru-charcoal placeholder:text-cru-muted focus:border-cru-gold focus:outline-none dark:border-white/10 dark:bg-cru-night-surface dark:text-cru-ink dark:placeholder:text-cru-ink-muted"
                        />
                      </div>
                    )}
                  </div>
                )}
              </fieldset>

              {/* Amount & Quick Presets */}
              <div className="space-y-2.5">
                <label
                  htmlFor="amount-php"
                  className="block text-xs font-semibold uppercase tracking-wider text-cru-charcoal dark:text-cru-ink"
                >
                  Amount Sent (PHP)
                </label>
                <div className="relative">
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-sm font-semibold text-cru-muted dark:text-cru-ink-muted"
                  >
                    PHP
                  </span>
                  <input
                    id="amount-php"
                    type="number"
                    min="1"
                    step="any"
                    required
                    value={amountPhp}
                    onChange={(e) => setAmountPhp(e.target.value)}
                    placeholder="0.00"
                    className="h-12 w-full rounded-xl border border-neutral-900/10 bg-cru-surface pl-14 pr-4 font-mono text-base font-semibold tabular-nums text-cru-charcoal placeholder:text-cru-muted focus:border-cru-gold focus:bg-white focus:outline-none dark:border-white/10 dark:bg-cru-night dark:text-cru-ink dark:focus:bg-cru-night"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {QUICK_AMOUNTS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setAmountPhp(String(preset))}
                      className={cn(
                        "min-h-[44px] rounded-full border px-4 py-1.5 font-mono text-xs font-medium tabular-nums transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cru-gold",
                        Number(amountPhp) === preset
                          ? "border-cru-gold bg-cru-gold-soft text-cru-charcoal dark:bg-cru-gold/20 dark:text-cru-ink"
                          : "border-neutral-900/10 bg-cru-surface text-cru-charcoal hover:border-cru-gold dark:border-white/10 dark:bg-cru-night dark:text-cru-ink"
                      )}
                    >
                      PHP {preset.toLocaleString("en-PH")}
                    </button>
                  ))}
                </div>
              </div>

              {/* Channel Used & Reference Number */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="channel-used"
                    className="mb-1.5 block text-xs font-medium text-cru-charcoal dark:text-cru-ink"
                  >
                    Cru EV Channel Used
                  </label>
                  {channels.length > 0 ? (
                    <select
                      id="channel-used"
                      value={channelUsedName}
                      onChange={(e) => {
                        const val = e.target.value;
                        setChannelUsedName(val);
                        const match = channels.find(
                          (c) => c.provider_name === val
                        );
                        if (match) setSelectedChannelId(match.id);
                      }}
                      className="h-11 w-full rounded-xl border border-neutral-900/10 bg-cru-surface px-3.5 text-sm text-cru-charcoal focus:border-cru-gold focus:bg-white focus:outline-none dark:border-white/10 dark:bg-cru-night dark:text-cru-ink"
                    >
                      {channels.map((ch) => (
                        <option key={ch.id} value={ch.provider_name}>
                          {ch.provider_name} ({ch.account_name})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      id="channel-used"
                      type="text"
                      required
                      value={channelUsedName}
                      onChange={(e) => setChannelUsedName(e.target.value)}
                      placeholder="e.g., GCash, BPI, Cash"
                      className="h-11 w-full rounded-xl border border-neutral-900/10 bg-cru-surface px-3.5 text-sm text-cru-charcoal placeholder:text-cru-muted focus:border-cru-gold focus:bg-white focus:outline-none dark:border-white/10 dark:bg-cru-night dark:text-cru-ink"
                    />
                  )}
                </div>

                <div>
                  <label
                    htmlFor="reference-number"
                    className="mb-1.5 block text-xs font-medium text-cru-charcoal dark:text-cru-ink"
                  >
                    Reference / Transaction No.{" "}
                    <span className="text-cru-muted dark:text-cru-ink-muted">
                      (optional)
                    </span>
                  </label>
                  <input
                    id="reference-number"
                    type="text"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    placeholder="e.g., 1029 3847 5610"
                    className="h-11 w-full rounded-xl border border-neutral-900/10 bg-cru-surface px-3.5 font-mono text-sm text-cru-charcoal placeholder:font-sans placeholder:text-cru-muted focus:border-cru-gold focus:bg-white focus:outline-none dark:border-white/10 dark:bg-cru-night dark:text-cru-ink"
                  />
                </div>
              </div>

              {/* Optional Receipt Screenshot Upload */}
              <div>
                <label
                  htmlFor="receipt-upload"
                  className="mb-1.5 block text-xs font-medium text-cru-charcoal dark:text-cru-ink"
                >
                  Receipt Screenshot{" "}
                  <span className="text-cru-muted dark:text-cru-ink-muted">
                    (optional, PNG/JPG/WebP/PDF up to 5 MB)
                  </span>
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  <input
                    ref={fileInputRef}
                    id="receipt-upload"
                    type="file"
                    accept="image/png,image/jpeg,image/webp,application/pdf"
                    onChange={handleFileChange}
                    className="sr-only"
                  />
                  <label
                    htmlFor="receipt-upload"
                    className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-dashed border-neutral-900/20 bg-cru-surface px-4 py-2 text-xs font-medium text-cru-charcoal transition-colors hover:border-cru-gold focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-cru-gold dark:border-white/20 dark:bg-cru-night dark:text-cru-ink"
                  >
                    <Upload aria-hidden="true" className="size-4" />
                    <span>
                      {receiptFile ? "Change receipt file" : "Attach receipt"}
                    </span>
                  </label>
                  {receiptFile && (
                    <div className="inline-flex items-center gap-2 rounded-xl border border-neutral-900/10 bg-cru-surface px-3 py-2 text-xs text-cru-charcoal dark:border-white/10 dark:bg-cru-night dark:text-cru-ink">
                      <span className="max-w-[200px] truncate">
                        {receiptFile.name}
                      </span>
                      <button
                        type="button"
                        aria-label="Remove attached receipt"
                        onClick={() => {
                          setReceiptFile(null);
                          if (fileInputRef.current)
                            fileInputRef.current.value = "";
                        }}
                        className="text-cru-muted hover:text-cru-charcoal dark:text-cru-ink-muted dark:hover:text-cru-ink"
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Donor Identity & Message */}
              <div className="space-y-4 border-t border-neutral-900/[0.06] pt-5 dark:border-white/10">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-cru-charcoal dark:text-cru-ink">
                    Your Details
                  </span>
                  <label
                    htmlFor="give-anonymously"
                    className="inline-flex min-h-[44px] items-center gap-2 text-xs font-medium text-cru-charcoal dark:text-cru-ink"
                  >
                    <input
                      id="give-anonymously"
                      type="checkbox"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      className="size-4 rounded border-neutral-900/20 accent-cru-gold"
                    />
                    <span>Give anonymously</span>
                  </label>
                </div>

                {!isAnonymous && (
                  <div>
                    <label
                      htmlFor="donor-name"
                      className="mb-1.5 block text-xs font-medium text-cru-charcoal dark:text-cru-ink"
                    >
                      Your Full Name
                    </label>
                    <input
                      id="donor-name"
                      type="text"
                      required={!isAnonymous}
                      value={donorName}
                      onChange={(e) => setDonorName(e.target.value)}
                      placeholder="Juan Dela Cruz"
                      className="h-11 w-full rounded-xl border border-neutral-900/10 bg-cru-surface px-3.5 text-sm text-cru-charcoal placeholder:text-cru-muted focus:border-cru-gold focus:bg-white focus:outline-none dark:border-white/10 dark:bg-cru-night dark:text-cru-ink"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="donor-email"
                      className="mb-1.5 block text-xs font-medium text-cru-charcoal dark:text-cru-ink"
                    >
                      Email{" "}
                      <span className="text-cru-muted dark:text-cru-ink-muted">
                        (optional)
                      </span>
                    </label>
                    <input
                      id="donor-email"
                      type="email"
                      value={donorEmail}
                      onChange={(e) => setDonorEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="h-11 w-full rounded-xl border border-neutral-900/10 bg-cru-surface px-3.5 text-sm text-cru-charcoal placeholder:text-cru-muted focus:border-cru-gold focus:bg-white focus:outline-none dark:border-white/10 dark:bg-cru-night dark:text-cru-ink"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="donor-phone"
                      className="mb-1.5 block text-xs font-medium text-cru-charcoal dark:text-cru-ink"
                    >
                      Mobile Number{" "}
                      <span className="text-cru-muted dark:text-cru-ink-muted">
                        (optional)
                      </span>
                    </label>
                    <input
                      id="donor-phone"
                      type="tel"
                      value={donorPhone}
                      onChange={(e) => setDonorPhone(e.target.value)}
                      placeholder="09XX XXX XXXX"
                      className="h-11 w-full rounded-xl border border-neutral-900/10 bg-cru-surface px-3.5 text-sm text-cru-charcoal placeholder:text-cru-muted focus:border-cru-gold focus:bg-white focus:outline-none dark:border-white/10 dark:bg-cru-night dark:text-cru-ink"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="donor-message"
                    className="mb-1.5 block text-xs font-medium text-cru-charcoal dark:text-cru-ink"
                  >
                    Message or Prayer Note{" "}
                    <span className="text-cru-muted dark:text-cru-ink-muted">
                      (optional)
                    </span>
                  </label>
                  <textarea
                    id="donor-message"
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Share a note of encouragement, prayer request, or purpose for this gift..."
                    className="w-full rounded-xl border border-neutral-900/10 bg-cru-surface p-3.5 text-sm text-cru-charcoal placeholder:text-cru-muted focus:border-cru-gold focus:bg-white focus:outline-none dark:border-white/10 dark:bg-cru-night dark:text-cru-ink"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full bg-cru-gold px-6 py-3 text-sm font-semibold text-cru-charcoal transition-colors hover:bg-cru-gold-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cru-charcoal disabled:opacity-60 dark:focus-visible:outline-cru-ink"
              >
                {isPending && (
                  <Loader2 aria-hidden="true" className="size-4 animate-spin" />
                )}
                <span>
                  {isPending
                    ? "Recording gift..."
                    : "Record Gift for Tracking"}
                </span>
              </button>
            </form>
          )}
        </section>
      </div>

      {/* QR Enlarge Modal */}
      {qrModalChannel && qrModalChannel.qr_image_url && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${qrModalChannel.provider_name} QR code`}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
          onClick={() => setQrModalChannel(null)}
        >
          <div
            className="w-full max-w-sm rounded-[24px] border border-neutral-900/10 bg-white p-6 shadow-xl dark:border-white/10 dark:bg-cru-night-surface"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-wider text-cru-muted dark:text-cru-ink-muted">
                  Cru Eastern Visayas
                </div>
                <h3 className="text-base font-semibold text-cru-charcoal dark:text-cru-ink">
                  {qrModalChannel.provider_name}
                </h3>
              </div>
              <button
                type="button"
                aria-label="Close QR modal"
                onClick={() => setQrModalChannel(null)}
                className="grid size-10 place-items-center rounded-full text-cru-muted transition-colors hover:bg-neutral-900/5 hover:text-cru-charcoal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cru-gold dark:text-cru-ink-muted dark:hover:bg-white/10 dark:hover:text-cru-ink"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="mt-4 rounded-2xl border border-neutral-900/[0.08] bg-white p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrModalChannel.qr_image_url}
                alt={`${qrModalChannel.provider_name} QR code`}
                width={320}
                height={320}
                className="mx-auto size-[280px] object-contain"
              />
            </div>

            <div className="mt-4 text-center text-xs text-cru-muted dark:text-cru-ink-muted">
              <div className="font-medium text-cru-charcoal dark:text-cru-ink">
                {qrModalChannel.account_name}
              </div>
              <div className="mt-0.5 font-mono">
                {qrModalChannel.account_number}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
