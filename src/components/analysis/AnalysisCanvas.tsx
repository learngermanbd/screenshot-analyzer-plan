"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { DetectedElement } from "@/types/analysis";

interface AnalysisCanvasProps {
  imageUrl: string;
  elements: DetectedElement[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  canvasRef?: React.RefObject<HTMLCanvasElement | null>;
  className?: string;
}

export default function AnalysisCanvas({
  imageUrl,
  elements,
  selectedId,
  onSelect,
  canvasRef: externalCanvasRef,
  className,
}: AnalysisCanvasProps) {
  const internalCanvasRef = useRef<HTMLCanvasElement>(null);
  const canvasRef = externalCanvasRef || internalCanvasRef;
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      setImage(img);
      const maxW = 800;
      const scale = maxW / img.width;
      setCanvasSize({
        width: Math.min(img.width, maxW),
        height: img.height * Math.min(scale, 1),
      });
    };
    img.src = imageUrl;
  }, [imageUrl]);

  useEffect(() => {
    if (!canvasRef.current || !image) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    const scaleX = canvasSize.width / image.width;
    const scaleY = canvasSize.height / image.height;

    // Draw image
    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);
    ctx.drawImage(image, 0, 0, canvasSize.width, canvasSize.height);

    // Draw bounding boxes
    elements.forEach((el) => {
      const x = el.bbox.x * scaleX;
      const y = el.bbox.y * scaleY;
      const w = el.bbox.width * scaleX;
      const h = el.bbox.height * scaleY;
      const isSelected = el.id === selectedId;

      // Box
      ctx.strokeStyle = isSelected ? "#818cf8" : "#6366f180";
      ctx.lineWidth = isSelected ? 3 : 1.5;
      ctx.strokeRect(x, y, w, h);

      // Fill
      ctx.fillStyle = isSelected
        ? "rgba(99,102,241,0.15)"
        : "rgba(99,102,241,0.05)";
      ctx.fillRect(x, y, w, h);

      // Label
      const label = `${el.type}${el.text ? `: ${el.text.slice(0, 20)}` : ""}`;
      ctx.font = "11px system-ui";
      const textW = ctx.measureText(label).width + 8;
      ctx.fillStyle = isSelected ? "#6366f1" : "rgba(99,102,241,0.8)";
      ctx.fillRect(x, y - 18, textW, 18);
      ctx.fillStyle = "#fff";
      ctx.fillText(label, x + 4, y - 5);

      // Dimensions
      if (isSelected) {
        const dimText = `${Math.round(el.bbox.width)}×${Math.round(el.bbox.height)}`;
        ctx.font = "bold 10px monospace";
        ctx.fillStyle = "#818cf8";
        ctx.fillText(dimText, x + w / 2 - 16, y + h + 14);
      }
    });
  }, [image, elements, selectedId, canvasSize, canvasRef]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect || !image) return;
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const scaleX = canvasSize.width / image.width;
    const scaleY = canvasSize.height / image.height;

    // Find clicked element (reverse order for top-most)
    for (let i = elements.length - 1; i >= 0; i--) {
      const el = elements[i];
      const x = el.bbox.x * scaleX;
      const y = el.bbox.y * scaleY;
      const w = el.bbox.width * scaleX;
      const h = el.bbox.height * scaleY;
      if (mx >= x && mx <= x + w && my >= y && my <= y + h) {
        onSelect(el.id);
        return;
      }
    }
    onSelect(null);
  };

  return (
    <div className={cn("relative overflow-hidden rounded-xl", className)}>
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        onClick={handleClick}
        className="cursor-crosshair rounded-xl"
      />
    </div>
  );
}
