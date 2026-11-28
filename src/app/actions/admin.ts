"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type {
  DonationStatus,
  GivingChannelType,
  InquiryStatus,
} from "@/types/database";

export interface AdminActionResult {
  success: boolean;
  message: string;
}

async function verifyAdmin() {
  const supabase = await createClient();
  if (!supabase) return { supabase: null, adminProfile: null };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, adminProfile: null };

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("auth_user_id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    return { supabase, adminProfile: null };
  }

  return { supabase, adminProfile: profile };
}

export async function reviewDisciplerApplication(
  applicationId: string,
  _applicantId: string,
  decision: "approved" | "rejected"
): Promise<AdminActionResult> {
  const { supabase, adminProfile } = await verifyAdmin();
  if (!supabase || !adminProfile) {
    return { success: false, message: "Unauthorized: Admin access required." };
  }

  const { error } = await supabase.rpc("review_discipler_application", {
    p_application_id: applicationId,
    p_decision: decision,
  });

  if (error) {
    return {
      success: false,
      message: error.message || "Failed to review application.",
    };
  }

  revalidatePath("/admin");
  revalidatePath("/dashboard");
  revalidatePath("/tree");
  return {
    success: true,
    message:
      decision === "approved"
        ? "Member confirmed as a Discipler!"
        : "Application marked as rejected.",
  };
}

export async function pairMentorshipRequest(
  requestId: string,
  requesterId: string,
  disciplerId: string
): Promise<AdminActionResult> {
  const { supabase, adminProfile } = await verifyAdmin();
  if (!supabase || !adminProfile) {
    return { success: false, message: "Unauthorized: Admin access required." };
  }

  if (!disciplerId) {
    return { success: false, message: "Please select a discipler to assign." };
  }

  const { error } = await supabase.rpc("pair_mentorship_request", {
    p_request_id: requestId,
    p_requester_id: requesterId,
    p_discipler_id: disciplerId,
  });

  if (error) {
    return {
      success: false,
      message: error.message || "Failed to link disciple to tree.",
    };
  }

  revalidatePath("/admin");
  revalidatePath("/dashboard");
  revalidatePath("/tree");
  revalidatePath("/");
  return {
    success: true,
    message: "Disciple successfully paired and linked into the family tree!",
  };
}

export async function updateJoinInquiryStatus(
  inquiryId: string,
  status: InquiryStatus
): Promise<AdminActionResult> {
  const { supabase, adminProfile } = await verifyAdmin();
  if (!supabase || !adminProfile) {
    return { success: false, message: "Unauthorized: Admin access required." };
  }

  const { error } = await supabase
    .from("join_inquiries")
    .update({ status })
    .eq("id", inquiryId);

  if (error) {
    return { success: false, message: "Failed to update inquiry." };
  }

  revalidatePath("/admin");
  return { success: true, message: "Join inquiry updated." };
}

