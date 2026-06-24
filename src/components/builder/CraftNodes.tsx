"use client";

import { useNode, type UserComponent } from "@craftjs/core";
import { cn } from "@/lib/utils";

// ─── Shared wrapper for selection highlight ───────────────────────
function NodeWrapper({
  children,
  className,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const {
    connectors: { connect, drag },
    isSelected,
    props,
  } = useNode((state) => ({
    isSelected: state.events.selected,
    props: state.data.props as Record<string, unknown>,
  }));

  // Support absolute positioning from imported analysis data
  const positionStyle: React.CSSProperties = {};
  if (props._position === "absolute") {
    positionStyle.position = "absolute";
    positionStyle.top = props._top as string;
    positionStyle.left = props._left as string;
    positionStyle.width = props._width as string;
    positionStyle.height = props._height as string;
  }

  return (
    <div
      ref={(ref) => {
        if (ref) connect(drag(ref));
      }}
      className={cn(
        "relative transition-all",
        isSelected && "ring-2 ring-indigo-500 ring-offset-2 ring-offset-slate-900",
        className
      )}
      style={{ ...positionStyle, ...style }}
    >
      {children}
    </div>
  );
}

// ─── Container (Canvas - accepts children) ────────────────────────
interface ContainerProps {
  children?: React.ReactNode;
  padding?: string;
  background?: string;
  borderRadius?: string;
  width?: string;
  minHeight?: string;
  flexDirection?: string;
  alignItems?: string;
  justifyContent?: string;
  gap?: string;
}

export const CraftContainer: UserComponent<ContainerProps> = ({
  children,
  padding = "16px",
  background = "transparent",
  borderRadius = "0px",
  width = "100%",
  minHeight = "50px",
  flexDirection = "column",
  alignItems = "stretch",
  justifyContent = "flex-start",
  gap = "8px",
}) => {
  const { connectors: { connect } } = useNode();

  return (
    <div
      ref={(ref) => { if (ref) connect(ref); }}
      className="min-h-[50px]"
      style={{
        padding,
        background,
        borderRadius,
        width,
        minHeight,
        display: "flex",
        flexDirection: flexDirection as React.CSSProperties["flexDirection"],
        alignItems: alignItems as React.CSSProperties["alignItems"],
        justifyContent: justifyContent as React.CSSProperties["justifyContent"],
        gap,
      }}
    >
      {children}
    </div>
  );
};

CraftContainer.craft = {
  props: {
    padding: "16px",
    background: "transparent",
    borderRadius: "0px",
    width: "100%",
    minHeight: "50px",
    flexDirection: "column",
    alignItems: "stretch",
    justifyContent: "flex-start",
    gap: "8px",
  },
  rules: {
    canMoveIn: () => true,
  },
  displayName: "Container",
};

// ─── Button ───────────────────────────────────────────────────────
interface ButtonProps {
  text?: string;
  background?: string;
  color?: string;
  borderRadius?: string;
  fontSize?: string;
  fontWeight?: string;
  width?: string;
  height?: string;
  padding?: string;
}

export const CraftButton: UserComponent<ButtonProps> = ({
  text = "Button",
  background = "#6366f1",
  color = "#ffffff",
  borderRadius = "8px",
  fontSize = "14px",
  fontWeight = "600",
  width = "auto",
  height = "auto",
  padding = "10px 20px",
}) => {
  return (
    <NodeWrapper>
      <button
        className="inline-flex items-center justify-center transition-colors"
        style={{
          background,
          color,
          borderRadius,
          fontSize,
          fontWeight,
          width,
          height,
          padding,
          border: "none",
          cursor: "pointer",
        }}
      >
        {text}
      </button>
    </NodeWrapper>
  );
};

CraftButton.craft = {
  props: {
    text: "Button",
    background: "#6366f1",
    color: "#ffffff",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    width: "auto",
    height: "auto",
    padding: "10px 20px",
  },
  displayName: "Button",
};

// ─── Text ─────────────────────────────────────────────────────────
interface TextProps {
  text?: string;
  fontSize?: string;
  fontWeight?: string;
  color?: string;
  fontFamily?: string;
  textAlign?: "left" | "center" | "right" | "justify";
  lineHeight?: string;
}

export const CraftText: UserComponent<TextProps> = ({
  text = "Text",
  fontSize = "14px",
  fontWeight = "400",
  color = "#e2e8f0",
  fontFamily = "inherit",
  textAlign = "left",
  lineHeight = "1.5",
}) => {
  return (
    <NodeWrapper>
      <p
        className="m-0"
        style={{ fontSize, fontWeight, color, fontFamily, textAlign, lineHeight }}
      >
        {text}
      </p>
    </NodeWrapper>
  );
};

CraftText.craft = {
  props: {
    text: "Text",
    fontSize: "14px",
    fontWeight: "400",
    color: "#e2e8f0",
    fontFamily: "inherit",
    textAlign: "left",
    lineHeight: "1.5",
  },
  displayName: "Text",
};

// ─── Heading ──────────────────────────────────────────────────────
interface HeadingProps {
  text?: string;
  fontSize?: string;
  fontWeight?: string;
  color?: string;
}

export const CraftHeading: UserComponent<HeadingProps> = ({
  text = "Heading",
  fontSize = "24px",
  fontWeight = "700",
  color = "#ffffff",
}) => {
  return (
    <NodeWrapper>
      <h2 className="m-0" style={{ fontSize, fontWeight, color }}>
        {text}
      </h2>
    </NodeWrapper>
  );
};

CraftHeading.craft = {
  props: {
    text: "Heading",
    fontSize: "24px",
    fontWeight: "700",
    color: "#ffffff",
  },
  displayName: "Heading",
};

// ─── Input ────────────────────────────────────────────────────────
interface InputProps {
  placeholder?: string;
  width?: string;
  height?: string;
  background?: string;
  color?: string;
  borderRadius?: string;
  fontSize?: string;
  padding?: string;
  borderColor?: string;
}

export const CraftInput: UserComponent<InputProps> = ({
  placeholder = "Enter text...",
  width = "100%",
  height = "40px",
  background = "#1e293b",
  color = "#e2e8f0",
  borderRadius = "8px",
  fontSize = "14px",
  padding = "8px 12px",
  borderColor = "#334155",
}) => {
  return (
    <NodeWrapper>
      <input
        type="text"
        placeholder={placeholder}
        className="outline-none"
        style={{
          width,
          height,
          background,
          color,
          borderRadius,
          fontSize,
          padding,
          border: `1px solid ${borderColor}`,
        }}
        readOnly
      />
    </NodeWrapper>
  );
};

CraftInput.craft = {
  props: {
    placeholder: "Enter text...",
    width: "100%",
    height: "40px",
    background: "#1e293b",
    color: "#e2e8f0",
    borderRadius: "8px",
    fontSize: "14px",
    padding: "8px 12px",
    borderColor: "#334155",
  },
  displayName: "Input",
};

// ─── Image ────────────────────────────────────────────────────────
interface ImageProps {
  width?: string;
  height?: string;
  borderRadius?: string;
  background?: string;
  alt?: string;
}

export const CraftImage: UserComponent<ImageProps> = ({
  width = "100%",
  height = "200px",
  borderRadius = "8px",
  background = "#1e293b",
  alt = "Image placeholder",
}) => {
  return (
    <NodeWrapper>
      <div
        className="flex items-center justify-center"
        style={{ width, height, borderRadius, background }}
      >
        <div className="flex flex-col items-center gap-2 text-slate-500">
          <span className="text-3xl">🖼️</span>
          <span className="text-xs">{alt}</span>
        </div>
      </div>
    </NodeWrapper>
  );
};

CraftImage.craft = {
  props: {
    width: "100%",
    height: "200px",
    borderRadius: "8px",
    background: "#1e293b",
    alt: "Image placeholder",
  },
  displayName: "Image",
};

// ─── Card ─────────────────────────────────────────────────────────
interface CardProps {
  children?: React.ReactNode;
  background?: string;
  borderRadius?: string;
  padding?: string;
  width?: string;
  shadow?: string;
}

export const CraftCard: UserComponent<CardProps> = ({
  children,
  background = "#1e293b",
  borderRadius = "12px",
  padding = "16px",
  width = "100%",
  shadow = "0 4px 6px -1px rgba(0,0,0,0.3)",
}) => {
  const { connectors: { connect } } = useNode();

  return (
    <div
      ref={(ref) => { if (ref) connect(ref); }}
      style={{ background, borderRadius, padding, width, boxShadow: shadow }}
    >
      {children}
    </div>
  );
};

CraftCard.craft = {
  props: {
    background: "#1e293b",
    borderRadius: "12px",
    padding: "16px",
    width: "100%",
    shadow: "0 4px 6px -1px rgba(0,0,0,0.3)",
  },
  rules: {
    canMoveIn: () => true,
  },
  displayName: "Card",
};

// ─── Navbar ───────────────────────────────────────────────────────
interface NavbarProps {
  title?: string;
  background?: string;
  color?: string;
  height?: string;
  padding?: string;
}

export const CraftNavbar: UserComponent<NavbarProps> = ({
  title = "App Title",
  background = "#0f172a",
  color = "#ffffff",
  height = "56px",
  padding = "0 16px",
}) => {
  return (
    <NodeWrapper
      style={{
        background,
        color,
        height,
        padding,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
      }}
    >
      <span className="text-xl cursor-pointer">☰</span>
      <span className="font-semibold">{title}</span>
      <span className="text-xl cursor-pointer">⋮</span>
    </NodeWrapper>
  );
};

CraftNavbar.craft = {
  props: {
    title: "App Title",
    background: "#0f172a",
    color: "#ffffff",
    height: "56px",
    padding: "0 16px",
  },
  displayName: "Navbar",
};

// ─── Row (Canvas) ─────────────────────────────────────────────────
interface RowProps {
  children?: React.ReactNode;
  gap?: string;
  padding?: string;
  alignItems?: string;
  justifyContent?: string;
  background?: string;
}

export const CraftRow: UserComponent<RowProps> = ({
  children,
  gap = "8px",
  padding = "8px",
  alignItems = "center",
  justifyContent = "flex-start",
  background = "transparent",
}) => {
  const { connectors: { connect } } = useNode();

  return (
    <div
      ref={(ref) => { if (ref) connect(ref); }}
      className="min-h-[40px]"
      style={{
        display: "flex",
        flexDirection: "row",
        gap,
        padding,
        alignItems,
        justifyContent,
        background,
        width: "100%",
      }}
    >
      {children}
    </div>
  );
};

CraftRow.craft = {
  props: {
    gap: "8px",
    padding: "8px",
    alignItems: "center",
    justifyContent: "flex-start",
    background: "transparent",
  },
  rules: {
    canMoveIn: () => true,
  },
  displayName: "Row",
};

// ─── Divider ──────────────────────────────────────────────────────
interface DividerProps {
  color?: string;
  thickness?: string;
  margin?: string;
}

export const CraftDivider: UserComponent<DividerProps> = ({
  color = "#334155",
  thickness = "1px",
  margin = "8px 0",
}) => {
  return (
    <NodeWrapper>
      <hr
        className="border-0"
        style={{
          borderTop: `${thickness} solid ${color}`,
          margin,
          width: "100%",
        }}
      />
    </NodeWrapper>
  );
};

CraftDivider.craft = {
  props: {
    color: "#334155",
    thickness: "1px",
    margin: "8px 0",
  },
  displayName: "Divider",
};

// ─── Map of all nodes (for Editor resolver) ───────────────────────
export const CraftNodeMap = {
  CraftContainer,
  CraftButton,
  CraftText,
  CraftHeading,
  CraftInput,
  CraftImage,
  CraftCard,
  CraftNavbar,
  CraftRow,
  CraftDivider,
};
