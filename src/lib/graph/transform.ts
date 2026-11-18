import type {
  DiscipleshipGraphData,
  GraphLink,
  GraphNode,
  Profile,
} from "@/types/database";

export const JESUS_ROOT_ID = "00000000-0000-0000-0000-000000000000";

/**
 * Returns the signature color for a node based on its generational depth from Jesus.
 */
export function getGenerationColor(
  depth: number,
  isRootJesus?: boolean
): string {
  if (isRootJesus || depth === 0) return "#FDB913"; // Radiant Cru Gold
  if (depth === 1) return "#D97706"; // Deep Amber Gold (Staff / Pioneers)
  if (depth === 2) return "#0D9488"; // Teal (Student Disciplers)
  if (depth === 3) return "#4F46E5"; // Indigo (Disciples)
  return "#059669"; // Emerald (Gen 4+)
}

export function getGenerationLabel(
  depth: number,
  isRootJesus?: boolean
): string {
  if (isRootJesus || depth === 0) return "The Vine · Center";
  if (depth === 1) return "Gen 1 · Campus Staff";
  if (depth === 2) return "Gen 2 · Student Discipler";
  return `Gen ${depth} · Disciple`;
}

/**
 * Converts Supabase profile rows into force-directed graph nodes and links.
 */
export function transformProfilesToGraph(
  profiles: Profile[]
): DiscipleshipGraphData {
  const nodeMap = new Map<string, GraphNode>();

  for (const profile of profiles) {
    const isJesus =
      profile.id === JESUS_ROOT_ID ||
      Boolean((profile as Profile & { is_root_jesus?: boolean }).is_root_jesus);

    nodeMap.set(profile.id, {
      id: profile.id,
      name: profile.full_name,
      avatarUrl: profile.avatar_url,
      collegeProgram: profile.college_program,
      testimony: profile.testimony,
      favoriteVerse: profile.favorite_verse,
      role: profile.role,
      disciplerId: profile.discipler_id,
      generationDepth: isJesus ? 0 : profile.generation_depth,
      isRootJesus: isJesus,
      ...(isJesus ? { fx: 0, fy: 0 } : {}),
    });
  }

  const links: GraphLink[] = [];
  for (const node of nodeMap.values()) {
    if (node.disciplerId && nodeMap.has(node.disciplerId)) {
      links.push({
        source: node.disciplerId,
        target: node.id,
      });
    }
  }

  return {
    nodes: Array.from(nodeMap.values()),
    links,
  };
}

/**
 * Walks up the strict single-parent tree from nodeId to Jesus, returning
 * all node IDs and directed link keys ("source->target") in the ancestry path.
 */
export function getAncestryPath(
  nodeId: string,
  nodes: GraphNode[]
): { nodeIds: Set<string>; linkKeys: Set<string> } {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const nodeIds = new Set<string>();
  const linkKeys = new Set<string>();

  let current = byId.get(nodeId);
  let guard = 0;

  while (current && guard < 50) {
    nodeIds.add(current.id);
    if (current.disciplerId && byId.has(current.disciplerId)) {
      linkKeys.add(`${current.disciplerId}->${current.id}`);
      current = byId.get(current.disciplerId);
    } else {
      break;
    }
    guard++;
  }

  return { nodeIds, linkKeys };
}

/**
 * Returns direct disciples ("spiritual children") of a given node.
 */
export function getDirectDisciples(
  nodeId: string,
  nodes: GraphNode[]
): GraphNode[] {
  return nodes.filter((n) => n.disciplerId === nodeId);
}

/**
 * Extracts a discipler's personal downline subtree (themselves + all descendants),
 * anchored at the center (0, 0) for their personal Family Tree Web workspace.
 */
