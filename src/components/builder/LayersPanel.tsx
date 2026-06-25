"use client";

import { useEditor } from "@craftjs/core";
import { cn } from "@/lib/utils";

interface LayersPanelProps {
  className?: string;
}

export default function LayersPanel({ className }: LayersPanelProps) {
  const { nodes, selected, actions } = useEditor((state) => ({
    nodes: state.nodes,
    selected: Array.from(state.events.selected),
  }));

  // Build the tree starting from ROOT
  const rootNodes = nodes["ROOT"]?.data.nodes || [];

  const renderNode = (nodeId: string, depth: number = 0) => {
    const node = nodes[nodeId];
    if (!node) return null;

    const typeName = typeof node.data.type === "object" && node.data.type !== null && "resolvedName" in node.data.type
      ? (node.data.type as { resolvedName?: string }).resolvedName
      : undefined;
    const displayName = node.data.displayName || typeName || nodeId;
    const isSelected = selected.includes(nodeId);
    const isHidden = node.data.hidden || false;
    const childNodes = node.data.nodes || [];

    const typeIcons: Record<string, string> = {
      CraftContainer: "📦",
      CraftButton: "🔘",
      CraftText: "📄",
      CraftHeading: "H",
      CraftInput: "📝",
      CraftImage: "🖼️",
      CraftCard: "🃏",
      CraftNavbar: "📊",
      CraftRow: "⬌",
      CraftDivider: "➖",
    };

    const icon = typeIcons[typeName ?? ""] || "📦";

    return (
      <div key={nodeId}>
        <button
          onClick={() => actions.selectNode(nodeId)}
          className={cn(
            "flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-xs transition",
            isSelected
              ? "bg-indigo-500/20 text-indigo-300"
              : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
          )}
          style={{ paddingLeft: `${8 + depth * 16}px` }}
        >
          <span className="w-4 text-center text-[10px]">{icon}</span>
          <span className="flex-1 truncate font-medium">
            {displayName}
          </span>

          {/* Lock indicator (non-functional placeholder) */}
          {node.data.custom?._locked && (
            <span className="text-[10px] text-slate-600">🔒</span>
          )}

          {/* Visibility toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              actions.setProp(nodeId, (p: Record<string, unknown>) => {
                p._hidden = !p._hidden;
              });
            }}
            className={cn(
              "rounded p-0.5 text-[10px] transition",
              isHidden ? "text-red-400" : "text-slate-600 hover:text-slate-400"
            )}
            title={isHidden ? "Show" : "Hide"}
          >
            {isHidden ? "👁️‍🗨️" : "👁️"}
          </button>
        </button>

        {/* Render children */}
        {childNodes.map((childId: string) => renderNode(childId, depth + 1))}
      </div>
    );
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
          Layers
        </h3>
        <span className="text-[10px] text-slate-600">
          {Object.keys(nodes).length - 1} elements
        </span>
      </div>

      <div className="max-h-[300px] space-y-0.5 overflow-y-auto rounded-lg border border-white/5 bg-slate-800/30 p-1">
        {rootNodes.length === 0 ? (
          <p className="p-4 text-center text-xs text-slate-600">
            No elements on canvas
          </p>
        ) : (
          rootNodes.map((nodeId: string) => renderNode(nodeId, 0))
        )}
      </div>

      {/* Quick actions */}
      {selected[0] && selected[0] !== "ROOT" && (
        <div className="flex gap-1">
          <button
            onClick={() => {
              const id = selected[0];
              actions.setProp(id, (p: Record<string, unknown>) => {
                p._hidden = !p._hidden;
              });
            }}
            className="flex-1 rounded-lg bg-slate-800/50 px-2 py-1.5 text-[10px] text-slate-400 transition hover:bg-slate-700/50 hover:text-white"
          >
            👁️ Toggle
          </button>
          <button
            onClick={() => {
              const id = selected[0];
              if (id !== "ROOT") actions.delete(id);
            }}
            className="flex-1 rounded-lg bg-red-500/10 px-2 py-1.5 text-[10px] text-red-400 transition hover:bg-red-500/20"
          >
            🗑 Delete
          </button>
        </div>
      )}
    </div>
  );
}
