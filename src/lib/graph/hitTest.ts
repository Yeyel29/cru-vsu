import type { GraphNode } from "@/types/database";

export interface ScreenPoint {
  x: number;
  y: number;
}

/**
 * Finds the closest visible node within a comfortable screen-space grab radius
 * (at least 22px radius / 44px diameter) of the pointer.
 */
export function findNodeAtScreenPoint(
  nodes: GraphNode[],
  pointerX: number,
  pointerY: number,
  projectToScreen: (x: number, y: number) => ScreenPoint,
  zoom: number
): GraphNode | null {
  let closest: GraphNode | null = null;
  let closestDist = Infinity;

  for (const node of nodes) {
    if (node.x === undefined || node.y === undefined) continue;
    const screen = projectToScreen(node.x, node.y);
    const visualRadius = (node.isRootJesus ? 14 : 8) * Math.max(zoom, 0.1);
    const hitRadius = Math.max(22, visualRadius + 6);
    const dist = Math.hypot(screen.x - pointerX, screen.y - pointerY);
    if (dist <= hitRadius && dist < closestDist) {
      closest = node;
      closestDist = dist;
    }
  }

  return closest;
}
