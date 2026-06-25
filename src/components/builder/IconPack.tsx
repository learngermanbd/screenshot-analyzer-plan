"use client";

import { useState, useMemo } from "react";
import { useEditor, type UserComponent } from "@craftjs/core";
import { cn } from "@/lib/utils";
import { NodeWrapper } from "./AndroidNodes";

// ─── Icon Definitions ───────────────────────────────────────────────

interface IconDef {
  name: string;
  svg: string;
  tags: string[];
}

// Curated set of the most common Material Design / mobile UI icons as inline SVGs
const ICONS: IconDef[] = [
  // Navigation & Actions
  { name: "home", svg: '<path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>', tags: ["home", "house"] },
  { name: "arrow-back", svg: '<path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>', tags: ["back", "arrow", "navigate"] },
  { name: "arrow-forward", svg: '<path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>', tags: ["forward", "arrow", "next"] },
  { name: "close", svg: '<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>', tags: ["close", "cancel", "x"] },
  { name: "menu", svg: '<path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>', tags: ["menu", "hamburger"] },
  { name: "search", svg: '<path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>', tags: ["search", "find", "magnify"] },
  { name: "more-vert", svg: '<path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>', tags: ["more", "dots", "vertical"] },
  { name: "more-horiz", svg: '<path d="M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>', tags: ["more", "dots", "horizontal"] },
  { name: "settings", svg: '<path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.488.488 0 00-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 00-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6A3.6 3.6 0 1115.6 12 3.6 3.6 0 0112 15.6z"/>', tags: ["settings", "gear", "cog"] },
  { name: "add", svg: '<path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>', tags: ["add", "plus", "new"] },
  { name: "delete", svg: '<path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>', tags: ["delete", "trash", "remove"] },
  { name: "edit", svg: '<path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>', tags: ["edit", "pencil", "write"] },
  { name: "share", svg: '<path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>', tags: ["share", "send"] },
  { name: "favorite", svg: '<path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>', tags: ["favorite", "heart", "like"] },
  { name: "star", svg: '<path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>', tags: ["star", "rating"] },
  { name: "check", svg: '<path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>', tags: ["check", "done", "tick"] },
  { name: "notifications", svg: '<path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>', tags: ["notification", "bell", "alert"] },
  { name: "person", svg: '<path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>', tags: ["person", "user", "account"] },
  { name: "email", svg: '<path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>', tags: ["email", "mail", "message"] },
  { name: "phone", svg: '<path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>', tags: ["phone", "call"] },
  { name: "camera", svg: '<path d="M12 15.2a3.2 3.2 0 100-6.4 3.2 3.2 0 000 6.4z"/><path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/>', tags: ["camera", "photo"] },
  { name: "location", svg: '<path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>', tags: ["location", "map", "pin"] },
  { name: "lock", svg: '<path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>', tags: ["lock", "password", "secure"] },
  { name: "shopping-cart", svg: '<path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>', tags: ["shopping", "cart", "buy"] },
  { name: "download", svg: '<path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>', tags: ["download", "save"] },
  { name: "upload", svg: '<path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z"/>', tags: ["upload", "cloud"] },
  { name: "refresh", svg: '<path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>', tags: ["refresh", "reload", "sync"] },
  { name: "visibility", svg: '<path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>', tags: ["visibility", "eye", "show"] },
  { name: "chat", svg: '<path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>', tags: ["chat", "message", "bubble"] },
  { name: "image", svg: '<path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>', tags: ["image", "photo", "picture"] },
  { name: "mic", svg: '<path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>', tags: ["mic", "microphone", "voice"] },
  { name: "play", svg: '<path d="M8 5v14l11-7z"/>', tags: ["play", "video"] },
  { name: "pause", svg: '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>', tags: ["pause", "stop"] },
  { name: "wifi", svg: '<path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"/>', tags: ["wifi", "wireless"] },
  { name: "battery", svg: '<path d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4z"/>', tags: ["battery", "power"] },
  { name: "calendar", svg: '<path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM9 10H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z"/>', tags: ["calendar", "date", "schedule"] },
  { name: "bookmark", svg: '<path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z"/>', tags: ["bookmark", "save", "mark"] },
];

