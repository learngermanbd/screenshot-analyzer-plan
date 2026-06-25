"use client";

import { useRef, useState } from "react";
import { useNode, useEditor, type UserComponent } from "@craftjs/core";
import ContextMenu from "./ContextMenu";
import { cn } from "@/lib/utils";

// ─── Resize Handles (same pattern as CraftNodes.tsx) ──────────────
const HANDLES = ["nw", "n", "ne", "e", "se", "s", "sw", "w"] as const;
type HandleDirection = (typeof HANDLES)[number];

function ResizeHandles({
  domRef,
}: {
  domRef: React.RefObject<HTMLDivElement | null>;
}) {
  const { id, props } = useNode((state) => ({
    props: state.data.props as Record<string, unknown>,
  }));
  const { actions } = useEditor();

  const handleMouseDown = (e: React.MouseEvent, direction: HandleDirection) => {
    e.stopPropagation();
    e.preventDefault();
    if (!domRef.current) return;

    const startX = e.clientX;
    const startY = e.clientY;
    const startRect = domRef.current.getBoundingClientRect();
    const startTop = parseFloat((props._top as string) || "0");
    const startLeft = parseFloat((props._left as string) || "0");

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      actions.setProp(id, (p: Record<string, unknown>) => {
        const isAbs = p._position === "absolute";
        let newWidth = startRect.width;
        let newHeight = startRect.height;
        let newTop = startTop;
        let newLeft = startLeft;

        if (direction.includes("e")) newWidth += deltaX;
        if (direction.includes("s")) newHeight += deltaY;
        if (direction.includes("w")) { newWidth -= deltaX; newLeft += deltaX; }
        if (direction.includes("n")) { newHeight -= deltaY; newTop += deltaY; }

        newWidth = Math.max(15, newWidth);
        newHeight = Math.max(15, newHeight);

        if (isAbs) {
          p._width = `${Math.round(newWidth)}px`;
          p._height = `${Math.round(newHeight)}px`;
          if (direction.includes("n")) p._top = `${Math.round(newTop)}px`;
          if (direction.includes("w")) p._left = `${Math.round(newLeft)}px`;
        } else {
          p.width = `${Math.round(newWidth)}px`;
          p.height = `${Math.round(newHeight)}px`;
        }
      });
    };

    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  const getHandleStyle = (dir: HandleDirection): React.CSSProperties => {
    const size = 8;
    const offset = size / 2;
    const base: React.CSSProperties = {
      position: "absolute",
      width: size,
      height: size,
      backgroundColor: "#6366f1",
      border: "1.5px solid white",
      borderRadius: "2px",
      zIndex: 100,
    };
    if (dir.includes("n")) base.top = -offset;
    else if (dir.includes("s")) base.bottom = -offset;
    else { base.top = "50%"; base.transform = "translateY(-50%)"; }
    if (dir.includes("w")) base.left = -offset;
    else if (dir.includes("e")) base.right = -offset;
    else if (!dir.includes("n") && !dir.includes("s")) { base.left = "50%"; base.transform = "translateX(-50%)"; }
    if (dir === "n" || dir === "s") { base.left = "50%"; base.transform = "translateX(-50%)"; }
    if (dir === "e" || dir === "w") { base.top = "50%"; base.transform = "translateY(-50%)"; }
    const cursorMap: Record<HandleDirection, string> = { nw: "nw-resize", n: "n-resize", ne: "ne-resize", e: "e-resize", se: "se-resize", s: "s-resize", sw: "sw-resize", w: "w-resize" };
    base.cursor = cursorMap[dir];
    return base;
  };

  return (<>{HANDLES.map((dir) => (<div key={dir} style={getHandleStyle(dir)} onMouseDown={(e) => handleMouseDown(e, dir)} />))}</>);
}

