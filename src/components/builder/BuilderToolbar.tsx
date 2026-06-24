"use client";

import { useEditor } from "@craftjs/core";
import { cn } from "@/lib/utils";

interface BuilderToolbarProps {
  mode: "freeform" | "grid";
  onModeChange: (mode: "freeform" | "grid") => void;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onPrototype: () => void;
  className?: string;
}

export default function BuilderToolbar({
  mode,
  onModeChange,
  zoom,
  onZoomChange,
  onPrototype,
  className,
}: BuilderToolbarProps) {
  const { actions, canUndo, canRedo } = useEditor((state, query) => ({
    canUndo: query.history.canUndo(),
    canRedo: query.history.canRedo(),
  }));

  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded-xl border border-white/10 bg-slate-800/80 p-1 backdrop-blur-sm",
        className
      )}
    >
      {/* Mode Toggle */}
      <div className="flex items-center rounded-lg bg-slate-900/50 p-0.5">
        <button
          onClick={() => onModeChange("freeform")}
          className={cn(
            "rounded-md px-3 py-1.5 text-xs font-medium transition",
            mode === "freeform"
              ? "bg-indigo-600 text-white"
              : "text-slate-400 hover:text-white"
          )}
        >
          Free Form
        </button>
        <button
          onClick={() => onModeChange("grid")}
          className={cn(
            "rounded-md px-3 py-1.5 text-xs font-medium transition",
            mode === "grid"
              ? "bg-indigo-600 text-white"
              : "text-slate-400 hover:text-white"
          )}
        >
          Grid
        </button>
      </div>

      <div className="mx-1 h-6 w-px bg-white/10" />

      {/* Undo/Redo */}
      <ToolbarButton
        onClick={() => actions.history.undo()}
        disabled={!canUndo}
        title="Undo"
      >
        ↩️
      </ToolbarButton>
      <ToolbarButton
        onClick={() => actions.history.redo()}
        disabled={!canRedo}
        title="Redo"
      >
        ↪️
      </ToolbarButton>

      <div className="mx-1 h-6 w-px bg-white/10" />

      {/* Zoom */}
      <div className="flex items-center gap-1">
        <ToolbarButton
          onClick={() => onZoomChange(Math.max(25, zoom - 25))}
          title="Zoom Out"
        >
          ➖
        </ToolbarButton>
        <span className="min-w-[40px] text-center text-xs font-medium text-slate-300">
          {zoom}%
        </span>
        <ToolbarButton
          onClick={() => onZoomChange(Math.min(200, zoom + 25))}
          title="Zoom In"
        >
          ➕
        </ToolbarButton>
      </div>

      <div className="mx-1 h-6 w-px bg-white/10" />

      {/* Actions */}
      <button
        onClick={onPrototype}
        className="flex items-center gap-1.5 rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-purple-500"
      >
        📱 Prototype
      </button>
    </div>
  );
}

function ToolbarButton({
  children,
  onClick,
  title,
  disabled = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={cn(
        "rounded-lg p-1.5 text-sm transition",
        disabled
          ? "cursor-not-allowed opacity-30"
          : "hover:bg-white/10"
      )}
    >
      {children}
    </button>
  );
}
