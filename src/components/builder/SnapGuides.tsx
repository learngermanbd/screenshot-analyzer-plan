"use client";

import { useEffect, useRef, useState, useCallback } from "react";

const SNAP_THRESHOLD = 5; // pixels

interface Guide {
  orientation: "vertical" | "horizontal";
  position: number; // canvas-relative px
  start: number;
  end: number;
}

interface Rect {
  left: number;
  top: number;
  right: number;
  bottom: number;
  centerX: number;
  centerY: number;
}

interface SnapGuidesProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  zoom: number;
}

function getRectFromElement(
  el: HTMLElement,
  canvasRect: DOMRect,
  zoomFactor: number
): Rect | null {
  const r = el.getBoundingClientRect();
  if (r.width === 0 && r.height === 0) return null;

  const left = (r.left - canvasRect.left) / zoomFactor;
  const top = (r.top - canvasRect.top) / zoomFactor;
  const right = (r.right - canvasRect.left) / zoomFactor;
  const bottom = (r.bottom - canvasRect.top) / zoomFactor;

  return {
    left,
    top,
    right,
    bottom,
    centerX: left + (right - left) / 2,
    centerY: top + (bottom - top) / 2,
  };
}

function computeGuides(
  draggedRect: Rect,
  otherRects: Rect[]
): Guide[] {
  const guides: Guide[] = [];

  const dragEdges = {
    left: draggedRect.left,
    centerX: draggedRect.centerX,
    right: draggedRect.right,
    top: draggedRect.top,
    centerY: draggedRect.centerY,
    bottom: draggedRect.bottom,
  };

  for (const other of otherRects) {
    // Vertical guides (x-alignment)
    const xChecks: [number, number][] = [
      [dragEdges.left, other.left],
      [dragEdges.left, other.centerX],
      [dragEdges.left, other.right],
      [dragEdges.centerX, other.left],
      [dragEdges.centerX, other.centerX],
      [dragEdges.centerX, other.right],
      [dragEdges.right, other.left],
      [dragEdges.right, other.centerX],
      [dragEdges.right, other.right],
    ];

    for (const [dragX, otherX] of xChecks) {
      if (Math.abs(dragX - otherX) <= SNAP_THRESHOLD) {
        const x = otherX;
        const start = Math.min(draggedRect.top, other.top) - 10;
        const end = Math.max(draggedRect.bottom, other.bottom) + 10;
        guides.push({ orientation: "vertical", position: x, start, end });
      }
    }

    // Horizontal guides (y-alignment)
    const yChecks: [number, number][] = [
      [dragEdges.top, other.top],
      [dragEdges.top, other.centerY],
      [dragEdges.top, other.bottom],
      [dragEdges.centerY, other.top],
      [dragEdges.centerY, other.centerY],
      [dragEdges.centerY, other.bottom],
      [dragEdges.bottom, other.top],
      [dragEdges.bottom, other.centerY],
      [dragEdges.bottom, other.bottom],
    ];

    for (const [dragY, otherY] of yChecks) {
      if (Math.abs(dragY - otherY) <= SNAP_THRESHOLD) {
        const y = otherY;
        const start = Math.min(draggedRect.left, other.left) - 10;
        const end = Math.max(draggedRect.right, other.right) + 10;
        guides.push({ orientation: "horizontal", position: y, start, end });
      }
    }
  }

  // Merge guides at the same position, taking union of extents
  const merged = new Map<string, Guide>();
  for (const g of guides) {
    const key = `${g.orientation}-${Math.round(g.position)}`;
    const existing = merged.get(key);
    if (existing) {
      existing.start = Math.min(existing.start, g.start);
      existing.end = Math.max(existing.end, g.end);
    } else {
      merged.set(key, { ...g });
    }
  }
  return Array.from(merged.values());
}

