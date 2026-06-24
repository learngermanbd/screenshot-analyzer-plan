"use client";

import { useEditor } from "@craftjs/core";
import { cn } from "@/lib/utils";

interface PropertyEditorProps {
  className?: string;
}

export default function PropertyEditor({ className }: PropertyEditorProps) {
  const { selected, actions } = useEditor((state) => {
    const selectedIds = Array.from(state.events.selected);
    const id = selectedIds[0];
    return {
      selected: id
        ? {
            id,
            name: state.nodes[id].data.displayName,
            props: state.nodes[id].data.props as Record<string, unknown>,
          }
        : null,
    };
  });

  if (!selected) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center p-8 text-slate-500",
          className
        )}
      >
        <div className="mb-3 text-4xl">✏️</div>
        <p className="text-sm">Select an element to edit properties</p>
      </div>
    );
  }

  const updateProp = (key: string, value: unknown) => {
    actions.setProp(selected.id, (props: Record<string, unknown>) => {
      props[key] = value;
    });
  };

  const propEntries = Object.entries(selected.props).filter(
    ([key]) => !key.startsWith("_") && key !== "children" && key !== "parentNode" && key !== "is"
  );

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-2">
        <span className="rounded-md bg-indigo-500/20 px-2 py-0.5 text-xs font-bold uppercase text-indigo-300">
          {selected.name}
        </span>
        <span className="text-xs text-slate-500">
          #{selected.id.slice(0, 8)}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Properties
        </span>
        <button
          onClick={() => actions.delete(selected.id)}
          className="rounded-md bg-red-500/10 px-2 py-1 text-[10px] font-semibold text-red-400 transition hover:bg-red-500/20"
        >
          🗑 Delete
        </button>
      </div>

      <div className="space-y-2">
        {propEntries.map(([key, value]) => {
          if (typeof value === "boolean") {
            return (
              <div key={key} className="flex items-center justify-between">
                <label className="text-[10px] text-slate-500">
                  {formatLabel(key)}
                </label>
                <button
                  onClick={() => updateProp(key, !value)}
                  className={cn(
                    "relative h-5 w-9 rounded-full transition-colors",
                    value ? "bg-indigo-600" : "bg-slate-700"
                  )}
                >
                  <div
                    className={cn(
                      "absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform",
                      value ? "left-[18px]" : "left-0.5"
                    )}
                  />
                </button>
              </div>
            );
          }

          if (typeof value === "string" && value.startsWith("#")) {
            return (
              <div key={key} className="flex items-center gap-2">
                <input
                  type="color"
                  value={value}
                  onChange={(e) => updateProp(key, e.target.value)}
                  className="h-7 w-7 cursor-pointer rounded border border-white/10 bg-transparent"
                />
                <div className="flex-1">
                  <label className="text-[10px] text-slate-500">
                    {formatLabel(key)}
                  </label>
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => updateProp(key, e.target.value)}
                    className="w-full rounded border border-white/10 bg-slate-800/50 px-2 py-0.5 font-mono text-xs text-white outline-none focus:border-indigo-500/50"
                  />
                </div>
              </div>
            );
          }

          if (typeof value === "string" || typeof value === "number") {
            return (
              <div key={key}>
                <label className="text-[10px] text-slate-500">
                  {formatLabel(key)}
                </label>
                <input
                  type="text"
                  value={String(value)}
                  onChange={(e) =>
                    updateProp(
                      key,
                      typeof value === "number"
                        ? parseFloat(e.target.value) || 0
                        : e.target.value
                    )
                  }
                  className="mt-0.5 w-full rounded-lg border border-white/10 bg-slate-800/50 px-2.5 py-1.5 text-xs text-white placeholder-slate-600 outline-none focus:border-indigo-500/50"
                />
              </div>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
}

function formatLabel(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
}
