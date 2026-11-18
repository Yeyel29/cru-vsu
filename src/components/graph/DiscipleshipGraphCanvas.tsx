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
import { cn } from "@/lib/utils";
import type { DiscipleshipGraphData, GraphNode } from "@/types/database";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center font-mono text-xs text-cru-muted">
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

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
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
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [maxDepthFilter, setMaxDepthFilter] = useState<number | null>(null);
  const [darkCanvas, setDarkCanvas] = useState(false);

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

  // Highlight ancestry chain back to Jesus on hover or selection
  const focusNodeId = hoveredNodeId || selectedNode?.id || null;
  const activePath = useMemo(() => {
    if (!focusNodeId) return null;
    return getAncestryPath(focusNodeId, filteredData.nodes);
  }, [focusNodeId, filteredData.nodes]);

  const focusCameraOnNode = useCallback((node: GraphNode) => {
    if (fgRef.current && node.x !== undefined && node.y !== undefined) {
      fgRef.current.centerAt(node.x, node.y, 600);
      fgRef.current.zoom(2.2, 600);
    }
  }, []);

  const handleResetCamera = () => {
    fgRef.current?.zoomToFit(500, 60);
  };

  // Custom HTML5 Canvas renderer per node
  const drawNode = useCallback(
    (
      nodeObj: object,
      ctx: CanvasRenderingContext2D,
      globalScale: number
    ) => {
      const node = nodeObj as GraphNode;
      const x = node.x ?? 0;
      const y = node.y ?? 0;

      const isDimmed =
        activePath !== null && !activePath.nodeIds.has(node.id);
      const isHighlighted =
        activePath !== null && activePath.nodeIds.has(node.id);
      const isSelected = selectedNode?.id === node.id;

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
      ctx.strokeStyle = darkCanvas ? "#171717" : "#FFFFFF";
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
        ctx.fillStyle = darkCanvas ? "#F5F5F5" : "#171717";
        ctx.fillText(node.name, x, y + radius + 3 / globalScale);
      }

      ctx.restore();
    },
    [activePath, selectedNode?.id, darkCanvas]
  );

  return (
    <div
      className={cn(
        "relative flex flex-col overflow-hidden rounded-[24px] border border-neutral-900/[0.08] transition-colors duration-300",
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
            <Search className="size-3.5 shrink-0 text-cru-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search person or course..."
              className="w-full bg-transparent text-xs text-cru-charcoal placeholder:text-cru-muted focus:outline-none"
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
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition-colors hover:bg-cru-gold-soft"
                >
                  <span className="font-medium text-cru-charcoal">
                    {item.name}
                  </span>
                  <span className="font-mono text-[10px] text-cru-muted">
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
                      : "text-cru-charcoal/70 hover:text-cru-charcoal"
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
            title="Reset camera / Zoom to fit"
            className="glass-nav grid size-9 place-items-center rounded-full text-cru-charcoal transition-transform hover:scale-105"
          >
            <RotateCcw className="size-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setDarkCanvas((prev) => !prev)}
            title="Toggle Obsidian Dark / Light Canvas"
            className="glass-nav grid size-9 place-items-center rounded-full text-cru-charcoal transition-transform hover:scale-105"
          >
            {darkCanvas ? (
              <Sun className="size-3.5 text-cru-gold-hover" />
            ) : (
              <Moon className="size-3.5" />
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
      <div ref={containerRef} className="relative flex-1 cursor-grab active:cursor-grabbing">
        <ForceGraph2D
          ref={fgRef}
          width={dimensions.width}
          height={dimensions.height}
          graphData={filteredData}
          backgroundColor="rgba(0,0,0,0)"
          nodeCanvasObject={drawNode}
          nodePointerAreaPaint={(nodeObj, color, ctx) => {
            const node = nodeObj as GraphNode;
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(node.x ?? 0, node.y ?? 0, 14, 0, 2 * Math.PI);
            ctx.fill();
          }}
          onNodeClick={(nodeObj) => {
            const node = nodeObj as GraphNode;
            onSelectNode(node);
            focusCameraOnNode(node);
          }}
          onNodeHover={(nodeObj) => {
            setHoveredNodeId(nodeObj ? (nodeObj as GraphNode).id : null);
          }}
          linkColor={(linkObj) => {
            const link = linkObj as { source: GraphNode | string; target: GraphNode | string };
            const s = typeof link.source === "string" ? link.source : link.source.id;
            const t = typeof link.target === "string" ? link.target : link.target.id;
            const isHighlighted = activePath?.linkKeys.has(`${s}->${t}`);

            if (activePath && !isHighlighted) {
              return darkCanvas
                ? "rgba(255,255,255,0.06)"
                : "rgba(23,23,23,0.06)";
            }
            return isHighlighted
              ? "#FDB913"
              : darkCanvas
              ? "rgba(253,185,19,0.35)"
              : "rgba(23,23,23,0.18)";
          }}
          linkWidth={(linkObj) => {
            const link = linkObj as { source: GraphNode | string; target: GraphNode | string };
            const s = typeof link.source === "string" ? link.source : link.source.id;
            const t = typeof link.target === "string" ? link.target : link.target.id;
            return activePath?.linkKeys.has(`${s}->${t}`) ? 2.4 : 1.2;
          }}
          linkDirectionalParticles={2}
          linkDirectionalParticleWidth={2.2}
          linkDirectionalParticleSpeed={0.004}
          linkDirectionalParticleColor={() => "#FDB913"}
          cooldownTicks={90}
          onEngineStop={() => fgRef.current?.zoomToFit(400, 60)}
        />
      </div>

      {/* Bottom Legend Bar */}
      <div className="pointer-events-none relative z-20 flex flex-wrap items-center justify-between gap-3 border-t border-neutral-900/[0.06] bg-white/75 px-4 py-2.5 backdrop-blur-md">
        <div className="flex flex-wrap items-center gap-4 text-[11px] font-medium text-cru-charcoal">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-[#FDB913]" />
            Jesus (Root)
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

        <span className="font-mono text-[10px] text-cru-muted">
          Click any node to view spiritual lineage · Scroll to zoom · Drag to pan
        </span>
      </div>
    </div>
  );
}
