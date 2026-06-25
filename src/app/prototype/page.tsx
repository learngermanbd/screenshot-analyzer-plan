"use client";

import { useState, useCallback } from "react";
import PrototypeCanvas, {
  type Interaction,
} from "@/components/prototype/PrototypeCanvas";
import InteractionPanel from "@/components/prototype/InteractionPanel";
import ScreenManager, { type Screen } from "@/components/builder/ScreenManager";
interface CanvasNode {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  props: Record<string, unknown>;
  style: Record<string, unknown>;
}

export default function PrototypePage() {
  const [screens, setScreens] = useState<Screen[]>([
    { id: "screen-1", name: "Login" },
    { id: "screen-2", name: "Home" },
    { id: "screen-3", name: "Profile" },
  ]);
  const [activeScreenId, setActiveScreenId] = useState("screen-1");
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [selectedNodeId, _setSelectedNodeId] = useState<string | null>(null);

  // Sample nodes for demo purposes
  const [screenNodes] = useState<Record<string, CanvasNode[]>>({
    "screen-1": [
      {
        id: "n1",
        type: "heading",
        x: 80,
        y: 100,
        width: 200,
        height: 40,
        props: { text: "Welcome Back" },
        style: { fontSize: "24px", fontWeight: "bold", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center" },
      },
      {
        id: "n2",
        type: "input",
        x: 50,
        y: 180,
        width: 260,
        height: 48,
        props: { text: "Email" },
        style: {},
      },
      {
        id: "n3",
        type: "input",
        x: 50,
        y: 248,
        width: 260,
        height: 48,
        props: { text: "Password" },
        style: {},
      },
      {
        id: "n4",
        type: "button",
        x: 50,
        y: 330,
        width: 260,
        height: 48,
        props: { text: "Sign In" },
        style: {},
      },
    ],
    "screen-2": [
      {
        id: "n5",
        type: "navbar",
        x: 0,
        y: 0,
        width: 340,
        height: 56,
        props: { text: "Home" },
        style: {},
      },
      {
        id: "n6",
        type: "card",
        x: 20,
        y: 80,
        width: 300,
        height: 120,
        props: { text: "Welcome Card" },
        style: {},
      },
      {
        id: "n7",
        type: "card",
        x: 20,
        y: 220,
        width: 300,
        height: 120,
        props: { text: "Recent Activity" },
        style: {},
      },
    ],
    "screen-3": [
      {
        id: "n8",
        type: "navbar",
        x: 0,
        y: 0,
        width: 340,
        height: 56,
        props: { text: "Profile" },
        style: {},
      },
      {
        id: "n9",
        type: "image",
        x: 120,
        y: 80,
        width: 100,
        height: 100,
        props: { text: "Avatar" },
        style: {},
      },
      {
        id: "n10",
        type: "text",
        x: 80,
        y: 200,
        width: 200,
        height: 30,
        props: { text: "John Doe" },
        style: { fontSize: "20px", fontWeight: "bold", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center" },
      },
    ],
  });

  const handleAddInteraction = useCallback(
    (interaction: Omit<Interaction, "id">) => {
      setInteractions([
        ...interactions,
        { ...interaction, id: `int-${Date.now()}` },
      ]);
    },
    [interactions]
  );

  const handleRemoveInteraction = useCallback(
    (id: string) => {
      setInteractions(interactions.filter((i) => i.id !== id));
    },
    [interactions]
  );

  const handleAddScreen = useCallback(() => {
    const newScreen: Screen = {
      id: `screen-${Date.now()}`,
      name: `Screen ${screens.length + 1}`,
    };
    setScreens([...screens, newScreen]);
    setActiveScreenId(newScreen.id);
  }, [screens]);

  const handleRemoveScreen = useCallback(
    (id: string) => {
      const filtered = screens.filter((s) => s.id !== id);
      setScreens(filtered);
      if (activeScreenId === id && filtered.length > 0) {
        setActiveScreenId(filtered[0].id);
      }
      setInteractions(interactions.filter((i) => i.targetScreenId !== id));
    },
    [screens, activeScreenId, interactions]
  );

  const prototypeScreens = screens.map((s) => ({
    ...s,
    nodes: screenNodes[s.id] || [],
  }));

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Left - Prototype Preview */}
      <div className="flex flex-1 flex-col items-center justify-center bg-slate-950 p-8">
        <div className="mb-6 text-center">
          <h1 className="mb-2 text-2xl font-extrabold text-white">
            📱 Prototype Mode
          </h1>
          <p className="text-sm text-slate-400">
            Tap elements to navigate between screens
          </p>
        </div>
        <PrototypeCanvas
          screens={prototypeScreens}
          interactions={interactions}
          onAddInteraction={handleAddInteraction}
        />
      </div>

      {/* Right Sidebar - Controls */}
      <aside className="w-80 shrink-0 border-l border-white/5 bg-slate-900/50 p-4">
        <div className="space-y-6">
          {/* Screens */}
          <div>
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-400">
              Screens
            </h3>
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

          <div className="border-t border-white/5 pt-4">
            <InteractionPanel
              interactions={interactions}
              screens={screens}
              selectedNodeId={selectedNodeId}
              onAdd={handleAddInteraction}
              onRemove={handleRemoveInteraction}
            />
          </div>

          {/* Actions */}
          <div className="border-t border-white/5 pt-4 space-y-2">
            <button
              onClick={() => setInteractions([])}
              className="w-full rounded-lg border border-white/10 bg-slate-800/50 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-700/50"
            >
              🔄 Reset Interactions
            </button>
            <a
              href="/builder"
              className="block w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-indigo-500"
            >
              ← Back to Builder
            </a>
          </div>
        </div>
      </aside>
    </div>
  );
}
