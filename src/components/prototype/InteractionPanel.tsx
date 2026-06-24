"use client";

import { cn } from "@/lib/utils";
import type { Interaction } from "./PrototypeCanvas";
import type { Screen } from "@/components/builder/ScreenManager";

interface InteractionPanelProps {
  interactions: Interaction[];
  screens: Screen[];
  selectedNodeId: string | null;
  onAdd: (interaction: Omit<Interaction, "id">) => void;
  onRemove: (id: string) => void;
  className?: string;
}

export default function InteractionPanel({
  interactions,
  screens,
  selectedNodeId,
  onAdd,
  onRemove,
  className,
}: InteractionPanelProps) {
  const nodeInteractions = selectedNodeId
    ? interactions.filter((i) => i.sourceNodeId === selectedNodeId)
    : [];

  return (
    <div className={cn("space-y-4", className)}>
      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
        Interactions
      </h3>

      {!selectedNodeId ? (
        <p className="text-sm text-slate-500">
          Select an element to add interactions
        </p>
      ) : (
        <div className="space-y-3">
          <div className="rounded-lg bg-slate-800/50 p-3">
            <div className="mb-2 text-xs font-bold text-slate-400">
              Add Interaction
            </div>
            <div className="space-y-2">
              <select
                id="trigger"
                className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none"
              >
                <option value="tap">On Tap</option>
                <option value="long-press">On Long Press</option>
                <option value="swipe-left">On Swipe Left</option>
                <option value="swipe-right">On Swipe Right</option>
              </select>
              <select
                id="target"
                className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none"
              >
                <option value="">Navigate to...</option>
                {screens.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <select
                id="transition"
                className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none"
              >
                <option value="slide-left">Slide Left</option>
                <option value="slide-right">Slide Right</option>
                <option value="fade">Fade</option>
                <option value="dissolve">Dissolve</option>
                <option value="none">None</option>
              </select>
              <button
                onClick={() => {
                  const trigger = (
                    document.getElementById("trigger") as HTMLSelectElement
                  )?.value as Interaction["trigger"];
                  const target = (
                    document.getElementById("target") as HTMLSelectElement
                  )?.value;
                  const transition = (
                    document.getElementById("transition") as HTMLSelectElement
                  )?.value as Interaction["transition"];
                  if (target) {
                    onAdd({
                      sourceNodeId: selectedNodeId,
                      trigger,
                      targetScreenId: target,
                      transition,
                    });
                  }
                }}
                className="w-full rounded-lg bg-purple-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-purple-500"
              >
                + Add Link
              </button>
            </div>
          </div>

          {/* Existing interactions for this node */}
          {nodeInteractions.length > 0 && (
            <div className="space-y-1">
              <div className="text-xs font-bold text-slate-500">
                Current Links
              </div>
              {nodeInteractions.map((interaction) => {
                const targetScreen = screens.find(
                  (s) => s.id === interaction.targetScreenId
                );
                return (
                  <div
                    key={interaction.id}
                    className="flex items-center justify-between rounded-lg bg-slate-800/50 px-3 py-2"
                  >
                    <div className="text-xs">
                      <span className="text-purple-400">
                        {interaction.trigger}
                      </span>
                      <span className="text-slate-600"> → </span>
                      <span className="text-white">
                        {targetScreen?.name || "Unknown"}
                      </span>
                      <span className="ml-2 text-slate-600">
                        ({interaction.transition})
                      </span>
                    </div>
                    <button
                      onClick={() => onRemove(interaction.id)}
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
