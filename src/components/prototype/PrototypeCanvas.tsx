"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import type { CanvasNode } from "@/components/builder/DesignCanvas";

export interface Interaction {
  id: string;
  sourceNodeId: string;
  trigger: "tap" | "long-press" | "swipe-left" | "swipe-right";
  targetScreenId: string;
  transition: "slide-left" | "slide-right" | "fade" | "dissolve" | "none";
}

interface PrototypeCanvasProps {
  screens: { id: string; name: string; nodes: CanvasNode[] }[];
  interactions: Interaction[];
  onAddInteraction: (interaction: Omit<Interaction, "id">) => void;
  className?: string;
}

export default function PrototypeCanvas({
  screens,
  interactions,
  onAddInteraction,
  className,
}: PrototypeCanvasProps) {
  const [currentScreenId, setCurrentScreenId] = useState(
    screens[0]?.id || ""
  );
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [linkMode, setLinkMode] = useState(false);
  const [transitioning, setTransitioning] = useState(false);

  const currentScreen = screens.find((s) => s.id === currentScreenId);

  const handleNodeClick = useCallback(
    (nodeId: string) => {
      if (linkMode) {
        setSelectedNodeId(nodeId);
        setLinkMode(false);
        return;
      }

      const interaction = interactions.find(
        (i) => i.sourceNodeId === nodeId && i.trigger === "tap"
      );
      if (interaction) {
        setTransitioning(true);
        setTimeout(() => {
          setCurrentScreenId(interaction.targetScreenId);
          setTransitioning(false);
        }, 300);
      } else {
        setSelectedNodeId(nodeId);
      }
    },
    [linkMode, interactions]
  );

  const renderNode = (node: CanvasNode) => {
    if (node.hidden) return null;

    return (
      <div
        key={node.id}
        className={cn(
          "absolute cursor-pointer transition-all",
          selectedNodeId === node.id && "ring-2 ring-purple-500"
        )}
        style={{
          left: node.x,
          top: node.y,
          width: node.width,
          height: node.height,
          ...Object.fromEntries(
            Object.entries(node.style).filter(
              ([, v]) => v !== undefined && v !== ""
            )
          ),
        }}
        onClick={() => handleNodeClick(node.id)}
      >
        {renderPrototypeContent(node)}
        {node.children?.map(renderNode)}
      </div>
    );
  };

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      {/* Phone Frame */}
      <div className="relative">
        {/* Phone bezel */}
        <div className="relative h-[680px] w-[360px] rounded-[40px] border-[6px] border-slate-700 bg-black shadow-2xl">
          {/* Notch */}
          <div className="absolute left-1/2 top-2 z-10 h-6 w-24 -translate-x-1/2 rounded-full bg-slate-700" />

          {/* Screen */}
          <div
            className={cn(
              "absolute inset-2 overflow-hidden rounded-[32px] bg-slate-900 transition-opacity",
              transitioning && "opacity-0"
            )}
          >
            {currentScreen?.nodes.map(renderNode)}
          </div>

          {/* Home indicator */}
          <div className="absolute bottom-2 left-1/2 h-1 w-24 -translate-x-1/2 rounded-full bg-slate-600" />
        </div>
      </div>

      {/* Screen Tabs */}
      <div className="flex items-center gap-2">
        {screens.map((screen) => (
          <button
            key={screen.id}
            onClick={() => setCurrentScreenId(screen.id)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-medium transition",
              screen.id === currentScreenId
                ? "bg-purple-600 text-white"
                : "bg-slate-800 text-slate-400 hover:text-white"
            )}
          >
            {screen.name}
          </button>
        ))}
      </div>

      {/* Interaction indicators */}
      <div className="text-center text-xs text-slate-500">
        {interactions.length} interaction(s) configured
      </div>
    </div>
  );
}

function renderPrototypeContent(node: CanvasNode) {
  const text = (node.props.text as string) || "";

  switch (node.type) {
    case "button":
      return (
        <div className="flex h-full w-full items-center justify-center rounded-lg bg-indigo-600 text-sm font-semibold text-white active:bg-indigo-700">
          {text || "Button"}
        </div>
      );
    case "input":
      return (
        <div className="flex h-full w-full items-center rounded-lg border border-slate-500 bg-slate-800 px-3 text-sm text-slate-400">
          {text || "Enter text..."}
        </div>
      );
    case "navbar":
      return (
        <div className="flex h-full w-full items-center justify-between rounded-lg bg-slate-800 px-4 text-sm text-white">
          <span>☰</span>
          <span className="font-semibold">{text || "Title"}</span>
          <span>⋮</span>
        </div>
      );
    default:
      return (
        <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">
          {text || node.type}
        </div>
      );
  }
}
