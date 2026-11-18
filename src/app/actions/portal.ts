"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface ActionResult {
  success: boolean;
  message: string;
}

async function getCurrentUserProfile() {
  const supabase = await createClient();
  if (!supabase) return { supabase: null, user: null, profile: null };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, profile: null };

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("auth_user_id", user.id)
    .single();

  return { supabase, user, profile };
}

export async function updateMyProfile(
  formData: FormData
): Promise<ActionResult> {
  const { supabase, user, profile } = await getCurrentUserProfile();
  if (!supabase || !user || !profile) {
    return { success: false, message: "You must be signed in." };
  }

  const fullName = String(formData.get("fullName") ?? "").trim();
  const collegeProgram = String(formData.get("collegeProgram") ?? "").trim();
  const favoriteVerse = String(formData.get("favoriteVerse") ?? "").trim();
  const testimony = String(formData.get("testimony") ?? "").trim();

  if (!fullName) {
    return { success: false, message: "Full name cannot be empty." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      college_program: collegeProgram || null,
      favorite_verse: favoriteVerse || null,
      testimony: testimony || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", profile.id);

  if (error) {
    return { success: false, message: "Failed to update profile." };
  }

  revalidatePath("/dashboard");
  revalidatePath("/tree");
  return { success: true, message: "Profile updated." };
}

export async function requestDiscipler(
  formData: FormData
): Promise<ActionResult> {
  const { supabase, user, profile } = await getCurrentUserProfile();
  if (!supabase || !user || !profile) {
    return { success: false, message: "You must be signed in." };
  }

  const preferredNotes = String(formData.get("preferredNotes") ?? "").trim();

  const { error } = await supabase.from("mentorship_requests").insert({
    requester_id: profile.id,
    preferred_notes: preferredNotes || null,
    status: "pending",
  });

  if (error) {
    return {
      success: false,
      message: "Could not submit mentorship request. Please try again.",
    };
  }

  revalidatePath("/dashboard");
  return {
    success: true,
    message: "Your request for a discipler has been sent to Cru leadership!",
  };
}

export async function applyAsDiscipler(
  formData: FormData
): Promise<ActionResult> {
  const { supabase, user, profile } = await getCurrentUserProfile();
  if (!supabase || !user || !profile) {
    return { success: false, message: "You must be signed in." };
  }

  const notes = String(formData.get("notes") ?? "").trim();

  const { error } = await supabase.from("discipler_applications").insert({
    applicant_id: profile.id,
    notes: notes || null,
    status: "pending",
  });

  if (error) {
    return {
      success: false,
      message: "Could not submit discipler application. Please try again.",
    };
  }

  revalidatePath("/dashboard");
  return {
    success: true,
    message:
      "Application submitted! Campus leadership will review and confirm your discipler role.",
  };
}

export async function addDiscipleToMyTree(
  formData: FormData
): Promise<ActionResult> {
  const { supabase, user, profile } = await getCurrentUserProfile();
  if (!supabase || !user || !profile) {
    return { success: false, message: "You must be signed in." };
  }

  if (profile.role !== "discipler" && profile.role !== "admin") {
    return {
      success: false,
      message: "Only confirmed disciplers can add disciples to their web.",
    };
  }

  const fullName = String(formData.get("fullName") ?? "").trim();
  const collegeProgram = String(formData.get("collegeProgram") ?? "").trim();
  const favoriteVerse = String(formData.get("favoriteVerse") ?? "").trim();
  const testimony = String(formData.get("testimony") ?? "").trim();

  if (!fullName || fullName.length < 2) {
    return { success: false, message: "Please enter the disciple's name." };
  }

  const { error } = await supabase.from("profiles").insert({
    full_name: fullName,
    college_program: collegeProgram || null,
    favorite_verse: favoriteVerse || null,
    testimony: testimony || null,
    role: "disciple",
    discipler_id: profile.id,
    generation_depth: (profile.generation_depth ?? 1) + 1,
  });

  if (error) {
    return {
      success: false,
      message: `Could not add disciple: ${error.message}`,
    };
  }

  revalidatePath("/dashboard/my-tree");
  revalidatePath("/tree");
  revalidatePath("/");
  return {
    success: true,
    message: `${fullName} has been added to your family tree and synced with the main campus tree!`,
  };
}

export async function signOutAction() {
  const supabase = await createClient();
  if (supabase) {
    await supabase.auth.signOut();
  }
  redirect("/");
}
