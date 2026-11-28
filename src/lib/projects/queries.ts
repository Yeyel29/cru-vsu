import { createClient } from "@/lib/supabase/server";
import type { MinistryProject } from "@/types/database";

const FALLBACK_PROJECTS: MinistryProject[] = [
  {
    id: "proj-1",
    title: "College Life Meeting",
    slug: "college-life-fellowship",
    category: "Fellowship",
    summary:
      "Weekly large-group gathering for worship, biblical teaching, and Christ-centered campus fellowship.",
    description:
      "Join students from across Visayas State University for an evening of worship, biblical teaching, prayer, and fellowship. A welcoming space whether you are exploring faith in Jesus Christ or seeking Christian community on campus.",
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
      "Small-group Bible study and discipleship cohorts led by student leaders across colleges and dorms.",
    description:
      "Action Groups are where life-on-life discipleship takes place. Meet weekly with peers in your college or dormitory to study Scripture, pray together, and grow in Christlike character.",
    cover_image_url: null,
    gallery_urls: [],
    schedule: "Various schedules by College & Dormitory",
    is_active: true,
    created_by: null,
    created_at: "",
  },
  {
    id: "proj-3",
    title: "Freshmen Welcome & Aninag Outreach",
    slug: "freshmen-soularium-outreach",
    category: "Outreach",
    summary:
      "Intentional spiritual conversations across VSU using Aninag visual story cards and campus hospitality.",
    description:
      "Every semester we set up interactive stations across the VSU Upper and Lower Campus to listen to students' stories, share the Gospel of Jesus Christ, and invite newcomers into Action Groups.",
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
