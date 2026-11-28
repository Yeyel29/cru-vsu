"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Search, RotateCcw, Moon, Sun, Maximize2 } from "lucide-react";
import Link from "next/link";
import type { ForceGraphMethods } from "react-force-graph-2d";
import {
  getAncestryPath,
  getGenerationColor,
} from "@/lib/graph/transform";
import { findNodeAtScreenPoint } from "@/lib/graph/hitTest";
import { cn, getInitials } from "@/lib/utils";
import { useTheme } from "@/components/theme/useTheme";
import type { DiscipleshipGraphData, GraphNode } from "@/types/database";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center font-mono text-xs text-cru-muted dark:text-cru-ink-muted">
      Initializing discipleship network...
    </div>
  ),
});

interface DiscipleshipGraphCanvasProps {
  data: DiscipleshipGraphData;
  selectedNode: GraphNode | null;
  onSelectNode: (node: GraphNode) => void;
  compact?: boolean;
  fullScreenHref?: string;
}

/**
 * Obsidian-style interactive force-directed graph for the Cru-VSU Spiritual Family Tree.
 */
export function DiscipleshipGraphCanvas({
  data,
  selectedNode,
  onSelectNode,
  compact = false,
  fullScreenHref,
}: DiscipleshipGraphCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const fgRef = useRef<ForceGraphMethods | undefined>(undefined);

  const [dimensions, setDimensions] = useState({ width: 800, height: 520 });
  const [searchQuery, setSearchQuery] = useState("");
  const [maxDepthFilter, setMaxDepthFilter] = useState<number | null>(null);
  // The canvas follows the site theme. The sun/moon button overrides it until the site theme changes.
  const { theme } = useTheme();
  const [canvasOverride, setCanvasOverride] = useState<{
    value: boolean;
    theme: string;
  } | null>(null);
  const darkCanvas =
    canvasOverride && canvasOverride.theme === theme
      ? canvasOverride.value
      : theme === "dark";

  const hoveredNodeIdRef = useRef<string | null>(null);
  const selectedNodeIdRef = useRef<string | null>(selectedNode?.id ?? null);
  const darkCanvasRef = useRef(darkCanvas);
  const hasInitialFitRef = useRef(false);
  const onSelectNodeRef = useRef(onSelectNode);
  const dragRef = useRef<{
    node: GraphNode;
    pointerId: number;
    startX: number;
    startY: number;
    dragged: boolean;
    lastReheat: number;
  } | null>(null);

  useEffect(() => {
    selectedNodeIdRef.current = selectedNode?.id ?? null;
  }, [selectedNode?.id]);

  useEffect(() => {
    darkCanvasRef.current = darkCanvas;
  }, [darkCanvas]);

  useEffect(() => {
    onSelectNodeRef.current = onSelectNode;
  }, [onSelectNode]);

  // Remember which nodes were initially pinned at (0, 0) (Jesus in main tree, or discipler in My Tree)
  const initialPinnedIdsRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    initialPinnedIdsRef.current = new Set(
      data.nodes
        .filter((n) => n.fx !== undefined && n.fy !== undefined)
        .map((n) => n.id)
    );
  }, [data]);

  // Measure container cleanly for responsive canvas
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateSize = () => {
      setDimensions({
        width: el.clientWidth,
        height: el.clientHeight,
      });
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Filter graph by generation depth
  const filteredData = useMemo(() => {
    if (maxDepthFilter === null) return data;
    const validNodes = data.nodes.filter(
      (n) => n.generationDepth <= maxDepthFilter
    );
    const validIds = new Set(validNodes.map((n) => n.id));
    const validLinks = data.links.filter((l) => {
      const s = typeof l.source === "string" ? l.source : l.source.id;
      const t = typeof l.target === "string" ? l.target : l.target.id;
      return validIds.has(s) && validIds.has(t);
    });
    return { nodes: validNodes, links: validLinks };
  }, [data, maxDepthFilter]);

  const filteredNodesRef = useRef(filteredData.nodes);
  useEffect(() => {
    filteredNodesRef.current = filteredData.nodes;
    hasInitialFitRef.current = false;
  }, [filteredData]);

  // Cache ancestry path lookup by focusNodeId + nodes array so frame draws stay O(1)
  const activePathCacheRef = useRef<{
    focusId: string | null;
    nodes: GraphNode[];
    path: { nodeIds: Set<string>; linkKeys: Set<string> } | null;
  }>({ focusId: null, nodes: [], path: null });

  const getActivePath = useCallback(() => {
    const focusId = hoveredNodeIdRef.current || selectedNodeIdRef.current;
    const nodes = filteredNodesRef.current;
    const cache = activePathCacheRef.current;
    if (cache.focusId === focusId && cache.nodes === nodes) {
      return cache.path;
    }
    const path = focusId ? getAncestryPath(focusId, nodes) : null;
    activePathCacheRef.current = { focusId, nodes, path };
    return path;
  }, []);

  // Search matches
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return filteredData.nodes
      .filter(
        (n) =>
          n.name.toLowerCase().includes(q) ||
          (n.collegeProgram && n.collegeProgram.toLowerCase().includes(q))
      )
      .slice(0, 6);
  }, [searchQuery, filteredData.nodes]);

  const focusCameraOnNode = useCallback((node: GraphNode) => {
    if (fgRef.current && node.x !== undefined && node.y !== undefined) {
      fgRef.current.centerAt(node.x, node.y, 600);
      fgRef.current.zoom(2.2, 600);
    }
  }, []);

  const handleResetCamera = useCallback(() => {
    for (const node of filteredNodesRef.current) {
      if (initialPinnedIdsRef.current.has(node.id)) {
        node.fx = 0;
        node.fy = 0;
      } else {
        node.fx = undefined;
        node.fy = undefined;
      }
    }
    hasInitialFitRef.current = false;
    fgRef.current?.d3ReheatSimulation();
    fgRef.current?.zoomToFit(500, 60);
  }, []);

  // Custom HTML5 Canvas renderer per node (reads refs so hover never triggers React re-renders)
  const drawNode = useCallback(
    (
      nodeObj: object,
      ctx: CanvasRenderingContext2D,
      globalScale: number
    ) => {
      const node = nodeObj as GraphNode;
      const x = node.x ?? 0;
      const y = node.y ?? 0;

      const activePath = getActivePath();
      const isDark = darkCanvasRef.current;
      const isDimmed =
        activePath !== null && !activePath.nodeIds.has(node.id);
      const isHighlighted =
        activePath !== null && activePath.nodeIds.has(node.id);
      const isSelected = selectedNodeIdRef.current === node.id;

      ctx.save();
      ctx.globalAlpha = isDimmed ? 0.2 : 1;

      const color = getGenerationColor(node.generationDepth, node.isRootJesus);
      const radius = node.isRootJesus ? 14 : isSelected ? 10 : 8;

      // Radiant golden aura for Jesus root or selected node
      if (node.isRootJesus || isSelected || isHighlighted) {
        ctx.beginPath();
        ctx.arc(x, y, radius + (node.isRootJesus ? 7 : 4), 0, 2 * Math.PI);
        ctx.fillStyle = node.isRootJesus
          ? "rgba(253, 185, 19, 0.26)"
          : `${color}30`;
        ctx.fill();
      }

      // Main circle
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();

      // Clean border ring
      ctx.lineWidth = node.isRootJesus ? 2 / globalScale : 1.5 / globalScale;
      ctx.strokeStyle = isDark ? "#171717" : "#FFFFFF";
      ctx.stroke();

      // Inner symbol / initials
      const innerFontSize = (node.isRootJesus ? 10 : 6.5) / Math.max(1, globalScale * 0.45);
      ctx.font = `700 ${innerFontSize}px Inter, system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = node.isRootJesus ? "#171717" : "#FFFFFF";
      ctx.fillText(
        node.isRootJesus ? "✝" : getInitials(node.name),
        x,
        y + 0.3
      );

      // Node label below circle
      if (globalScale > 0.85 || node.isRootJesus || isHighlighted) {
        const labelFontSize = Math.max(3.5, 11 / globalScale);
        ctx.font = `${node.isRootJesus ? "700" : "500"} ${labelFontSize}px Inter, system-ui, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillStyle = isDark ? "#F5F5F5" : "#171717";
        ctx.fillText(node.name, x, y + radius + 3 / globalScale);
      }

      ctx.restore();
    },
    [getActivePath]
  );

  const findNodeAtClientPoint = useCallback(
    (clientX: number, clientY: number): GraphNode | null => {
      const container = containerRef.current;
      const fg = fgRef.current;
      if (!container || !fg) return null;
      const rect = container.getBoundingClientRect();
      const pointerX = clientX - rect.left;
      const pointerY = clientY - rect.top;
      const currentZoom = fg.zoom() ?? 1;
      return findNodeAtScreenPoint(
        filteredNodesRef.current,
        pointerX,
        pointerY,
        (x, y) => fg.graph2ScreenCoords(x, y),
        currentZoom
      );
    },
    []
  );

  const shouldAllowCanvasPan = useCallback(
    (ev: MouseEvent) => {
      const touch = (ev as unknown as TouchEvent).touches?.[0];
      const clientX = touch ? touch.clientX : ev.clientX;
      const clientY = touch ? touch.clientY : ev.clientY;
      if (typeof clientX !== "number" || typeof clientY !== "number") {
        return true;
      }
      return findNodeAtClientPoint(clientX, clientY) === null;
    },
    [findNodeAtClientPoint]
  );

  const handleContainerPointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      const hitNode = findNodeAtClientPoint(event.clientX, event.clientY);
      if (!hitNode) return;

      event.currentTarget.setPointerCapture(event.pointerId);
      dragRef.current = {
        node: hitNode,
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        dragged: false,
        lastReheat: 0,
      };
      event.currentTarget.style.cursor = "grabbing";
    },
    [findNodeAtClientPoint]
  );

  const handleContainerPointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current;
      if (drag && drag.pointerId === event.pointerId) {
        const moved = Math.hypot(
          event.clientX - drag.startX,
          event.clientY - drag.startY
        );
        if (!drag.dragged && moved > 5) {
          drag.dragged = true;
        }
        if (drag.dragged) {
          const container = containerRef.current;
          const fg = fgRef.current;
          if (container && fg) {
            const rect = container.getBoundingClientRect();
            const { x: gx, y: gy } = fg.screen2GraphCoords(
              event.clientX - rect.left,
              event.clientY - rect.top
            );
            drag.node.fx = gx;
            drag.node.fy = gy;
            drag.node.x = gx;
            drag.node.y = gy;
            const now = performance.now();
            if (now - drag.lastReheat > 120) {
              fg.d3ReheatSimulation();
              drag.lastReheat = now;
            }
          }
        }
        return;
      }

      const hit = findNodeAtClientPoint(event.clientX, event.clientY);
      hoveredNodeIdRef.current = hit ? hit.id : null;
      event.currentTarget.style.cursor = hit ? "pointer" : "grab";
    },
    [findNodeAtClientPoint]
  );

  const finishNodeDrag = useCallback(
    (event: React.PointerEvent<HTMLDivElement>, treatAsClickIfStill: boolean) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) return;
      dragRef.current = null;

      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }

      if (!drag.dragged && treatAsClickIfStill) {
        onSelectNodeRef.current(drag.node);
        focusCameraOnNode(drag.node);
      } else if (drag.dragged) {
        drag.node.fx = drag.node.x;
        drag.node.fy = drag.node.y;
        fgRef.current?.d3ReheatSimulation();
      }

      const hit = findNodeAtClientPoint(event.clientX, event.clientY);
      hoveredNodeIdRef.current = hit ? hit.id : null;
      event.currentTarget.style.cursor = hit ? "pointer" : "grab";
    },
    [findNodeAtClientPoint, focusCameraOnNode]
  );

  const handleContainerPointerUp = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      finishNodeDrag(event, true);
    },
    [finishNodeDrag]
  );

  const handleContainerPointerCancel = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      finishNodeDrag(event, false);
    },
    [finishNodeDrag]
  );

  const handleContainerPointerLeave = useCallback(() => {
    if (!dragRef.current) {
      hoveredNodeIdRef.current = null;
    }
  }, []);

  const getLinkColor = useCallback(
    (linkObj: object) => {
      const link = linkObj as { source: GraphNode | string; target: GraphNode | string };
      const s = typeof link.source === "string" ? link.source : link.source.id;
      const t = typeof link.target === "string" ? link.target : link.target.id;
      const activePath = getActivePath();
      const isDark = darkCanvasRef.current;
      const isHighlighted = activePath?.linkKeys.has(`${s}->${t}`);

      if (activePath && !isHighlighted) {
        return isDark ? "rgba(255,255,255,0.06)" : "rgba(23,23,23,0.06)";
      }
      return isHighlighted
        ? "#FDB913"
        : isDark
        ? "rgba(253,185,19,0.35)"
        : "rgba(23,23,23,0.18)";
    },
    [getActivePath]
  );

  const getLinkWidth = useCallback(
    (linkObj: object) => {
      const link = linkObj as { source: GraphNode | string; target: GraphNode | string };
      const s = typeof link.source === "string" ? link.source : link.source.id;
      const t = typeof link.target === "string" ? link.target : link.target.id;
      const activePath = getActivePath();
      return activePath?.linkKeys.has(`${s}->${t}`) ? 2.4 : 1.2;
    },
    [getActivePath]
  );

  const getParticleColor = useCallback(() => "#FDB913", []);

  const handleEngineStop = useCallback(() => {
    if (!hasInitialFitRef.current) {
      hasInitialFitRef.current = true;
      fgRef.current?.zoomToFit(400, 60);
    }
  }, []);

  return (
    <div
      className={cn(
        "relative flex flex-col overflow-hidden rounded-[24px] border border-neutral-900/[0.08] transition-colors duration-300 dark:border-white/10",
        darkCanvas ? "bg-[#0F1115]" : "bg-[#FAFAFA]",
        compact ? "h-[540px]" : "h-[calc(100vh-8rem)] min-h-[600px]"
      )}
    >
      {/* Subtle Obsidian Dot Grid Overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage: `radial-gradient(${
            darkCanvas ? "rgba(255,255,255,0.12)" : "rgba(23,23,23,0.12)"
          } 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
        }}
      />

      {/* Top Toolbar */}
      <div className="pointer-events-none relative z-20 flex flex-wrap items-center justify-between gap-3 p-4">
        {/* Search Bar */}
        <div className="pointer-events-auto relative w-full max-w-xs">
          <div className="glass-nav flex h-10 items-center gap-2 rounded-full px-3.5">
            <Search className="size-3.5 shrink-0 text-cru-muted dark:text-cru-ink-muted" aria-hidden="true" />
            <input
              type="text"
              aria-label="Search person or degree program"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search person or course..."
              className="w-full bg-transparent text-xs text-cru-charcoal placeholder:text-cru-muted focus:outline-none dark:text-cru-ink dark:placeholder:text-cru-ink-muted"
            />
          </div>

          {searchResults.length > 0 && (
            <div className="glass-panel absolute left-0 right-0 top-12 z-30 rounded-2xl p-1.5">
              {searchResults.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onSelectNode(item);
                    focusCameraOnNode(item);
                    setSearchQuery("");
                  }}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition-colors hover:bg-cru-gold-soft dark:hover:bg-white/10"
                >
                  <span className="font-medium text-cru-charcoal dark:text-cru-ink">
                    {item.name}
                  </span>
                  <span className="font-mono text-[10px] text-cru-muted dark:text-cru-ink-muted">
                    {item.isRootJesus ? "Center" : `Gen ${item.generationDepth}`}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Depth Filter Pills + Canvas Controls */}
        <div className="pointer-events-auto flex flex-wrap items-center gap-2">
          <div className="glass-nav inline-flex items-center gap-1 rounded-full p-1">
            {[
              { label: "All", value: null },
              { label: "Gen 1", value: 1 },
              { label: "Gen 2", value: 2 },
              { label: "Gen 3+", value: 3 },
            ].map((pill) => {
              const active = maxDepthFilter === pill.value;
              return (
                <button
                  key={pill.label}
                  type="button"
                  onClick={() => setMaxDepthFilter(pill.value)}
                  className={cn(
                    "h-7 rounded-full px-3 text-[11px] font-medium transition-all",
                    active
                      ? "bg-cru-gold text-cru-charcoal shadow-xs"
                      : "text-cru-charcoal/70 hover:text-cru-charcoal dark:text-white/70 dark:hover:text-white"
                  )}
                >
                  {pill.label}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleResetCamera}
            aria-label="Reset camera and layout"
            title="Reset camera / Zoom to fit"
            className="glass-nav grid size-9 place-items-center rounded-full text-cru-charcoal transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cru-gold dark:text-cru-ink"
          >
            <RotateCcw aria-hidden="true" className="size-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setCanvasOverride({ value: !darkCanvas, theme })}
            aria-label={
              darkCanvas
                ? "Switch graph canvas to light mode"
                : "Switch graph canvas to dark mode"
            }
            title="Toggle Dark / Light Canvas"
            className="glass-nav grid size-9 place-items-center rounded-full text-cru-charcoal transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cru-gold dark:text-cru-ink"
          >
            {darkCanvas ? (
              <Sun aria-hidden="true" className="size-3.5 text-cru-gold-hover" />
            ) : (
              <Moon aria-hidden="true" className="size-3.5" />
            )}
          </button>

          {fullScreenHref && (
            <Link
              href={fullScreenHref}
              className="inline-flex h-9 items-center gap-1.5 rounded-full bg-cru-gold px-3.5 text-xs font-semibold text-cru-charcoal shadow-xs transition-colors hover:bg-cru-gold-hover"
            >
              <Maximize2 className="size-3" />
              <span className="hidden sm:inline">Full Screen</span>
            </Link>
          )}
        </div>
      </div>

      {/* Force Graph Canvas */}
      <div
        ref={containerRef}
        onPointerDown={handleContainerPointerDown}
        onPointerMove={handleContainerPointerMove}
        onPointerUp={handleContainerPointerUp}
        onPointerCancel={handleContainerPointerCancel}
        onPointerLeave={handleContainerPointerLeave}
        className="relative flex-1 touch-none cursor-grab active:cursor-grabbing"
      >
        <ForceGraph2D
          ref={fgRef}
          width={dimensions.width}
          height={dimensions.height}
          graphData={filteredData}
          backgroundColor="rgba(0,0,0,0)"
          nodeCanvasObject={drawNode}
          enablePointerInteraction={false}
          enableNodeDrag={false}
          enablePanInteraction={shouldAllowCanvasPan}
          linkColor={getLinkColor}
          linkWidth={getLinkWidth}
          linkDirectionalParticles={2}
          linkDirectionalParticleWidth={2.2}
          linkDirectionalParticleSpeed={0.004}
          linkDirectionalParticleColor={getParticleColor}
          cooldownTicks={90}
          onEngineStop={handleEngineStop}
        />
      </div>

      {/* Bottom Legend Bar */}
      <div className="pointer-events-none relative z-20 flex flex-wrap items-center justify-between gap-3 border-t border-neutral-900/[0.06] bg-white/75 px-4 py-2.5 backdrop-blur-md dark:border-white/10 dark:bg-cru-night/75">
        <div className="flex flex-wrap items-center gap-4 text-[11px] font-medium text-cru-charcoal dark:text-cru-ink">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-[#FDB913]" />
            Jesus Christ (Center)
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-[#D97706]" />
            Gen 1 · Staff
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-[#0D9488]" />
            Gen 2 · Disciplers
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-[#4F46E5]" />
            Gen 3+ · Disciples
          </span>
        </div>

        <span className="font-mono text-[10px] text-cru-muted dark:text-cru-ink-muted">
          Click any node to view lineage · Drag any node to arrange · Scroll to zoom
        </span>
      </div>
    </div>
  );
}
