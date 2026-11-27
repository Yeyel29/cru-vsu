"use server";

import { createClient } from "@/lib/supabase/server";
import type { DonationDesignationType } from "@/types/database";

export interface SubmitDonationResult {
  success: boolean;
  message: string;
  referenceCode?: string;
}

const MAX_RECEIPT_BYTES = 5 * 1024 * 1024;
const ALLOWED_RECEIPT_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "application/pdf": "pdf",
};

/**
 * Validates and persists a donor's Cru EV transfer record for ministry tracking.
 */
export async function submitDonationRecord(
  formData: FormData
): Promise<SubmitDonationResult> {
  const designationRaw = String(
    formData.get("designationType") ?? "general_fund"
  ).trim();
  const designationType: DonationDesignationType =
    designationRaw === "specific_person" ? "specific_person" : "general_fund";

  const recipientProfileId = String(
    formData.get("recipientProfileId") ?? ""
  ).trim();
  const recipientCustomName = String(
    formData.get("recipientCustomName") ?? ""
  ).trim();

  const amountRaw = String(formData.get("amountPhp") ?? "").trim();
  const amountPhp = Number(amountRaw);

  const channelId = String(formData.get("channelId") ?? "").trim();
  const channelNameSnapshot = String(
    formData.get("channelNameSnapshot") ?? ""
  ).trim();
  const referenceNumber = String(
    formData.get("referenceNumber") ?? ""
  ).trim();

  const isAnonymous =
    formData.get("isAnonymous") === "true" ||
    formData.get("isAnonymous") === "on";
  const donorName = String(formData.get("donorName") ?? "").trim();
  const donorEmail = String(formData.get("donorEmail") ?? "").trim();
  const donorPhone = String(formData.get("donorPhone") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const receiptFile = formData.get("receiptFile");

  if (
    designationType === "specific_person" &&
    !recipientProfileId &&
    !recipientCustomName
  ) {
    return {
      success: false,
      message: "Please select a person or enter their name for this gift.",
    };
  }

  if (!Number.isFinite(amountPhp) || amountPhp <= 0 || amountPhp > 10000000) {
    return {
      success: false,
      message: "Please enter a valid amount in Philippine Pesos (PHP).",
    };
  }

  if (!channelNameSnapshot) {
    return {
      success: false,
      message: "Please indicate which Cru EV channel you used for the transfer.",
    };
  }

  if (!isAnonymous && donorName.length < 2) {
    return {
      success: false,
      message: "Please enter your name, or check Give anonymously.",
    };
  }

  if (donorEmail && !donorEmail.includes("@")) {
    return {
      success: false,
      message: "Please enter a valid email address or leave it blank.",
    };
  }

  const supabase = await createClient();
  if (!supabase) {
    return {
      success: false,
      message:
        "Supabase connection is not configured. Please check environment variables.",
    };
  }

  let receiptStoragePath: string | null = null;

  if (receiptFile instanceof File && receiptFile.size > 0) {
    if (receiptFile.size > MAX_RECEIPT_BYTES) {
      return {
        success: false,
        message: "Receipt file must be 5 MB or smaller.",
      };
    }

    const ext = ALLOWED_RECEIPT_TYPES[receiptFile.type];
    if (!ext) {
      return {
        success: false,
        message: "Receipt must be a PNG, JPG, WebP image, or PDF.",
      };
    }

    const storagePath = `receipts/${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("giving-receipts")
      .upload(storagePath, receiptFile, {
        contentType: receiptFile.type,
        upsert: false,
      });

    if (uploadError) {
      return {
        success: false,
        message:
          "Could not upload the receipt image right now. Please try again or submit with your reference number.",
      };
    }

    receiptStoragePath = storagePath;
  }

  const donationId = crypto.randomUUID();
  const { error: insertError } = await supabase.from("donations").insert({
    id: donationId,
    designation_type: designationType,
    recipient_profile_id:
      designationType === "specific_person" && recipientProfileId
        ? recipientProfileId
        : null,
    recipient_custom_name:
      designationType === "specific_person" && !recipientProfileId
        ? recipientCustomName
        : null,
    amount_php: Math.round(amountPhp * 100) / 100,
    channel_id: channelId || null,
    channel_name_snapshot: channelNameSnapshot,
    reference_number: referenceNumber || null,
    receipt_storage_path: receiptStoragePath,
    donor_name: isAnonymous ? null : donorName,
    is_anonymous: isAnonymous,
    donor_email: donorEmail || null,
    donor_phone: donorPhone || null,
    message: message || null,
    status: "pending",
  });

  if (insertError) {
    return {
      success: false,
      message: "Could not record your gift right now. Please try again.",
    };
  }

  return {
    success: true,
    message:
      "Thank you for sowing into Cru VSU. Your gift record has been logged for Cru Eastern Visayas verification.",
    referenceCode: donationId.slice(0, 8).toUpperCase(),
  };
}
