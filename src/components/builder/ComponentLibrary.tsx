"use client";

import { useState } from "react";
import { useEditor, Element } from "@craftjs/core";
import { cn } from "@/lib/utils";
import {
  CraftButton,
  CraftText,
  CraftHeading,
  CraftInput,
  CraftImage,
  CraftCard,
  CraftNavbar,
  CraftContainer,
  CraftRow,
  CraftDivider,
} from "./CraftNodes";
import {
  CraftToggle,
  CraftCheckbox,
  CraftRadio,
  CraftChip,
  CraftFAB,
  CraftBottomNav,
  CraftTopAppBar,
  CraftProgress,
  CraftBadge,
  CraftListItem,
  CraftSnackbar,
  CraftSlider,
} from "./AndroidNodes";
import IconPackBrowser from "./IconPack";

interface ComponentLibraryProps {
  className?: string;
}

const categories = [
  {
    name: "Layout",
    icon: "📐",
    items: [
      { type: "row", label: "Row", icon: "⬌", element: <Element is={CraftRow} canvas /> },
      { type: "container", label: "Container", icon: "📦", element: <Element is={CraftContainer} canvas /> },
      { type: "card", label: "Card", icon: "🃏", element: <Element is={CraftCard} canvas /> },
    ],
  },
  {
    name: "Mobile UI",
    icon: "📱",
    items: [
      { type: "button", label: "Button", icon: "🔘", element: <CraftButton /> },
      { type: "input", label: "Input", icon: "📝", element: <CraftInput /> },
      { type: "navbar", label: "Navbar", icon: "📊", element: <CraftNavbar /> },
    ],
  },
  {
    name: "Text",
    icon: "✏️",
    items: [
      { type: "heading", label: "Heading", icon: "H", element: <CraftHeading /> },
      { type: "text", label: "Text", icon: "¶", element: <CraftText /> },
    ],
  },
  {
    name: "Media",
    icon: "🖼️",
    items: [
      { type: "image", label: "Image", icon: "🖼️", element: <CraftImage /> },
      { type: "divider", label: "Divider", icon: "➖", element: <CraftDivider /> },
    ],
  },
  {
    name: "Android / Material",
    icon: "🤖",
    items: [
      { type: "toggle", label: "Toggle", icon: "🔀", element: <CraftToggle /> },
      { type: "checkbox", label: "Checkbox", icon: "☑️", element: <CraftCheckbox /> },
      { type: "radio", label: "Radio", icon: "🔘", element: <CraftRadio /> },
      { type: "chip", label: "Chip", icon: "🏷️", element: <CraftChip /> },
      { type: "slider", label: "Slider", icon: "🎚️", element: <CraftSlider /> },
      { type: "fab", label: "FAB", icon: "➕", element: <CraftFAB /> },
      { type: "topappbar", label: "Top App Bar", icon: "📊", element: <CraftTopAppBar /> },
      { type: "bottomnav", label: "Bottom Nav", icon: "📱", element: <CraftBottomNav /> },
      { type: "listitem", label: "List Item", icon: "📋", element: <CraftListItem /> },
      { type: "progress", label: "Progress", icon: "⏳", element: <CraftProgress /> },
      { type: "badge", label: "Badge", icon: "🔴", element: <CraftBadge /> },
      { type: "snackbar", label: "Snackbar", icon: "💬", element: <CraftSnackbar /> },
    ],
  },
];

export default function ComponentLibrary({ className }: ComponentLibraryProps) {
  const { connectors } = useEditor();
  const [search, setSearch] = useState("");
  const [expandedCat, setExpandedCat] = useState<string | null>("Mobile UI");
  const [showIcons, setShowIcons] = useState(false);

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
                  <div
                    key={item.type}
                    ref={(ref) => {
                      if (ref) connectors.create(ref, item.element);
                    }}
                    className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-slate-800/50 p-2 text-xs text-slate-300 transition hover:border-indigo-500/30 hover:bg-indigo-500/10 cursor-grab active:cursor-grabbing"
                  >
                    <span>{item.icon}</span>
                    <span className="truncate">{item.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Icon Pack toggle */}
      <div className="mt-3">
        <button
          onClick={() => setShowIcons(!showIcons)}
          className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs font-bold uppercase tracking-wider text-slate-500 transition hover:bg-white/5 hover:text-slate-300"
        >
          <span>🎨</span>
          <span>Icons</span>
          <span className="ml-auto">{showIcons ? "▾" : "▸"}</span>
        </button>
        {showIcons && <IconPackBrowser className="mt-2" />}
      </div>

      <div className="mt-3 rounded-lg border border-dashed border-white/10 bg-slate-800/20 p-3 text-center text-xs text-slate-600">
        Drag components to canvas
      </div>
    </div>
  );
}
