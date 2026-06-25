"use client";

import { useState } from "react";
import { useEditor } from "@craftjs/core";
import { cn } from "@/lib/utils";
import LiveCodePreview from "@/components/inspect/LiveCodePreview";
import type { CodeExportFormat } from "@/types/analysis";

interface ExportPanelProps {
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
  className,
}: ExportPanelProps) {
  const { query } = useEditor();
  const [selected, setSelected] = useState<CodeExportFormat>("react-tailwind");
  const [exportedCode, setExportedCode] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const handleExport = async (format: CodeExportFormat) => {
    setExporting(true);
    try {
      const jsonState = query.serialize();

      const response = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jsonState, format }),
      });

      if (response.ok) {
        const data = await response.json();
        setExportedCode(data.code);
      } else {
        // Fallback: generate HTML from serialized state
        const state = JSON.parse(jsonState);
        const html = generateFallbackHtml(state);
        setExportedCode(html);
      }
    } catch {
      const jsonState = query.serialize();
      const state = JSON.parse(jsonState);
      const html = generateFallbackHtml(state);
      setExportedCode(html);
    } finally {
      setExporting(false);
    }
  };

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
        onClick={() => handleExport(selected)}
        disabled={exporting}
        className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 text-sm font-bold text-white transition hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50"
      >
        {exporting ? (
          <span className="flex items-center justify-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Generating...
          </span>
        ) : (
          `Export as ${formats.find((f) => f.value === selected)?.label}`
        )}
      </button>

      {exportedCode && (
        <div className="mt-4">
          <LiveCodePreview code={exportedCode} language={selected} />
          <button
            onClick={() => setExportedCode(null)}
            className="mt-2 w-full rounded-lg border border-white/10 bg-slate-800/50 px-3 py-2 text-xs text-slate-400 transition hover:bg-slate-700/50 hover:text-white"
          >
            ✕ Close Preview
          </button>
        </div>
      )}
    </div>
  );
}

function generateFallbackHtml(state: Record<string, unknown>): string {
  const ROOT_ID = "ROOT";
  const nodes = state.nodes as Record<string, { data: { type: { resolvedName: string }; props: Record<string, unknown> } }>;
  const root = nodes[ROOT_ID];

  function renderNode(id: string): string {
    const node = nodes[id];
    if (!node) return "";
    const { type, props } = node.data;
    const name = type.resolvedName || type;
    const text = (props.text as string) || "";

    switch (name) {
      case "CraftButton":
        return `  <button style="background:${props.background || "#6366f1"};color:${props.color || "#fff"};border-radius:${props.borderRadius || "8px"};padding:${props.padding || "10px 20px"};font-size:${props.fontSize || "14px"};font-weight:${props.fontWeight || "600"};width:${props.width || "auto"};border:none;cursor:pointer;">${text}</button>`;
      case "CraftText":
        return `  <p style="font-size:${props.fontSize || "14px"};color:${props.color || "#e2e8f0"};font-weight:${props.fontWeight || "400"};">${text}</p>`;
      case "CraftHeading":
        return `  <h2 style="font-size:${props.fontSize || "24px"};color:${props.color || "#fff"};font-weight:${props.fontWeight || "700"};">${text}</h2>`;
      case "CraftInput":
        return `  <input type="text" placeholder="${props.placeholder || "Enter text..."}" style="width:${props.width || "100%"};padding:${props.padding || "8px 12px"};background:${props.background || "#1e293b"};color:${props.color || "#e2e8f0"};border:1px solid ${props.borderColor || "#334155"};border-radius:${props.borderRadius || "8px"};font-size:${props.fontSize || "14px"};outline:none;" />`;
      case "CraftNavbar":
        return `  <nav style="background:${props.background || "#0f172a"};color:${props.color || "#fff"};height:${props.height || "56px"};padding:${props.padding || "0 16px"};display:flex;align-items:center;justify-content:space-between;"><span>☰</span><span style="font-weight:600;">${props.title || "Title"}</span><span>⋮</span></nav>`;
      case "CraftDivider":
        return `  <hr style="border-top:${props.thickness || "1px"} solid ${props.color || "#334155"};margin:${props.margin || "8px 0"};border-bottom:none;border-left:none;border-right:none;" />`;
      case "CraftImage":
        return `  <div style="width:${props.width || "100%"};height:${props.height || "200px"};background:${props.background || "#1e293b"};border-radius:${props.borderRadius || "8px"};display:flex;align-items:center;justify-content:center;"><span style="color:#64748b;">🖼️ Image</span></div>`;
      case "CraftContainer":
      case "CraftRow":
      case "CraftCard": {
        const children = Object.keys(nodes).filter(
          (nid) => nodes[nid] && (nodes[nid].data as { parentNode?: string }).parentNode === id
        );
        const childHtml = children.map(renderNode).join("\n");
        return `  <div style="display:flex;flex-direction:${name === "CraftRow" ? "row" : "column"};gap:${props.gap || "8px"};padding:${props.padding || "16px"};background:${props.background || "transparent"};border-radius:${props.borderRadius || "0"};width:${props.width || "100%"};">\n${childHtml}\n  </div>`;
      }
      default:
        return `  <div>${name}</div>`;
    }
  }

  const children = root
    ? Object.keys(nodes).filter(
        (nid) => (nodes[nid].data as { parentNode?: string }).parentNode === ROOT_ID
      )
    : [];
  const body = children.map(renderNode).join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Exported Design</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #0f172a; font-family: system-ui, sans-serif; padding: 20px; }
  </style>
</head>
<body>
${body}
</body>
</html>`;
}