export default function SnapGuides({ containerRef, zoom }: SnapGuidesProps) {
  const [guides, setGuides] = useState<Guide[]>([]);
  const isDragging = useRef(false);
  const draggedIdRef = useRef<string | null>(null);
  const staticRectsRef = useRef<{ id: string; rect: Rect }[]>([]);
  const rafRef = useRef<number>(0);
  const zoomRef = useRef(zoom);

  useEffect(() => {
    zoomRef.current = zoom;
  });

  const findNodeElement = useCallback(
    (nodeId: string): HTMLElement | null => {
      if (!containerRef.current) return null;
      // Craft.js wraps each node in a div with data-node-id
      // Craft.js attaches data-craft-node-id to rendered DOM elements
      const el = containerRef.current.querySelector(
        `[data-craft-node-id="${nodeId}"]`
      ) as HTMLElement | null;
      return el;
    },
    [containerRef]
  );

  // Cache all non-dragged node rects on drag start
  const cacheStaticRects = useCallback(
    (draggedId: string) => {
      if (!containerRef.current) return;
      const canvasRect = containerRef.current.getBoundingClientRect();
      const zf = zoomRef.current / 100;

      // Get all Craft.js node elements inside the canvas
      const nodeEls = containerRef.current.querySelectorAll("[data-craft-node-id]");
      const rects: { id: string; rect: Rect }[] = [];

      nodeEls.forEach((el) => {
        const id = el.getAttribute("data-craft-node-id");
        if (!id || id === draggedId || id === "ROOT") return;
        const rect = getRectFromElement(el as HTMLElement, canvasRect, zf);
        if (rect) rects.push({ id, rect });
      });

      staticRectsRef.current = rects;
    },
    [containerRef]
  );

  // Poll loop during drag
  const startPolling = useCallback(
    (draggedId: string) => {
      const poll = () => {
        if (!isDragging.current) return;

        const draggedEl = findNodeElement(draggedId);
        const canvas = containerRef.current;
        if (!draggedEl || !canvas) {
          rafRef.current = requestAnimationFrame(poll);
          return;
        }

        const canvasRect = canvas.getBoundingClientRect();
        const zf = zoomRef.current / 100;
        const draggedRect = getRectFromElement(draggedEl, canvasRect, zf);

        if (draggedRect) {
          const otherRects = staticRectsRef.current.map((entry) => entry.rect);
          const newGuides = computeGuides(draggedRect, otherRects);
          setGuides(newGuides);
        }

        rafRef.current = requestAnimationFrame(poll);
      };

      rafRef.current = requestAnimationFrame(poll);
    },
    [containerRef, findNodeElement]
  );

  const stopPolling = useCallback(() => {
    isDragging.current = false;
    draggedIdRef.current = null;
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
    // Small delay so guides linger briefly for visual feedback
    setTimeout(() => setGuides([]), 150);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseDown = (e: MouseEvent) => {
      // Find the closest Craft.js node element
      const target = e.target as HTMLElement;
      const nodeEl = target.closest("[data-craft-node-id]") as HTMLElement | null;
      if (!nodeEl) return;

      const nodeId = nodeEl.getAttribute("data-craft-node-id");
      if (!nodeId || nodeId === "ROOT") return;

      // Check if the drag handle was used (Craft.js wraps in a drag connector)
      // We detect drag by checking if mouse moves significantly after mousedown
      isDragging.current = false;
      draggedIdRef.current = nodeId;

      const startX = e.clientX;
      const startY = e.clientY;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const dx = Math.abs(moveEvent.clientX - startX);
        const dy = Math.abs(moveEvent.clientY - startY);

        // Start drag detection after 3px movement
        if (!isDragging.current && (dx > 3 || dy > 3)) {
          isDragging.current = true;
          cacheStaticRects(nodeId);
          startPolling(nodeId);
        }
      };

      const handleMouseUp = () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
        stopPolling();
      };

      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    };

    container.addEventListener("mousedown", handleMouseDown);

    return () => {
      container.removeEventListener("mousedown", handleMouseDown);
      stopPolling();
    };
  }, [containerRef, cacheStaticRects, startPolling, stopPolling]);

  if (guides.length === 0) return null;

  return (
    <div
      className="pointer-events-none absolute inset-0"
      style={{ zIndex: 50 }}
    >
      {guides.map((guide, i) => {
        if (guide.orientation === "vertical") {
          return (
            <div
              key={`v-${i}`}
              className="absolute"
              style={{
                left: guide.position,
                top: guide.start,
                width: 1,
                height: guide.end - guide.start,
                backgroundColor: "#f472b6", // pink-400
                opacity: 0.8,
              }}
            />
          );
        }
        return (
          <div
            key={`h-${i}`}
            className="absolute"
            style={{
              top: guide.position,
              left: guide.start,
              height: 1,
              width: guide.end - guide.start,
              backgroundColor: "#f472b6", // pink-400
              opacity: 0.8,
            }}
          />
        );
      })}
    </div>
  );
}
