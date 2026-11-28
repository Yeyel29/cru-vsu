import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { getInitials } from "../utils.ts";
import {
  JESUS_ROOT_ID,
  extractPersonalSubtree,
  getAncestryPath,
  getDirectDisciples,
  transformProfilesToGraph,
} from "../graph/transform.ts";
import {
  isValidEmail,
  isValidUuid,
  validateDonationFields,
} from "../giving/validation.ts";
import { findNodeAtScreenPoint } from "../graph/hitTest.ts";
import type { GraphNode, Profile } from "../../types/database.ts";

function makeProfile(overrides: Partial<Profile> & { id: string; full_name: string }): Profile {
  return {
    avatar_url: null,
    college_program: null,
    testimony: null,
    favorite_verse: null,
    role: "disciple",
    discipler_id: null,
    generation_depth: 1,
    created_at: "",
    updated_at: "",
    ...overrides,
  };
}

describe("getInitials", () => {
  it("handles single, multi-word, and empty names", () => {
    assert.equal(getInitials("Marco"), "MA");
    assert.equal(getInitials("Juan Dela Cruz"), "JC");
    assert.equal(getInitials("   "), "?");
    assert.equal(getInitials(""), "?");
  });
});

describe("graph transform helpers", () => {
  const jesus = makeProfile({
    id: JESUS_ROOT_ID,
    full_name: "Jesus Christ",
    role: "admin",
    generation_depth: 0,
    is_root_jesus: true,
  });
  const staff = makeProfile({
    id: "11111111-1111-1111-1111-111111111111",
    full_name: "Kuya Marco",
    role: "admin",
    discipler_id: JESUS_ROOT_ID,
    generation_depth: 1,
  });
  const discipler = makeProfile({
    id: "22222222-2222-2222-2222-222222222222",
    full_name: "Daniel Reyes",
    role: "discipler",
    discipler_id: staff.id,
    generation_depth: 2,
  });
  const disciple = makeProfile({
    id: "33333333-3333-3333-3333-333333333333",
    full_name: "Joshua Lim",
    role: "disciple",
    discipler_id: discipler.id,
    generation_depth: 3,
  });

  it("transforms profiles into nodes and links and pins Jesus at (0,0)", () => {
    const graph = transformProfilesToGraph([jesus, staff, discipler, disciple]);
    assert.equal(graph.nodes.length, 4);
    assert.equal(graph.links.length, 3);
    const rootNode = graph.nodes.find((n) => n.id === JESUS_ROOT_ID);
    assert.equal(rootNode?.fx, 0);
    assert.equal(rootNode?.fy, 0);
    assert.equal(rootNode?.isRootJesus, true);
  });

  it("walks ancestry path back to Jesus", () => {
    const graph = transformProfilesToGraph([jesus, staff, discipler, disciple]);
    const path = getAncestryPath(disciple.id, graph.nodes);
    assert.equal(path.nodeIds.size, 4);
    assert.ok(path.linkKeys.has(`${discipler.id}->${disciple.id}`));
    assert.ok(path.linkKeys.has(`${staff.id}->${discipler.id}`));
    assert.ok(path.linkKeys.has(`${JESUS_ROOT_ID}->${staff.id}`));
  });

  it("returns direct disciples only", () => {
    const graph = transformProfilesToGraph([jesus, staff, discipler, disciple]);
    const direct = getDirectDisciples(staff.id, graph.nodes);
    assert.deepEqual(
      direct.map((n) => n.id),
      [discipler.id]
    );
  });

  it("extracts personal subtree pinned at center without ancestors", () => {
    const graph = extractPersonalSubtree(discipler.id, [
      jesus,
      staff,
      discipler,
      disciple,
    ]);
    assert.deepEqual(
      graph.nodes.map((n) => n.id),
      [discipler.id, disciple.id]
    );
    const center = graph.nodes.find((n) => n.id === discipler.id);
    assert.equal(center?.fx, 0);
    assert.equal(center?.fy, 0);
  });
});

describe("donation validation", () => {
  it("validates UUIDs and emails", () => {
    assert.equal(isValidUuid("11111111-1111-1111-1111-111111111111"), true);
    assert.equal(isValidUuid("not-a-uuid"), false);
    assert.equal(isValidEmail("donor@vsu.edu.ph"), true);
    assert.equal(isValidEmail("@"), false);
    assert.equal(isValidEmail("bad@domain"), false);
  });

  it("rejects invalid donation inputs and accepts valid ones", () => {
    const base = {
      designationType: "general_fund" as const,
      recipientProfileId: "",
      recipientCustomName: "",
      amountPhp: 500,
      channelId: "11111111-1111-1111-1111-111111111111",
      channelNameSnapshot: "GCash",
      isAnonymous: false,
      donorName: "Maria Santos",
      donorEmail: "maria@vsu.edu.ph",
    };

    assert.equal(validateDonationFields(base), null);
    assert.ok(validateDonationFields({ ...base, amountPhp: -10 }));
    assert.ok(validateDonationFields({ ...base, donorEmail: "@" }));
    assert.ok(
      validateDonationFields({ ...base, recipientProfileId: "invalid-id" })
    );
    assert.ok(
      validateDonationFields({
        ...base,
        designationType: "specific_person",
        recipientProfileId: "",
        recipientCustomName: "",
      })
    );
    assert.equal(
      validateDonationFields({
        ...base,
        isAnonymous: true,
        donorName: "",
        donorEmail: "",
      }),
      null
    );
  });
});

describe("geometric graph hit-testing", () => {
  const nodes: GraphNode[] = [
    {
      id: JESUS_ROOT_ID,
      name: "Jesus Christ",
      avatarUrl: null,
      collegeProgram: null,
      testimony: null,
      favoriteVerse: null,
      role: "admin",
      disciplerId: null,
      generationDepth: 0,
      isRootJesus: true,
      x: 0,
      y: 0,
    },
    {
      id: "node-a",
      name: "Ate Grace",
      avatarUrl: null,
      collegeProgram: null,
      testimony: null,
      favoriteVerse: null,
      role: "discipler",
      disciplerId: JESUS_ROOT_ID,
      generationDepth: 1,
      x: 40,
      y: 0,
    },
    {
      id: "node-unplaced",
      name: "Unplaced",
      avatarUrl: null,
      collegeProgram: null,
      testimony: null,
      favoriteVerse: null,
      role: "disciple",
      disciplerId: "node-a",
      generationDepth: 2,
    },
  ];

  const identityProject = (x: number, y: number) => ({ x: x + 200, y: y + 200 });

  it("picks the closest node within grab radius", () => {
    const hitJesus = findNodeAtScreenPoint(nodes, 205, 203, identityProject, 1);
    assert.equal(hitJesus?.id, JESUS_ROOT_ID);

    const hitGrace = findNodeAtScreenPoint(nodes, 236, 200, identityProject, 1);
    assert.equal(hitGrace?.id, "node-a");
  });

  it("maintains at least a 22px grab radius even when zoomed out", () => {
    const hit = findNodeAtScreenPoint(nodes, 218, 200, identityProject, 0.25);
    assert.equal(hit?.id, JESUS_ROOT_ID);
  });

  it("returns null on empty canvas space and ignores unplaced nodes", () => {
    const miss = findNodeAtScreenPoint(nodes, 500, 500, identityProject, 1);
    assert.equal(miss, null);
  });
});
