"use client";

import { cn } from "@/lib/utils";

export interface Screen {
  id: string;
  name: string;
  thumbnail?: string;
}

interface ScreenManagerProps {
  screens: Screen[];
  activeId: string;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
  onRename: (id: string, name: string) => void;
  className?: string;
}

export default function ScreenManager({
  screens,
  activeId,
  onSelect,
  onAdd,
  onRemove,
  className,
}: ScreenManagerProps) {
  return (
    <div className={cn("flex items-center gap-2 overflow-x-auto", className)}>
      {screens.map((screen) => (
        <div
          key={screen.id}
          className={cn(
            "group flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-sm transition cursor-pointer",
            screen.id === activeId
              ? "border-indigo-500/50 bg-indigo-500/10 text-indigo-300"
              : "border-white/10 text-slate-400 hover:border-white/20 hover:bg-white/5"
          )}
          onClick={() => onSelect(screen.id)}
        >
          <span className="text-xs">📱</span>
          <span className="font-medium">{screen.name}</span>
          {screens.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(screen.id);
              }}
              className="ml-1 text-xs text-slate-600 opacity-0 transition group-hover:opacity-100 hover:text-red-400"
            >
              ✕
            </button>
          )}
        </div>
      ))}
      <button
        onClick={onAdd}
        className="shrink-0 rounded-lg border border-dashed border-white/20 px-3 py-2 text-sm text-slate-500 transition hover:border-white/40 hover:text-white"
      >
        + Add Screen
      </button>
    </div>
  );
}
