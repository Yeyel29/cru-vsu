"use server";

import { createClient } from "@/lib/supabase/server";

export interface JoinInquiryResult {
  success: boolean;
  message: string;
}

/**
 * Validates and persists a new student "Join Cru" inquiry into Supabase.
 */
export async function submitJoinInquiry(
  formData: FormData
): Promise<JoinInquiryResult> {
  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const collegeCourseYear = String(
    formData.get("collegeCourseYear") ?? ""
  ).trim();
  const spiritualInterest = String(
    formData.get("spiritualInterest") ?? ""
  ).trim();

  if (!fullName || fullName.length < 2) {
    return {
      success: false,
      message: "Please enter your full name.",
    };
  }

  if (!email || !email.includes("@")) {
    return {
      success: false,
      message: "Please enter a valid email address so we can reach you.",
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

  const { error } = await supabase.from("join_inquiries").insert({
    full_name: fullName,
    email,
    phone: phone || null,
    college_course_year: collegeCourseYear || null,
    spiritual_interest: spiritualInterest || null,
    status: "pending",
  });

  if (error) {
    return {
      success: false,
      message: "Could not submit your request right now. Please try again.",
    };
  }

  return {
    success: true,
    message:
      "Welcome to the family! A Cru VSU leader will reach out to you soon.",
  };
}
