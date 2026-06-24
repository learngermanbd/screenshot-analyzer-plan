"use client";

import { cn } from "@/lib/utils";
import type { DetectedElement } from "@/types/analysis";

interface SpecsPanelProps {
  element: DetectedElement | null;
  className?: string;
}

export default function SpecsPanel({ element, className }: SpecsPanelProps) {
  if (!element) {
    return (
      <div className={cn("flex flex-col items-center justify-center p-8 text-slate-500", className)}>
        <div className="mb-3 text-4xl">🎯</div>
        <p className="text-sm">Click an element on the canvas to view specs</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-2">
        <span className="rounded-md bg-indigo-500/20 px-2 py-0.5 text-xs font-bold uppercase text-indigo-300">
          {element.type}
        </span>
        {element.confidence && (
          <span className="text-xs text-slate-500">
            {(element.confidence * 100).toFixed(0)}% confidence
          </span>
        )}
      </div>

      {element.text && (
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Text Content</label>
          <p className="mt-1 rounded-lg bg-slate-800/50 px-3 py-2 text-sm text-white">{element.text}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <SpecItem label="X" value={`${Math.round(element.bbox.x)}px`} />
        <SpecItem label="Y" value={`${Math.round(element.bbox.y)}px`} />
        <SpecItem label="Width" value={`${Math.round(element.bbox.width)}px`} />
        <SpecItem label="Height" value={`${Math.round(element.bbox.height)}px`} />
      </div>

      {element.styles && (
        <>
          <div className="border-t border-white/5 pt-3">
            <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Typography</h4>
            <div className="grid grid-cols-2 gap-3">
              {element.styles.fontFamily && <SpecItem label="Font" value={element.styles.fontFamily} />}
              {element.styles.fontSize && <SpecItem label="Size" value={`${element.styles.fontSize}px`} />}
              {element.styles.fontWeight && <SpecItem label="Weight" value={String(element.styles.fontWeight)} />}
              {element.styles.color && (
                <SpecItem
                  label="Color"
                  value={element.styles.color}
                  badge={
                    <span
                      className="ml-1 inline-block h-3 w-3 rounded-full border border-white/20"
                      style={{ backgroundColor: element.styles.color }}
                    />
                  }
                />
              )}
            </div>
          </div>

          {element.styles.backgroundColor && (
            <div className="border-t border-white/5 pt-3">
              <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Background</h4>
              <SpecItem
                label="BG Color"
                value={element.styles.backgroundColor}
                badge={
                  <span
                    className="ml-1 inline-block h-3 w-3 rounded-full border border-white/20"
                    style={{ backgroundColor: element.styles.backgroundColor }}
                  />
                }
              />
            </div>
          )}

          {(element.styles.borderRadius || element.styles.padding) && (
            <div className="border-t border-white/5 pt-3">
              <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Spacing & Borders</h4>
              <div className="grid grid-cols-2 gap-3">
                {element.styles.borderRadius && <SpecItem label="Radius" value={`${element.styles.borderRadius}px`} />}
                {element.styles.padding && (
                  <SpecItem label="Padding" value={element.styles.padding.map((p) => `${p}px`).join(" ")} />
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function SpecItem({
  label,
  value,
  badge,
}: {
  label: string;
  value: string;
  badge?: React.ReactNode;
}) {
  return (
    <div className="rounded-lg bg-slate-800/50 p-2">
      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</div>
      <div className="mt-0.5 flex items-center text-sm font-medium text-white">
        {value}
        {badge}
      </div>
    </div>
  );
}
