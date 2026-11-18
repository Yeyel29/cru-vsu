import { createClient } from "@/lib/supabase/server";
import type { MinistryProject } from "@/types/database";

const FALLBACK_PROJECTS: MinistryProject[] = [
  {
    id: "proj-1",
    title: "College Life Weekly Fellowship",
    slug: "college-life-fellowship",
    category: "Fellowship",
    summary:
      "Our weekly large-group gathering for worship, biblical teaching, and authentic campus community.",
    description:
      "Join students from every college at VSU for an energizing evening of worship, relevant messages from Scripture, games, and fellowship. A welcoming space whether you are exploring faith or looking for a Christian community on campus.",
    cover_image_url: null,
    gallery_urls: [],
    schedule: "Thursdays, 6:00 PM @ Student Union Building",
    is_active: true,
    created_by: null,
    created_at: "",
  },
  {
    id: "proj-2",
    title: "Campus Action Groups",
    slug: "campus-action-groups",
    category: "Action Groups",
    summary:
      "Small-group discipleship cohorts led by student moms and dads across dorms and colleges.",
    description:
      "Action Groups are where life-on-life discipleship happens. Meet weekly with 4-8 peers in your college or dorm to study the Bible, pray for one another, and navigate university life together.",
    cover_image_url: null,
    gallery_urls: [],
    schedule: "Various schedules by College & Dormitory",
    is_active: true,
    created_by: null,
    created_at: "",
  },
  {
    id: "proj-3",
    title: "Freshmen Welcome & Soularium Outreach",
    slug: "freshmen-soularium-outreach",
    category: "Outreach",
    summary:
      "Creative spiritual conversations across VSU campus using visual story cards and campus hospitality.",
    description:
      "Every semester we set up interactive stations around the VSU Upper and Lower Campus to hear students' stories, share the hope of Jesus, and invite newcomers into community.",
    cover_image_url: null,
    gallery_urls: [],
    schedule: "First 3 weeks of each semester",
    is_active: true,
    created_by: null,
    created_at: "",
  },
];

/**
 * Fetches active campus ministry projects from Supabase.
 */
export async function fetchActiveProjects(): Promise<MinistryProject[]> {
  try {
    const supabase = await createClient();
    if (!supabase) return FALLBACK_PROJECTS;

    const { data, error } = await supabase
      .from("ministry_projects")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: true });

    if (error || !data || data.length === 0) {
      return FALLBACK_PROJECTS;
    }

    return data as MinistryProject[];
  } catch {
    return FALLBACK_PROJECTS;
  }
}
