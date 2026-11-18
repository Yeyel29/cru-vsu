export type UserRole = "seeker" | "disciple" | "discipler" | "admin";

export type InquiryStatus = "pending" | "contacted" | "paired" | "closed";

export type ApplicationStatus = "pending" | "approved" | "rejected";

export interface Profile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  college_program: string | null;
  testimony: string | null;
  favorite_verse: string | null;
  role: UserRole;
  discipler_id: string | null;
  generation_depth: number;
  created_at: string;
  updated_at: string;
}

export interface MinistryProject {
  id: string;
  title: string;
  slug: string;
  category: string;
  summary: string;
  description: string;
  cover_image_url: string | null;
  gallery_urls: string[];
  schedule: string | null;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
}

export interface JoinInquiry {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  college_course_year: string | null;
  spiritual_interest: string | null;
  status: InquiryStatus;
  assigned_discipler_id: string | null;
  created_at: string;
}

export interface DisciplerApplication {
  id: string;
  applicant_id: string;
  notes: string | null;
  status: ApplicationStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
}

export interface MentorshipRequest {
  id: string;
  requester_id: string;
  preferred_notes: string | null;
  status: "pending" | "paired" | "closed";
  assigned_discipler_id: string | null;
  created_at: string;
}

/**
 * Graph data structures for the Obsidian-style Discipleship Family Tree.
 */
export interface GraphNode {
  id: string;
  name: string;
  avatarUrl: string | null;
  collegeProgram: string | null;
  testimony: string | null;
  favoriteVerse: string | null;
  role: UserRole;
  disciplerId: string | null;
  generationDepth: number;
  isRootJesus?: boolean;
  fx?: number;
  fy?: number;
  x?: number;
  y?: number;
}

export interface GraphLink {
  source: string | GraphNode;
  target: string | GraphNode;
}

export interface DiscipleshipGraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}
