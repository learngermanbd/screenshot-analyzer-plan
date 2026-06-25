"use client";

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
  { name: "Custom", icon: "⚙️", width: 390, height: 844 },
];

interface DeviceFrameSelectorProps {
  activePreset: string;
  onSelect: (preset: DevicePreset) => void;
  className?: string;
}

export default function DeviceFrameSelector({
  activePreset,
  onSelect,
  className,
}: DeviceFrameSelectorProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
        Device Frame
      </h3>
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
      </div>
    </div>
  );
}
