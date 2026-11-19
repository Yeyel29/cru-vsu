"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { InquiryStatus } from "@/types/database";

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
  applicantId: string,
  decision: "approved" | "rejected"
): Promise<AdminActionResult> {
  const { supabase, adminProfile } = await verifyAdmin();
  if (!supabase || !adminProfile) {
    return { success: false, message: "Unauthorized: Admin access required." };
  }

  const { error: appError } = await supabase
    .from("discipler_applications")
    .update({
      status: decision,
      reviewed_by: adminProfile.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", applicationId);

  if (appError) {
    return { success: false, message: "Failed to update application status." };
  }

  if (decision === "approved") {
    const { error: roleError } = await supabase
      .from("profiles")
      .update({
        role: "discipler",
        updated_at: new Date().toISOString(),
      })
      .eq("id", applicantId);

    if (roleError) {
      return {
        success: false,
        message: "Application approved, but failed to promote user role.",
      };
    }
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

  const { data: discipler } = await supabase
    .from("profiles")
    .select("id, generation_depth")
    .eq("id", disciplerId)
    .single();

  if (!discipler) {
    return { success: false, message: "Selected discipler was not found." };
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      discipler_id: discipler.id,
      generation_depth: (discipler.generation_depth ?? 1) + 1,
      updated_at: new Date().toISOString(),
    })
    .eq("id", requesterId);

  if (profileError) {
    return { success: false, message: "Failed to link disciple to tree." };
  }

  await supabase
    .from("mentorship_requests")
    .update({
      status: "paired",
      assigned_discipler_id: discipler.id,
    })
    .eq("id", requestId);

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
  status: InquiryStatus,
  assignedDisciplerId?: string
): Promise<AdminActionResult> {
  const { supabase, adminProfile } = await verifyAdmin();
  if (!supabase || !adminProfile) {
    return { success: false, message: "Unauthorized: Admin access required." };
  }

  const { error } = await supabase
    .from("join_inquiries")
    .update({
      status,
      ...(assignedDisciplerId !== undefined
        ? { assigned_discipler_id: assignedDisciplerId || null }
        : {}),
    })
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
