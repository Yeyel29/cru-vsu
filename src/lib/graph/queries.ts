import { createClient } from "@/lib/supabase/server";
import {
  FALLBACK_PROFILES,
  transformProfilesToGraph,
} from "@/lib/graph/transform";
import type { DiscipleshipGraphData, Profile } from "@/types/database";

/**
 * Fetches all public discipleship nodes from Supabase and formats them for the graph.
 */
export async function fetchDiscipleshipGraphData(): Promise<DiscipleshipGraphData> {
  try {
    const supabase = await createClient();
    if (!supabase) {
      return transformProfilesToGraph(FALLBACK_PROFILES);
    }

    const { data, error } = await supabase
      .from("profiles")
      .select(
        "id, full_name, avatar_url, college_program, testimony, favorite_verse, role, discipler_id, generation_depth, is_root_jesus, created_at, updated_at"
      )
      .order("generation_depth", { ascending: true });

    if (error || !data || data.length === 0) {
      return transformProfilesToGraph(FALLBACK_PROFILES);
    }

    return transformProfilesToGraph(data as Profile[]);
  } catch {
    return transformProfilesToGraph(FALLBACK_PROFILES);
  }
}
