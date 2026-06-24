"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { DetectedElement } from "@/types/analysis";

type InspectTarget = "css" | "react" | "vue" | "compose" | "kotlin-xml";

interface InspectOverlayProps {
  element: DetectedElement;
  className?: string;
}

export default function InspectOverlay({
  element,
  className,
}: InspectOverlayProps) {
  const [target, setTarget] = useState<InspectTarget>("css");

  const code = generateCode(element, target);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
          Inspect
        </h3>
        <span className="rounded-md bg-indigo-500/20 px-2 py-0.5 text-xs font-bold text-indigo-300">
          {element.type}
        </span>
      </div>

      {/* Target selector */}
      <div className="flex gap-1 rounded-lg bg-slate-800/50 p-1">
        {([
          { value: "css", label: "CSS", icon: "🌐" },
          { value: "react", label: "React", icon: "⚛️" },
          { value: "vue", label: "Vue", icon: "💚" },
          { value: "compose", label: "Compose", icon: "🤖" },
          { value: "kotlin-xml", label: "XML", icon: "📱" },
        ] as const).map((t) => (
          <button
            key={t.value}
            onClick={() => setTarget(t.value)}
            className={cn(
              "flex-1 rounded-md px-2 py-1.5 text-[10px] font-semibold transition",
              target === t.value
                ? "bg-indigo-600 text-white"
                : "text-slate-400 hover:text-white"
            )}
          >
            <span className="mr-1">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* Code output */}
      <div className="relative">
        <pre className="max-h-[300px] overflow-auto rounded-xl bg-slate-900 p-4 text-xs leading-relaxed">
          <code className="text-slate-300">{code}</code>
        </pre>
        <button
          onClick={() => navigator.clipboard.writeText(code)}
          className="absolute right-2 top-2 rounded-md bg-slate-700 px-2 py-1 text-[10px] font-semibold text-slate-300 transition hover:bg-slate-600"
        >
          Copy
        </button>
      </div>

      {/* Measurements */}
      <div className="rounded-xl border border-white/10 bg-slate-800/30 p-4">
        <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
          Measurements
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <MeasureItem label="Position" value={`${Math.round(element.bbox.x)}, ${Math.round(element.bbox.y)}`} />
          <MeasureItem label="Size" value={`${Math.round(element.bbox.width)} × ${Math.round(element.bbox.height)}`} />
          {element.styles?.padding && (
            <MeasureItem label="Padding" value={element.styles.padding.map((p) => `${p}px`).join(" ")} />
          )}
          {element.styles?.borderRadius && (
            <MeasureItem label="Border Radius" value={`${element.styles.borderRadius}px`} />
          )}
        </div>
      </div>
    </div>
  );
}

function MeasureItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] text-slate-500">{label}</div>
      <div className="font-mono text-sm font-medium text-white">{value}</div>
    </div>
  );
}

function generateCode(element: DetectedElement, target: InspectTarget): string {
  const { type, text, styles } = element;
  const content = text || type;

  switch (target) {
    case "css":
      return `.${type} {
  /* Position */
  position: absolute;
  left: ${Math.round(element.bbox.x)}px;
  top: ${Math.round(element.bbox.y)}px;
  width: ${Math.round(element.bbox.width)}px;
  height: ${Math.round(element.bbox.height)}px;

  /* Typography */
  font-family: ${styles?.fontFamily || "system-ui, sans-serif"};
  font-size: ${styles?.fontSize || 14}px;
  font-weight: ${styles?.fontWeight || 400};
  color: ${styles?.color || "#ffffff"};

  /* Appearance */
  background-color: ${styles?.backgroundColor || "transparent"};
  border-radius: ${styles?.borderRadius || 0}px;
  padding: ${styles?.padding?.map((p) => `${p}px`).join(" ") || "0px"};
}`;

    case "react":
      return `export function ${capitalize(type)}() {
  return (
    <div className="${type}" style={{
      width: ${Math.round(element.bbox.width)},
      height: ${Math.round(element.bbox.height)},
      backgroundColor: "${styles?.backgroundColor || "transparent"}",
      borderRadius: ${styles?.borderRadius || 0},
      fontSize: ${styles?.fontSize || 14},
      color: "${styles?.color || "#ffffff"}",
      padding: "${styles?.padding?.map((p) => `${p}px`).join(" ") || "0px"}",
    }}>
      ${content}
    </div>
  );
}`;

    case "vue":
      return `<template>
  <div class="${type}">
    ${content}
  </div>
</template>

<script setup lang="ts">
// ${type} component
</script>

<style scoped>
.${type} {
  width: ${Math.round(element.bbox.width)}px;
  height: ${Math.round(element.bbox.height)}px;
  background-color: ${styles?.backgroundColor || "transparent"};
  border-radius: ${styles?.borderRadius || 0}px;
  font-size: ${styles?.fontSize || 14}px;
  color: ${styles?.color || "#ffffff"};
  padding: ${styles?.padding?.map((p) => `${p}px`).join(" ") || "0px"};
}
</style>`;

    case "compose":
      return `@Composable
fun ${capitalize(type)}() {
    Box(
        modifier = Modifier
            .width(${Math.round(element.bbox.width)}.dp)
            .height(${Math.round(element.bbox.height)}.dp)
            .background(
                color = Color(${hexToComposeColor(styles?.backgroundColor || "#000000")}),
                shape = RoundedCornerShape(${styles?.borderRadius || 0}.dp)
            )
            .padding(${styles?.padding?.map((p) => `${p}.dp`).join(", ") || "0.dp"})
    ) {
        Text(
            text = "${content}",
            fontSize = ${styles?.fontSize || 14}.sp,
            color = Color(${hexToComposeColor(styles?.color || "#ffffff")})
        )
    }
}`;

    case "kotlin-xml":
      return `<View
    android:layout_width="${Math.round(element.bbox.width)}dp"
    android:layout_height="${Math.round(element.bbox.height)}dp"
    android:layout_marginLeft="${Math.round(element.bbox.x)}dp"
    android:layout_marginTop="${Math.round(element.bbox.y)}dp"
    android:background="${styles?.backgroundColor || "#000000"}"
    android:padding="${styles?.padding?.[0] || 0}dp" />

<TextView
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:text="${content}"
    android:textSize="${styles?.fontSize || 14}sp"
    android:textColor="${styles?.color || "#ffffff"}" />`;

    default:
      return "";
  }
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function hexToComposeColor(hex: string): string {
  return `0xFF${hex.replace("#", "").toUpperCase()}`;
}
