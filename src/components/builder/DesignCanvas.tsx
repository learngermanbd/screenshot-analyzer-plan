"use client";

import { useCallback, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface CanvasNode {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  props: Record<string, unknown>;
  style: Record<string, unknown>;
  children?: CanvasNode[];
  parentId?: string;
  locked?: boolean;
  hidden?: boolean;
}

interface DesignCanvasProps {
  nodes: CanvasNode[];
  selectedId: string | null;
  mode: "freeform" | "grid";
  onSelect: (id: string | null) => void;
  onMove: (id: string, x: number, y: number) => void;
  onResize: (id: string, width: number, height: number) => void;
  className?: string;
}

export default function DesignCanvas({
  nodes,
  selectedId,
  mode,
  onSelect,
  onMove,
  onResize,
  className,
}: DesignCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<{
    nodeId: string;
    startX: number;
    startY: number;
    offsetX: number;
    offsetY: number;
  } | null>(null);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, nodeId: string) => {
      e.stopPropagation();
      const node = nodes.find((n) => n.id === nodeId);
      if (!node || node.locked) return;
      onSelect(nodeId);
      setDragging({
        nodeId,
        startX: node.x,
        startY: node.y,
        offsetX: e.clientX - node.x,
        offsetY: e.clientY - node.y,
      });
    },
    [nodes, onSelect]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!dragging) return;
      const newX = e.clientX - dragging.offsetX;
      const newY = e.clientY - dragging.offsetY;
      onMove(
        dragging.nodeId,
        mode === "grid" ? Math.round(newX / 8) * 8 : newX,
        mode === "grid" ? Math.round(newY / 8) * 8 : newY
      );
    },
    [dragging, mode, onMove]
  );

  const handleMouseUp = useCallback(() => {
    setDragging(null);
  }, []);

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === canvasRef.current) {
        onSelect(null);
      }
    },
    [onSelect]
  );

  const renderNode = (node: CanvasNode) => {
    if (node.hidden) return null;
    const isSelected = node.id === selectedId;

    return (
      <div
        key={node.id}
        className={cn(
          "absolute cursor-move transition-shadow",
          isSelected && "ring-2 ring-indigo-500 ring-offset-1 ring-offset-transparent",
          node.locked && "cursor-default"
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
        onMouseDown={(e) => handleMouseDown(e, node.id)}
      >
        {renderNodeContent(node)}
        {isSelected && (
          <>
            {/* Resize handles */}
            {["nw", "ne", "sw", "se"].map((pos) => (
              <div
                key={pos}
                className={cn(
                  "absolute h-3 w-3 rounded-full border-2 border-indigo-500 bg-white",
                  pos === "nw" && "-left-1.5 -top-1.5 cursor-nw-resize",
                  pos === "ne" && "-right-1.5 -top-1.5 cursor-ne-resize",
                  pos === "sw" && "-bottom-1.5 -left-1.5 cursor-sw-resize",
                  pos === "se" && "-bottom-1.5 -right-1.5 cursor-se-resize"
                )}
              />
            ))}
          </>
        )}
        {node.children?.map(renderNode)}
      </div>
    );
  };

  return (
    <div
      ref={canvasRef}
      className={cn(
        "relative min-h-[600px] overflow-auto rounded-xl border border-white/10 bg-slate-900",
        mode === "grid" && "bg-[length:16px_16px] bg-[image:radial-gradient(circle,rgba(255,255,255,.05)_1px,transparent_1px)]",
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onClick={handleCanvasClick}
    >
      {nodes.length === 0 && (
        <div className="flex h-full min-h-[400px] flex-col items-center justify-center text-slate-500">
          <div className="mb-3 text-5xl">🎨</div>
          <p className="text-lg font-semibold">Drag components here</p>
          <p className="text-sm">Or upload a screenshot to auto-populate</p>
        </div>
      )}
      {nodes.map(renderNode)}
    </div>
  );
}

function renderNodeContent(node: CanvasNode) {
  const text = (node.props.text as string) || "";
  const base = "flex items-center justify-center w-full h-full overflow-hidden";

  switch (node.type) {
    case "button":
      return (
        <div className={cn(base, "rounded-lg bg-indigo-600 text-sm font-semibold text-white")}>
          {text || "Button"}
        </div>
      );
    case "input":
      return (
        <div className={cn(base, "rounded-lg border border-slate-500 bg-slate-800 px-3 text-left text-sm text-slate-400")}>
          {text || "Input field..."}
        </div>
      );
    case "text":
    case "heading":
    case "paragraph":
    case "label":
    case "caption":
      return (
        <div className={cn(base, "text-left")}>
          <span className="text-sm text-white">{text || "Text"}</span>
        </div>
      );
    case "image":
      return (
        <div className={cn(base, "rounded-lg border border-dashed border-slate-500 bg-slate-800/50 text-2xl text-slate-500")}>
          🖼️
        </div>
      );
    case "navbar":
      return (
        <div className={cn(base, "rounded-lg bg-slate-800 px-4 text-sm text-white justify-between")}>
          <span>☰</span>
          <span className="font-semibold">{text || "Title"}</span>
          <span>⋮</span>
        </div>
      );
    case "card":
      return (
        <div className={cn(base, "flex-col rounded-xl border border-white/10 bg-slate-800 p-4 text-sm text-white")}>
          <div className="mb-2 h-3 w-1/2 rounded bg-slate-600" />
          <div className="h-2 w-3/4 rounded bg-slate-700" />
        </div>
      );
    case "row":
      return (
        <div className={cn(base, "gap-2 rounded-lg border border-dashed border-slate-600 bg-slate-800/30")}>
          <span className="text-xs text-slate-500">Row</span>
        </div>
      );
    case "column":
      return (
        <div className={cn(base, "flex-col gap-2 rounded-lg border border-dashed border-slate-600 bg-slate-800/30")}>
          <span className="text-xs text-slate-500">Column</span>
        </div>
      );
    default:
      return (
        <div className={cn(base, "rounded-lg border border-dashed border-slate-600 bg-slate-800/30 text-xs text-slate-500")}>
          {node.type}
        </div>
      );
  }
}
