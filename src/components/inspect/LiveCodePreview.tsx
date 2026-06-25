"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";

// Dynamically import Sandpack to avoid SSR issues (uses window/browser APIs)
const SandpackPreview = dynamic(() => import("./SandpackPreview"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[500px] items-center justify-center bg-slate-900">
      <div className="flex items-center gap-3 text-slate-400">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
        <span className="text-sm">Loading editor...</span>
      </div>
    </div>
  ),
});

interface LiveCodePreviewProps {
  code: string;
  language: string;
  className?: string;
}

type Tab = "preview" | "code" | "editor";

export default function LiveCodePreview({
  code,
  language,
  className,
}: LiveCodePreviewProps) {
  const [activeTab, setActiveTab] = useState<Tab>("preview");

  const canUseSandpack =
    language === "react-tailwind" ||
    language === "vue-tailwind" ||
    language === "html-css";

  const sandpackTemplate = useMemo(() => {
    if (language === "vue-tailwind") return "vue" as const;
    if (language === "react-tailwind") return "react" as const;
    return "vanilla" as const;
  }, [language]);

  const sandpackFiles: Record<string, string> = useMemo(() => {
    if (language === "react-tailwind") {
      // Clean up the exported React code for Sandpack
      let cleanedCode = code;
      // Remove import statements that Sandpack handles
      cleanedCode = cleanedCode.replace(/import\s+.*?from\s+["'].*?["'];?\n?/g, "");
      // Ensure there's a default export
      if (!cleanedCode.includes("export default")) {
        cleanedCode = cleanedCode.replace(
          /export\s+(default\s+)?function/,
          "export default function"
        );
      }
      if (!cleanedCode.includes("export default")) {
        cleanedCode = `export default ${cleanedCode}`;
      }

      // Prepend Tailwind CSS import to the component code
      const codeWithTailwind = `import './styles.css';\n\n${cleanedCode}`;

      return {
        "/App.tsx": codeWithTailwind,
        "/styles.css": `@tailwind base;\n@tailwind components;\n@tailwind utilities;\n\nbody {\n  margin: 0;\n  padding: 16px;\n  font-family: system-ui, -apple-system, sans-serif;\n  background: #0f172a;\n  color: #e2e8f0;\n}`,
        "/tailwind.config.js": `module.exports = {\n  content: ["./**/*.{js,ts,jsx,tsx}"],\n  theme: { extend: {} },\n  plugins: [],\n};`,
        "/postcss.config.js": `module.exports = {\n  plugins: {\n    tailwindcss: {},\n    autoprefixer: {},\n  },\n};`,
      };
    }

    if (language === "vue-tailwind") {
      const templateMatch = code.match(/<template>([\s\S]*?)<\/template>/);
      const scriptMatch = code.match(/<script[^>]*>([\s\S]*?)<\/script>/);
      const styleMatch = code.match(/<style[^>]*>([\s\S]*?)<\/style>/);

      const template = templateMatch ? templateMatch[1] : `<div>${code}</div>`;
      const script = scriptMatch
        ? scriptMatch[1]
        : `import { ref } from 'vue'`;
      const styles = styleMatch ? styleMatch[1] : "";

      return {
        "/src/App.vue": `<template>\n${template}\n</template>\n\n<script setup>\n${script}\n</script>\n\n<style>\n${styles}\n</style>`,
      };
    }

    // HTML/CSS
    const htmlFiles: Record<string, string> = {
      "/index.html": code,
    };
    return htmlFiles;
  }, [code, language]);

  const tabs: { id: Tab; label: string; icon: string }[] = canUseSandpack
    ? [
        { id: "preview", label: "Preview", icon: "▶" },
        { id: "editor", label: "Editor", icon: "✏️" },
        { id: "code", label: "Code", icon: "</>" },
      ]
    : [
        { id: "preview", label: "Preview", icon: "▶" },
        { id: "code", label: "Code", icon: "</>" },
      ];

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-white/10",
        className
      )}
    >
      {/* Tab Bar */}
      <div className="flex items-center justify-between border-b border-white/10 bg-slate-800/50 px-3 py-2">
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition",
                activeTab === tab.id
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-white"
              )}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded bg-slate-700/50 px-2 py-0.5 text-[10px] text-slate-500">
            {formatLabel(language)}
          </span>
          <button
            onClick={() => navigator.clipboard.writeText(code)}
            className="rounded px-2 py-1 text-[10px] text-slate-400 hover:bg-white/10 hover:text-white"
          >
            📋 Copy
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="relative">
        {activeTab === "preview" && canUseSandpack ? (
          <SandpackPreview
            template={sandpackTemplate}
            files={sandpackFiles}
            showNavigator={language === "react-tailwind"}
          />
        ) : activeTab === "editor" && canUseSandpack ? (
          <SandpackPreview
            template={sandpackTemplate}
            files={sandpackFiles}
            showEditor={true}
            showNavigator={false}
          />
        ) : activeTab === "preview" ? (
          <FallbackPreview code={code} language={language} />
        ) : (
          <pre className="max-h-[500px] overflow-auto bg-slate-900 p-4">
            <code className="text-xs leading-relaxed text-slate-300">
              {code}
            </code>
          </pre>
        )}
      </div>
    </div>
  );
}

