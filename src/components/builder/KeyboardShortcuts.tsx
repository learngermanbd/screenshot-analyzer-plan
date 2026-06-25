"use client";

import { useEffect, useRef } from "react";
import { useEditor } from "@craftjs/core";

export default function KeyboardShortcuts() {
  const { actions, selected } = useEditor((state) => ({
    selected: Array.from(state.events.selected),
  }));

  // Use refs to avoid re-registering listener on every render
  const selectedRef = useRef(selected);
  selectedRef.current = selected;
  const actionsRef = useRef(actions);
  actionsRef.current = actions;

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
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}
