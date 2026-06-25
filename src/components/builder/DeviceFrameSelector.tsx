"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export interface DevicePreset {
  name: string;
  icon: string;
  width: number;
  height: number;
}

const presets: DevicePreset[] = [
  { name: "iPhone 14", icon: "📱", width: 390, height: 844 },
  { name: "iPhone 14 Pro Max", icon: "📱", width: 430, height: 932 },
  { name: "Pixel 7", icon: "📱", width: 412, height: 915 },
  { name: "iPad Mini", icon: "📱", width: 744, height: 1133 },
  { name: "iPad Pro", icon: "📱", width: 1024, height: 1366 },
  { name: "Galaxy S23", icon: "📱", width: 360, height: 780 },
];

interface DeviceFrameSelectorProps {
  activePreset: string;
  canvasWidth?: number;
  canvasHeight?: number;
  onSelect: (preset: DevicePreset) => void;
  className?: string;
}

export default function DeviceFrameSelector({
  activePreset,
  canvasWidth = 390,
  canvasHeight = 844,
  onSelect,
  className,
}: DeviceFrameSelectorProps) {
  const [customWidth, setCustomWidth] = useState(String(canvasWidth));
  const [customHeight, setCustomHeight] = useState(String(canvasHeight));

  const isCustom = activePreset === "Custom";

  const handleApplyCustom = () => {
    const w = Math.max(200, Math.min(2000, parseInt(customWidth) || 390));
    const h = Math.max(200, Math.min(4000, parseInt(customHeight) || 844));
    setCustomWidth(String(w));
    setCustomHeight(String(h));
    onSelect({ name: "Custom", icon: "⚙️", width: w, height: h });
  };

  return (
    <div className={cn("space-y-3", className)}>
      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
        Device Frame
      </h3>

      {/* Preset buttons */}
      <div className="grid grid-cols-2 gap-1">
        {presets.map((preset) => (
          <button
            key={preset.name}
            onClick={() => onSelect(preset)}
            className={cn(
              "flex items-center gap-2 rounded-lg border p-2 text-left text-xs transition",
              activePreset === preset.name
                ? "border-indigo-500/50 bg-indigo-500/10 text-indigo-300"
                : "border-white/10 text-slate-400 hover:border-white/20 hover:bg-white/5"
            )}
          >
            <span>{preset.icon}</span>
            <div>
              <div className="font-medium">{preset.name}</div>
              <div className="text-[10px] text-slate-600">
                {preset.width}×{preset.height}
              </div>
            </div>
          </button>
        ))}

        {/* Custom button */}
        <button
          onClick={() => handleApplyCustom()}
          className={cn(
            "flex items-center gap-2 rounded-lg border p-2 text-left text-xs transition",
            isCustom
              ? "border-indigo-500/50 bg-indigo-500/10 text-indigo-300"
              : "border-white/10 text-slate-400 hover:border-white/20 hover:bg-white/5"
          )}
        >
          <span>⚙️</span>
          <div>
            <div className="font-medium">Custom</div>
            <div className="text-[10px] text-slate-600">
              {customWidth}×{customHeight}
            </div>
          </div>
        </button>
      </div>

      {/* Custom dimension inputs — only visible when Custom is selected */}
      {isCustom && <div className="space-y-2">
        <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Custom Dimensions
        </h4>
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <label className="text-[10px] text-slate-500">Width (px)</label>
            <input
              type="number"
              min={200}
              max={2000}
              value={customWidth}
              onChange={(e) => setCustomWidth(e.target.value)}
              onBlur={() => isCustom && handleApplyCustom()}
              onKeyDown={(e) => e.key === "Enter" && handleApplyCustom()}
              className="mt-0.5 w-full rounded-lg border border-white/10 bg-slate-800/50 px-2.5 py-1.5 text-xs text-white placeholder-slate-600 outline-none focus:border-indigo-500/50"
            />
          </div>
          <span className="mt-4 text-slate-600">×</span>
          <div className="flex-1">
            <label className="text-[10px] text-slate-500">Height (px)</label>
            <input
              type="number"
              min={200}
              max={4000}
              value={customHeight}
              onChange={(e) => setCustomHeight(e.target.value)}
              onBlur={() => isCustom && handleApplyCustom()}
              onKeyDown={(e) => e.key === "Enter" && handleApplyCustom()}
              className="mt-0.5 w-full rounded-lg border border-white/10 bg-slate-800/50 px-2.5 py-1.5 text-xs text-white placeholder-slate-600 outline-none focus:border-indigo-500/50"
            />
          </div>
        </div>
        <button
          onClick={handleApplyCustom}
          className="w-full rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-indigo-500"
        >
          Apply Custom Size
        </button>
      </div>}
    </div>
  );
}
