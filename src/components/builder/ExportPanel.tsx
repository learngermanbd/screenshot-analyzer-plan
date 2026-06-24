"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { CodeExportFormat } from "@/types/analysis";

interface ExportPanelProps {
  onExport: (format: CodeExportFormat) => void;
  isExporting?: boolean;
  className?: string;
}

const formats: { value: CodeExportFormat; label: string; icon: string; desc: string }[] = [
  { value: "react-tailwind", label: "React + Tailwind", icon: "⚛️", desc: "Modern React components" },
  { value: "vue-tailwind", label: "Vue + Tailwind", icon: "💚", desc: "Vue 3 composition API" },
  { value: "html-css", label: "HTML + CSS", icon: "🌐", desc: "Plain HTML & CSS" },
  { value: "jetpack-compose", label: "Jetpack Compose", icon: "🤖", desc: "Android Compose UI" },
  { value: "kotlin-xml", label: "Kotlin/XML", icon: "📱", desc: "Android XML layouts" },
  { value: "json", label: "JSON Design", icon: "📋", desc: "Raw design data" },
];

export default function ExportPanel({
  onExport,
  isExporting = false,
  className,
}: ExportPanelProps) {
  const [selected, setSelected] = useState<CodeExportFormat>("react-tailwind");

  return (
    <div className={cn("space-y-4", className)}>
      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
        Export Code
      </h3>

      <div className="space-y-2">
        {formats.map((f) => (
          <button
            key={f.value}
            onClick={() => setSelected(f.value)}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl border p-3 text-left transition",
              selected === f.value
                ? "border-indigo-500/50 bg-indigo-500/10"
                : "border-white/10 hover:border-white/20 hover:bg-white/5"
            )}
          >
            <span className="text-xl">{f.icon}</span>
            <div>
              <div className="text-sm font-semibold text-white">{f.label}</div>
              <div className="text-xs text-slate-500">{f.desc}</div>
            </div>
            {selected === f.value && (
              <div className="ml-auto h-2 w-2 rounded-full bg-indigo-400" />
            )}
          </button>
        ))}
      </div>

      <button
        onClick={() => onExport(selected)}
        disabled={isExporting}
        className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 text-sm font-bold text-white transition hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50"
      >
        {isExporting ? (
          <span className="flex items-center justify-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Generating...
          </span>
        ) : (
          `Export as ${formats.find((f) => f.value === selected)?.label}`
        )}
      </button>
    </div>
  );
}
