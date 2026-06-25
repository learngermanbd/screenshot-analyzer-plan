"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import type { DetectedElement, ColorInfo } from "@/types/analysis";

interface AccessibilityAuditProps {
  elements: DetectedElement[];
  colors: ColorInfo[];
  className?: string;
}

interface AuditResult {
  id: string;
  type: "pass" | "warning" | "fail";
  category: "contrast" | "touch-target" | "readability";
  title: string;
  description: string;
  element?: string;
}

import { hexToRgb } from "@/lib/utils";

function relativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function contrastRatio(hex1: string, hex2: string): number {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  if (!rgb1 || !rgb2) return 0;
  const l1 = relativeLuminance(rgb1.r, rgb1.g, rgb1.b);
  const l2 = relativeLuminance(rgb2.r, rgb2.g, rgb2.b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function getWcagLevel(ratio: number, fontSize?: number): "AAA" | "AA" | "fail" {
  const isLargeText = fontSize ? fontSize >= 18 || fontSize >= 14 : false;
  if (isLargeText) {
    if (ratio >= 4.5) return "AAA";
    if (ratio >= 3) return "AA";
  } else {
    if (ratio >= 7) return "AAA";
    if (ratio >= 4.5) return "AA";
  }
  return "fail";
}

export default function AccessibilityAudit({
  elements,
  colors,
  className,
}: AccessibilityAuditProps) {
  const auditResults = useMemo(() => {
    const results: AuditResult[] = [];

    // 1. Contrast checks — compare dominant colors against white/dark backgrounds
    const bgColors = colors.slice(0, 3);
    const textColors = ["#ffffff", "#000000", "#f8fafc", "#0f172a"];

    for (const bg of bgColors) {
      for (const fg of textColors) {
        const ratio = contrastRatio(bg.hex, fg);
        const level = getWcagLevel(ratio);
        if (level === "fail") {
          results.push({
            id: `contrast-${bg.hex}-${fg}`,
            type: "warning",
            category: "contrast",
            title: `Low contrast: ${bg.hex} on ${fg}`,
            description: `Ratio ${ratio.toFixed(1)}:1 — WCAG AA requires 4.5:1 for normal text`,
          });
        } else {
          results.push({
            id: `contrast-${bg.hex}-${fg}`,
            type: "pass",
            category: "contrast",
            title: `${bg.hex} on ${fg}: ${level}`,
            description: `Contrast ratio ${ratio.toFixed(1)}:1 meets ${level} standards`,
          });
        }
      }
    }

    // 2. Touch target checks
    const MIN_TOUCH_TARGET = 44; // Apple HIG recommends 44pt minimum
    for (const el of elements) {
      if (
        el.type === "button" ||
        el.type === "input" ||
        el.type === "toggle" ||
        el.type === "tab"
      ) {
        const width = el.bbox.width;
        const height = el.bbox.height;
        const isAccessible =
          width >= MIN_TOUCH_TARGET && height >= MIN_TOUCH_TARGET;

        results.push({
          id: `touch-${el.id}`,
          type: isAccessible ? "pass" : "fail",
          category: "touch-target",
          title: `${el.type} touch target: ${Math.round(width)}×${Math.round(height)}px`,
          description: isAccessible
            ? `Meets 44px minimum touch target`
            : `Below 44px minimum — ${width < MIN_TOUCH_TARGET ? "width" : "height"} is too small`,
          element: el.label || el.text || el.type,
        });
      }
    }

    // 3. Text readability checks
    for (const el of elements) {
      if (el.type === "text" || el.type === "button") {
        const fontSize = el.styles?.fontSize;
        if (fontSize && fontSize < 12) {
          results.push({
            id: `read-${el.id}`,
            type: "fail",
            category: "readability",
            title: `Text too small: ${fontSize}px`,
            description: `Minimum recommended font size is 12px for body text`,
            element: el.text || el.type,
          });
        } else if (fontSize && fontSize >= 12) {
          results.push({
            id: `read-${el.id}`,
            type: "pass",
            category: "readability",
            title: `Font size OK: ${fontSize}px`,
            description: `Font size meets minimum readability standards`,
            element: el.text || el.type,
          });
        }
      }
    }

    return results;
  }, [elements, colors]);

  const passCount = auditResults.filter((r) => r.type === "pass").length;
  const warningCount = auditResults.filter((r) => r.type === "warning").length;
  const failCount = auditResults.filter((r) => r.type === "fail").length;
  const totalCount = auditResults.length;
  const score =
    totalCount > 0 ? Math.round((passCount / totalCount) * 100) : 0;

  const getScoreColor = () => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <div className={cn("space-y-4", className)}>
      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
        Accessibility Audit
      </h3>

      {/* Score */}
      <div className="flex items-center gap-4 rounded-xl border border-white/10 bg-slate-800/30 p-4">
        <div
          className={cn(
            "text-4xl font-extrabold",
            getScoreColor()
          )}
        >
          {score}%
        </div>
        <div>
          <div className="text-sm font-semibold text-white">Accessibility Score</div>
          <div className="text-xs text-slate-500">
            {passCount} pass · {warningCount} warnings · {failCount} failures
          </div>
        </div>
      </div>

      {/* Summary badges */}
      <div className="flex gap-2">
        <span className="rounded-lg bg-green-500/15 px-2.5 py-1 text-xs font-semibold text-green-400">
          ✓ {passCount} Pass
        </span>
        <span className="rounded-lg bg-yellow-500/15 px-2.5 py-1 text-xs font-semibold text-yellow-400">
          ⚠ {warningCount} Warnings
        </span>
        <span className="rounded-lg bg-red-500/15 px-2.5 py-1 text-xs font-semibold text-red-400">
          ✗ {failCount} Failures
        </span>
      </div>

      {/* Category filters and results */}
      <div className="max-h-[400px] space-y-1.5 overflow-y-auto pr-1">
        {auditResults
          .filter((r) => r.type !== "pass")
          .map((result) => (
            <div
              key={result.id}
              className={cn(
                "rounded-lg border p-3 text-xs",
                result.type === "fail"
                  ? "border-red-500/20 bg-red-500/5"
                  : "border-yellow-500/20 bg-yellow-500/5"
              )}
            >
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "text-sm",
                    result.type === "fail" ? "text-red-400" : "text-yellow-400"
                  )}
                >
                  {result.type === "fail" ? "✗" : "⚠"}
                </span>
                <span className="font-semibold text-white">{result.title}</span>
              </div>
              <p className="mt-1 pl-5 text-slate-400">{result.description}</p>
              {result.element && (
                <span className="mt-1 inline-block rounded bg-slate-700/50 px-1.5 py-0.5 text-[10px] text-slate-500">
                  {result.element}
                </span>
              )}
            </div>
          ))}

        {auditResults.filter((r) => r.type !== "pass").length === 0 && (
          <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-4 text-center text-sm text-green-400">
            ✓ All accessibility checks passed!
          </div>
        )}
      </div>
    </div>
  );
}
