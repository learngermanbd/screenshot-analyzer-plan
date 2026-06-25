"use client";

import {
  Sandpack,
  SandpackProvider,
  SandpackCodeEditor,
  type SandpackTheme,
} from "@codesandbox/sandpack-react";

// Custom dark theme matching the app's design
const darkTheme: SandpackTheme = {
  colors: {
    surface1: "#0f172a",
    surface2: "#1e293b",
    surface3: "#334155",
    clickable: "#94a3b8",
    base: "#e2e8f0",
    disabled: "#475569",
    hover: "#f1f5f9",
    accent: "#6366f1",
    error: "#ef4444",
    errorSurface: "#1e293b",
  },
  syntax: {
    plain: "#e2e8f0",
    comment: { color: "#475569", fontStyle: "italic" },
    keyword: "#c084fc",
    tag: "#f472b6",
    punctuation: "#94a3b8",
    definition: "#7dd3fc",
    property: "#86efac",
    static: "#fbbf24",
    string: "#86efac",
  },
  font: {
    body: 'system-ui, -apple-system, sans-serif',
    mono: '"Fira Code", "Fira Mono", "DejaVu Sans Mono", monospace',
    size: "13px",
    lineHeight: "1.6",
  },
};

interface SandpackPreviewProps {
  template: "react" | "vue" | "vanilla";
  files: Record<string, string>;
  showEditor?: boolean;
  showNavigator?: boolean;
}

export default function SandpackPreview({
  template,
  files,
  showEditor = false,
  showNavigator = false,
}: SandpackPreviewProps) {
  if (showEditor) {
    return (
      <SandpackProvider
        template={template}
        files={files}
        theme={darkTheme}
      >
        <SandpackCodeEditor
          showTabs
          showLineNumbers
          showInlineErrors
          style={{ height: "500px" }}
        />
      </SandpackProvider>
    );
  }

  return (
    <Sandpack
      template={template}
      files={files}
      theme={darkTheme}
      customSetup={{
        dependencies: {
          tailwindcss: "^3.4.0",
          autoprefixer: "^10.4.0",
          postcss: "^8.4.0",
        },
      }}
      options={{
        showNavigator,
        showTabs: false,
        showLineNumbers: false,
        showInlineErrors: false,
        layout: "preview",
      }}
    />
  );
}
