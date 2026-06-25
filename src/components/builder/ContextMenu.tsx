"use client";

import { useEffect, useRef, useCallback } from "react";
import type { ElementType } from "react";
import { createPortal } from "react-dom";
import { useEditor } from "@craftjs/core";
import { getClipboard, setClipboard } from "./clipboard";

interface ContextMenuProps {
  nodeId: string;
  x: number;
  y: number;
  onClose: () => void;
}

export default function ContextMenu({
  nodeId,
  x,
  y,
  onClose,
}: ContextMenuProps) {
  const { actions, query } = useEditor();
  const menuRef = useRef<HTMLDivElement>(null);
  const hasClipboard = getClipboard() !== null;

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    // Delay to prevent the triggering right-click from immediately closing
    let cancelled = false;
    const raf = requestAnimationFrame(() => {
      if (!cancelled) document.addEventListener("mousedown", handler);
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      document.removeEventListener("mousedown", handler);
    };
  }, [onClose]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  // Adjust position to stay on screen
  useEffect(() => {
    if (!menuRef.current) return;
    const el = menuRef.current;
    const rect = el.getBoundingClientRect();
    if (rect.right > window.innerWidth) {
      el.style.left = `${window.innerWidth - rect.width - 8}px`;
    }
    if (rect.bottom > window.innerHeight) {
      el.style.top = `${window.innerHeight - rect.height - 8}px`;
    }
  }, [x, y]);

  // ── Actions ────────────────────────────────────────────────────────

  const handleCopy = useCallback(() => {
    try {
      const node = query.node(nodeId).get();
      setClipboard({
        type: node.data.type as ElementType,
        props: { ...node.data.props },
        isCanvas: node.data.isCanvas,
        displayName: node.data.displayName ?? null,
        custom: node.data.custom ? { ...node.data.custom } : null,
      });
    } catch (err) {
      console.error("Copy failed:", err);
    }
    onClose();
  }, [nodeId, query, onClose]);

  const handlePaste = useCallback(() => {
    const data = getClipboard();
    if (!data) return;
    try {
      const freshNode = query
        .parseFreshNode({
          data: {
            type: data.type,
            props: { ...data.props },
            isCanvas: data.isCanvas,
            displayName: data.displayName ?? undefined,
            custom: data.custom,
            linkedNodes: {},
            nodes: [],
          },
        })
        .toNode();

      // Add as sibling of the right-clicked node
      const node = query.node(nodeId).get();
      const parentId = node.data.parent ?? undefined;
      actions.add(freshNode, parentId);
    } catch (err) {
      console.error("Paste failed:", err);
    }
    onClose();
  }, [nodeId, actions, query, onClose]);

  const handleDuplicate = useCallback(() => {
    try {
      const node = query.node(nodeId).get();
      const props = { ...node.data.props };

      // Offset absolute elements so duplicate is visible
      if (props._position === "absolute") {
        props._top = `${parseFloat((props._top as string) || "0") + 20}px`;
        props._left = `${parseFloat((props._left as string) || "0") + 20}px`;
      }

      const freshNode = query
        .parseFreshNode({
          data: {
            type: node.data.type,
            props,
            isCanvas: node.data.isCanvas,
            displayName: node.data.displayName ?? undefined,
            custom: node.data.custom,
            parent: node.data.parent,
            linkedNodes: {},
            nodes: [],
          },
        })
        .toNode();

      // Place right after the original
      const parentId = node.data.parent ?? undefined;
      const parent = parentId ? query.node(parentId).get() : null;
      const index = parent ? parent.data.nodes.indexOf(nodeId) + 1 : undefined;
      actions.add(freshNode, parentId, index);
    } catch (err) {
      console.error("Duplicate failed:", err);
    }
    onClose();
  }, [nodeId, actions, query, onClose]);

  const handleBringToFront = useCallback(() => {
    try {
      const node = query.node(nodeId).get();
      const parentId = node.data.parent;
      if (!parentId) return;
      const parent = query.node(parentId).get();
      const siblings: string[] = parent.data.nodes;

      if (node.data.props._position === "absolute") {
        // For absolute elements, bump z-index above all siblings
        const maxZ = Math.max(
          0,
          ...siblings.map((sId: string) => {
            try {
              return (
                parseInt(
                  String(query.node(sId).get().data.props._zIndex || "0"),
                  10,
                ) || 0
              );
            } catch {
              return 0;
            }
          }),
        );
        actions.setProp(nodeId, (p: Record<string, unknown>) => {
          p._zIndex = maxZ + 1;
        });
      } else {
        // For flex children, reorder to end
        const currentIndex = siblings.indexOf(nodeId);
        if (currentIndex < siblings.length - 1) {
          actions.move(nodeId, parentId, siblings.length);
        }
      }
    } catch (err) {
      console.error("Bring to front failed:", err);
    }
    onClose();
  }, [nodeId, actions, query, onClose]);

  const handleSendToBack = useCallback(() => {
    try {
      const node = query.node(nodeId).get();
      const parentId = node.data.parent;
      if (!parentId) return;
      const parent = query.node(parentId).get();
      const siblings: string[] = parent.data.nodes;

      if (node.data.props._position === "absolute") {
        const minZ = Math.min(
          0,
          ...siblings.map((sId: string) => {
            try {
              return (
                parseInt(
                  String(query.node(sId).get().data.props._zIndex || "0"),
                  10,
                ) || 0
              );
            } catch {
              return 0;
            }
          }),
        );
        actions.setProp(nodeId, (p: Record<string, unknown>) => {
          p._zIndex = minZ - 1;
        });
      } else {
        const currentIndex = siblings.indexOf(nodeId);
        if (currentIndex > 0) {
          actions.move(nodeId, parentId, 0);
        }
      }
    } catch (err) {
      console.error("Send to back failed:", err);
    }
    onClose();
  }, [nodeId, actions, query, onClose]);

  const handleDelete = useCallback(() => {
    if (nodeId && nodeId !== "ROOT") {
      actions.delete(nodeId);
    }
    onClose();
  }, [nodeId, actions, onClose]);

  // ── Render ─────────────────────────────────────────────────────────

  const menuX = Math.min(x, window.innerWidth - 220);
  const menuY = Math.min(y, window.innerHeight - 380);

  return createPortal(
    <div
      ref={menuRef}
      role="menu"
      style={{ position: "fixed", left: menuX, top: menuY, zIndex: 99999 }}
      className="min-w-[200px] rounded-xl border border-white/10 bg-slate-800/95 p-1.5 shadow-2xl shadow-black/50 backdrop-blur-xl"
      onContextMenu={(e) => e.preventDefault()}
    >
      <MenuItem icon="📋" label="Copy" shortcut="⌘C" onClick={handleCopy} />
      {hasClipboard && (
        <MenuItem
          icon="📌"
          label="Paste"
          shortcut="⌘V"
          onClick={handlePaste}
        />
      )}
      <MenuItem
        icon="📑"
        label="Duplicate"
        shortcut="⌘D"
        onClick={handleDuplicate}
      />
      <div className="mx-2 my-1.5 border-t border-white/5" />
      <MenuItem
        icon="⬆️"
        label="Bring to Front"
        onClick={handleBringToFront}
      />
      <MenuItem icon="⬇️" label="Send to Back" onClick={handleSendToBack} />
      <div className="mx-2 my-1.5 border-t border-white/5" />
      <MenuItem
        icon="🗑️"
        label="Delete"
        shortcut="Del"
        onClick={handleDelete}
        variant="danger"
      />
    </div>,
    document.body,
  );
}

// ── Menu Item ──────────────────────────────────────────────────────

function MenuItem({
  icon,
  label,
  shortcut,
  onClick,
  variant = "default",
}: {
  icon: string;
  label: string;
  shortcut?: string;
  onClick: () => void;
  variant?: "default" | "danger";
}) {
  return (
    <button
      role="menuitem"
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs transition-colors ${
        variant === "danger"
          ? "text-red-400 hover:bg-red-500/15 active:bg-red-500/25"
          : "text-slate-300 hover:bg-indigo-500/15 hover:text-white active:bg-indigo-500/25"
      }`}
    >
      <span className="w-4 text-center text-[11px]">{icon}</span>
      <span className="flex-1 font-medium">{label}</span>
      {shortcut && (
        <span className="text-[10px] text-slate-600">{shortcut}</span>
      )}
    </button>
  );
}
