"use client";

import { useState, useTransition } from "react";
import {
  CheckCircle2,
  XCircle,
  UserCheck,
  Users,
  Layers,
  Inbox,
  Plus,
  Loader2,
  HeartHandshake,
  Landmark,
  FileText,
  Trash2,
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
  | "projects"
  | "donations"
  | "channels";

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
  const [feedback, setFeedback] = useState<string | null>(null);
  const [selectedDisciplers, setSelectedDisciplers] = useState<
    Record<string, string>
  >({});
  const [donationStatusFilter, setDonationStatusFilter] = useState<
    "all" | DonationStatus
  >("all");
  const [donationDesignationFilter, setDonationDesignationFilter] = useState<
    "all" | DonationDesignationType
  >("all");

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

  const handleViewReceipt = (storagePath: string) => {
    setFeedback(null);
    startTransition(async () => {
      const res = await getDonationReceiptUrl(storagePath);
      if (res.success && res.url) {
        window.open(res.url, "_blank", "noopener,noreferrer");
      } else {
        setFeedback(res.message ?? "Could not open receipt.");
      }
    });
  };

  const runAction = (fn: () => Promise<{ success: boolean; message: string }>) => {
    setFeedback(null);
    startTransition(async () => {
      const res = await fn();
      setFeedback(res.message);
    });
  };

  return (
    <div className="space-y-6">
      {feedback && (
        <div className="flex items-center gap-2.5 rounded-2xl border border-cru-gold/50 bg-cru-gold-soft/70 px-4 py-3 text-xs font-medium text-cru-charcoal">
          <CheckCircle2 className="size-4 shrink-0 text-cru-gold-hover" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Segmented Tab Switcher */}
      <div className="inline-flex flex-wrap items-center gap-1 rounded-full bg-neutral-900/[0.04] p-1">
        {[
          {
            key: "applications" as TabKey,
            label: "Discipler Approvals",
            count: pendingAppsCount,
            icon: UserCheck,
          },
          {
            key: "mentorship" as TabKey,
            label: "Mentorship Pairing",
            count: pendingMentorshipCount,
            icon: Users,
          },
          {
            key: "inquiries" as TabKey,
            label: "Join Cru Inquiries",
            count: pendingInquiriesCount,
            icon: Inbox,
          },
          {
            key: "projects" as TabKey,
            label: "Ministry Projects",
            count: projects.length,
            icon: Layers,
          },
          {
            key: "donations" as TabKey,
            label: "Donations",
            count: pendingDonationsCount,
            icon: HeartHandshake,
          },
          {
            key: "channels" as TabKey,
            label: "Cru EV Channels",
            count: activeChannelsCount,
            icon: Landmark,
          },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "inline-flex h-9 items-center gap-2 rounded-full px-4 text-xs font-medium transition-all",
                active
                  ? "bg-white text-cru-charcoal shadow-[0_1px_3px_rgb(0_0_0/0.12)]"
                  : "text-cru-muted hover:text-cru-charcoal"
              )}
            >
              <Icon
                className={cn(
                  "size-3.5",
                  active ? "text-cru-gold-hover" : "text-current"
                )}
              />
              <span>{tab.label}</span>
              <span className="font-mono text-[10px] text-cru-gold-hover">
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Discipler Applications */}
      {activeTab === "applications" && (
        <div className="space-y-3">
          {applications.length === 0 ? (
            <p className="rounded-[24px] border border-dashed border-neutral-900/10 p-8 text-center text-xs text-cru-muted">
              No discipler applications submitted yet.
            </p>
          ) : (
            applications.map((app) => (
              <div
                key={app.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-[24px] border border-neutral-900/[0.07] bg-cru-surface p-6"
              >
                <div className="max-w-xl">
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-base font-semibold text-cru-charcoal">
                      {app.applicantName}
                    </h3>
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-0.5 font-mono text-[10px] uppercase",
                        app.status === "approved"
                          ? "bg-emerald-100 text-emerald-800"
                          : app.status === "rejected"
                          ? "bg-red-100 text-red-800"
                          : "bg-cru-gold-soft text-amber-800"
                      )}
                    >
                      {app.status}
                    </span>
                  </div>
                  {app.applicantProgram && (
                    <p className="mt-0.5 text-xs text-cru-muted">
                      {app.applicantProgram}
                    </p>
                  )}
                  {app.notes && (
                    <p className="mt-2 text-xs leading-relaxed text-cru-charcoal/85">
                      &ldquo;{app.notes}&rdquo;
                    </p>
                  )}
                </div>

                {app.status === "pending" && (
                  <div className="flex items-center gap-2">
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
                      className="inline-flex h-9 items-center gap-1.5 rounded-full bg-cru-gold px-4 text-xs font-semibold text-cru-charcoal hover:bg-cru-gold-hover disabled:opacity-50"
                    >
                      <CheckCircle2 className="size-3.5" />
                      <span>Approve as Discipler</span>
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
                      className="inline-flex h-9 items-center gap-1.5 rounded-full border border-neutral-900/10 bg-white px-4 text-xs font-medium text-cru-muted hover:text-red-600 disabled:opacity-50"
                    >
                      <XCircle className="size-3.5" />
                      <span>Decline</span>
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Mentorship Pairing */}
      {activeTab === "mentorship" && (
        <div className="space-y-3">
          {mentorships.length === 0 ? (
            <p className="rounded-[24px] border border-dashed border-neutral-900/10 p-8 text-center text-xs text-cru-muted">
              No mentorship requests from members yet.
            </p>
          ) : (
            mentorships.map((req) => (
              <div
                key={req.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-[24px] border border-neutral-900/[0.07] bg-cru-surface p-6"
              >
                <div className="max-w-lg">
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-base font-semibold text-cru-charcoal">
                      {req.requesterName}
                    </h3>
                    <span className="rounded-full bg-white px-2.5 py-0.5 font-mono text-[10px] uppercase text-cru-muted">
                      {req.status}
                    </span>
                  </div>
                  {req.requesterProgram && (
                    <p className="mt-0.5 text-xs text-cru-muted">
                      {req.requesterProgram}
                    </p>
                  )}
                  {req.preferred_notes && (
                    <p className="mt-2 text-xs text-cru-charcoal/80">
                      Notes: {req.preferred_notes}
                    </p>
                  )}
                </div>

                {req.status === "pending" && (
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={selectedDisciplers[req.id] ?? ""}
                      onChange={(e) =>
                        setSelectedDisciplers((prev) => ({
                          ...prev,
                          [req.id]: e.target.value,
                        }))
                      }
                      className="h-9 rounded-full border border-neutral-900/10 bg-white px-3.5 text-xs text-cru-charcoal focus:border-cru-gold focus:outline-none"
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
                      className="inline-flex h-9 items-center gap-1.5 rounded-full bg-cru-gold px-4 text-xs font-semibold text-cru-charcoal hover:bg-cru-gold-hover disabled:opacity-50"
                    >
                      <span>Pair &amp; Link to Tree</span>
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 3: Join Cru Public Inquiries */}
      {activeTab === "inquiries" && (
        <div className="space-y-3">
          {inquiries.length === 0 ? (
            <p className="rounded-[24px] border border-dashed border-neutral-900/10 p-8 text-center text-xs text-cru-muted">
              No public Join Cru inquiries yet.
            </p>
          ) : (
            inquiries.map((inq) => (
              <div
                key={inq.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-[24px] border border-neutral-900/[0.07] bg-cru-surface p-6"
              >
                <div className="max-w-lg">
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-base font-semibold text-cru-charcoal">
                      {inq.full_name}
                    </h3>
                    <span className="rounded-full bg-white px-2.5 py-0.5 font-mono text-[10px] uppercase text-cru-muted">
                      {inq.status}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-cru-muted">
                    {inq.email}
                    {inq.phone ? ` · ${inq.phone}` : ""}
                    {inq.college_course_year
                      ? ` · ${inq.college_course_year}`
                      : ""}
                  </p>
                  {inq.spiritual_interest && (
                    <p className="mt-2 text-xs text-cru-charcoal/85">
                      Interest: {inq.spiritual_interest}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <select
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
                    className="h-9 rounded-full border border-neutral-900/10 bg-white px-3.5 text-xs font-medium text-cru-charcoal focus:border-cru-gold focus:outline-none"
                  >
                    <option value="pending">Pending</option>
                    <option value="contacted">Contacted</option>
                    <option value="paired">Paired</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 4: Ministry Projects CMS */}
      {activeTab === "projects" && (
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Existing Projects List */}
          <div className="space-y-3 lg:col-span-2">
            {projects.map((proj) => (
              <div
                key={proj.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-[24px] border border-neutral-900/[0.07] bg-cru-surface p-6"
              >
                <div className="max-w-md">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-white px-2.5 py-0.5 font-mono text-[10px] uppercase text-cru-muted">
                      {proj.category}
                    </span>
                    <span
                      className={cn(
                        "font-mono text-[10px] uppercase",
                        proj.is_active ? "text-emerald-700" : "text-cru-muted"
                      )}
                    >
                      {proj.is_active ? "Active" : "Paused"}
                    </span>
                  </div>
                  <h3 className="mt-1.5 text-base font-semibold text-cru-charcoal">
                    {proj.title}
                  </h3>
                  <p className="mt-1 text-xs text-cru-muted">{proj.summary}</p>
                </div>

                <button
                  type="button"
                  disabled={isPending}
                  onClick={() =>
                    runAction(() =>
                      toggleProjectActive(proj.id, !proj.is_active)
                    )
                  }
                  className="h-9 rounded-full border border-neutral-900/10 bg-white px-4 text-xs font-medium text-cru-charcoal hover:border-cru-gold disabled:opacity-50"
                >
                  {proj.is_active ? "Pause Project" : "Activate Project"}
                </button>
              </div>
            ))}
          </div>

          {/* Create New Project Form */}
          <div className="rounded-[24px] border border-neutral-900/[0.07] bg-cru-surface p-7">
            <div className="mb-4 flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-full bg-cru-gold text-cru-charcoal">
                <Plus className="size-4" />
              </span>
              <h3 className="text-base font-semibold text-cru-charcoal">
                New Ministry Project
              </h3>
            </div>

            <form
              action={(formData) =>
                runAction(() => createMinistryProject(formData))
              }
              className="space-y-3.5"
            >
              <div>
                <label className="mb-1 block text-xs font-medium text-cru-charcoal">
                  Project Title
                </label>
                <input
                  name="title"
                  required
                  placeholder="e.g., Summer Missions VSU"
                  className="h-10 w-full rounded-xl border border-neutral-900/10 bg-white px-3.5 text-sm focus:border-cru-gold focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-cru-charcoal">
                  Category
                </label>
                <select
                  name="category"
                  required
                  className="h-10 w-full rounded-xl border border-neutral-900/10 bg-white px-3.5 text-sm focus:border-cru-gold focus:outline-none"
                >
                  <option value="Fellowship">Fellowship</option>
                  <option value="Action Groups">Action Groups</option>
                  <option value="Outreach">Outreach</option>
                  <option value="Missions">Missions</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-cru-charcoal">
                  Schedule / Location
                </label>
                <input
                  name="schedule"
                  placeholder="e.g., Fridays 5:30 PM @ Upper Campus"
                  className="h-10 w-full rounded-xl border border-neutral-900/10 bg-white px-3.5 text-sm focus:border-cru-gold focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-cru-charcoal">
                  Short Summary
                </label>
                <input
                  name="summary"
                  required
                  placeholder="1-sentence overview for the card..."
                  className="h-10 w-full rounded-xl border border-neutral-900/10 bg-white px-3.5 text-sm focus:border-cru-gold focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-cru-charcoal">
                  Full Description
                </label>
                <textarea
                  name="description"
                  rows={3}
                  required
                  placeholder="Detailed description for the modal..."
                  className="w-full rounded-xl border border-neutral-900/10 bg-white p-3 text-sm focus:border-cru-gold focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-cru-gold text-xs font-semibold text-cru-charcoal hover:bg-cru-gold-hover disabled:opacity-60"
              >
                {isPending && <Loader2 className="size-3.5 animate-spin" />}
                <span>Publish Project</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Tab 5: Donations Ledger */}
      {activeTab === "donations" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-neutral-900/[0.07] bg-cru-surface p-4">
            <div className="flex flex-wrap items-center gap-2">
              <label
                htmlFor="filter-donation-status"
                className="text-xs font-medium text-cru-muted"
              >
                Status:
              </label>
              <select
                id="filter-donation-status"
                value={donationStatusFilter}
                onChange={(e) =>
                  setDonationStatusFilter(
                    e.target.value as "all" | DonationStatus
                  )
                }
                className="h-9 rounded-full border border-neutral-900/10 bg-white px-3 text-xs font-medium text-cru-charcoal focus:border-cru-gold focus:outline-none"
              >
                <option value="all">All ({donations.length})</option>
                <option value="pending">Pending ({pendingDonationsCount})</option>
                <option value="verified">Verified</option>
                <option value="distributed">Distributed</option>
              </select>

              <label
                htmlFor="filter-donation-designation"
                className="ml-2 text-xs font-medium text-cru-muted"
              >
                For:
              </label>
              <select
                id="filter-donation-designation"
                value={donationDesignationFilter}
                onChange={(e) =>
                  setDonationDesignationFilter(
                    e.target.value as "all" | DonationDesignationType
                  )
                }
                className="h-9 rounded-full border border-neutral-900/10 bg-white px-3 text-xs font-medium text-cru-charcoal focus:border-cru-gold focus:outline-none"
              >
                <option value="all">All Designations</option>
                <option value="general_fund">General Ministry Fund</option>
                <option value="specific_person">Specific Person</option>
              </select>
            </div>

            <span className="font-mono text-xs text-cru-muted tabular-nums">
              Showing {filteredDonations.length} of {donations.length}
            </span>
          </div>

          {filteredDonations.length === 0 ? (
            <div className="rounded-[24px] border border-neutral-900/[0.07] bg-cru-surface p-10 text-center text-sm text-cru-muted">
              No donation records match the selected filters.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredDonations.map((donation) => (
                <div
                  key={donation.id}
                  className="flex flex-col justify-between gap-4 rounded-[24px] border border-neutral-900/[0.07] bg-cru-surface p-5 md:flex-row md:items-start"
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-sm font-semibold tabular-nums text-cru-charcoal">
                        PHP{" "}
                        {Number(donation.amount_php).toLocaleString("en-PH", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-0.5 font-mono text-[10px] uppercase",
                          donation.status === "distributed"
                            ? "bg-emerald-100 text-emerald-800"
                            : donation.status === "verified"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-cru-gold-soft text-amber-800"
                        )}
                      >
                        {donation.status}
                      </span>
                      <span className="rounded-full bg-neutral-900/[0.05] px-2.5 py-0.5 font-mono text-[10px] text-cru-charcoal">
                        {donation.channel_name_snapshot}
                      </span>
                    </div>

                    <div className="text-sm font-medium text-cru-charcoal">
                      For: {donation.recipientName}
                      {donation.designation_type === "specific_person" &&
                        !donation.recipient_profile_id &&
                        donation.recipient_custom_name && (
                          <span className="ml-1.5 text-xs text-cru-muted">
                            (manual name)
                          </span>
                        )}
                    </div>

                    <div className="text-xs text-cru-muted">
                      From:{" "}
                      <span className="font-medium text-cru-charcoal">
                        {donation.is_anonymous
                          ? "Anonymous"
                          : donation.donor_name || "Unnamed"}
                      </span>
                      {donation.donor_email ? ` · ${donation.donor_email}` : ""}
                      {donation.donor_phone ? ` · ${donation.donor_phone}` : ""}
                      {donation.reference_number
                        ? ` · Ref: ${donation.reference_number}`
                        : ""}
                    </div>

                    {donation.message && (
                      <p className="mt-1 rounded-xl border border-neutral-900/[0.06] bg-white px-3.5 py-2 text-xs leading-relaxed text-cru-charcoal/85">
                        &ldquo;{donation.message}&rdquo;
                      </p>
                    )}

                    <div className="font-mono text-[10px] text-cru-muted">
                      Tracking: CRU-{donation.id.slice(0, 8).toUpperCase()} ·{" "}
                      {new Date(donation.created_at).toLocaleString("en-PH")}
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
                        className="inline-flex h-9 items-center gap-1.5 rounded-full border border-neutral-900/10 bg-white px-3.5 text-xs font-medium text-cru-charcoal hover:border-cru-gold disabled:opacity-60"
                      >
                        <FileText className="size-3.5" />
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
                      className="h-9 rounded-full border border-neutral-900/10 bg-white px-3 text-xs font-medium text-cru-charcoal focus:border-cru-gold focus:outline-none disabled:opacity-60"
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
        </div>
      )}

      {/* Tab 6: Cru EV Giving Channels */}
      {activeTab === "channels" && (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.2fr_1fr]">
          <div className="space-y-3">
            {givingChannels.length === 0 ? (
              <div className="rounded-[24px] border border-neutral-900/[0.07] bg-cru-surface p-10 text-center text-sm text-cru-muted">
                No Cru Eastern Visayas payment channels added yet. Use the form
                to add your first bank or e-wallet account.
              </div>
            ) : (
              givingChannels.map((ch) => (
                <div
                  key={ch.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-[24px] border border-neutral-900/[0.07] bg-cru-surface p-5"
                >
                  <div className="flex items-center gap-4">
                    {ch.qr_image_url ? (
                      <div className="shrink-0 rounded-xl border border-neutral-900/10 bg-white p-1">
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
                      <div className="grid size-14 shrink-0 place-items-center rounded-xl border border-dashed border-neutral-900/15 bg-white font-mono text-[10px] text-cru-muted">
                        NO QR
                      </div>
                    )}

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-cru-charcoal">
                          {ch.provider_name}
                        </span>
                        <span className="rounded-full bg-neutral-900/[0.05] px-2 py-0.5 font-mono text-[10px] uppercase text-cru-muted">
                          {ch.channel_type}
                        </span>
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 font-mono text-[10px] uppercase",
                            ch.is_active
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-neutral-200 text-neutral-700"
                          )}
                        >
                          {ch.is_active ? "Active" : "Hidden"}
                        </span>
                      </div>
                      <div className="mt-0.5 text-xs text-cru-charcoal">
                        {ch.account_name}
                      </div>
                      <div className="font-mono text-xs text-cru-muted">
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
                      className="h-9 rounded-full border border-neutral-900/10 bg-white px-4 text-xs font-medium text-cru-charcoal hover:border-cru-gold disabled:opacity-60"
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
                      className="grid size-9 place-items-center rounded-full border border-neutral-900/10 bg-white text-cru-muted hover:border-red-300 hover:text-red-600 disabled:opacity-60"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Add New Cru EV Channel Form */}
          <div className="rounded-[24px] border border-neutral-900/[0.07] bg-cru-surface p-6">
            <h3 className="flex items-center gap-2 text-base font-semibold text-cru-charcoal">
              <Plus className="size-4 text-cru-gold-hover" />
              <span>Add Cru EV Channel</span>
            </h3>
            <form
              action={(fd) => runAction(() => createGivingChannel(fd))}
              className="mt-4 space-y-4"
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="channel-provider"
                    className="mb-1 block text-xs font-medium text-cru-charcoal"
                  >
                    Provider Name
                  </label>
                  <input
                    id="channel-provider"
                    name="providerName"
                    required
                    placeholder="e.g., GCash, BPI, Maya"
                    className="h-10 w-full rounded-xl border border-neutral-900/10 bg-white px-3.5 text-sm focus:border-cru-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="channel-type"
                    className="mb-1 block text-xs font-medium text-cru-charcoal"
                  >
                    Type
                  </label>
                  <select
                    id="channel-type"
                    name="channelType"
                    required
                    className="h-10 w-full rounded-xl border border-neutral-900/10 bg-white px-3.5 text-sm focus:border-cru-gold focus:outline-none"
                  >
                    <option value="ewallet">E-Wallet</option>
                    <option value="bank">Bank Account</option>
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="channel-account-name"
                  className="mb-1 block text-xs font-medium text-cru-charcoal"
                >
                  Account Name
                </label>
                <input
                  id="channel-account-name"
                  name="accountName"
                  required
                  placeholder="e.g., Cru Eastern Visayas"
                  className="h-10 w-full rounded-xl border border-neutral-900/10 bg-white px-3.5 text-sm focus:border-cru-gold focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-[2fr_1fr]">
                <div>
                  <label
                    htmlFor="channel-account-number"
                    className="mb-1 block text-xs font-medium text-cru-charcoal"
                  >
                    Account / Mobile Number
                  </label>
                  <input
                    id="channel-account-number"
                    name="accountNumber"
                    required
                    placeholder="Account or mobile number"
                    className="h-10 w-full rounded-xl border border-neutral-900/10 bg-white px-3.5 font-mono text-sm focus:border-cru-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="channel-order"
                    className="mb-1 block text-xs font-medium text-cru-charcoal"
                  >
                    Order
                  </label>
                  <input
                    id="channel-order"
                    name="displayOrder"
                    type="number"
                    defaultValue={0}
                    className="h-10 w-full rounded-xl border border-neutral-900/10 bg-white px-3.5 font-mono text-sm focus:border-cru-gold focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="channel-qr"
                  className="mb-1 block text-xs font-medium text-cru-charcoal"
                >
                  QR Code Image (optional, PNG/JPG/WebP)
                </label>
                <input
                  id="channel-qr"
                  name="qrFile"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="block w-full text-xs text-cru-muted file:mr-3 file:rounded-full file:border-0 file:bg-cru-gold-soft file:px-3.5 file:py-2 file:text-xs file:font-semibold file:text-cru-charcoal hover:file:bg-cru-gold"
                />
              </div>

              <div>
                <label
                  htmlFor="channel-instructions"
                  className="mb-1 block text-xs font-medium text-cru-charcoal"
                >
                  Transfer Note (optional)
                </label>
                <textarea
                  id="channel-instructions"
                  name="instructions"
                  rows={2}
                  placeholder="e.g., Include Cru VSU in the transfer note if your bank app allows it."
                  className="w-full rounded-xl border border-neutral-900/10 bg-white p-3 text-sm focus:border-cru-gold focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-cru-gold text-xs font-semibold text-cru-charcoal hover:bg-cru-gold-hover disabled:opacity-60"
              >
                {isPending && <Loader2 className="size-3.5 animate-spin" />}
                <span>Save Cru EV Channel</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
