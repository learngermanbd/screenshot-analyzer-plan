"use client";

import { useEditor } from "@craftjs/core";
import { cn } from "@/lib/utils";

interface BuilderToolbarProps {
  mode: "freeform" | "grid";
  onModeChange: (mode: "freeform" | "grid") => void;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  canvasWidth?: number;
  canvasHeight?: number;
  onPrototype: () => void;
  className?: string;
}

export default function BuilderToolbar({
  mode,
  onModeChange,
  zoom,
  onZoomChange,
  canvasWidth = 390,
  canvasHeight = 844,
  onPrototype,
  className,
}: BuilderToolbarProps) {
  const { actions, canUndo, canRedo, selected } = useEditor((state, query) => ({
    canUndo: query.history.canUndo(),
    canRedo: query.history.canRedo(),
    selected: Array.from(state.events.selected),
  }));

  const selectedId = selected[0];

  const handleDelete = () => {
    if (selectedId && selectedId !== "ROOT") {
      actions.delete(selectedId);
    }
  };

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-1 rounded-xl border border-white/10 bg-slate-800/80 p-1 backdrop-blur-sm",
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
        title="Undo (Ctrl+Z)"
      >
        ↩️
      </ToolbarButton>
      <ToolbarButton
        onClick={() => actions.history.redo()}
        disabled={!canRedo}
        title="Redo (Ctrl+Y)"
      >
        ↪️
      </ToolbarButton>

      <div className="mx-1 h-6 w-px bg-white/10" />

      {/* Element Actions */}
      <ToolbarButton
        onClick={handleDelete}
        disabled={!selectedId || selectedId === "ROOT"}
        title="Delete (Del)"
      >
        🗑️
      </ToolbarButton>

      <div className="mx-1 h-6 w-px bg-white/10" />

      {/* Alignment (only when element selected) */}
      {selectedId && selectedId !== "ROOT" && (
        <>
          <AlignmentButton
            onClick={() => {
              actions.setProp(selectedId, (p: Record<string, unknown>) => {
                if (p._position === "absolute") p._left = "0px";
              });
            }}
            title="Align Left"
          >
            ⫍
          </AlignmentButton>
          <AlignmentButton
            onClick={() => {
              actions.setProp(selectedId, (p: Record<string, unknown>) => {
                if (p._position === "absolute") {
                  const w = parseFloat((p._width as string) || "100");
                  p._left = `${Math.round((canvasWidth - w) / 2)}px`;
                }
              });
            }}
            title="Center Horizontally"
          >
            ⊞
          </AlignmentButton>
          <AlignmentButton
            onClick={() => {
              actions.setProp(selectedId, (p: Record<string, unknown>) => {
                if (p._position === "absolute") {
                  const w = parseFloat((p._width as string) || "100");
                  p._left = `${Math.round(canvasWidth - w)}px`;
                }
              });
            }}
            title="Align Right"
          >
            ⫎
          </AlignmentButton>
          <AlignmentButton
            onClick={() => {
              actions.setProp(selectedId, (p: Record<string, unknown>) => {
                if (p._position === "absolute") p._top = "0px";
              });
            }}
            title="Align Top"
          >
            ⫠
          </AlignmentButton>
          <AlignmentButton
            onClick={() => {
              actions.setProp(selectedId, (p: Record<string, unknown>) => {
                if (p._position === "absolute") {
                  const h = parseFloat((p._height as string) || "100");
                  p._top = `${Math.round((canvasHeight - h) / 2)}px`;
                }
              });
            }}
            title="Center Vertically"
          >
            ⊟
          </AlignmentButton>
          <AlignmentButton
            onClick={() => {
              actions.setProp(selectedId, (p: Record<string, unknown>) => {
                if (p._position === "absolute") {
                  const h = parseFloat((p._height as string) || "100");
                  p._top = `${Math.round(canvasHeight - h)}px`;
                }
              });
            }}
            title="Align Bottom"
          >
            ⫡
          </AlignmentButton>

          <div className="mx-1 h-6 w-px bg-white/10" />
        </>
      )}

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

function AlignmentButton({
  children,
  onClick,
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="rounded-md px-1.5 py-1 text-xs text-slate-400 transition hover:bg-white/10 hover:text-white"
    >
      {children}
    </button>
  );
}
