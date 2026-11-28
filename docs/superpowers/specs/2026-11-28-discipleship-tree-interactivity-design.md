# Discipleship Tree Interactivity Fix — Short Design

## Intent & Why
Every node in the Cru-VSU Discipleship Tree must be reliably grabbable, draggable (with connected branches following via spring physics), and positionable without hover re-renders breaking hit-testing or the camera snapping back on release.

## Goals, Non-Goals & Anti-Goals
- **Goals:** Fix hit-test flushing on hover so all nodes are draggable; scale pointer hit areas with zoom; prevent `onEngineStop` from resetting the camera after drags; allow sticky node positioning on drag end with Reset Camera restoring the default layout.
- **Non-Goals:** No database, server action, or `MemberProfileDrawer` changes.
- **Anti-Goals:** Triggering React re-renders on `onNodeHover` or calling `zoomToFit` after every drag.

## Approaches Considered
1. **Approach A — Stabilize `ForceGraph2D` with anchored root:** Eliminate hover re-renders, guard `onEngineStop`, and scale `nodePointerAreaPaint`, while keeping the center node fixed at `(0, 0)` and letting dragged nodes snap back under spring tension.
2. **Approach B — Stabilize `ForceGraph2D` + free/sticky node positioning (Chosen):** Same stability fixes as Approach A, plus persisting dragged node positions (`fx`/`fy` on `onNodeDragEnd`) and restoring the default centered layout on Reset Camera. Chosen so users can freely arrange and inspect any part of the tree.

## Design (`DiscipleshipGraphCanvas.tsx`)
1. **Zero re-renders on hover:** Replace `hoveredNodeId` `useState` with `hoveredNodeIdRef` (`useRef<string | null>(null)`) and compute `activePath` from `hoveredNodeIdRef.current || selectedNode?.id` inside the canvas/link callbacks.
2. **Stable `ForceGraph2D` callbacks:** Memoize `nodePointerAreaPaint`, `linkColor`, `linkWidth`, `onNodeClick`, `onNodeHover`, `onNodeDragEnd`, `onEngineStop`, and `linkDirectionalParticleColor` with `useCallback` so `force-graph` never flushes the shadow hit-test canvas mid-interaction.
3. **Zoom-aware hit targets:** In `nodePointerAreaPaint(nodeObj, color, ctx, globalScale)`, use radius `Math.max(14, 16 / globalScale)` so every node remains easy to grab when zoomed out.
4. **Initial-only `zoomToFit`:** Guard `onEngineStop` with `hasInitialFitRef` (reset when `filteredData` changes) so dragging a node does not snap the camera back.
5. **Sticky drag + Reset Camera:** In `onNodeDragEnd`, set `node.fx = node.x` and `node.fy = node.y` so any dragged node (including the center node) stays where placed. In `handleResetCamera`, clear `fx`/`fy` on non-root nodes, re-pin the root node at `(0, 0)`, call `d3ReheatSimulation()`, and run `zoomToFit(500, 60)`.
