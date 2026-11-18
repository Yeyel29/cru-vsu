"use client";

import { useState } from "react";
import { DiscipleshipGraphCanvas } from "./DiscipleshipGraphCanvas";
import { MemberProfileDrawer } from "./MemberProfileDrawer";
import type { DiscipleshipGraphData, GraphNode } from "@/types/database";

interface DiscipleshipExplorerProps {
  data: DiscipleshipGraphData;
  compact?: boolean;
  fullScreenHref?: string;
}

/**
 * Interactive wrapper combining the Obsidian-style force graph canvas
 * with the slide-out Member Profile Drawer.
 */
export function DiscipleshipExplorer({
  data,
  compact = false,
  fullScreenHref,
}: DiscipleshipExplorerProps) {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  return (
    <div className="relative">
      <DiscipleshipGraphCanvas
        data={data}
        selectedNode={selectedNode}
        onSelectNode={(node) => setSelectedNode(node)}
        compact={compact}
        fullScreenHref={fullScreenHref}
      />

      <MemberProfileDrawer
        node={selectedNode}
        allNodes={data.nodes}
        onClose={() => setSelectedNode(null)}
        onSelectNode={(node) => setSelectedNode(node)}
      />
    </div>
  );
}
