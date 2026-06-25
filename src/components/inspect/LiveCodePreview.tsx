"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

interface LiveCodePreviewProps {
  code: string;
  language: string;
  className?: string;
}

export default function LiveCodePreview({
  code,
  language,
  className,
}: LiveCodePreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [activeTab, setActiveTab] = useState<"preview" | "code">("preview");
  const [error, setError] = useState<string | null>(null);

  const updatePreview = useCallback(() => {
    if (!iframeRef.current) return;
    setError(null);

    let html = "";

    if (language === "html-css" || language === "html") {
      html = code;
    } else if (language === "react-tailwind") {
      // Convert React JSX to a simple HTML preview
      html = generateReactPreview(code);
    } else if (language === "vue-tailwind") {
      html = generateVuePreview(code);
    } else if (language === "jetpack-compose" || language === "kotlin-xml") {
      // For Android code, show a styled preview representation
      html = generateAndroidPreview(code, language);
    } else if (language === "json") {
      html = generateJsonPreview(code);
    } else {
      html = wrapInHtml(code);
    }

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);

    iframeRef.current.onload = () => {
      URL.revokeObjectURL(url);
    };
    iframeRef.current.src = url;
  }, [code, language]);

  useEffect(() => {
    if (activeTab === "preview") {
      updatePreview();
    }
  }, [activeTab, updatePreview]);

  return (
    <div className={cn("overflow-hidden rounded-xl border border-white/10", className)}>
      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-white/10 bg-slate-800/50 px-3 py-2">
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab("preview")}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-medium transition",
              activeTab === "preview"
                ? "bg-indigo-600 text-white"
                : "text-slate-400 hover:text-white"
            )}
          >
            ▶ Live Preview
          </button>
          <button
            onClick={() => setActiveTab("code")}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-medium transition",
              activeTab === "code"
                ? "bg-indigo-600 text-white"
                : "text-slate-400 hover:text-white"
            )}
          >
            {`</>`} Code
          </button>
        </div>
        <button
          onClick={() => navigator.clipboard.writeText(code)}
          className="rounded px-2 py-1 text-[10px] text-slate-400 hover:bg-white/10 hover:text-white"
        >
          📋 Copy
        </button>
      </div>

      {/* Content */}
      {activeTab === "preview" ? (
        <div className="relative bg-white">
          <iframe
            ref={iframeRef}
            className="h-[500px] w-full border-0"
            sandbox="allow-scripts allow-same-origin"
            title="Live Preview"
          />
          {error && (
            <div className="absolute bottom-0 left-0 right-0 bg-red-500/90 p-2 text-xs text-white">
              {error}
            </div>
          )}
        </div>
      ) : (
        <pre className="max-h-[500px] overflow-auto bg-slate-900 p-4">
          <code className="text-xs leading-relaxed text-slate-300">{code}</code>
        </pre>
      )}
    </div>
  );
}

function wrapInHtml(code: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <script src="https://cdn.tailwindcss.com"></script>
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

function generateReactPreview(jsxCode: string): string {
  // Extract JSX content and convert to plain HTML for preview
  const htmlCode = jsxCode
    .replace(/import.*?;/g, "")
    .replace(/export\s+(default\s+)?function\s+\w+\s*\(\s*\)\s*\{?\s*return\s*\(/g, "")
    .replace(/\);\s*\}\s*$/g, "")
    .replace(/className=/g, "class=")
    .replace(/\{["']([^"']*)["']\}/g, '"$1"')
    .replace(/\{([^}]*)\}/g, "$1");

  return wrapInHtml(htmlCode);
}

function generateVuePreview(vueCode: string): string {
  const templateMatch = vueCode.match(/<template>([\s\S]*?)<\/template>/);
  const styleMatch = vueCode.match(/<style[^>]*>([\s\S]*?)<\/style>/);
  const template = templateMatch ? templateMatch[1] : vueCode;
  const styles = styleMatch ? `<style>${styleMatch[1]}</style>` : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, sans-serif; background: #0f172a; color: #e2e8f0; padding: 16px; }
    ${styles}
  </style>
</head>
<body>
  ${template}
</body>
</html>`;
}

function generateAndroidPreview(code: string, language: string): string {
  const isCompose = language === "jetpack-compose";
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, sans-serif; background: #0f172a; color: #e2e8f0; padding: 20px; }
    .phone-frame { max-width: 390px; margin: 0 auto; background: #1e293b; border-radius: 24px; padding: 20px; border: 3px solid #334155; }
    .title { font-size: 14px; font-weight: 700; color: #6366f1; margin-bottom: 12px; }
    .desc { font-size: 12px; color: #94a3b8; margin-bottom: 16px; }
    pre { background: #0d1117; padding: 16px; border-radius: 8px; overflow: auto; font-size: 11px; line-height: 1.5; color: #e2e8f0; }
    .keyword { color: #c084fc; }
    .string { color: #86efac; }
    .comment { color: #475569; }
  </style>
</head>
<body>
  <div class="phone-frame">
    <div class="title">${isCompose ? "🤖 Jetpack Compose" : "📱 Kotlin/XML"}</div>
    <div class="desc">Android preview — code would render natively on device</div>
    <pre>${escapeHtml(code)}</pre>
  </div>
</body>
</html>`;
}

function generateJsonPreview(jsonCode: string): string {
  let formatted: string;
  try {
    formatted = JSON.stringify(JSON.parse(jsonCode), null, 2);
  } catch {
    formatted = jsonCode;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Consolas', monospace; background: #0d1117; color: #e2e8f0; padding: 20px; }
    pre { font-size: 13px; line-height: 1.6; white-space: pre-wrap; word-break: break-word; }
    .key { color: #7dd3fc; }
    .string { color: #86efac; }
    .number { color: #fbbf24; }
    .boolean { color: #c084fc; }
    .null { color: #94a3b8; }
  </style>
</head>
<body>
  <pre>${syntaxHighlightJson(formatted)}</pre>
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

function syntaxHighlightJson(json: string): string {
  return json
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?)/g,
      (match) => {
        if (match.endsWith(":")) {
          return `<span class="key">${match}</span>`;
        }
        return `<span class="string">${match}</span>`;
      }
    )
    .replace(/\b(true|false)\b/g, '<span class="boolean">$1</span>')
    .replace(/\bnull\b/g, '<span class="null">null</span>')
    .replace(/\b(-?\d+\.?\d*)\b/g, '<span class="number">$1</span>');
}
