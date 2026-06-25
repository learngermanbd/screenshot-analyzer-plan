"use client";

import { useEffect, useRef } from "react";
import type { ElementType } from "react";
import { useEditor } from "@craftjs/core";
import { getClipboard, setClipboard } from "./clipboard";

export default function KeyboardShortcuts() {
  const { actions, query, selected } = useEditor((state) => ({
    selected: Array.from(state.events.selected),
  }));

  // Use refs to avoid re-registering listener on every render
  const selectedRef = useRef(selected);
  const actionsRef = useRef(actions);
  const queryRef = useRef(query);

  useEffect(() => {
    selectedRef.current = selected;
    actionsRef.current = actions;
    queryRef.current = query;
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const currentActions = actionsRef.current;
      const target = e.target as HTMLElement;
      // Don't trigger shortcuts when typing in inputs
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable
      ) {
        return;
      }

      const isCtrl = e.ctrlKey || e.metaKey;
      const selectedId = selectedRef.current[0];

      // Delete selected node
      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedId && selectedId !== "ROOT") {
          e.preventDefault();
          currentActions.delete(selectedId);
        }
        return;
      }

      // Undo
      if (isCtrl && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        currentActions.history.undo();
        return;
      }

      // Redo (Ctrl+Y or Ctrl+Shift+Z)
      if (isCtrl && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault();
        currentActions.history.redo();
        return;
      }

      // Copy selected node
      if (isCtrl && e.key === "c") {
        if (selectedId && selectedId !== "ROOT") {
          e.preventDefault();
          const currentQuery = queryRef.current;
          try {
            const node = currentQuery.node(selectedId).get();
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
        }
        return;
      }

      // Paste from clipboard
      if (isCtrl && e.key === "v") {
        const data = getClipboard();
        if (data) {
          e.preventDefault();
          const currentActions = actionsRef.current;
          const currentQuery = queryRef.current;
          try {
            const freshNode = currentQuery
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
            // Paste as sibling of the selected node
            if (selectedId && selectedId !== "ROOT") {
              const parentNode = currentQuery.node(selectedId).get();
              currentActions.add(freshNode, parentNode.data.parent ?? undefined);
            } else {
              currentActions.add(freshNode);
            }
          } catch (err) {
            console.error("Paste failed:", err);
          }
        }
        return;
      }

      // Duplicate selected node
      if (isCtrl && e.key === "d") {
        if (selectedId && selectedId !== "ROOT") {
          e.preventDefault();
          const currentActions = actionsRef.current;
          const currentQuery = queryRef.current;
          try {
            const node = currentQuery.node(selectedId).get();
            const props = { ...node.data.props };
            if (props._position === "absolute") {
              props._top = `${parseFloat((props._top as string) || "0") + 20}px`;
              props._left = `${parseFloat((props._left as string) || "0") + 20}px`;
            }
            const freshNode = currentQuery
              .parseFreshNode({
                data: {
                  type: node.data.type,
                  props,
                  isCanvas: node.data.isCanvas,
                  displayName: node.data.displayName ?? undefined,
                  custom: node.data.custom,
                  parent: node.data.parent ?? undefined,
                  linkedNodes: {},
                  nodes: [],
                },
              })
              .toNode();
            const parentId = node.data.parent ?? undefined;
            const parent = parentId ? currentQuery.node(parentId).get() : null;
            const idx = parent ? parent.data.nodes.indexOf(selectedId) + 1 : undefined;
            currentActions.add(freshNode, parentId, idx);
          } catch (err) {
            console.error("Duplicate failed:", err);
          }
        }
        return;
      }

      // Arrow keys - nudge selected element
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        if (selectedId && selectedId !== "ROOT") {
          e.preventDefault();
          const delta = e.shiftKey ? 10 : 1;
          currentActions.setProp(selectedId, (props: Record<string, unknown>) => {
            // For absolute positioned elements, update _top/_left
            if (props._position === "absolute") {
              const currentTop = parseFloat((props._top as string) || "0");
              const currentLeft = parseFloat((props._left as string) || "0");
              if (e.key === "ArrowUp") props._top = `${currentTop - delta}px`;
              if (e.key === "ArrowDown") props._top = `${currentTop + delta}px`;
              if (e.key === "ArrowLeft") props._left = `${currentLeft - delta}px`;
              if (e.key === "ArrowRight") props._left = `${currentLeft + delta}px`;
            }
          });
        }
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return null;
}
