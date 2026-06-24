"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface ComponentLibraryProps {
  onAddComponent: (type: string, props: Record<string, unknown>) => void;
  detectedComponents?: { type: string; text?: string; id: string }[];
  className?: string;
}

const categories = [
  {
    name: "Layout",
    icon: "📐",
    items: [
      { type: "row", label: "Row", icon: "⬌" },
      { type: "column", label: "Column", icon: "⬍" },
      { type: "grid", label: "Grid", icon: "⊞" },
      { type: "container", label: "Container", icon: "📦" },
    ],
  },
  {
    name: "Mobile UI",
    icon: "📱",
    items: [
      { type: "button", label: "Button", icon: "🔘" },
      { type: "input", label: "Input", icon: "📝" },
      { type: "card", label: "Card", icon: "🃏" },
      { type: "navbar", label: "Navbar", icon: "📊" },
      { type: "tab-bar", label: "Tab Bar", icon: "📑" },
      { type: "modal", label: "Modal", icon: "💬" },
      { type: "toggle", label: "Toggle", icon: "🔀" },
      { type: "avatar", label: "Avatar", icon: "👤" },
      { type: "badge", label: "Badge", icon: "🏷️" },
      { type: "list-item", label: "List Item", icon: "📋" },
    ],
  },
  {
    name: "Text",
    icon: "✏️",
    items: [
      { type: "heading", label: "Heading", icon: "H" },
      { type: "paragraph", label: "Paragraph", icon: "¶" },
      { type: "label", label: "Label", icon: "🏷️" },
      { type: "caption", label: "Caption", icon: "Aa" },
    ],
  },
  {
    name: "Media",
    icon: "🖼️",
    items: [
      { type: "image", label: "Image", icon: "🖼️" },
      { type: "icon", label: "Icon", icon: "⭐" },
      { type: "divider", label: "Divider", icon: "➖" },
    ],
  },
];

export default function ComponentLibrary({
  onAddComponent,
  detectedComponents = [],
  className,
}: ComponentLibraryProps) {
  const [search, setSearch] = useState("");
  const [expandedCat, setExpandedCat] = useState<string | null>("Mobile UI");

  const filtered = categories
    .map((cat) => ({
      ...cat,
      items: cat.items.filter((item) =>
        item.label.toLowerCase().includes(search.toLowerCase())
      ),
    }))
    .filter((cat) => cat.items.length > 0);

  return (
    <div className={cn("flex flex-col", className)}>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
          Components
        </h3>
      </div>

      <input
        type="text"
        placeholder="Search components..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-3 w-full rounded-lg border border-white/10 bg-slate-800/50 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500/50"
      />

      {/* AI Detected Components */}
      {detectedComponents.length > 0 && (
        <div className="mb-3">
          <button
            onClick={() =>
              setExpandedCat(expandedCat === "detected" ? null : "detected")
            }
            className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs font-bold uppercase tracking-wider text-indigo-400 transition hover:bg-white/5"
          >
            <span>🤖</span>
            <span>From Screenshot ({detectedComponents.length})</span>
            <span className="ml-auto">{expandedCat === "detected" ? "▾" : "▸"}</span>
          </button>
          {expandedCat === "detected" && (
            <div className="mt-1 grid grid-cols-2 gap-1 pl-2">
              {detectedComponents.map((comp) => (
                <button
                  key={comp.id}
                  onClick={() =>
                    onAddComponent(comp.type, { text: comp.text })
                  }
                  className="flex items-center gap-1.5 rounded-lg border border-indigo-500/20 bg-indigo-500/5 p-2 text-xs text-indigo-300 transition hover:bg-indigo-500/15"
                >
                  <span className="truncate">{comp.text || comp.type}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Standard Categories */}
      <div className="flex-1 space-y-1 overflow-y-auto">
        {filtered.map((cat) => (
          <div key={cat.name}>
            <button
              onClick={() =>
                setExpandedCat(expandedCat === cat.name ? null : cat.name)
              }
              className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs font-bold uppercase tracking-wider text-slate-500 transition hover:bg-white/5 hover:text-slate-300"
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
              <span className="ml-auto">
                {expandedCat === cat.name ? "▾" : "▸"}
              </span>
            </button>
            {expandedCat === cat.name && (
              <div className="mt-1 grid grid-cols-2 gap-1 pl-2">
                {cat.items.map((item) => (
                  <button
                    key={item.type}
                    onClick={() => onAddComponent(item.type, {})}
                    className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-slate-800/50 p-2 text-xs text-slate-300 transition hover:border-indigo-500/30 hover:bg-indigo-500/10"
                  >
                    <span>{item.icon}</span>
                    <span className="truncate">{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
