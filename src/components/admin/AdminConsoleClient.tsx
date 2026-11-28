"use client";

import { Fragment, useRef, useState, useTransition } from "react";
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  HeartHandshake,
  Inbox,
  Landmark,
  Layers,
  Loader2,
  Plus,
  Trash2,
  UserCheck,
  Users,
  XCircle,
} from "lucide-react";
import {
  createGivingChannel,
  createMinistryProject,
  deleteGivingChannel,
  getDonationReceiptUrl,
  pairMentorshipRequest,
  reviewDisciplerApplication,
  toggleGivingChannelActive,
  toggleProjectActive,
  updateDonationStatus,
  updateJoinInquiryStatus,
} from "@/app/actions/admin";
import { cn } from "@/lib/utils";
import type {
  DisciplerApplication,
  Donation,
  DonationDesignationType,
  DonationStatus,
  GivingChannel,
  InquiryStatus,
  JoinInquiry,
  MentorshipRequest,
  MinistryProject,
  Profile,
} from "@/types/database";

export interface EnrichedApplication extends DisciplerApplication {
  applicantName: string;
  applicantProgram: string | null;
}

export interface EnrichedMentorship extends MentorshipRequest {
  requesterName: string;
  requesterProgram: string | null;
}

export interface EnrichedDonation extends Donation {
  recipientName: string;
}

interface AdminConsoleClientProps {
  applications: EnrichedApplication[];
  mentorships: EnrichedMentorship[];
  inquiries: JoinInquiry[];
  projects: MinistryProject[];
  disciplers: Profile[];
  donations: EnrichedDonation[];
  givingChannels: GivingChannel[];
}

type TabKey =
  | "applications"
  | "mentorship"
  | "inquiries"
  | "donations"
  | "channels"
  | "projects";

interface FeedbackState {
  type: "success" | "error";
  message: string;
}

const FOCUS_RING =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cru-gold";

const INPUT_CLASS =
  "h-11 w-full rounded-lg border border-neutral-900/15 bg-white px-3.5 text-sm text-cru-charcoal placeholder:text-cru-muted focus:border-cru-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cru-gold dark:border-white/15 dark:bg-cru-night dark:text-cru-ink dark:placeholder:text-cru-ink-muted";

const SELECT_CLASS =
  "h-11 rounded-lg border border-neutral-900/15 bg-white px-3 text-xs font-medium text-cru-charcoal focus:border-cru-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cru-gold disabled:opacity-60 dark:border-white/15 dark:bg-cru-night dark:text-cru-ink";

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Declined",
  contacted: "Contacted",
  paired: "Paired",
  closed: "Closed",
  verified: "Verified",
  distributed: "Distributed",
};

function getStatusBadgeClass(status: string): string {
  switch (status) {
    case "approved":
    case "distributed":
    case "paired":
      return "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300";
    case "verified":
    case "contacted":
      return "bg-blue-500/15 text-blue-800 dark:text-blue-300";
    case "rejected":
    case "closed":
      return "bg-red-500/15 text-red-800 dark:text-red-300";
    default:
      return "bg-cru-gold-soft text-cru-gold-text dark:bg-cru-gold/15 dark:text-cru-gold";
  }
}

