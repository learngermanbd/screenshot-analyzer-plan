"use client";

import { useEditor } from "@craftjs/core";
import { cn } from "@/lib/utils";

interface AlignmentToolbarProps {
  className?: string;
}

type Alignment =
  | "left"
  | "center-h"
  | "right"
  | "top"
  | "center-v"
  | "bottom";

export default function AlignmentToolbar({ className }: AlignmentToolbarProps) {
  const { actions, selected } = useEditor((state) => ({
    selected: Array.from(state.events.selected),
  }));

  const selectedId = selected[0];

  if (!selectedId || selectedId === "ROOT") return null;

  const alignActions: { icon: string; label: string; align: Alignment }[] = [
    { icon: "⫍", label: "Align Left", align: "left" },
    { icon: "⫏", label: "Center Horizontal", align: "center-h" },
    { icon: "⫎", label: "Align Right", align: "right" },
    { icon: "⫠", label: "Align Top", align: "top" },
    { icon: "⫢", label: "Center Vertical", align: "center-v" },
    { icon: "⫡", label: "Align Bottom", align: "bottom" },
  ];

  const handleAlign = (alignment: Alignment) => {
    actions.setProp(selectedId, (props: Record<string, unknown>) => {
      const isAbs = props._position === "absolute";

      switch (alignment) {
        case "left":
          if (isAbs) props._left = "0px";
          break;
        case "center-h":
          if (isAbs) {
            const w = parseFloat((props._width as string) || "100");
            props._left = `${Math.max(0, (390 - w) / 2)}px`;
          }
          break;
        case "right":
          if (isAbs) {
            const w = parseFloat((props._width as string) || "100");
            props._left = `${Math.max(0, 390 - w)}px`;
          }
          break;
        case "top":
          if (isAbs) props._top = "0px";
          break;
        case "center-v":
          if (isAbs) {
            const h = parseFloat((props._height as string) || "100");
            props._top = `${Math.max(0, (844 - h) / 2)}px`;
          }
          break;
        case "bottom":
          if (isAbs) {
            const h = parseFloat((props._height as string) || "100");
            props._top = `${Math.max(0, 844 - h)}px`;
          }
          break;
      }
    });
  };

  return (
    <div
      className={cn(
        "flex items-center gap-0.5 rounded-lg border border-white/10 bg-slate-800/80 p-0.5",
        className
      )}
    >
      {alignActions.map((a) => (
        <button
          key={a.align}
          onClick={() => handleAlign(a.align)}
          title={a.label}
          className="rounded-md px-2 py-1 text-xs text-slate-400 transition hover:bg-white/10 hover:text-white"
        >
          {a.icon}
        </button>
      ))}
    </div>
  );
}
