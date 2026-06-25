"use client";

import { useState } from "react";
import { Editor } from "@craftjs/core";
import ComponentLibrary from "@/components/builder/ComponentLibrary";
import DesignCanvas from "@/components/builder/DesignCanvas";
import PropertyEditor from "@/components/builder/PropertyEditor";
import ExportPanel from "@/components/builder/ExportPanel";
import BuilderToolbar from "@/components/builder/BuilderToolbar";
import ScreenManager, { type Screen } from "@/components/builder/ScreenManager";
import KeyboardShortcuts from "@/components/builder/KeyboardShortcuts";
import LayersPanel from "@/components/builder/LayersPanel";
import DeviceFrameSelector, {
  type DevicePreset,
} from "@/components/builder/DeviceFrameSelector";
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
  const [canvasSize, setCanvasSize] = useState({ width: 390, height: 844 });
  const [activeDevice, setActiveDevice] = useState("iPhone 14");
  const [rightTab, setRightTab] = useState<"properties" | "layers" | "device">("properties");

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
      <KeyboardShortcuts />
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
              canvasWidth={canvasSize.width}
              canvasHeight={canvasSize.height}
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
            <DesignCanvas
              mode={mode}
              zoom={zoom}
              canvasWidth={canvasSize.width}
              canvasHeight={canvasSize.height}
            />
          </div>
        </div>

        {/* Right Sidebar - Property Editor, Layers, Device */}
        <aside className="w-80 shrink-0 border-l border-white/5 bg-slate-900/50 flex flex-col">
          {/* Tab Bar */}
          <div className="flex border-b border-white/5">
            {(
              [
                { id: "properties" as const, label: "Properties", icon: "✏️" },
                { id: "layers" as const, label: "Layers", icon: "📑" },
                { id: "device" as const, label: "Device", icon: "📱" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setRightTab(tab.id)}
                className={`flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition ${
                  rightTab === tab.id
                    ? "border-b-2 border-indigo-500 text-indigo-300"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                <span className="text-[11px]">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {rightTab === "properties" && (
              <div className="space-y-6">
                <PropertyEditor />
                <div className="border-t border-white/5 pt-4">
                  <ExportPanel />
                </div>
              </div>
            )}
            {rightTab === "layers" && <LayersPanel />}
            {rightTab === "device" && (
              <DeviceFrameSelector
                activePreset={activeDevice}
                onSelect={(preset: DevicePreset) => {
                  setActiveDevice(preset.name);
                  setCanvasSize({
                    width: preset.width,
                    height: preset.height,
                  });
                }}
              />
            )}
          </div>
        </aside>
      </div>
    </Editor>
  );
}