export function extractPersonalSubtree(
  disciplerId: string,
  profiles: Profile[]
): DiscipleshipGraphData {
  const childrenMap = new Map<string, Profile[]>();
  const byId = new Map<string, Profile>();

  for (const p of profiles) {
    byId.set(p.id, p);
    if (p.discipler_id) {
      const list = childrenMap.get(p.discipler_id) ?? [];
      list.push(p);
      childrenMap.set(p.discipler_id, list);
    }
  }

  const root = byId.get(disciplerId);
  if (!root) {
    return { nodes: [], links: [] };
  }

  const subtreeProfiles: Profile[] = [];
  const queue: Profile[] = [root];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (visited.has(current.id)) continue;
    visited.add(current.id);
    subtreeProfiles.push(current);

    const children = childrenMap.get(current.id) ?? [];
    for (const child of children) {
      queue.push(child);
    }
  }

  const graph = transformProfilesToGraph(subtreeProfiles);
  // Pin the logged-in discipler at the center of their local web
  for (const node of graph.nodes) {
    if (node.id === disciplerId) {
      node.fx = 0;
      node.fy = 0;
    }
  }

  return graph;
}

/**
 * Fallback seed profiles if Supabase env vars are missing during offline builds.
 */
export const FALLBACK_PROFILES: Profile[] = [
  {
    id: JESUS_ROOT_ID,
    full_name: "Jesus Christ",
    avatar_url: null,
    college_program: "The Cornerstone",
    testimony:
      "I am the vine; you are the branches. If you remain in me and I in you, you will bear much fruit.",
    favorite_verse: "John 15:5",
    role: "admin",
    discipler_id: null,
    generation_depth: 0,
    created_at: "",
    updated_at: "",
  },
  {
    id: "11111111-1111-1111-1111-111111111111",
    full_name: "Kuya Marco Santos",
    avatar_url: null,
    college_program: "Campus Staff / VSU Alumni",
    testimony:
      "Called to equip student leaders at Visayas State University to win, build, and send.",
    favorite_verse: "2 Timothy 2:2",
    role: "admin",
    discipler_id: JESUS_ROOT_ID,
    generation_depth: 1,
    created_at: "",
    updated_at: "",
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    full_name: "Ate Grace Villanueva",
    avatar_url: null,
    college_program: "Campus Staff / Women's Ministry",
    testimony:
      "Passionate about walking alongside college women as a spiritual mom on campus.",
    favorite_verse: "1 Thessalonians 2:8",
    role: "discipler",
    discipler_id: JESUS_ROOT_ID,
    generation_depth: 1,
    created_at: "",
    updated_at: "",
  },
  {
    id: "33333333-3333-3333-3333-333333333333",
    full_name: "Daniel Reyes",
    avatar_url: null,
    college_program: "BS Computer Science, 4th Year",
    testimony:
      "Found true community in Cru during freshman year; now discipling freshmen in Engineering.",
    favorite_verse: "Proverbs 27:17",
    role: "discipler",
    discipler_id: "11111111-1111-1111-1111-111111111111",
    generation_depth: 2,
    created_at: "",
    updated_at: "",
  },
  {
    id: "44444444-4444-4444-4444-444444444444",
    full_name: "Hannah Mendoza",
    avatar_url: null,
    college_program: "BS Agriculture, 3rd Year",
    testimony:
      "Experiencing God's grace through Action Groups and passing it on to my roommates.",
    favorite_verse: "Romans 12:1-2",
    role: "discipler",
    discipler_id: "22222222-2222-2222-2222-222222222222",
    generation_depth: 2,
    created_at: "",
    updated_at: "",
  },
  {
    id: "55555555-5555-5555-5555-555555555555",
    full_name: "Joshua Lim",
    avatar_url: null,
    college_program: "BS Civil Engineering, 2nd Year",
    testimony:
      "Growing in daily scripture reading and prayer with my spiritual dad.",
    favorite_verse: "Joshua 1:9",
    role: "disciple",
    discipler_id: "33333333-3333-3333-3333-333333333333",
    generation_depth: 3,
    created_at: "",
    updated_at: "",
  },
  {
    id: "66666666-6666-6666-6666-666666666666",
    full_name: "Sophia Cruz",
    avatar_url: null,
    college_program: "BS Development Communication, 1st Year",
    testimony:
      "New to VSU and thankful to have a spiritual mom guiding me through college life.",
    favorite_verse: "Jeremiah 29:11",
    role: "disciple",
    discipler_id: "44444444-4444-4444-4444-444444444444",
    generation_depth: 3,
    created_at: "",
    updated_at: "",
  },
];
