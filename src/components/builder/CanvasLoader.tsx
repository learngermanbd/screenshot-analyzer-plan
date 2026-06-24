"use client";

import { useEffect, useRef } from "react";
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

  useEffect(() => {
    if (loaded.current) return;

    const data = sessionStorage.getItem("importedElements");
    if (!data) return;

    loaded.current = true;

    try {
      const elements: DetectedElement[] = JSON.parse(data);
      const serializedState = buildSerializedState(elements);

      actions.deserialize(serializedState);

      sessionStorage.removeItem("importedElements");
    } catch (err) {
      console.error("Failed to load imported design:", err);
    }
  }, [actions]);

  return null;
}
