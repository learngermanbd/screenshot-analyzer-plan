"use client";

import { cn } from "@/lib/utils";
import type { ColorInfo } from "@/types/analysis";

interface ColorPaletteProps {
  colors: ColorInfo[];
  className?: string;
}

export default function ColorPalette({ colors, className }: ColorPaletteProps) {
  const copyToClipboard = (hex: string) => {
    navigator.clipboard.writeText(hex);
  };

  return (
    <div className={cn("space-y-3", className)}>
      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
        Color Palette
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {colors.map((color, i) => (
          <button
            key={i}
            onClick={() => copyToClipboard(color.hex)}
            className="group flex items-center gap-3 rounded-lg bg-slate-800/50 p-2.5 transition hover:bg-slate-700/50"
            title={`Click to copy ${color.hex}`}
          >
            <div
              className="h-8 w-8 shrink-0 rounded-lg border border-white/10 shadow-inner transition group-hover:scale-110"
              style={{ backgroundColor: color.hex }}
            />
            <div className="text-left">
              <div className="font-mono text-xs font-semibold text-white">
                {color.hex}
              </div>
              <div className="text-[10px] text-slate-500">
                {color.percentage?.toFixed(1)}%
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