export async function createMinistryProject(
  formData: FormData
): Promise<AdminActionResult> {
  const { supabase, adminProfile } = await verifyAdmin();
  if (!supabase || !adminProfile) {
    return { success: false, message: "Unauthorized: Admin access required." };
  }

  const title = String(formData.get("title") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const schedule = String(formData.get("schedule") ?? "").trim();

  if (!title || !category || !summary || !description) {
    return {
      success: false,
      message: "Title, category, summary, and description are required.",
    };
  }

  const slug =
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") +
    "-" +
    Date.now().toString().slice(-4);

  const { error } = await supabase.from("ministry_projects").insert({
    title,
    slug,
    category,
    summary,
    description,
    schedule: schedule || null,
    is_active: true,
    created_by: adminProfile.id,
  });

  if (error) {
    return { success: false, message: `Failed to create project: ${error.message}` };
  }

  revalidatePath("/admin");
  revalidatePath("/");
  return { success: true, message: `Published "${title}"!` };
}

export async function toggleProjectActive(
  projectId: string,
  nextActive: boolean
): Promise<AdminActionResult> {
  const { supabase, adminProfile } = await verifyAdmin();
  if (!supabase || !adminProfile) {
    return { success: false, message: "Unauthorized: Admin access required." };
  }

  const { error } = await supabase
    .from("ministry_projects")
    .update({ is_active: nextActive })
    .eq("id", projectId);

  if (error) {
    return { success: false, message: "Failed to update project status." };
  }

  revalidatePath("/admin");
  revalidatePath("/");
  return {
    success: true,
    message: nextActive ? "Project activated." : "Project paused.",
  };
}

const MAX_QR_BYTES = 5 * 1024 * 1024;
const ALLOWED_QR_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

export async function createGivingChannel(
  formData: FormData
): Promise<AdminActionResult> {
  const { supabase, adminProfile } = await verifyAdmin();
  if (!supabase || !adminProfile) {
    return { success: false, message: "Unauthorized: Admin access required." };
  }

  const providerName = String(formData.get("providerName") ?? "").trim();
  const channelTypeRaw = String(formData.get("channelType") ?? "bank").trim();
  const channelType: GivingChannelType =
    channelTypeRaw === "ewallet" ? "ewallet" : "bank";
  const accountName = String(formData.get("accountName") ?? "").trim();
  const accountNumber = String(formData.get("accountNumber") ?? "").trim();
  const instructions = String(formData.get("instructions") ?? "").trim();
  const displayOrderRaw = Number(formData.get("displayOrder") ?? 0);
  const displayOrder = Number.isFinite(displayOrderRaw)
    ? Math.trunc(displayOrderRaw)
    : 0;
  const qrFile = formData.get("qrFile");

  if (!providerName || !accountName || !accountNumber) {
    return {
      success: false,
      message: "Provider name, account name, and account number are required.",
    };
  }

  let qrImageUrl: string | null = null;

  if (qrFile instanceof File && qrFile.size > 0) {
    if (qrFile.size > MAX_QR_BYTES) {
      return {
        success: false,
        message: "QR image must be 5 MB or smaller.",
      };
    }

    const ext = ALLOWED_QR_TYPES[qrFile.type];
    if (!ext) {
      return {
        success: false,
        message: "QR image must be PNG, JPG, or WebP.",
      };
    }

    const storagePath = `qr/${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("giving-qr-codes")
      .upload(storagePath, qrFile, {
        contentType: qrFile.type,
        upsert: false,
      });

    if (uploadError) {
      return {
        success: false,
        message: `Failed to upload QR code: ${uploadError.message}`,
      };
    }

    const { data: urlData } = supabase.storage
      .from("giving-qr-codes")
      .getPublicUrl(storagePath);
    qrImageUrl = urlData.publicUrl;
  }

  const { error } = await supabase.from("giving_channels").insert({
    provider_name: providerName,
    channel_type: channelType,
    account_name: accountName,
    account_number: accountNumber,
    qr_image_url: qrImageUrl,
    instructions: instructions || null,
    display_order: displayOrder,
    is_active: true,
  });

  if (error) {
    return {
      success: false,
      message: `Failed to save Cru EV channel: ${error.message}`,
    };
  }

  revalidatePath("/admin");
  revalidatePath("/give");
  return {
    success: true,
    message: `Added ${providerName} (${accountName}) to Cru EV giving channels.`,
  };
}

export async function toggleGivingChannelActive(
  channelId: string,
  nextActive: boolean
): Promise<AdminActionResult> {
  const { supabase, adminProfile } = await verifyAdmin();
  if (!supabase || !adminProfile) {
    return { success: false, message: "Unauthorized: Admin access required." };
  }

  const { error } = await supabase
    .from("giving_channels")
    .update({
      is_active: nextActive,
      updated_at: new Date().toISOString(),
    })
    .eq("id", channelId);

  if (error) {
    return { success: false, message: "Failed to update channel visibility." };
  }

  revalidatePath("/admin");
  revalidatePath("/give");
  return {
    success: true,
    message: nextActive ? "Channel is now visible on /give." : "Channel hidden from /give.",
  };
}

export async function deleteGivingChannel(
  channelId: string
): Promise<AdminActionResult> {
  const { supabase, adminProfile } = await verifyAdmin();
  if (!supabase || !adminProfile) {
    return { success: false, message: "Unauthorized: Admin access required." };
  }

  const { data: existingChannel } = await supabase
    .from("giving_channels")
    .select("qr_image_url")
    .eq("id", channelId)
    .maybeSingle();

  const { error } = await supabase
    .from("giving_channels")
    .delete()
    .eq("id", channelId);

  if (error) {
    return { success: false, message: "Failed to remove giving channel." };
  }

  const qrUrl = existingChannel?.qr_image_url;
  if (qrUrl) {
    const marker = "/storage/v1/object/public/giving-qr-codes/";
    const idx = qrUrl.indexOf(marker);
    if (idx !== -1) {
      const storagePath = decodeURIComponent(qrUrl.slice(idx + marker.length));
      if (storagePath) {
        await supabase.storage.from("giving-qr-codes").remove([storagePath]);
      }
    }
  }

  revalidatePath("/admin");
  revalidatePath("/give");
  return {
    success: true,
    message: "Giving channel removed. Existing donation snapshots remain intact.",
  };
}

export async function updateDonationStatus(
  donationId: string,
  status: DonationStatus,
  adminNotes?: string
): Promise<AdminActionResult> {
  const { supabase, adminProfile } = await verifyAdmin();
  if (!supabase || !adminProfile) {
    return { success: false, message: "Unauthorized: Admin access required." };
  }

  const isCleared = status === "verified" || status === "distributed";
  const { error } = await supabase
    .from("donations")
    .update({
      status,
      ...(adminNotes !== undefined ? { admin_notes: adminNotes.trim() || null } : {}),
      verified_by: isCleared ? adminProfile.id : null,
      verified_at: isCleared ? new Date().toISOString() : null,
    })
    .eq("id", donationId);

  if (error) {
    return { success: false, message: "Failed to update donation status." };
  }

  revalidatePath("/admin");
  return {
    success: true,
    message: `Donation marked as ${status}.`,
  };
}

export async function getDonationReceiptUrl(storagePath: string): Promise<{
  success: boolean;
  url?: string;
  message?: string;
}> {
  const { supabase, adminProfile } = await verifyAdmin();
  if (!supabase || !adminProfile) {
    return { success: false, message: "Unauthorized: Admin access required." };
  }

  if (!storagePath) {
    return { success: false, message: "No receipt path provided." };
  }

  const { data, error } = await supabase.storage
    .from("giving-receipts")
    .createSignedUrl(storagePath, 300);

  if (error || !data?.signedUrl) {
    return {
      success: false,
      message: "Could not load receipt file.",
    };
  }

  return { success: true, url: data.signedUrl };
}