// ─── Fallback Preview (for non-Sandpack formats) ────────────────────

function FallbackPreview({
  code,
  language,
}: {
  code: string;
  language: string;
}) {
  if (language === "jetpack-compose" || language === "kotlin-xml") {
    return <AndroidCodePreview code={code} language={language} />;
  }
  if (language === "json") {
    return <JsonPreview code={code} />;
  }
  return <IframePreview code={code} language={language} />;
}

function IframePreview({
  code,
  language,
}: {
  code: string;
  language: string;
}) {
  const html = useMemo(() => {
    if (language === "html-css" || language === "html") return code;
    return wrapInHtml(code);
  }, [code, language]);

  const blobUrl = useMemo(() => {
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    // Schedule revocation after current render cycle
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return url;
  }, [html]);

  return (
    <iframe
      src={blobUrl}
      className="h-[500px] w-full border-0 bg-white"
      sandbox="allow-scripts allow-same-origin"
      title="Live Preview"
    />
  );
}

function AndroidCodePreview({
  code,
  language,
}: {
  code: string;
  language: string;
}) {
  const isCompose = language === "jetpack-compose";
  return (
    <div className="bg-slate-950 p-6">
      <div className="mx-auto max-w-md rounded-3xl border-[3px] border-slate-700 bg-slate-900 p-5 shadow-2xl">
        <div className="mb-3 text-center">
          <span className="text-sm font-bold text-indigo-400">
            {isCompose ? "🤖 Jetpack Compose" : "📱 Kotlin/XML"}
          </span>
          <p className="mt-1 text-xs text-slate-500">
            Code would render natively on Android
          </p>
        </div>
        <pre className="max-h-[350px] overflow-auto rounded-xl bg-[#0d1117] p-4 text-xs leading-relaxed text-slate-300">
          {escapeHtml(code)}
        </pre>
      </div>
    </div>
  );
}

function JsonPreview({ code }: { code: string }) {
  const formatted = useMemo(() => {
    try {
      return JSON.stringify(JSON.parse(code), null, 2);
    } catch {
      return code;
    }
  }, [code]);

  return (
    <div className="bg-[#0d1117] p-5">
      <pre className="max-h-[500px] overflow-auto rounded-xl bg-[#161b22] p-4 font-mono text-xs leading-relaxed text-slate-300">
        {formatted}
      </pre>
    </div>
  );
}

// ─── Utilities ──────────────────────────────────────────────────────

function wrapInHtml(code: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <script src="https://cdn.tailwindcss.com"><\/script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, sans-serif; background: #0f172a; color: #e2e8f0; }
  </style>
</head>
<body>
  ${code}
</body>
</html>`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatLabel(language: string): string {
  const labels: Record<string, string> = {
    "react-tailwind": "React + Tailwind",
    "vue-tailwind": "Vue + Tailwind",
    "html-css": "HTML + CSS",
    "jetpack-compose": "Jetpack Compose",
    "kotlin-xml": "Kotlin/XML",
    json: "JSON",
  };
  return labels[language] || language;
}