// ─── Icon Pack Browser Component ────────────────────────────────────

interface IconPackBrowserProps {
  className?: string;
}

export default function IconPackBrowser({ className }: IconPackBrowserProps) {
  const { connectors } = useEditor();
  const [search, setSearch] = useState("");
  const [selectedIcon, setSelectedIcon] = useState<IconDef | null>(null);
  const [iconColor, setIconColor] = useState("#e2e8f0");
  const [iconSize, setIconSize] = useState("24px");

  const filteredIcons = useMemo(() => {
    if (!search) return ICONS;
    const query = search.toLowerCase();
    return ICONS.filter(
      (icon) =>
        icon.name.includes(query) || icon.tags.some((t) => t.includes(query))
    );
  }, [search]);

  return (
    <div className={cn("flex flex-col", className)}>
      <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-slate-400">
        Icon Pack
      </h3>

      <input
        type="text"
        placeholder="Search icons..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-3 w-full rounded-lg border border-white/10 bg-slate-800/50 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500/50"
      />

      {/* Icon size & color controls */}
      <div className="mb-3 flex gap-2">
        <div className="flex-1">
          <label className="text-[10px] text-slate-500">Size</label>
          <select
            value={iconSize}
            onChange={(e) => setIconSize(e.target.value)}
            className="w-full rounded border border-white/10 bg-slate-800/50 px-2 py-1 text-xs text-white outline-none"
          >
            <option value="16px">16px</option>
            <option value="20px">20px</option>
            <option value="24px">24px</option>
            <option value="32px">32px</option>
            <option value="40px">40px</option>
            <option value="48px">48px</option>
          </select>
        </div>
        <div className="flex-1">
          <label className="text-[10px] text-slate-500">Color</label>
          <div className="flex items-center gap-1">
            <input
              type="color"
              value={iconColor}
              onChange={(e) => setIconColor(e.target.value)}
              className="h-6 w-6 cursor-pointer rounded border border-white/10"
            />
            <span className="text-[10px] text-slate-500">{iconColor}</span>
          </div>
        </div>
      </div>

      {/* Icon grid */}
      <div className="grid grid-cols-4 gap-1 overflow-y-auto pr-1" style={{ maxHeight: "300px" }}>
        {filteredIcons.map((icon) => (
          <div
            key={icon.name}
            ref={(ref) => {
              if (ref) {
                connectors.create(
                  ref,
                  <CraftIcon
                    name={icon.name}
                    svg={icon.svg}
                    color={iconColor}
                    size={iconSize}
                  />
                );
              }
            }}
            onClick={() => setSelectedIcon(icon)}
            className={cn(
              "flex flex-col items-center gap-1 rounded-lg border p-2 text-[10px] transition cursor-grab active:cursor-grabbing",
              selectedIcon?.name === icon.name
                ? "border-indigo-500/50 bg-indigo-500/10 text-indigo-300"
                : "border-white/10 text-slate-400 hover:border-white/20 hover:bg-white/5"
            )}
            title={icon.name}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="currentColor"
              dangerouslySetInnerHTML={{ __html: icon.svg }}
            />
            <span className="truncate w-full text-center">{icon.name}</span>
          </div>
        ))}
      </div>

      {filteredIcons.length === 0 && (
        <div className="py-4 text-center text-xs text-slate-600">
          No icons found for &quot;{search}&quot;
        </div>
      )}

      <div className="mt-2 text-[10px] text-slate-600">
        {ICONS.length} Material Icons · Drag to canvas
      </div>
    </div>
  );
}

// ─── Craft Icon Node ────────────────────────────────────────────────

interface IconNodeProps {
  name?: string;
  svg?: string;
  color?: string;
  size?: string;
}

export const CraftIcon: UserComponent<IconNodeProps> = ({
  svg = '<path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>',
  color = "#e2e8f0",
  size = "24px",
}) => {
  return (
    <NodeWrapper>
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: size,
          height: size,
          color,
        }}
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="currentColor"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      </div>
    </NodeWrapper>
  );
};

CraftIcon.craft = {
  props: {
    name: "home",
    svg: '<path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>',
    color: "#e2e8f0",
    size: "24px",
  },
  displayName: "Icon",
};

export { ICONS };
