"use client";

import { cn } from "@/lib/utils";

interface PropertyEditorProps {
  element: {
    id: string;
    type: string;
    props: Record<string, unknown>;
    style: Record<string, unknown>;
  } | null;
  onChange: (id: string, updates: { props?: Record<string, unknown>; style?: Record<string, unknown> }) => void;
  className?: string;
}

export default function PropertyEditor({
  element,
  onChange,
  className,
}: PropertyEditorProps) {
  if (!element) {
    return (
      <div className={cn("flex flex-col items-center justify-center p-8 text-slate-500", className)}>
        <div className="mb-3 text-4xl">✏️</div>
        <p className="text-sm">Select an element to edit properties</p>
      </div>
    );
  }

  const updateStyle = (key: string, value: unknown) => {
    onChange(element.id, {
      style: { ...element.style, [key]: value },
    });
  };

  const updateProp = (key: string, value: unknown) => {
    onChange(element.id, {
      props: { ...element.props, [key]: value },
    });
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-2">
        <span className="rounded-md bg-indigo-500/20 px-2 py-0.5 text-xs font-bold uppercase text-indigo-300">
          {element.type}
        </span>
        <span className="text-xs text-slate-500">#{element.id.slice(0, 8)}</span>
      </div>

      {/* Content */}
      {(element.type === "text" || element.type === "button" || element.type === "heading" || element.type === "label") && (
        <PropertyGroup label="Content">
          <PropertyInput
            label="Text"
            value={(element.props.text as string) || ""}
            onChange={(v) => updateProp("text", v)}
          />
        </PropertyGroup>
      )}

      {/* Layout */}
      <PropertyGroup label="Layout">
        <div className="grid grid-cols-2 gap-2">
          <PropertyInput
            label="Width"
            value={(element.style.width as string) || ""}
            onChange={(v) => updateStyle("width", v)}
            placeholder="auto"
          />
          <PropertyInput
            label="Height"
            value={(element.style.height as string) || ""}
            onChange={(v) => updateStyle("height", v)}
            placeholder="auto"
          />
        </div>
        <PropertyInput
          label="Padding"
          value={(element.style.padding as string) || ""}
          onChange={(v) => updateStyle("padding", v)}
          placeholder="0px"
        />
        <PropertyInput
          label="Margin"
          value={(element.style.margin as string) || ""}
          onChange={(v) => updateStyle("margin", v)}
          placeholder="0px"
        />
      </PropertyGroup>

      {/* Colors */}
      <PropertyGroup label="Appearance">
        <PropertyColor
          label="Background"
          value={(element.style.backgroundColor as string) || "#000000"}
          onChange={(v) => updateStyle("backgroundColor", v)}
        />
        <PropertyColor
          label="Text Color"
          value={(element.style.color as string) || "#ffffff"}
          onChange={(v) => updateStyle("color", v)}
        />
        <PropertyInput
          label="Border Radius"
          value={String(element.style.borderRadius || "")}
          onChange={(v) => updateStyle("borderRadius", v)}
          placeholder="0px"
        />
        <PropertyInput
          label="Font Size"
          value={String(element.style.fontSize || "")}
          onChange={(v) => updateStyle("fontSize", v)}
          placeholder="14px"
        />
        <PropertySelect
          label="Font Weight"
          value={String(element.style.fontWeight || "normal")}
          onChange={(v) => updateStyle("fontWeight", v)}
          options={["normal", "medium", "semibold", "bold"]}
        />
      </PropertyGroup>

      {/* Flex */}
      <PropertyGroup label="Flex">
        <PropertySelect
          label="Direction"
          value={String(element.style.flexDirection || "column")}
          onChange={(v) => updateStyle("flexDirection", v)}
          options={["row", "column", "row-reverse", "column-reverse"]}
        />
        <PropertySelect
          label="Align"
          value={String(element.style.alignItems || "stretch")}
          onChange={(v) => updateStyle("alignItems", v)}
          options={["flex-start", "center", "flex-end", "stretch", "space-between"]}
        />
        <PropertySelect
          label="Justify"
          value={String(element.style.justifyContent || "flex-start")}
          onChange={(v) => updateStyle("justifyContent", v)}
          options={["flex-start", "center", "flex-end", "space-between", "space-around"]}
        />
        <PropertyInput
          label="Gap"
          value={String(element.style.gap || "")}
          onChange={(v) => updateStyle("gap", v)}
          placeholder="0px"
        />
      </PropertyGroup>
    </div>
  );
}

function PropertyGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</h4>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function PropertyInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="text-[10px] text-slate-500">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-0.5 w-full rounded-lg border border-white/10 bg-slate-800/50 px-2.5 py-1.5 text-xs text-white placeholder-slate-600 outline-none focus:border-indigo-500/50"
      />
    </div>
  );
}

function PropertyColor({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-7 w-7 cursor-pointer rounded border border-white/10 bg-transparent"
      />
      <div className="flex-1">
        <label className="text-[10px] text-slate-500">{label}</label>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded border border-white/10 bg-slate-800/50 px-2 py-0.5 font-mono text-xs text-white outline-none focus:border-indigo-500/50"
        />
      </div>
    </div>
  );
}

function PropertySelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div>
      <label className="text-[10px] text-slate-500">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-0.5 w-full rounded-lg border border-white/10 bg-slate-800/50 px-2.5 py-1.5 text-xs text-white outline-none focus:border-indigo-500/50"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}
