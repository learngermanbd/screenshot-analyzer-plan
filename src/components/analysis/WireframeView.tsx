"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import type { DetectedElement } from "@/types/analysis";

interface WireframeViewProps {
  elements: DetectedElement[];
  width: number;
  height: number;
  className?: string;
}

export default function WireframeView({
  elements,
  width,
  height,
  className,
}: WireframeViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const maxW = 600;
    const scale = Math.min(maxW / width, 1);
    canvas.width = width * scale;
    canvas.height = height * scale;

    // White background
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    elements.forEach((el) => {
      const x = el.bbox.x * scale;
      const y = el.bbox.y * scaleY(el, scale);
      const w = el.bbox.width * scale;
      const h = el.bbox.height * scale;

      ctx.strokeStyle = "#94a3b8";
      ctx.lineWidth = 1;
      ctx.fillStyle = "#e2e8f0";

      switch (el.type) {
        case "button":
          roundRect(ctx, x, y, w, h, 6);
          ctx.fill();
          ctx.stroke();
          // Button text placeholder
          ctx.fillStyle = "#64748b";
          ctx.fillRect(x + w * 0.2, y + h * 0.4, w * 0.6, 2);
          break;
        case "input":
          roundRect(ctx, x, y, w, h, 4);
          ctx.fill();
          ctx.stroke();
          if (el.text) {
            ctx.fillStyle = "#94a3b8";
            ctx.font = `${Math.min(12, h * 0.4)}px system-ui`;
            ctx.fillText(el.text, x + 8, y + h * 0.6);
          }
          break;
        case "text":
          ctx.fillStyle = "#475569";
          ctx.font = `${el.styles?.fontSize ? el.styles.fontSize * scale : 12}px system-ui`;
          ctx.fillText(el.text || "Text", x, y + h * 0.7);
          break;
        case "image":
          ctx.fillRect(x, y, w, h);
          ctx.strokeRect(x, y, w, h);
          // X pattern
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + w, y + h);
          ctx.moveTo(x + w, y);
          ctx.lineTo(x, y + h);
          ctx.strokeStyle = "#cbd5e1";
          ctx.stroke();
          break;
        case "navbar":
          ctx.fillRect(x, y, w, h);
          ctx.strokeRect(x, y, w, h);
          // Dots
          ctx.fillStyle = "#94a3b8";
          for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.arc(x + w * 0.3 + i * (w * 0.15), y + h * 0.5, 3, 0, Math.PI * 2);
            ctx.fill();
          }
          break;
        default:
          ctx.fillRect(x, y, w, h);
          ctx.strokeRect(x, y, w, h);
      }
    });
  }, [elements, width, height]);

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-400">
        Wireframe
      </h3>
      <canvas ref={canvasRef} className="rounded-xl border border-white/10 shadow-lg" />
    </div>
  );
}

function scaleY(el: DetectedElement, scale: number): number {
  return el.bbox.y * scale;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
