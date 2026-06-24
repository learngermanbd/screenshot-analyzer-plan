import type { DetectedElement, CraftNode, DesignScreen } from "@/types/analysis";
import { generateId } from "./utils";

export function analysisToCraftNodes(elements: DetectedElement[]): CraftNode[] {
  return elements.map((el) => ({
    id: generateId(),
    type: elementTypeToCraftType(el.type),
    displayName: el.label || el.type,
    props: {
      x: el.bbox.x,
      y: el.bbox.y,
      width: el.bbox.width,
      height: el.bbox.height,
      backgroundColor: el.styles.backgroundColor,
      color: el.styles.textColor,
      fontSize: el.styles.fontSize,
      fontWeight: el.styles.fontWeight,
      borderRadius: el.styles.borderRadius,
      text: el.label,
      padding: el.styles.padding,
      label: el.label,
    },
    children: el.children ? analysisToCraftNodes(el.children) : [],
  }));
}

function elementTypeToCraftType(
  type: DetectedElement["type"]
): string {
  const mapping: Record<string, string> = {
    button: "CraftButton",
    input: "CraftInput",
    text: "CraftText",
    image: "CraftImage",
    icon: "CraftImage",
    card: "CraftCard",
    navbar: "CraftNavbar",
    container: "CraftContainer",
    list: "CraftContainer",
    unknown: "CraftContainer",
  };
  return mapping[type] || "ContainerNode";
}

export function createDefaultScreen(
  name: string,
  width = 390,
  height = 844
): DesignScreen {
  return {
    id: generateId(),
    name,
    width,
    height,
    nodes: [
      {
        id: generateId(),
        type: "CraftContainer",
        displayName: "Root",
        props: { width, height, backgroundColor: "#ffffff" },
        children: [],
      },
    ],
  };
}

export const COMPONENT_TEMPLATES: Record<
  string,
  { type: string; displayName: string; defaultProps: Record<string, unknown> }
> = {
  button_primary: {
    type: "ButtonNode",
    displayName: "Primary Button",
    defaultProps: {
      text: "Button",
      backgroundColor: "#6366f1",
      color: "#ffffff",
      borderRadius: 8,
      fontSize: 16,
      fontWeight: "600",
      width: 200,
      height: 48,
      padding: { top: 12, right: 24, bottom: 12, left: 24 },
    },
  },
  button_secondary: {
    type: "ButtonNode",
    displayName: "Secondary Button",
    defaultProps: {
      text: "Button",
      backgroundColor: "transparent",
      color: "#6366f1",
      borderRadius: 8,
      fontSize: 16,
      fontWeight: "600",
      width: 200,
      height: 48,
      borderWidth: 1,
      borderColor: "#6366f1",
    },
  },
  text_input: {
    type: "InputNode",
    displayName: "Text Input",
    defaultProps: {
      placeholder: "Enter text...",
      width: 300,
      height: 48,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: "#374151",
      backgroundColor: "#1f2937",
      color: "#f3f4f6",
      fontSize: 14,
      padding: { top: 12, right: 16, bottom: 12, left: 16 },
    },
  },
  heading: {
    type: "TextNode",
    displayName: "Heading",
    defaultProps: {
      text: "Heading",
      fontSize: 24,
      fontWeight: "700",
      color: "#ffffff",
      width: 300,
      height: 36,
    },
  },
  body_text: {
    type: "TextNode",
    displayName: "Body Text",
    defaultProps: {
      text: "Body text content goes here.",
      fontSize: 14,
      fontWeight: "400",
      color: "#9ca3af",
      width: 300,
      height: 48,
    },
  },
  card: {
    type: "CardNode",
    displayName: "Card",
    defaultProps: {
      width: 340,
      height: 200,
      backgroundColor: "#1f2937",
      borderRadius: 12,
      padding: { top: 16, right: 16, bottom: 16, left: 16 },
    },
  },
  image_placeholder: {
    type: "ImageNode",
    displayName: "Image",
    defaultProps: {
      width: 300,
      height: 200,
      borderRadius: 8,
      backgroundColor: "#374151",
    },
  },
  navbar: {
    type: "NavbarNode",
    displayName: "Navigation Bar",
    defaultProps: {
      width: 390,
      height: 56,
      backgroundColor: "#111827",
      title: "App Title",
    },
  },
  container: {
    type: "ContainerNode",
    displayName: "Container",
    defaultProps: {
      width: 340,
      height: 100,
      backgroundColor: "transparent",
      borderRadius: 0,
    },
  },
};
