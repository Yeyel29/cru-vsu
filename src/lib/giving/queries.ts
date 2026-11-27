import { createClient } from "@/lib/supabase/server";
import type { GivingChannel, RecipientOption } from "@/types/database";

/**
 * Fetches active Cru Eastern Visayas payment channels ordered for display on /give.
 */
export async function fetchActiveGivingChannels(): Promise<GivingChannel[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("giving_channels")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error || !data) return [];
  return data as GivingChannel[];
}

/**
 * Fetches Cru-VSU members, disciples, and leaders (excluding the Jesus root node)
 * so donors can designate a gift to a specific person.
 */
export async function fetchRecipientProfiles(): Promise<RecipientOption[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, role, college_program")
    .eq("is_root_jesus", false)
    .order("full_name", { ascending: true });

  if (error || !data) return [];
  return data as RecipientOption[];
}
