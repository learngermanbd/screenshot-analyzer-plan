import type { ElementType } from "react";

export interface ClipboardData {
  type: ElementType;
  props: Record<string, unknown>;
  isCanvas: boolean;
  displayName: string | null;
  custom: Record<string, unknown> | null;
}

let _clipboard: ClipboardData | null = null;

export function getClipboard(): ClipboardData | null {
  return _clipboard;
}

export function setClipboard(data: ClipboardData | null): void {
  _clipboard = data;
}
