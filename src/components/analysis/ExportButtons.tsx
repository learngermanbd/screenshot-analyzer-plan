"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import type { AnalysisResult } from "@/types/analysis";

interface ExportButtonsProps {
  result: AnalysisResult;
  canvasRef?: React.RefObject<HTMLCanvasElement | null>;
  className?: string;
}

export default function ExportButtons({
  result,
  canvasRef,
  className,
}: ExportButtonsProps) {
  const [exporting, setExporting] = useState<string | null>(null);

  const handleExportAnnotatedImage = useCallback(async () => {
    setExporting("image");
    try {
      const canvas = canvasRef?.current;
      if (!canvas) {
        // Fallback: create a new canvas from the image
        const img = new Image();
        img.crossOrigin = "anonymous";
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error("Failed to load image"));
          img.src = result.imageUrl;
        });

        const exportCanvas = document.createElement("canvas");
        exportCanvas.width = img.width;
        exportCanvas.height = img.height;
        const ctx = exportCanvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0);

        // Draw bounding boxes
        result.elements.forEach((el) => {
          const { x, y, width: w, height: h } = el.bbox;
          ctx.strokeStyle = "#6366f1";
          ctx.lineWidth = 2;
          ctx.strokeRect(x, y, w, h);
          ctx.fillStyle = "rgba(99,102,241,0.08)";
          ctx.fillRect(x, y, w, h);

          // Label
          const label = el.label || el.type;
          ctx.font = "bold 11px system-ui";
          const textW = ctx.measureText(label).width + 8;
          ctx.fillStyle = "#6366f1";
          ctx.fillRect(x, y - 18, textW, 18);
          ctx.fillStyle = "#ffffff";
          ctx.fillText(label, x + 4, y - 5);
        });

        // Draw spacing measurements between vertically adjacent elements
        const sorted = [...result.elements].sort((a, b) => a.bbox.y - b.bbox.y);
        for (let i = 1; i < sorted.length; i++) {
          const prev = sorted[i - 1];
          const curr = sorted[i];
          const gap = Math.round(curr.bbox.y - (prev.bbox.y + prev.bbox.height));
          if (gap > 0 && gap < 200) {
            const midX = Math.min(prev.bbox.x, curr.bbox.x) + 20;
            const startY = prev.bbox.y + prev.bbox.height;
            const endY = curr.bbox.y;
            ctx.strokeStyle = "#f472b680";
            ctx.lineWidth = 1;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.moveTo(midX, startY);
            ctx.lineTo(midX, endY);
            ctx.stroke();
            ctx.setLineDash([]);
            // Gap label
            ctx.font = "bold 10px monospace";
            ctx.fillStyle = "#f472b6";
            ctx.fillText(`${gap}px`, midX + 4, (startY + endY) / 2 + 3);
          }
        }

        exportCanvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `screenshot-analysis-${result.id.slice(0, 8)}.png`;
            a.click();
            URL.revokeObjectURL(url);
          }
        }, "image/png");
      } else {
        // Use existing canvas
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `screenshot-analysis-${result.id.slice(0, 8)}.png`;
            a.click();
            URL.revokeObjectURL(url);
          }
        }, "image/png");
      }
    } catch (err) {
      console.error("Export image failed:", err);
    } finally {
      setExporting(null);
    }
  }, [result, canvasRef]);

  const handleExportJsonSpec = useCallback(() => {
    setExporting("json");
    try {
      const specSheet = {
        meta: {
          id: result.id,
          exportedAt: new Date().toISOString(),
          imageWidth: result.imageWidth,
          imageHeight: result.imageHeight,
          platform: result.metadata?.platform,
          deviceType: result.metadata?.deviceType,
        },
        designTokens: {
          colors: result.colors.map((c) => ({
            hex: c.hex,
            rgb: c.rgb,
            hsl: c.hsl,
            percentage: c.percentage,
            name: c.name,
          })),
          typography: result.elements
            .filter((el) => el.styles?.fontSize)
            .map((el) => ({
              element: el.label || el.type,
              fontFamily: el.styles?.fontFamily || "system-ui",
              fontSize: el.styles?.fontSize,
              fontWeight: el.styles?.fontWeight,
              color: el.styles?.color || el.styles?.textColor,
            })),
          spacing: result.elements.map((el) => ({
            element: el.label || el.type,
            x: Math.round(el.bbox.x),
            y: Math.round(el.bbox.y),
            width: Math.round(el.bbox.width),
            height: Math.round(el.bbox.height),
            padding: el.styles?.padding,
            margin: el.styles?.margin,
          })),
        },
        elements: result.elements.map((el) => ({
          id: el.id,
          type: el.type,
          label: el.label,
          text: el.text,
          bbox: {
            x: Math.round(el.bbox.x),
            y: Math.round(el.bbox.y),
            width: Math.round(el.bbox.width),
            height: Math.round(el.bbox.height),
          },
          confidence: el.confidence,
          styles: el.styles,
        })),
        texts: result.texts,
        accessibility: {
          touchTargets: result.elements
            .filter((el) => ["button", "input", "toggle", "tab"].includes(el.type))
            .map((el) => ({
              element: el.label || el.type,
              width: Math.round(el.bbox.width),
              height: Math.round(el.bbox.height),
              meetsMinimum:
                el.bbox.width >= 44 && el.bbox.height >= 44,
            })),
        },
      };

      const blob = new Blob([JSON.stringify(specSheet, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `design-spec-${result.id.slice(0, 8)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export JSON failed:", err);
    } finally {
      setExporting(null);
    }
  }, [result]);

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      <button
        onClick={handleExportAnnotatedImage}
        disabled={exporting !== null}
        className="flex items-center gap-2 rounded-lg border border-white/10 bg-slate-800/50 px-4 py-2.5 text-sm font-medium text-white transition hover:border-indigo-500/30 hover:bg-indigo-500/10 disabled:opacity-50"
      >
        {exporting === "image" ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        ) : (
          <span>📸</span>
        )}
        Export Annotated Image
      </button>
      <button
        onClick={handleExportJsonSpec}
        disabled={exporting !== null}
        className="flex items-center gap-2 rounded-lg border border-white/10 bg-slate-800/50 px-4 py-2.5 text-sm font-medium text-white transition hover:border-indigo-500/30 hover:bg-indigo-500/10 disabled:opacity-50"
      >
        {exporting === "json" ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        ) : (
          <span>📋</span>
        )}
        Export JSON Spec Sheet
      </button>
    </div>
  );
}
