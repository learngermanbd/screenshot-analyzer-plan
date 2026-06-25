"use client";

import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface UploadZoneProps {
  onUpload: (file: File) => void;
  isAnalyzing?: boolean;
  className?: string;
}

export default function UploadZone({
  onUpload,
  isAnalyzing = false,
  className,
}: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  // Revoke object URL on unmount
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return;
      // Revoke previous preview to prevent memory leak
      if (preview) URL.revokeObjectURL(preview);
      const url = URL.createObjectURL(file);
      setPreview(url);
      onUpload(file);
    },
    [onUpload, preview]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 transition-all",
        isDragging
          ? "border-indigo-400 bg-indigo-500/10"
          : "border-slate-600 hover:border-slate-500",
        isAnalyzing && "pointer-events-none opacity-60",
        className
      )}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      {preview ? (
        <div className="relative w-full max-w-md">
          {/* eslint-disable-next-line @next/next/no-img-element -- blob URL preview, next/image cannot optimize local blobs */}
          <img
            src={preview}
            alt="Uploaded screenshot"
            className="w-full rounded-xl border border-white/10 shadow-2xl"
          />
          {isAnalyzing && (
            <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/60 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-3">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
                <span className="text-sm font-medium text-indigo-300">
                  Analyzing...
                </span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="mb-4 text-6xl">📸</div>
          <h3 className="mb-2 text-xl font-bold text-white">
            Drop your screenshot here
          </h3>
          <p className="mb-6 text-sm text-slate-400">
            PNG, JPG, or WebP — up to 10MB
          </p>
          <label className="cursor-pointer rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500">
            Choose File
            <input
              id="file-upload"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleChange}
              className="hidden"
            />
          </label>
        </>
      )}
    </div>
  );
}
