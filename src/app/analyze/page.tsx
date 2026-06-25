"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import UploadZone from "@/components/upload/UploadZone";
import AnalysisCanvas from "@/components/analysis/AnalysisCanvas";
import ColorPalette from "@/components/analysis/ColorPalette";
import SpecsPanel from "@/components/analysis/SpecsPanel";
import WireframeView from "@/components/analysis/WireframeView";
import ElementsList from "@/components/analysis/ElementsList";
import InspectOverlay from "@/components/inspect/InspectOverlay";
import type { AnalysisResult, DetectedElement } from "@/types/analysis";

type ViewMode = "analysis" | "inspect";

export default function AnalyzePage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("analysis");
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const router = useRouter();

  const selectedElement = result?.elements.find((e) => e.id === selectedId) || null;

  const handleUpload = useCallback(async (file: File) => {
    setIsAnalyzing(true);
    setError(null);

    // Create local preview URL in case storage isn't configured
    const localPreview = URL.createObjectURL(file);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Analysis failed. Please try again.");
      }

      const data: AnalysisResult = await response.json();
      // Use local preview if storage returned no URL
      if (!data.imageUrl) {
        data.imageUrl = localPreview;
      } else {
        URL.revokeObjectURL(localPreview);
      }
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      URL.revokeObjectURL(localPreview);
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  if (!result) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-6">
        <div className="w-full max-w-2xl">
          <div className="mb-8 text-center">
            <h1 className="mb-3 text-3xl font-extrabold text-white">
              Analyze a Screenshot
            </h1>
            <p className="text-slate-400">
              Upload a mobile app screenshot to detect UI elements, extract
              colors, fonts, and measurements.
            </p>
          </div>
          <UploadZone onUpload={handleUpload} isAnalyzing={isAnalyzing} />
          {error && (
            <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-center text-sm text-red-300">
              {error}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Left Sidebar - Elements & Colors */}
      <aside className="w-72 shrink-0 border-r border-white/5 bg-slate-900/50 p-4">
        <ElementsList
          elements={result.elements}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
        <div className="mt-6">
          <ColorPalette colors={result.colors} />
        </div>
      </aside>

      {/* Center - Canvas */}
      <div className="flex-1 p-6">
        {/* Mode Toggle */}
        <div className="mb-4 flex items-center gap-2">
          <button
            onClick={() => setViewMode("analysis")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              viewMode === "analysis"
                ? "bg-indigo-600 text-white"
                : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            🔍 Analysis
          </button>
          <button
            onClick={() => setViewMode("inspect")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              viewMode === "inspect"
                ? "bg-indigo-600 text-white"
                : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            🔎 Inspect
          </button>
          <div className="ml-auto flex items-center gap-3">
            <span className="text-sm text-slate-500">
              {result.elements.length} elements detected
            </span>
            <button
              onClick={() => {
                if (result?.elements) {
                  setIsExporting(true);
                  sessionStorage.setItem("importedElements", JSON.stringify(result.elements));
                  router.push("/builder");
                }
              }}
              disabled={isExporting}
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-wait"
            >
              {isExporting ? (
                <>
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Importing…
                </>
              ) : (
                "Open in Builder →"
              )}
            </button>
          </div>
        </div>

        <AnalysisCanvas
          imageUrl={result.imageUrl}
          elements={result.elements}
          selectedId={selectedId}
          onSelect={setSelectedId}
          className="mb-6"
        />

        <WireframeView
          elements={result.elements}
          width={result.imageWidth}
          height={result.imageHeight}
        />
      </div>

      {/* Right Sidebar - Specs / Inspect */}
      <aside className="w-80 shrink-0 border-l border-white/5 bg-slate-900/50 p-4">
        {viewMode === "inspect" && selectedElement ? (
          <InspectOverlay element={selectedElement} />
        ) : (
          <SpecsPanel element={selectedElement} />
        )}
      </aside>
    </div>
  );
}
