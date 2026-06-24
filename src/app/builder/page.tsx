"use client";

import { useState } from "react";
import { Editor } from "@craftjs/core";
import ComponentLibrary from "@/components/builder/ComponentLibrary";
import DesignCanvas from "@/components/builder/DesignCanvas";
import PropertyEditor from "@/components/builder/PropertyEditor";
import ExportPanel from "@/components/builder/ExportPanel";
import BuilderToolbar from "@/components/builder/BuilderToolbar";
import ScreenManager, { type Screen } from "@/components/builder/ScreenManager";
import {
  CraftContainer,
  CraftButton,
  CraftText,
  CraftHeading,
  CraftInput,
  CraftImage,
  CraftCard,
  CraftNavbar,
  CraftRow,
  CraftDivider,
} from "@/components/builder/CraftNodes";
import CanvasLoader from "@/components/builder/CanvasLoader";

export default function BuilderPage() {
  const [screens, setScreens] = useState<Screen[]>([
    { id: "screen-1", name: "Screen 1" },
  ]);
  const [activeScreenId, setActiveScreenId] = useState("screen-1");
  const [mode, setMode] = useState<"freeform" | "grid">("freeform");
  const [zoom, setZoom] = useState(100);

  const handleAddScreen = () => {
    const newScreen: Screen = {
      id: `screen-${Date.now()}`,
      name: `Screen ${screens.length + 1}`,
    };
    setScreens([...screens, newScreen]);
    setActiveScreenId(newScreen.id);
  };

  const handleRemoveScreen = (id: string) => {
    const filtered = screens.filter((s) => s.id !== id);
    setScreens(filtered);
    if (activeScreenId === id && filtered.length > 0) {
      setActiveScreenId(filtered[0].id);
    }
  };

  return (
    <Editor
      resolver={{
        CraftContainer,
        CraftButton,
        CraftText,
        CraftHeading,
        CraftInput,
        CraftImage,
        CraftCard,
        CraftNavbar,
        CraftRow,
        CraftDivider,
      }}
    >
      <CanvasLoader />
      <div className="flex min-h-[calc(100vh-4rem)]">
        {/* Left Sidebar - Component Library */}
        <aside className="w-64 shrink-0 border-r border-white/5 bg-slate-900/50 p-4">
          <ComponentLibrary />
        </aside>

        {/* Center - Canvas */}
        <div className="flex flex-1 flex-col">
          {/* Toolbar */}
          <div className="border-b border-white/5 bg-slate-900/30 px-4 py-2">
            <BuilderToolbar
              mode={mode}
              onModeChange={setMode}
              zoom={zoom}
              onZoomChange={setZoom}
              onPrototype={() => (window.location.href = "/prototype")}
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
                setScreens(
                  screens.map((s) => (s.id === id ? { ...s, name } : s))
                )
              }
            />
          </div>

          {/* Canvas Area */}
          <div className="flex-1 overflow-auto p-4">
            <DesignCanvas mode={mode} zoom={zoom} />
          </div>
        </div>

        {/* Right Sidebar - Property Editor & Export */}
        <aside className="w-80 shrink-0 border-l border-white/5 bg-slate-900/50 p-4 overflow-y-auto">
          <div className="space-y-6">
            <PropertyEditor />
            <div className="border-t border-white/5 pt-4">
              <ExportPanel />
            </div>
          </div>
        </aside>
      </div>
    </Editor>
  );
}