export function AdminConsoleClient({
  applications,
  mentorships,
  inquiries,
  projects,
  disciplers,
  donations,
  givingChannels,
}: AdminConsoleClientProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("applications");
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [selectedDisciplers, setSelectedDisciplers] = useState<
    Record<string, string>
  >({});
  const [donationStatusFilter, setDonationStatusFilter] = useState<
    "all" | DonationStatus
  >("all");
  const [donationDesignationFilter, setDonationDesignationFilter] = useState<
    "all" | DonationDesignationType
  >("all");

  const projectFormRef = useRef<HTMLFormElement | null>(null);
  const channelFormRef = useRef<HTMLFormElement | null>(null);

  const pendingAppsCount = applications.filter(
    (a) => a.status === "pending"
  ).length;
  const pendingMentorshipCount = mentorships.filter(
    (m) => m.status === "pending"
  ).length;
  const pendingInquiriesCount = inquiries.filter(
    (i) => i.status === "pending"
  ).length;
  const pendingDonationsCount = donations.filter(
    (d) => d.status === "pending"
  ).length;
  const activeChannelsCount = givingChannels.filter((c) => c.is_active).length;

  const filteredDonations = donations.filter((d) => {
    if (donationStatusFilter !== "all" && d.status !== donationStatusFilter) {
      return false;
    }
    if (
      donationDesignationFilter !== "all" &&
      d.designation_type !== donationDesignationFilter
    ) {
      return false;
    }
    return true;
  });

  const runAction = (
    fn: () => Promise<{ success: boolean; message: string }>,
    onSuccess?: () => void
  ) => {
    setFeedback(null);
    startTransition(async () => {
      const res = await fn();
      setFeedback({
        type: res.success ? "success" : "error",
        message: res.message,
      });
      if (res.success) {
        onSuccess?.();
      }
    });
  };

  const handleViewReceipt = (storagePath: string) => {
    setFeedback(null);
    startTransition(async () => {
      const res = await getDonationReceiptUrl(storagePath);
      if (res.success && res.url) {
        window.open(res.url, "_blank", "noopener,noreferrer");
      } else {
        setFeedback({
          type: "error",
          message: res.message ?? "Could not open receipt.",
        });
      }
    });
  };

  const navGroups: Array<{
    groupLabel: string;
    items: Array<{
      key: TabKey;
      label: string;
      count: number;
      icon: typeof UserCheck;
    }>;
  }> = [
    {
      groupLabel: "People & Triage",
      items: [
        {
          key: "applications",
          label: "Discipler Approvals",
          count: pendingAppsCount,
          icon: UserCheck,
        },
        {
          key: "mentorship",
          label: "Mentorship Pairing",
          count: pendingMentorshipCount,
          icon: Users,
        },
        {
          key: "inquiries",
          label: "Join Cru Inquiries",
          count: pendingInquiriesCount,
          icon: Inbox,
        },
      ],
    },
    {
      groupLabel: "Ministry & Stewardship",
      items: [
        {
          key: "donations",
          label: "Donations",
          count: pendingDonationsCount,
          icon: HeartHandshake,
        },
        {
          key: "channels",
          label: "Cru EV Channels",
          count: activeChannelsCount,
          icon: Landmark,
        },
        {
          key: "projects",
          label: "Ministry Projects",
          count: projects.length,
          icon: Layers,
        },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {feedback && (
        <div
          role={feedback.type === "error" ? "alert" : "status"}
          aria-live="polite"
          className={cn(
            "flex items-center gap-2.5 rounded-xl border px-4 py-3 text-xs font-medium",
            feedback.type === "error"
              ? "border-red-500/30 bg-red-500/[0.06] text-red-800 dark:bg-red-500/10 dark:text-red-300"
              : "border-emerald-500/30 bg-emerald-500/[0.06] text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300"
          )}
        >
          {feedback.type === "error" ? (
            <AlertCircle aria-hidden="true" className="size-4 shrink-0" />
          ) : (
            <CheckCircle2 aria-hidden="true" className="size-4 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[232px_minmax(0,1fr)]">
        {/* Left Navigation Rail (Desktop sticky sidebar; horizontal scrollable strip on mobile) */}
        <aside className="lg:sticky lg:top-28">
          <div
            role="tablist"
            aria-label="Admin console sections"
            className="flex gap-1 overflow-x-auto border-b border-neutral-900/[0.08] pb-2 dark:border-white/10 lg:flex-col lg:overflow-visible lg:border-b-0 lg:pb-0"
          >
            {navGroups.map((group, groupIndex) => (
              <Fragment key={group.groupLabel}>
                <div
                  className={cn(
                    "hidden px-3 text-[11px] font-medium text-cru-muted dark:text-cru-ink-muted lg:block",
                    groupIndex === 0 ? "pb-1.5" : "pt-5 pb-1.5"
                  )}
                >
                  {group.groupLabel}
                </div>
                {group.items.map((tab) => {
                  const Icon = tab.icon;
                  const active = activeTab === tab.key;
                  return (
                    <button
                      key={tab.key}
                      id={`admin-tab-${tab.key}`}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      aria-controls={`admin-panel-${tab.key}`}
                      onClick={() => setActiveTab(tab.key)}
                      className={cn(
                        "inline-flex min-h-[44px] shrink-0 items-center justify-between gap-2.5 whitespace-nowrap rounded-lg border-b-2 px-3 py-2 text-xs transition-colors lg:w-full lg:rounded-none lg:rounded-r-lg lg:border-b-0 lg:border-l-2",
                        FOCUS_RING,
                        active
                          ? "border-cru-gold bg-cru-surface font-semibold text-cru-charcoal dark:bg-cru-night-surface dark:text-cru-ink"
                          : "border-transparent font-medium text-cru-muted hover:bg-cru-surface/70 hover:text-cru-charcoal dark:text-cru-ink-muted dark:hover:bg-cru-night-surface/60 dark:hover:text-cru-ink"
                      )}
                    >
                      <span className="flex items-center gap-2.5">
                        <Icon
                          aria-hidden="true"
                          className={cn(
                            "size-4 shrink-0",
                            active
                              ? "text-cru-gold-text dark:text-cru-gold"
                              : "text-current"
                          )}
                        />
                        <span>{tab.label}</span>
                      </span>
                      <span
                        className={cn(
                          "font-mono text-[11px] tabular-nums",
                          active
                            ? "text-cru-gold-text dark:text-cru-gold"
                            : "text-cru-muted dark:text-cru-ink-muted"
                        )}
                      >
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </Fragment>
            ))}
          </div>
        </aside>

        {/* Main Active Queue Panel */}
        <div
          id={`admin-panel-${activeTab}`}
          role="tabpanel"
          aria-labelledby={`admin-tab-${activeTab}`}
          className="min-w-0 space-y-5"
        >
          {/* Tab 1: Discipler Applications */}
          {activeTab === "applications" && (
            <section className="space-y-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-base font-semibold text-cru-charcoal dark:text-cru-ink">
                  Discipler Approvals
                </h2>
                <span className="font-mono text-xs tabular-nums text-cru-muted dark:text-cru-ink-muted">
                  {pendingAppsCount} pending · {applications.length} total
                </span>
              </div>

              {applications.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-neutral-900/15 bg-cru-surface p-8 text-center text-sm text-cru-muted dark:border-white/15 dark:bg-cru-night-surface dark:text-cru-ink-muted">
                  No discipler applications yet. Members can apply from their
                  Member Dashboard once they are ready to lead.
                </div>
              ) : (
                <div className="divide-y divide-neutral-900/[0.06] rounded-2xl border border-neutral-900/[0.08] bg-white dark:divide-white/[0.08] dark:border-white/10 dark:bg-cru-night-surface">
                  {applications.map((app) => (
                    <div
                      key={app.id}
                      className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center"
                    >
                      <div className="min-w-0 max-w-xl space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-semibold text-cru-charcoal dark:text-cru-ink">
                            {app.applicantName}
                          </h3>
                          <span
                            className={cn(
                              "rounded-md px-2 py-0.5 text-[11px] font-medium",
                              getStatusBadgeClass(app.status)
                            )}
                          >
                            {STATUS_LABELS[app.status] ?? app.status}
                          </span>
                        </div>
                        {app.applicantProgram && (
                          <p className="text-xs text-cru-muted dark:text-cru-ink-muted">
                            {app.applicantProgram}
                          </p>
                        )}
                        {app.notes && (
                          <p className="pt-1 text-xs leading-relaxed text-cru-charcoal/85 dark:text-cru-ink/85">
                            &ldquo;{app.notes}&rdquo;
                          </p>
                        )}
                      </div>

                      {app.status === "pending" && (
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() =>
                              runAction(() =>
                                reviewDisciplerApplication(
                                  app.id,
                                  app.applicant_id,
                                  "approved"
                                )
                              )
                            }
                            className={cn(
                              "inline-flex min-h-[44px] items-center gap-1.5 rounded-full bg-cru-gold px-4 text-xs font-semibold text-cru-charcoal transition-colors hover:bg-cru-gold-hover disabled:opacity-50",
                              FOCUS_RING
                            )}
                          >
                            <CheckCircle2 aria-hidden="true" className="size-3.5" />
                            <span>Approve</span>
                          </button>
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() =>
                              runAction(() =>
                                reviewDisciplerApplication(
                                  app.id,
                                  app.applicant_id,
                                  "rejected"
                                )
                              )
                            }
                            className={cn(
                              "inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border border-neutral-900/15 bg-white px-3.5 text-xs font-medium text-cru-charcoal transition-colors hover:border-red-400 hover:text-red-700 disabled:opacity-50 dark:border-white/15 dark:bg-cru-night dark:text-cru-ink dark:hover:text-red-400",
                              FOCUS_RING
                            )}
                          >
                            <XCircle aria-hidden="true" className="size-3.5" />
                            <span>Decline</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Tab 2: Mentorship Pairing */}
          {activeTab === "mentorship" && (
            <section className="space-y-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-base font-semibold text-cru-charcoal dark:text-cru-ink">
                  Mentorship Pairing
                </h2>
                <span className="font-mono text-xs tabular-nums text-cru-muted dark:text-cru-ink-muted">
                  {pendingMentorshipCount} pending · {mentorships.length} total
                </span>
              </div>

              {mentorships.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-neutral-900/15 bg-cru-surface p-8 text-center text-sm text-cru-muted dark:border-white/15 dark:bg-cru-night-surface dark:text-cru-ink-muted">
                  No mentorship requests yet. Students can request a spiritual
                  parent from their Member Dashboard.
                </div>
              ) : (
                <div className="divide-y divide-neutral-900/[0.06] rounded-2xl border border-neutral-900/[0.08] bg-white dark:divide-white/[0.08] dark:border-white/10 dark:bg-cru-night-surface">
                  {mentorships.map((req) => (
                    <div
                      key={req.id}
                      className="flex flex-col justify-between gap-4 p-5 lg:flex-row lg:items-center"
                    >
                      <div className="min-w-0 max-w-lg space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-semibold text-cru-charcoal dark:text-cru-ink">
                            {req.requesterName}
                          </h3>
                          <span
                            className={cn(
                              "rounded-md px-2 py-0.5 text-[11px] font-medium",
                              getStatusBadgeClass(req.status)
                            )}
                          >
                            {STATUS_LABELS[req.status] ?? req.status}
                          </span>
                        </div>
                        {req.requesterProgram && (
                          <p className="text-xs text-cru-muted dark:text-cru-ink-muted">
                            {req.requesterProgram}
                          </p>
                        )}
                        {req.preferred_notes && (
                          <p className="pt-1 text-xs text-cru-charcoal/85 dark:text-cru-ink/85">
                            Notes: {req.preferred_notes}
                          </p>
                        )}
                      </div>

                      {req.status === "pending" && (
                        <div className="flex flex-wrap items-center gap-2">
                          <select
                            aria-label={`Select discipler for ${req.requesterName}`}
                            value={selectedDisciplers[req.id] ?? ""}
                            onChange={(e) =>
                              setSelectedDisciplers((prev) => ({
                                ...prev,
                                [req.id]: e.target.value,
                              }))
                            }
                            className={SELECT_CLASS}
                          >
                            <option value="">Select a Discipler...</option>
                            {disciplers.map((d) => (
                              <option key={d.id} value={d.id}>
                                {d.full_name} (Gen {d.generation_depth})
                              </option>
                            ))}
                          </select>

                          <button
                            type="button"
                            disabled={isPending || !selectedDisciplers[req.id]}
                            onClick={() =>
                              runAction(() =>
                                pairMentorshipRequest(
                                  req.id,
                                  req.requester_id,
                                  selectedDisciplers[req.id]
                                )
                              )
                            }
                            className={cn(
                              "inline-flex min-h-[44px] items-center gap-1.5 rounded-full bg-cru-gold px-4 text-xs font-semibold text-cru-charcoal transition-colors hover:bg-cru-gold-hover disabled:opacity-50",
                              FOCUS_RING
                            )}
                          >
                            <span>Pair &amp; Link</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Tab 3: Join Cru Inquiries */}
          {activeTab === "inquiries" && (
            <section className="space-y-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-base font-semibold text-cru-charcoal dark:text-cru-ink">
                  Join Cru Inquiries
                </h2>
                <span className="font-mono text-xs tabular-nums text-cru-muted dark:text-cru-ink-muted">
                  {pendingInquiriesCount} pending · {inquiries.length} total
                </span>
              </div>

              {inquiries.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-neutral-900/15 bg-cru-surface p-8 text-center text-sm text-cru-muted dark:border-white/15 dark:bg-cru-night-surface dark:text-cru-ink-muted">
                  No Join Cru inquiries yet. Submissions from the home page
                  intake form appear here for follow-up.
                </div>
              ) : (
                <div className="divide-y divide-neutral-900/[0.06] rounded-2xl border border-neutral-900/[0.08] bg-white dark:divide-white/[0.08] dark:border-white/10 dark:bg-cru-night-surface">
                  {inquiries.map((inq) => (
                    <div
                      key={inq.id}
                      className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center"
                    >
                      <div className="min-w-0 max-w-lg space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-semibold text-cru-charcoal dark:text-cru-ink">
                            {inq.full_name}
                          </h3>
                          <span
                            className={cn(
                              "rounded-md px-2 py-0.5 text-[11px] font-medium",
                              getStatusBadgeClass(inq.status)
                            )}
                          >
                            {STATUS_LABELS[inq.status] ?? inq.status}
                          </span>
                        </div>
                        <p className="text-xs text-cru-muted dark:text-cru-ink-muted">
                          {inq.email}
                          {inq.phone ? ` · ${inq.phone}` : ""}
                          {inq.college_course_year
                            ? ` · ${inq.college_course_year}`
                            : ""}
                        </p>
                        {inq.spiritual_interest && (
                          <p className="pt-1 text-xs text-cru-charcoal/85 dark:text-cru-ink/85">
                            Interest: {inq.spiritual_interest}
                          </p>
                        )}
                      </div>

                      <div className="shrink-0">
                        <select
                          aria-label={`Update status for ${inq.full_name}`}
                          value={inq.status}
                          disabled={isPending}
                          onChange={(e) =>
                            runAction(() =>
                              updateJoinInquiryStatus(
                                inq.id,
                                e.target.value as InquiryStatus
                              )
                            )
                          }
                          className={SELECT_CLASS}
                        >
                          <option value="pending">Pending</option>
                          <option value="contacted">Contacted</option>
                          <option value="paired">Paired</option>
                          <option value="closed">Closed</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Tab 4: Donations Ledger */}
          {activeTab === "donations" && (
            <section className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-base font-semibold text-cru-charcoal dark:text-cru-ink">
                  Donations Ledger
                </h2>

                <div className="flex flex-wrap items-center gap-2">
                  <label
                    htmlFor="filter-donation-status"
                    className="text-xs font-medium text-cru-muted dark:text-cru-ink-muted"
                  >
                    Status
                  </label>
                  <select
                    id="filter-donation-status"
                    value={donationStatusFilter}
                    onChange={(e) =>
                      setDonationStatusFilter(
                        e.target.value as "all" | DonationStatus
                      )
                    }
                    className={SELECT_CLASS}
                  >
                    <option value="all">All ({donations.length})</option>
                    <option value="pending">
                      Pending ({pendingDonationsCount})
                    </option>
                    <option value="verified">Verified</option>
                    <option value="distributed">Distributed</option>
                  </select>

                  <label
                    htmlFor="filter-donation-designation"
                    className="ml-1 text-xs font-medium text-cru-muted dark:text-cru-ink-muted"
                  >
                    For
                  </label>
                  <select
                    id="filter-donation-designation"
                    value={donationDesignationFilter}
                    onChange={(e) =>
                      setDonationDesignationFilter(
                        e.target.value as "all" | DonationDesignationType
                      )
                    }
                    className={SELECT_CLASS}
                  >
                    <option value="all">All Designations</option>
                    <option value="general_fund">General Ministry Fund</option>
                    <option value="specific_person">Specific Person</option>
                  </select>
                </div>
              </div>

              {filteredDonations.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-neutral-900/15 bg-cru-surface p-8 text-center text-sm text-cru-muted dark:border-white/15 dark:bg-cru-night-surface dark:text-cru-ink-muted">
                  {donations.length === 0
                    ? "No gifts logged yet. Gifts submitted on /give will appear here for Cru EV verification."
                    : "No donation records match the selected filters."}
                </div>
              ) : (
                <div className="divide-y divide-neutral-900/[0.06] rounded-2xl border border-neutral-900/[0.08] bg-white dark:divide-white/[0.08] dark:border-white/10 dark:bg-cru-night-surface">
                  {filteredDonations.map((donation) => (
                    <div
                      key={donation.id}
                      className="flex flex-col justify-between gap-4 p-5 md:flex-row md:items-start"
                    >
                      <div className="min-w-0 space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-sm font-semibold tabular-nums text-cru-charcoal dark:text-cru-ink">
                            PHP{" "}
                            {Number(donation.amount_php).toLocaleString(
                              "en-PH",
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }
                            )}
                          </span>
                          <span
                            className={cn(
                              "rounded-md px-2 py-0.5 text-[11px] font-medium",
                              getStatusBadgeClass(donation.status)
                            )}
                          >
                            {STATUS_LABELS[donation.status] ?? donation.status}
                          </span>
                          <span className="rounded-md bg-neutral-900/[0.05] px-2 py-0.5 text-[11px] font-medium text-cru-charcoal dark:bg-white/10 dark:text-cru-ink">
                            {donation.channel_name_snapshot}
                          </span>
                        </div>

                        <div className="text-sm font-medium text-cru-charcoal dark:text-cru-ink">
                          For: {donation.recipientName}
                          {donation.designation_type === "specific_person" &&
                            !donation.recipient_profile_id &&
                            donation.recipient_custom_name && (
                              <span className="ml-1.5 text-xs font-normal text-cru-muted dark:text-cru-ink-muted">
                                (manual name)
                              </span>
                            )}
                        </div>

                        <div className="text-xs text-cru-muted dark:text-cru-ink-muted">
                          From:{" "}
                          <span className="font-medium text-cru-charcoal dark:text-cru-ink">
                            {donation.is_anonymous
                              ? "Anonymous"
                              : donation.donor_name || "Unnamed"}
                          </span>
                          {donation.donor_email
                            ? ` · ${donation.donor_email}`
                            : ""}
                          {donation.donor_phone
                            ? ` · ${donation.donor_phone}`
                            : ""}
                          {donation.reference_number
                            ? ` · Ref: ${donation.reference_number}`
                            : ""}
                        </div>

                        {donation.message && (
                          <p className="mt-1 rounded-lg border border-neutral-900/[0.06] bg-cru-surface px-3 py-2 text-xs leading-relaxed text-cru-charcoal/85 dark:border-white/10 dark:bg-cru-night dark:text-cru-ink/85">
                            &ldquo;{donation.message}&rdquo;
                          </p>
                        )}

                        <div className="font-mono text-[11px] text-cru-muted dark:text-cru-ink-muted">
                          CRU-{donation.id.slice(0, 8).toUpperCase()} ·{" "}
                          {new Date(donation.created_at).toLocaleString(
                            "en-PH"
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 md:justify-end">
                        {donation.receipt_storage_path && (
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() =>
                              handleViewReceipt(donation.receipt_storage_path!)
                            }
                            className={cn(
                              "inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border border-neutral-900/15 bg-white px-3.5 text-xs font-medium text-cru-charcoal transition-colors hover:border-cru-gold disabled:opacity-60 dark:border-white/15 dark:bg-cru-night dark:text-cru-ink",
                              FOCUS_RING
                            )}
                          >
                            <FileText aria-hidden="true" className="size-3.5" />
                            <span>View Receipt</span>
                          </button>
                        )}

                        <select
                          aria-label={`Update status for donation CRU-${donation.id.slice(0, 8).toUpperCase()}`}
                          value={donation.status}
                          disabled={isPending}
                          onChange={(e) =>
                            runAction(() =>
                              updateDonationStatus(
                                donation.id,
                                e.target.value as DonationStatus
                              )
                            )
                          }
                          className={SELECT_CLASS}
                        >
                          <option value="pending">Pending</option>
                          <option value="verified">Verified</option>
                          <option value="distributed">Distributed</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Tab 5: Cru EV Giving Channels */}
          {activeTab === "channels" && (
            <section className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[1.2fr_1fr]">
              <div className="space-y-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h2 className="text-base font-semibold text-cru-charcoal dark:text-cru-ink">
                    Cru EV Channels
                  </h2>
                  <span className="font-mono text-xs tabular-nums text-cru-muted dark:text-cru-ink-muted">
                    {activeChannelsCount} active · {givingChannels.length} total
                  </span>
                </div>

                {givingChannels.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-neutral-900/15 bg-cru-surface p-8 text-center text-sm text-cru-muted dark:border-white/15 dark:bg-cru-night-surface dark:text-cru-ink-muted">
                    No Cru Eastern Visayas channels added yet. Add a bank or
                    e-wallet account using the form to publish it on /give.
                  </div>
                ) : (
                  <div className="divide-y divide-neutral-900/[0.06] rounded-2xl border border-neutral-900/[0.08] bg-white dark:divide-white/[0.08] dark:border-white/10 dark:bg-cru-night-surface">
                    {givingChannels.map((ch) => (
                      <div
                        key={ch.id}
                        className="flex flex-wrap items-center justify-between gap-4 p-5"
                      >
                        <div className="flex items-center gap-4">
                          {ch.qr_image_url ? (
                            <div className="shrink-0 rounded-lg border border-neutral-900/10 bg-white p-1">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={ch.qr_image_url}
                                alt={`${ch.provider_name} QR`}
                                width={56}
                                height={56}
                                className="size-14 object-contain"
                              />
                            </div>
                          ) : (
                            <div className="grid size-14 shrink-0 place-items-center rounded-lg border border-dashed border-neutral-900/15 bg-cru-surface font-mono text-[10px] text-cru-muted dark:border-white/15 dark:bg-cru-night dark:text-cru-ink-muted">
                              No QR
                            </div>
                          )}

                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-semibold text-cru-charcoal dark:text-cru-ink">
                                {ch.provider_name}
                              </span>
                              <span className="rounded-md bg-neutral-900/[0.05] px-2 py-0.5 text-[11px] font-medium text-cru-muted dark:bg-white/10 dark:text-cru-ink-muted">
                                {ch.channel_type === "ewallet"
                                  ? "E-Wallet"
                                  : "Bank"}
                              </span>
                              <span
                                className={cn(
                                  "rounded-md px-2 py-0.5 text-[11px] font-medium",
                                  ch.is_active
                                    ? "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300"
                                    : "bg-neutral-200 text-neutral-700 dark:bg-white/10 dark:text-cru-ink-muted"
                                )}
                              >
                                {ch.is_active ? "Active" : "Hidden"}
                              </span>
                            </div>
                            <div className="mt-0.5 text-xs text-cru-charcoal dark:text-cru-ink">
                              {ch.account_name}
                            </div>
                            <div className="font-mono text-xs text-cru-muted dark:text-cru-ink-muted">
                              {ch.account_number}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() =>
                              runAction(() =>
                                toggleGivingChannelActive(ch.id, !ch.is_active)
                              )
                            }
                            className={cn(
                              "min-h-[44px] rounded-lg border border-neutral-900/15 bg-white px-4 text-xs font-medium text-cru-charcoal transition-colors hover:border-cru-gold disabled:opacity-60 dark:border-white/15 dark:bg-cru-night dark:text-cru-ink",
                              FOCUS_RING
                            )}
                          >
                            {ch.is_active ? "Hide" : "Activate"}
                          </button>
                          <button
                            type="button"
                            disabled={isPending}
                            aria-label={`Remove ${ch.provider_name}`}
                            onClick={() =>
                              runAction(() => deleteGivingChannel(ch.id))
                            }
                            className={cn(
                              "grid size-11 place-items-center rounded-lg border border-neutral-900/15 bg-white text-cru-muted transition-colors hover:border-red-300 hover:text-red-700 disabled:opacity-60 dark:border-white/15 dark:bg-cru-night dark:text-cru-ink-muted dark:hover:text-red-400",
                              FOCUS_RING
                            )}
                          >
                            <Trash2 aria-hidden="true" className="size-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add New Cru EV Channel Form */}
              <div className="rounded-2xl border border-neutral-900/[0.08] bg-cru-surface p-6 dark:border-white/10 dark:bg-cru-night-surface">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-cru-charcoal dark:text-cru-ink">
                  <Plus
                    aria-hidden="true"
                    className="size-4 text-cru-gold-text dark:text-cru-gold"
                  />
                  <span>Add Cru EV Channel</span>
                </h3>
                <form
                  ref={channelFormRef}
                  action={(fd) =>
                    runAction(
                      () => createGivingChannel(fd),
                      () => channelFormRef.current?.reset()
                    )
                  }
                  className="mt-4 space-y-4"
                >
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="channel-provider"
                        className="mb-1 block text-xs font-medium text-cru-charcoal dark:text-cru-ink"
                      >
                        Provider Name
                      </label>
                      <input
                        id="channel-provider"
                        name="providerName"
                        required
                        placeholder="e.g., GCash, BPI, Maya"
                        className={INPUT_CLASS}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="channel-type"
                        className="mb-1 block text-xs font-medium text-cru-charcoal dark:text-cru-ink"
                      >
                        Type
                      </label>
                      <select
                        id="channel-type"
                        name="channelType"
                        required
                        className={cn(SELECT_CLASS, "w-full text-sm")}
                      >
                        <option value="ewallet">E-Wallet</option>
                        <option value="bank">Bank Account</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="channel-account-name"
                      className="mb-1 block text-xs font-medium text-cru-charcoal dark:text-cru-ink"
                    >
                      Account Name
                    </label>
                    <input
                      id="channel-account-name"
                      name="accountName"
                      required
                      placeholder="e.g., Cru Eastern Visayas"
                      className={INPUT_CLASS}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-[2fr_1fr]">
                    <div>
                      <label
                        htmlFor="channel-account-number"
                        className="mb-1 block text-xs font-medium text-cru-charcoal dark:text-cru-ink"
                      >
                        Account / Mobile Number
                      </label>
                      <input
                        id="channel-account-number"
                        name="accountNumber"
                        required
                        placeholder="Account or mobile number"
                        className={cn(INPUT_CLASS, "font-mono")}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="channel-order"
                        className="mb-1 block text-xs font-medium text-cru-charcoal dark:text-cru-ink"
                      >
                        Order
                      </label>
                      <input
                        id="channel-order"
                        name="displayOrder"
                        type="number"
                        defaultValue={0}
                        className={cn(INPUT_CLASS, "font-mono")}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="channel-qr"
                      className="mb-1 block text-xs font-medium text-cru-charcoal dark:text-cru-ink"
                    >
                      QR Code Image (optional, PNG/JPG/WebP)
                    </label>
                    <input
                      id="channel-qr"
                      name="qrFile"
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className={cn(
                        "block w-full rounded-lg text-xs text-cru-muted file:mr-3 file:min-h-[44px] file:cursor-pointer file:rounded-lg file:border file:border-neutral-900/15 file:bg-white file:px-3.5 file:py-2 file:text-xs file:font-semibold file:text-cru-charcoal hover:file:border-cru-gold dark:text-cru-ink-muted dark:file:border-white/15 dark:file:bg-cru-night dark:file:text-cru-ink",
                        FOCUS_RING
                      )}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="channel-instructions"
                      className="mb-1 block text-xs font-medium text-cru-charcoal dark:text-cru-ink"
                    >
                      Transfer Note (optional)
                    </label>
                    <textarea
                      id="channel-instructions"
                      name="instructions"
                      rows={2}
                      placeholder="e.g., Include Cru VSU in the transfer note if your bank app allows it."
                      className={cn(
                        "w-full rounded-lg border border-neutral-900/15 bg-white p-3 text-sm text-cru-charcoal placeholder:text-cru-muted focus:border-cru-gold dark:border-white/15 dark:bg-cru-night dark:text-cru-ink dark:placeholder:text-cru-ink-muted",
                        FOCUS_RING
                      )}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isPending}
                    className={cn(
                      "inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full bg-cru-gold text-xs font-semibold text-cru-charcoal transition-colors hover:bg-cru-gold-hover disabled:opacity-60",
                      FOCUS_RING
                    )}
                  >
                    {isPending && (
                      <Loader2
                        aria-hidden="true"
                        className="size-3.5 animate-spin"
                      />
                    )}
                    <span>
                      {isPending ? "Saving channel..." : "Save Cru EV Channel"}
                    </span>
                  </button>
                </form>
              </div>
            </section>
          )}

          {/* Tab 6: Ministry Projects CMS */}
          {activeTab === "projects" && (
            <section className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[1.2fr_1fr]">
              <div className="space-y-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h2 className="text-base font-semibold text-cru-charcoal dark:text-cru-ink">
                    Ministry Projects
                  </h2>
                  <span className="font-mono text-xs tabular-nums text-cru-muted dark:text-cru-ink-muted">
                    {projects.filter((p) => p.is_active).length} active ·{" "}
                    {projects.length} total
                  </span>
                </div>

                {projects.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-neutral-900/15 bg-cru-surface p-8 text-center text-sm text-cru-muted dark:border-white/15 dark:bg-cru-night-surface dark:text-cru-ink-muted">
                    No ministry projects published yet. Use the form to add
                    fellowships, action groups, or outreach events.
                  </div>
                ) : (
                  <div className="divide-y divide-neutral-900/[0.06] rounded-2xl border border-neutral-900/[0.08] bg-white dark:divide-white/[0.08] dark:border-white/10 dark:bg-cru-night-surface">
                    {projects.map((proj) => (
                      <div
                        key={proj.id}
                        className="flex flex-wrap items-center justify-between gap-4 p-5"
                      >
                        <div className="min-w-0 max-w-md space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-md bg-neutral-900/[0.05] px-2 py-0.5 text-[11px] font-medium text-cru-muted dark:bg-white/10 dark:text-cru-ink-muted">
                              {proj.category}
                            </span>
                            <span
                              className={cn(
                                "rounded-md px-2 py-0.5 text-[11px] font-medium",
                                proj.is_active
                                  ? "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300"
                                  : "bg-neutral-200 text-neutral-700 dark:bg-white/10 dark:text-cru-ink-muted"
                              )}
                            >
                              {proj.is_active ? "Active" : "Paused"}
                            </span>
                          </div>
                          <h3 className="text-sm font-semibold text-cru-charcoal dark:text-cru-ink">
                            {proj.title}
                          </h3>
                          <p className="text-xs text-cru-muted dark:text-cru-ink-muted">
                            {proj.summary}
                          </p>
                        </div>

                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() =>
                            runAction(() =>
                              toggleProjectActive(proj.id, !proj.is_active)
                            )
                          }
                          className={cn(
                            "min-h-[44px] rounded-lg border border-neutral-900/15 bg-white px-4 text-xs font-medium text-cru-charcoal transition-colors hover:border-cru-gold disabled:opacity-50 dark:border-white/15 dark:bg-cru-night dark:text-cru-ink",
                            FOCUS_RING
                          )}
                        >
                          {proj.is_active ? "Pause" : "Activate"}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Create New Project Form */}
              <div className="rounded-2xl border border-neutral-900/[0.08] bg-cru-surface p-6 dark:border-white/10 dark:bg-cru-night-surface">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-cru-charcoal dark:text-cru-ink">
                  <Plus
                    aria-hidden="true"
                    className="size-4 text-cru-gold-text dark:text-cru-gold"
                  />
                  <span>New Ministry Project</span>
                </h3>

                <form
                  ref={projectFormRef}
                  action={(formData) =>
                    runAction(
                      () => createMinistryProject(formData),
                      () => projectFormRef.current?.reset()
                    )
                  }
                  className="mt-4 space-y-3.5"
                >
                  <div>
                    <label
                      htmlFor="project-title"
                      className="mb-1 block text-xs font-medium text-cru-charcoal dark:text-cru-ink"
                    >
                      Project Title
                    </label>
                    <input
                      id="project-title"
                      name="title"
                      required
                      placeholder="e.g., Summer Missions VSU"
                      className={INPUT_CLASS}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="project-category"
                      className="mb-1 block text-xs font-medium text-cru-charcoal dark:text-cru-ink"
                    >
                      Category
                    </label>
                    <select
                      id="project-category"
                      name="category"
                      required
                      className={cn(SELECT_CLASS, "w-full text-sm")}
                    >
                      <option value="Fellowship">Fellowship</option>
                      <option value="Action Groups">Action Groups</option>
                      <option value="Outreach">Outreach</option>
                      <option value="Missions">Missions</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="project-schedule"
                      className="mb-1 block text-xs font-medium text-cru-charcoal dark:text-cru-ink"
                    >
                      Schedule / Location
                    </label>
                    <input
                      id="project-schedule"
                      name="schedule"
                      placeholder="e.g., Fridays 5:30 PM @ Upper Campus"
                      className={INPUT_CLASS}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="project-summary"
                      className="mb-1 block text-xs font-medium text-cru-charcoal dark:text-cru-ink"
                    >
                      Short Summary
                    </label>
                    <input
                      id="project-summary"
                      name="summary"
                      required
                      placeholder="1-sentence overview for the card..."
                      className={INPUT_CLASS}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="project-description"
                      className="mb-1 block text-xs font-medium text-cru-charcoal dark:text-cru-ink"
                    >
                      Full Description
                    </label>
                    <textarea
                      id="project-description"
                      name="description"
                      rows={3}
                      required
                      placeholder="Detailed description for the modal..."
                      className={cn(
                        "w-full rounded-lg border border-neutral-900/15 bg-white p-3 text-sm text-cru-charcoal placeholder:text-cru-muted focus:border-cru-gold dark:border-white/15 dark:bg-cru-night dark:text-cru-ink dark:placeholder:text-cru-ink-muted",
                        FOCUS_RING
                      )}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isPending}
                    className={cn(
                      "inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full bg-cru-gold text-xs font-semibold text-cru-charcoal transition-colors hover:bg-cru-gold-hover disabled:opacity-60",
                      FOCUS_RING
                    )}
                  >
                    {isPending && (
                      <Loader2
                        aria-hidden="true"
                        className="size-3.5 animate-spin"
                      />
                    )}
                    <span>
                      {isPending ? "Publishing..." : "Publish Project"}
                    </span>
                  </button>
                </form>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
