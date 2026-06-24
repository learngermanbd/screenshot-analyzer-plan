"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface CodePreviewProps {
  code: string;
  language: string;
  title?: string;
  className?: string;
}

export default function CodePreview({
  code,
  language,
  title,
  className,
}: CodePreviewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const ext =
      language === "react"
        ? "tsx"
        : language === "vue"
        ? "vue"
        : language === "compose"
        ? "kt"
        : language === "kotlin-xml"
        ? "xml"
        : "html";
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title || "component"}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={cn("overflow-hidden rounded-xl border border-white/10", className)}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 bg-slate-800/50 px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">{language}</span>
          {title && (
            <span className="text-xs font-semibold text-white">{title}</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            className="rounded-md px-2 py-1 text-[10px] font-semibold text-slate-400 transition hover:bg-white/10 hover:text-white"
          >
            {copied ? "✓ Copied" : "📋 Copy"}
          </button>
          <button
            onClick={handleDownload}
            className="rounded-md px-2 py-1 text-[10px] font-semibold text-slate-400 transition hover:bg-white/10 hover:text-white"
          >
            ⬇️ Download
          </button>
        </div>
      </div>

      {/* Code */}
      <pre className="max-h-[500px] overflow-auto bg-slate-900 p-4">
        <code className="text-xs leading-relaxed text-slate-300">
          {code}
        </code>
      </pre>
    </div>
  );
}
