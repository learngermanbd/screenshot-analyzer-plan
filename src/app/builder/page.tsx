"use client";

import { useState, useCallback } from "react";
import DesignCanvas, { type CanvasNode } from "@/components/builder/DesignCanvas";
import ComponentLibrary from "@/components/builder/ComponentLibrary";
import PropertyEditor from "@/components/builder/PropertyEditor";
import ExportPanel from "@/components/builder/ExportPanel";
import BuilderToolbar from "@/components/builder/BuilderToolbar";
import ScreenManager, { type Screen } from "@/components/builder/ScreenManager";
import CodePreview from "@/components/inspect/CodePreview";
import type { CodeExportFormat } from "@/types/analysis";

export default function BuilderPage() {
  const [screens, setScreens] = useState<Screen[]>([
    { id: "screen-1", name: "Screen 1" },
  ]);
  const [activeScreenId, setActiveScreenId] = useState("screen-1");
  const [nodes, setNodes] = useState<CanvasNode[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mode, setMode] = useState<"freeform" | "grid">("freeform");
  const [zoom, setZoom] = useState(100);
  const [history, setHistory] = useState<CanvasNode[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [exportedCode, setExportedCode] = useState<string | null>(null);
  const [exportFormat, setExportFormat] = useState<CodeExportFormat>("react-tailwind");

  const selectedNode = nodes.find((n) => n.id === selectedId) || null;

  const pushHistory = useCallback(
    (newNodes: CanvasNode[]) => {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newNodes);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
      setNodes(newNodes);
    },
    [history, historyIndex]
  );

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setNodes(history[historyIndex - 1]);
    }
  }, [historyIndex, history]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setNodes(history[historyIndex + 1]);
    }
  }, [historyIndex, history]);

  const handleAddComponent = useCallback(
    (type: string, props: Record<string, unknown>) => {
      const newNode: CanvasNode = {
        id: `node-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        type,
        x: 100 + Math.random() * 200,
        y: 100 + Math.random() * 200,
        width: type === "heading" || type === "paragraph" ? 200 : 150,
        height: type === "heading" ? 40 : type === "paragraph" ? 60 : 48,
        props: { text: props.text || "" },
        style: {},
        parentId: undefined,
      };
      pushHistory([...nodes, newNode]);
      setSelectedId(newNode.id);
    },
    [nodes, pushHistory]
  );

  const handleMove = useCallback(
    (id: string, x: number, y: number) => {
      pushHistory(
        nodes.map((n) => (n.id === id ? { ...n, x, y } : n))
      );
    },
    [nodes, pushHistory]
  );

  const handleResize = useCallback(
    (id: string, width: number, height: number) => {
      pushHistory(
        nodes.map((n) => (n.id === id ? { ...n, width, height } : n))
      );
    },
    [nodes, pushHistory]
  );

  const handlePropertyChange = useCallback(
    (id: string, updates: { props?: Record<string, unknown>; style?: Record<string, unknown> }) => {
      pushHistory(
        nodes.map((n) =>
          n.id === id
            ? {
                ...n,
                ...(updates.props && { props: { ...n.props, ...updates.props } }),
                ...(updates.style && { style: { ...n.style, ...updates.style } }),
              }
            : n
        )
      );
    },
    [nodes, pushHistory]
  );

  const handleAddScreen = useCallback(() => {
    const newScreen: Screen = {
      id: `screen-${Date.now()}`,
      name: `Screen ${screens.length + 1}`,
    };
    setScreens([...screens, newScreen]);
    setActiveScreenId(newScreen.id);
    pushHistory([]);
  }, [screens, pushHistory]);

  const handleRemoveScreen = useCallback(
    (id: string) => {
      const filtered = screens.filter((s) => s.id !== id);
      setScreens(filtered);
      if (activeScreenId === id) {
        setActiveScreenId(filtered[0]?.id || "");
      }
    },
    [screens, activeScreenId]
  );

  const handleExport = useCallback(
    async (format: CodeExportFormat) => {
      setIsExporting(true);
      setExportFormat(format);
      try {
        const response = await fetch("/api/export", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nodes, format }),
        });
        if (!response.ok) throw new Error("Export failed");
        const data = await response.json();
        setExportedCode(data.code);
      } catch {
        // Fallback: generate simple HTML client-side
        const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Exported Design</title>
  <script src="https://cdn.tailwindcss.com"><\/script>
</head>
<body class="bg-slate-900 min-h-screen p-8">
${nodes.map((n) => `  <div style="position:absolute;left:${n.x}px;top:${n.y}px;width:${n.width}px;height:${n.height}px;" class="text-white">${(n.props.text as string) || n.type}</div>`).join("\n")}
</body>
</html>`;
        setExportedCode(html);
      } finally {
        setIsExporting(false);
      }
    },
    [nodes]
  );

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Left Sidebar - Component Library */}
      <aside className="w-64 shrink-0 border-r border-white/5 bg-slate-900/50 p-4">
        <ComponentLibrary
          onAddComponent={handleAddComponent}
          detectedComponents={[]}
        />
      </aside>

      {/* Center - Canvas */}
      <div className="flex flex-1 flex-col">
        {/* Toolbar */}
        <div className="border-b border-white/5 bg-slate-900/30 px-4 py-2">
          <BuilderToolbar
            mode={mode}
            onModeChange={setMode}
            onUndo={handleUndo}
            onRedo={handleRedo}
            zoom={zoom}
            onZoomChange={setZoom}
            onExport={() => handleExport("react-tailwind")}
            onPrototype={() => window.location.href = "/prototype"}
          />
        </div>

        {/* Screen Tabs */}
        <div className="border-b border-white/5 bg-slate-900/20 px-4 py-2">
          <ScreenManager
            screens={screens}
            activeId={activeScreenId}
            onSelect={setActiveScreenId}
            onAdd={handleAddScreen}
            onRemove={handleRemoveScreen}
            onRename={(id, name) =>
              setScreens(screens.map((s) => (s.id === id ? { ...s, name } : s)))
            }
          />
        </div>

        {/* Canvas Area */}
        <div className="flex-1 overflow-hidden p-4" style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top left" }}>
          <DesignCanvas
            nodes={nodes}
            selectedId={selectedId}
            mode={mode}
            onSelect={setSelectedId}
            onMove={handleMove}
            onResize={handleResize}
          />
        </div>

        {/* Exported Code Preview */}
        {exportedCode && (
          <div className="border-t border-white/5 p-4">
            <CodePreview
              code={exportedCode}
              language={exportFormat}
              title="Exported Design"
            />
          </div>
        )}
      </div>

      {/* Right Sidebar - Property Editor & Export */}
      <aside className="w-72 shrink-0 border-l border-white/5 bg-slate-900/50 p-4">
        <div className="space-y-6">
          <PropertyEditor
            element={
              selectedNode
                ? {
                    id: selectedNode.id,
                    type: selectedNode.type,
                    props: selectedNode.props,
                    style: selectedNode.style,
                  }
                : null
            }
            onChange={handlePropertyChange}
          />
          <div className="border-t border-white/5 pt-4">
            <ExportPanel onExport={handleExport} isExporting={isExporting} />
          </div>
        </div>
      </aside>
    </div>
  );
}