// ─── Shared NodeWrapper with selection, resize, context menu ───────
export function NodeWrapper({
  children,
  className,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const domRef = useRef<HTMLDivElement>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const {
    id,
    connectors: { connect, drag },
    isSelected,
    props,
  } = useNode((state) => ({
    isSelected: state.events.selected,
    props: state.data.props as Record<string, unknown>,
  }));

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const positionStyle: React.CSSProperties = {};
  if (props._position === "absolute") {
    positionStyle.position = "absolute";
    positionStyle.top = props._top as string;
    positionStyle.left = props._left as string;
    positionStyle.width = props._width as string;
    positionStyle.height = props._height as string;
  }
  if (props._zIndex !== undefined) {
    positionStyle.zIndex = Number(props._zIndex);
  }
  if (props._hidden) {
    positionStyle.display = "none";
  }

  return (
    <div
      ref={(ref) => {
        domRef.current = ref;
        if (ref) connect(drag(ref));
      }}
      className={cn(
        "relative transition-all",
        isSelected && "ring-2 ring-indigo-500 ring-offset-2 ring-offset-slate-900",
        className
      )}
      style={{ ...positionStyle, ...style }}
      onContextMenu={handleContextMenu}
    >
      {children}
      {isSelected && <ResizeHandles domRef={domRef} />}
      {contextMenu && (
        <ContextMenu
          nodeId={id}
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
}

// ─── Material Toggle / Switch ───────────────────────────────────────
interface ToggleProps {
  checked?: boolean;
  activeColor?: string;
  inactiveColor?: string;
  thumbColor?: string;
  width?: string;
  height?: string;
  label?: string;
  labelColor?: string;
}

export const CraftToggle: UserComponent<ToggleProps> = ({
  checked = false,
  activeColor = "#6750a4",
  inactiveColor = "#49454f",
  thumbColor = "#ffffff",
  width = "52px",
  height = "32px",
  label = "Wi-Fi",
  labelColor = "#e2e8f0",
}) => {
  return (
    <NodeWrapper>
      <div className="flex items-center gap-3">
        <div
          style={{
            width,
            height,
            borderRadius: "16px",
            background: checked ? activeColor : inactiveColor,
            position: "relative",
            cursor: "pointer",
            transition: "background 0.2s",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "4px",
              left: checked ? "calc(100% - 24px - 4px)" : "4px",
              width: "24px",
              height: "24px",
              borderRadius: "50%",
              background: thumbColor,
              transition: "left 0.2s",
              boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
            }}
          />
        </div>
        <span style={{ fontSize: "14px", color: labelColor, fontWeight: "400" }}>
          {label}
        </span>
      </div>
    </NodeWrapper>
  );
};

CraftToggle.craft = {
  props: {
    checked: false,
    activeColor: "#6750a4",
    inactiveColor: "#49454f",
    thumbColor: "#ffffff",
    width: "52px",
    height: "32px",
    label: "Wi-Fi",
    labelColor: "#e2e8f0",
  },
  displayName: "Toggle",
};

// ─── Material Checkbox ──────────────────────────────────────────────
interface CheckboxProps {
  checked?: boolean;
  checkedColor?: string;
  uncheckedBorderColor?: string;
  checkmarkColor?: string;
  size?: string;
  label?: string;
  labelColor?: string;
}

export const CraftCheckbox: UserComponent<CheckboxProps> = ({
  checked = false,
  checkedColor = "#6750a4",
  uncheckedBorderColor = "#79747e",
  checkmarkColor = "#ffffff",
  size = "24px",
  label = "Accept terms",
  labelColor = "#e2e8f0",
}) => {
  return (
    <NodeWrapper>
      <div className="flex items-center gap-3">
        <div
          style={{
            width: size,
            height: size,
            borderRadius: "4px",
            background: checked ? checkedColor : "transparent",
            border: checked ? "none" : `2px solid ${uncheckedBorderColor}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          {checked && (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6.5 10.8L3.7 8L2.8 8.9L6.5 12.6L13.6 5.5L12.7 4.6L6.5 10.8Z" fill={checkmarkColor} />
            </svg>
          )}
        </div>
        <span style={{ fontSize: "14px", color: labelColor }}>{label}</span>
      </div>
    </NodeWrapper>
  );
};

CraftCheckbox.craft = {
  props: {
    checked: false,
    checkedColor: "#6750a4",
    uncheckedBorderColor: "#79747e",
    checkmarkColor: "#ffffff",
    size: "24px",
    label: "Accept terms",
    labelColor: "#e2e8f0",
  },
  displayName: "Checkbox",
};

// ─── Material Radio Button ──────────────────────────────────────────
interface RadioProps {
  selected?: boolean;
  selectedColor?: string;
  unselectedBorderColor?: string;
  dotColor?: string;
  size?: string;
  label?: string;
  labelColor?: string;
}

export const CraftRadio: UserComponent<RadioProps> = ({
  selected = false,
  selectedColor = "#6750a4",
  unselectedBorderColor = "#79747e",
  dotColor = "#ffffff",
  size = "24px",
  label = "Option A",
  labelColor = "#e2e8f0",
}) => {
  return (
    <NodeWrapper>
      <div className="flex items-center gap-3">
        <div
          style={{
            width: size,
            height: size,
            borderRadius: "50%",
            background: selected ? selectedColor : "transparent",
            border: selected ? "none" : `2px solid ${unselectedBorderColor}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          {selected && (
            <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: dotColor }} />
          )}
        </div>
        <span style={{ fontSize: "14px", color: labelColor }}>{label}</span>
      </div>
    </NodeWrapper>
  );
};

CraftRadio.craft = {
  props: {
    selected: false,
    selectedColor: "#6750a4",
    unselectedBorderColor: "#79747e",
    dotColor: "#ffffff",
    size: "24px",
    label: "Option A",
    labelColor: "#e2e8f0",
  },
  displayName: "Radio",
};

// ─── Material Chip ──────────────────────────────────────────────────
interface ChipProps {
  label?: string;
  variant?: "filled" | "outlined";
  background?: string;
  color?: string;
  borderColor?: string;
  borderRadius?: string;
  fontSize?: string;
  padding?: string;
  icon?: string;
  selected?: boolean;
  selectedBackground?: string;
}

export const CraftChip: UserComponent<ChipProps> = ({
  label = "Chip",
  variant = "filled",
  background = "#2b2930",
  color = "#e2e8f0",
  borderColor = "#79747e",
  borderRadius = "8px",
  fontSize = "14px",
  padding = "6px 16px",
  icon = "",
  selected = false,
  selectedBackground = "#6750a4",
}) => {
  const isOutlined = variant === "outlined";
  return (
    <NodeWrapper>
      <div
        className="inline-flex items-center gap-1.5"
        style={{
          background: selected ? selectedBackground : isOutlined ? "transparent" : background,
          color,
          border: isOutlined ? `1px solid ${selected ? selectedBackground : borderColor}` : "none",
          borderRadius,
          fontSize,
          padding,
          cursor: "pointer",
          height: "32px",
        }}
      >
        {icon && <span style={{ fontSize: "16px" }}>{icon}</span>}
        <span>{label}</span>
      </div>
    </NodeWrapper>
  );
};

CraftChip.craft = {
  props: {
    label: "Chip",
    variant: "filled",
    background: "#2b2930",
    color: "#e2e8f0",
    borderColor: "#79747e",
    borderRadius: "8px",
    fontSize: "14px",
    padding: "6px 16px",
    icon: "",
    selected: false,
    selectedBackground: "#6750a4",
  },
  displayName: "Chip",
};

// ─── Material FAB (Floating Action Button) ──────────────────────────
interface FABProps {
  icon?: string;
  size?: string;
  background?: string;
  color?: string;
  borderRadius?: string;
  shadow?: string;
  label?: string;
  extended?: boolean;
}

export const CraftFAB: UserComponent<FABProps> = ({
  icon = "\uff0b",
  size = "56px",
  background = "#6750a4",
  color = "#ffffff",
  borderRadius = "16px",
  shadow = "0 6px 10px rgba(0,0,0,0.3)",
  label = "Create",
  extended = false,
}) => {
  return (
    <NodeWrapper>
      <div
        className="inline-flex items-center justify-center"
        style={{
          width: extended ? "auto" : size,
          height: size,
          background,
          color,
          borderRadius,
          boxShadow: shadow,
          cursor: "pointer",
          padding: extended ? "0 20px" : "0",
          gap: "8px",
          fontSize: "24px",
        }}
      >
        <span>{icon}</span>
        {extended && (
          <span style={{ fontSize: "14px", fontWeight: "600" }}>{label}</span>
        )}
      </div>
    </NodeWrapper>
  );
};

CraftFAB.craft = {
  props: {
    icon: "\uff0b",
    size: "56px",
    background: "#6750a4",
    color: "#ffffff",
    borderRadius: "16px",
    shadow: "0 6px 10px rgba(0,0,0,0.3)",
    label: "Create",
    extended: false,
  },
  displayName: "FAB",
};

// ─── Material Bottom Navigation Bar ─────────────────────────────────
interface BottomNavItem {
  icon: string;
  label: string;
}

interface BottomNavProps {
  items?: string;
  activeIndex?: number;
  activeColor?: string;
  inactiveColor?: string;
  background?: string;
  height?: string;
}

export const CraftBottomNav: UserComponent<BottomNavProps> = ({
  items = '[{"icon":"\ud83c\udfe0","label":"Home"},{"icon":"\ud83d\udd0d","label":"Search"},{"icon":"\ud83d\udd14","label":"Alerts"},{"icon":"\ud83d\udc64","label":"Profile"}]',
  activeIndex = 0,
  activeColor = "#6750a4",
  inactiveColor = "#79747e",
  background = "#1c1b1f",
  height = "80px",
}) => {
  let parsed: BottomNavItem[] = [];
  try {
    parsed = JSON.parse(items);
  } catch {
    parsed = [
      { icon: "\ud83c\udfe0", label: "Home" },
      { icon: "\ud83d\udd0d", label: "Search" },
      { icon: "\ud83d\udd14", label: "Alerts" },
      { icon: "\ud83d\udc64", label: "Profile" },
    ];
  }

  return (
    <NodeWrapper>
      <div
        className="flex items-center justify-around"
        style={{
          width: "100%",
          height,
          background,
          borderTop: "1px solid #334155",
        }}
      >
        {parsed.map((item, i) => (
          <div
            key={i}
            className="flex flex-col items-center gap-1"
            style={{ cursor: "pointer" }}
          >
            <span style={{ fontSize: "22px" }}>{item.icon}</span>
            <span
              style={{
                fontSize: "11px",
                fontWeight: i === activeIndex ? "600" : "400",
                color: i === activeIndex ? activeColor : inactiveColor,
              }}
            >
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </NodeWrapper>
  );
};

CraftBottomNav.craft = {
  props: {
    items: '[{"icon":"\ud83c\udfe0","label":"Home"},{"icon":"\ud83d\udd0d","label":"Search"},{"icon":"\ud83d\udd14","label":"Alerts"},{"icon":"\ud83d\udc64","label":"Profile"}]',
    activeIndex: 0,
    activeColor: "#6750a4",
    inactiveColor: "#79747e",
    background: "#1c1b1f",
    height: "80px",
  },
  displayName: "BottomNav",
};

// ─── Material Top App Bar ───────────────────────────────────────────
interface TopAppBarProps {
  title?: string;
  background?: string;
  color?: string;
  height?: string;
  padding?: string;
  showBack?: boolean;
  showAction?: boolean;
  actionIcon?: string;
}

export const CraftTopAppBar: UserComponent<TopAppBarProps> = ({
  title = "Screen Title",
  background = "#1c1b1f",
  color = "#e2e8f0",
  height = "64px",
  padding = "0 4px",
  showBack = true,
  showAction = true,
  actionIcon = "\u22ee",
}) => {
  return (
    <NodeWrapper>
      <div
        className="flex items-center"
        style={{
          width: "100%",
          height,
          background,
          color,
          padding,
          gap: "4px",
        }}
      >
        {showBack && (
          <span
            className="flex items-center justify-center"
            style={{ width: "48px", height: "48px", fontSize: "20px", cursor: "pointer" }}
          >
            \u2190
          </span>
        )}
        <span
          className="flex-1"
          style={{
            fontSize: "22px",
            fontWeight: "400",
            paddingLeft: showBack ? "0" : "16px",
          }}
        >
          {title}
        </span>
        {showAction && (
          <span
            className="flex items-center justify-center"
            style={{ width: "48px", height: "48px", fontSize: "20px", cursor: "pointer" }}
          >
            {actionIcon}
          </span>
        )}
      </div>
    </NodeWrapper>
  );
};

CraftTopAppBar.craft = {
  props: {
    title: "Screen Title",
    background: "#1c1b1f",
    color: "#e2e8f0",
    height: "64px",
    padding: "0 4px",
    showBack: true,
    showAction: true,
    actionIcon: "\u22ee",
  },
  displayName: "TopAppBar",
};

// ─── Material Progress Indicator ────────────────────────────────────
interface ProgressProps {
  variant?: "linear" | "circular";
  value?: number;
  color?: string;
  trackColor?: string;
  width?: string;
  height?: string;
  indeterminate?: boolean;
}

export const CraftProgress: UserComponent<ProgressProps> = ({
  variant = "linear",
  value = 60,
  color = "#6750a4",
  trackColor = "#334155",
  width = "100%",
  height = "4px",
  indeterminate = false,
}) => {
  if (variant === "circular") {
    const radius = 18;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (value / 100) * circumference;
    return (
      <NodeWrapper>
        <div className="flex items-center justify-center" style={{ width: "48px", height: "48px" }}>
          <svg width="48" height="48" viewBox="0 0 48 48">
            <circle cx="24" cy="24" r={radius} fill="none" stroke={trackColor} strokeWidth="4" />
            <circle
              cx="24" cy="24" r={radius} fill="none" stroke={color} strokeWidth="4"
              strokeDasharray={circumference}
              strokeDashoffset={indeterminate ? circumference * 0.75 : offset}
              strokeLinecap="round" transform="rotate(-90 24 24)"
            />
          </svg>
        </div>
      </NodeWrapper>
    );
  }

  return (
    <NodeWrapper>
      <div style={{ width, height, background: trackColor, borderRadius: "2px", overflow: "hidden" }}>
        <div
          style={{
            width: indeterminate ? "40%" : `${value}%`,
            height: "100%",
            background: color,
            borderRadius: "2px",
          }}
        />
      </div>
    </NodeWrapper>
  );
};

CraftProgress.craft = {
  props: {
    variant: "linear",
    value: 60,
    color: "#6750a4",
    trackColor: "#334155",
    width: "100%",
    height: "4px",
    indeterminate: false,
  },
  displayName: "Progress",
};

// ─── Material Badge ─────────────────────────────────────────────────
interface BadgeProps {
  count?: number;
  showZero?: boolean;
  background?: string;
  color?: string;
  size?: string;
  fontSize?: string;
  children?: React.ReactNode;
}

export const CraftBadge: UserComponent<BadgeProps> = ({
  count = 3,
  showZero = false,
  background = "#b3261e",
  color = "#ffffff",
  size = "18px",
  fontSize = "11px",
  children,
}) => {
  const show = count > 0 || showZero;
  return (
    <NodeWrapper>
      <div className="relative inline-flex">
        {children || (
          <div
            style={{
              width: "40px", height: "40px", borderRadius: "50%",
              background: "#334155", display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: "20px",
            }}
          >
            \ud83d\udd14
          </div>
        )}
        {show && (
          <div
            className="absolute flex items-center justify-center"
            style={{
              top: "-4px", right: "-4px", minWidth: size, height: size,
              borderRadius: "9px", background, color, fontSize,
              fontWeight: "600", padding: "0 4px",
            }}
          >
            {count > 99 ? "99+" : count}
          </div>
        )}
      </div>
    </NodeWrapper>
  );
};

CraftBadge.craft = {
  props: {
    count: 3, showZero: false, background: "#b3261e",
    color: "#ffffff", size: "18px", fontSize: "11px",
  },
  displayName: "Badge",
};

// ─── Material List Item ─────────────────────────────────────────────
interface ListItemProps {
  title?: string;
  subtitle?: string;
  leadingIcon?: string;
  trailingText?: string;
  background?: string;
  titleColor?: string;
  subtitleColor?: string;
  height?: string;
  padding?: string;
  showDivider?: boolean;
  dividerColor?: string;
}

export const CraftListItem: UserComponent<ListItemProps> = ({
  title = "List Item",
  subtitle = "Description text",
  leadingIcon = "\ud83d\udcc1",
  trailingText = "",
  background = "transparent",
  titleColor = "#e2e8f0",
  subtitleColor = "#94a3b8",
  height = "72px",
  padding = "8px 16px",
  showDivider = true,
  dividerColor = "#334155",
}) => {
  return (
    <NodeWrapper>
      <div>
        <div className="flex items-center gap-4" style={{ background, height, padding, cursor: "pointer" }}>
          <span style={{ fontSize: "24px", width: "40px", textAlign: "center" }}>{leadingIcon}</span>
          <div className="flex flex-1 flex-col">
            <span style={{ fontSize: "16px", fontWeight: "400", color: titleColor }}>{title}</span>
            {subtitle && (
              <span style={{ fontSize: "14px", color: subtitleColor, marginTop: "2px" }}>{subtitle}</span>
            )}
          </div>
          {trailingText && (
            <span style={{ fontSize: "12px", color: subtitleColor }}>{trailingText}</span>
          )}
        </div>
        {showDivider && (
          <hr style={{ border: "none", borderTop: `1px solid ${dividerColor}`, margin: "0 16px" }} />
        )}
      </div>
    </NodeWrapper>
  );
};

CraftListItem.craft = {
  props: {
    title: "List Item", subtitle: "Description text", leadingIcon: "\ud83d\udcc1",
    trailingText: "", background: "transparent", titleColor: "#e2e8f0",
    subtitleColor: "#94a3b8", height: "72px", padding: "8px 16px",
    showDivider: true, dividerColor: "#334155",
  },
  displayName: "ListItem",
};

// ─── Material Snackbar ──────────────────────────────────────────────
interface SnackbarProps {
  message?: string;
  actionText?: string;
  background?: string;
  color?: string;
  actionColor?: string;
  borderRadius?: string;
  padding?: string;
}

export const CraftSnackbar: UserComponent<SnackbarProps> = ({
  message = "Item deleted",
  actionText = "UNDO",
  background = "#322f35",
  color = "#e2e8f0",
  actionColor = "#d0bcff",
  borderRadius = "4px",
  padding = "14px 16px",
}) => {
  return (
    <NodeWrapper>
      <div
        className="flex items-center justify-between gap-4"
        style={{
          background, color, borderRadius, padding,
          minWidth: "280px", maxWidth: "390px",
          boxShadow: "0 3px 5px rgba(0,0,0,0.2)",
        }}
      >
        <span style={{ fontSize: "14px" }}>{message}</span>
        <span style={{ fontSize: "14px", fontWeight: "600", color: actionColor, cursor: "pointer", flexShrink: 0 }}>
          {actionText}
        </span>
      </div>
    </NodeWrapper>
  );
};

CraftSnackbar.craft = {
  props: {
    message: "Item deleted", actionText: "UNDO", background: "#322f35",
    color: "#e2e8f0", actionColor: "#d0bcff", borderRadius: "4px", padding: "14px 16px",
  },
  displayName: "Snackbar",
};

// ─── Material Slider ────────────────────────────────────────────────
interface SliderProps {
  value?: number;
  min?: number;
  max?: number;
  color?: string;
  trackColor?: string;
  thumbColor?: string;
  width?: string;
  height?: string;
  label?: string;
  labelColor?: string;
}

export const CraftSlider: UserComponent<SliderProps> = ({
  value = 50,
  min = 0,
  max = 100,
  color = "#6750a4",
  trackColor = "#49454f",
  thumbColor = "#6750a4",
  width = "100%",
  height = "4px",
  label = "Volume",
  labelColor = "#e2e8f0",
}) => {
  const percentage = ((value - min) / (max - min)) * 100;
  return (
    <NodeWrapper>
      <div className="flex flex-col gap-2" style={{ width }}>
        {label && (
          <div className="flex items-center justify-between">
            <span style={{ fontSize: "14px", color: labelColor }}>{label}</span>
            <span style={{ fontSize: "14px", color: labelColor }}>{value}</span>
          </div>
        )}
        <div className="relative" style={{ height: "40px" }}>
          <div style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", width: "100%", height, background: trackColor, borderRadius: "2px" }} />
          <div style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", width: `${percentage}%`, height, background: color, borderRadius: "2px" }} />
          <div style={{ position: "absolute", top: "50%", left: `${percentage}%`, transform: "translate(-50%, -50%)", width: "20px", height: "20px", borderRadius: "50%", background: thumbColor, boxShadow: "0 1px 3px rgba(0,0,0,0.3)" }} />
        </div>
      </div>
    </NodeWrapper>
  );
};

CraftSlider.craft = {
  props: {
    value: 50, min: 0, max: 100, color: "#6750a4", trackColor: "#49454f",
    thumbColor: "#6750a4", width: "100%", height: "4px", label: "Volume", labelColor: "#e2e8f0",
  },
  displayName: "Slider",
};

// ─── Map of all Android nodes ───────────────────────────────────────
export const AndroidNodeMap = {
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
};
