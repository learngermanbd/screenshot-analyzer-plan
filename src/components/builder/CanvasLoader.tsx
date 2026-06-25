"use client";

import { useEffect, useRef, useState } from "react";
import { useEditor } from "@craftjs/core";
import type { DetectedElement } from "@/types/analysis";

const TYPE_MAP: Record<string, string> = {
  button: "CraftButton",
  input: "CraftInput",
  text: "CraftText",
  label: "CraftText",
  heading: "CraftHeading",
  image: "CraftImage",
  icon: "CraftImage",
  card: "CraftCard",
  navbar: "CraftNavbar",
  container: "CraftContainer",
  list: "CraftContainer",
  modal: "CraftCard",
  tab: "CraftContainer",
  toggle: "CraftButton",
  slider: "CraftContainer",
  dropdown: "CraftInput",
  avatar: "CraftImage",
  badge: "CraftText",
  divider: "CraftDivider",
  unknown: "CraftContainer",
};

function buildProps(el: DetectedElement): Record<string, unknown> {
  const text = el.text || el.label || "";
  const bg = el.styles.backgroundColor || "transparent";
  const fg = el.styles.color || el.styles.textColor || "#e2e8f0";
  const fs = el.styles.fontSize ? `${el.styles.fontSize}px` : "14px";
  const fw = el.styles.fontWeight ? String(el.styles.fontWeight) : "400";
  const br = el.styles.borderRadius ? `${el.styles.borderRadius}px` : "0px";

  const resolvedType = TYPE_MAP[el.type] || "CraftContainer";

  switch (resolvedType) {
    case "CraftButton":
      return { text, background: bg !== "transparent" ? bg : "#6366f1", color: fg, fontSize: fs, fontWeight: fw, borderRadius: br, width: "100%", height: "100%", padding: "8px 16px" };
    case "CraftInput":
      return { placeholder: text || "Enter text...", background: bg !== "transparent" ? bg : "#1e293b", color: fg, fontSize: fs, borderRadius: br, width: "100%", height: "100%", padding: "8px 12px", borderColor: el.styles.borderColor || "#334155" };
    case "CraftNavbar":
      return { title: text || "Title", background: bg !== "transparent" ? bg : "#0f172a", color: fg, height: "100%", padding: "0 16px" };
    case "CraftHeading":
      return { text, fontSize: fs, fontWeight: fw, color: fg };
    case "CraftText":
      return { text, fontSize: fs, fontWeight: fw, color: fg, fontFamily: el.styles.fontFamily || "inherit" };
    case "CraftImage":
      return { width: "100%", height: "100%", borderRadius: br, background: bg !== "transparent" ? bg : "#1e293b", alt: text || "Image" };
    case "CraftCard":
      return { background: bg !== "transparent" ? bg : "#1e293b", borderRadius: br, padding: "16px", width: "100%" };
    case "CraftDivider":
      return { color: "#334155", thickness: "1px", margin: "0" };
    case "CraftRow":
      return { gap: "8px", padding: "8px", background: bg !== "transparent" ? bg : "transparent" };
    default:
      return { background: bg !== "transparent" ? bg : "#1e293b", borderRadius: br, width: "100%", minHeight: "40px" };
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildSerializedState(elements: DetectedElement[]): Record<string, any> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nodes: Record<string, any> = {};

  // ROOT node — no parent field, isCanvas: true
  nodes["ROOT"] = {
    type: { resolvedName: "CraftContainer" },
    isCanvas: true,
    props: {
      padding: "0px",
      background: "#0f172a",
      width: "100%",
      minHeight: "844px",
      flexDirection: "column",
      gap: "0px",
    },
    displayName: "Root",
    nodes: elements.map((el) => el.id),
    linkedNodes: {},
    hidden: false,
    custom: {},
  };

  // Map each detected element to a Craft.js serialized node
  elements.forEach((el) => {
    const resolvedName = TYPE_MAP[el.type] || "CraftContainer";
    const props = buildProps(el);

    // Add absolute positioning from the detected bounding box
    props._position = "absolute";
    props._top = `${Math.round(el.bbox.y)}px`;
    props._left = `${Math.round(el.bbox.x)}px`;
    props._width = `${Math.round(el.bbox.width)}px`;
    props._height = `${Math.round(el.bbox.height)}px`;

    nodes[el.id] = {
      type: { resolvedName },
      isCanvas: false,
      props,
      displayName: el.label || el.text || el.type,
      nodes: [],
      linkedNodes: {},
      parent: "ROOT",
      hidden: false,
      custom: {},
    };
  });

  return nodes;
}

export default function CanvasLoader() {
  const { actions } = useEditor();
  const loaded = useRef(false);
  const [isLoading, setIsLoading] = useState(false);
  const [elementCount, setElementCount] = useState(0);

  useEffect(() => {
    if (loaded.current) return;

    const data = sessionStorage.getItem("importedElements");
    if (!data) return;

    loaded.current = true;
    setIsLoading(true);

    try {
      const elements: DetectedElement[] = JSON.parse(data);
      setElementCount(elements.length);

      // Use requestAnimationFrame to let the loading overlay paint first
      requestAnimationFrame(() => {
        try {
          const serializedState = buildSerializedState(elements);
          actions.deserialize(serializedState);
          sessionStorage.removeItem("importedElements");
        } catch (err) {
          console.error("Failed to load imported design:", err);
        } finally {
          // Brief delay so user sees the loading state transition
          setTimeout(() => setIsLoading(false), 200);
        }
      });
    } catch (err) {
      console.error("Failed to parse imported elements:", err);
      sessionStorage.removeItem("importedElements");
      setIsLoading(false);
    }
  }, [actions]);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-slate-900/80 p-8 shadow-2xl">
        {/* Animated spinner */}
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full border-2 border-slate-700" />
          <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-indigo-500" />
        </div>

        <div className="text-center">
          <p className="text-sm font-semibold text-white">Importing design…</p>
          <p className="mt-1 text-xs text-slate-400">
            Loading {elementCount} detected element{elementCount !== 1 ? "s" : ""} into the builder
          </p>
        </div>

        {/* Progress dots animation */}
        <div className="flex gap-1">
          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-500" style={{ animationDelay: "0ms" }} />
          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-500" style={{ animationDelay: "200ms" }} />
          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-500" style={{ animationDelay: "400ms" }} />
        </div>
      </div>
    </div>
  );
}
