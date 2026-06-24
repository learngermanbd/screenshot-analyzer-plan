"use client";

import { cn } from "@/lib/utils";
import type { DetectedElement } from "@/types/analysis";

interface ElementsListProps {
  elements: DetectedElement[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  className?: string;
}

const typeIcons: Record<string, string> = {
  button: "🔘",
  input: "📝",
  text: "📄",
  image: "🖼️",
  navbar: "📱",
  card: "🃏",
  icon: "⭐",
  list: "📋",
  modal: "💬",
  tab: "📑",
  toggle: "🔀",
  slider: "🎚️",
  dropdown: "▼",
  avatar: "👤",
  badge: "🏷️",
  divider: "➖",
  container: "📦",
};

export default function ElementsList({
  elements,
  selectedId,
  onSelect,
  className,
}: ElementsListProps) {
  return (
    <div className={cn("space-y-1", className)}>
      <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-slate-400">
        Detected Elements ({elements.length})
      </h3>
      <div className="max-h-[300px] space-y-1 overflow-y-auto pr-1">
        {elements.map((el) => (
          <button
            key={el.id}
            onClick={() => onSelect(el.id)}
            className={cn(
              "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition",
              selectedId === el.id
                ? "bg-indigo-500/20 text-indigo-200"
                : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
            )}
          >
            <span>{typeIcons[el.type] || "📦"}</span>
            <span className="truncate font-medium">
              {el.text || el.type}
            </span>
            <span className="ml-auto text-[10px] text-slate-600">
              {Math.round(el.bbox.width)}×{Math.round(el.bbox.height)}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
