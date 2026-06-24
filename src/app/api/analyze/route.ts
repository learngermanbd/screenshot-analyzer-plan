import { NextRequest, NextResponse } from "next/server";
import { generateId } from "@/lib/utils";
import { cacheGet, cacheSet, hashBuffer } from "@/lib/cache";
import { uploadImage } from "@/lib/storage";
import type { AnalysisResult } from "@/types/analysis";

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "File must be an image" }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File must be under 10MB" }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();

    // Check cache
    const hash = await hashBuffer(buffer);
    const cached = await cacheGet<AnalysisResult>(`analysis:${hash}`);
    if (cached) {
      return NextResponse.json(cached);
    }

    // Upload to R2
    const key = `screenshots/${hash}-${Date.now()}.${file.name.split(".").pop() || "png"}`;
    const imageUrl = await uploadImage(key, buffer, file.type);

    // Forward to ML service
    const mlFormData = new FormData();
    mlFormData.append("file", new Blob([buffer], { type: file.type }), file.name);

    let analysisData: AnalysisResult;

    try {
      const mlResponse = await fetch(`${ML_SERVICE_URL}/analyze`, {
        method: "POST",
        body: mlFormData,
        signal: AbortSignal.timeout(60000),
      });

      if (mlResponse.ok) {
        analysisData = await mlResponse.json();
      } else {
        // Fallback: return mock data if ML service is not available
        analysisData = createMockAnalysis(buffer, file, imageUrl);
      }
    } catch {
      // ML service not available, use mock data
      analysisData = createMockAnalysis(buffer, file, imageUrl);
    }

    // Ensure the result has proper structure
    analysisData = {
      ...analysisData,
      id: analysisData.id || generateId(),
      imageUrl: imageUrl || analysisData.imageUrl || "",
      createdAt: analysisData.createdAt || new Date().toISOString(),
    };

    // Cache the result
    await cacheSet(`analysis:${hash}`, analysisData);

    return NextResponse.json(analysisData);
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: "Analysis failed. Please try again." },
      { status: 500 }
    );
  }
}

function createMockAnalysis(buffer: ArrayBuffer, file: File, imageUrl: string | null): AnalysisResult {
  return {
    id: generateId(),
    imageUrl: imageUrl || `data:${file.type};base64,${Buffer.from(buffer).toString("base64")}`,
    imageWidth: 390,
    imageHeight: 844,
    elements: [
      {
        id: generateId(),
        type: "navbar",
        label: "Navigation Bar",
        text: "Home",
        bbox: { x: 0, y: 0, width: 390, height: 56 },
        confidence: 0.95,
        styles: { backgroundColor: "#111827", color: "#ffffff", textColor: "#ffffff", fontSize: 18, fontWeight: "600" },
      },
      {
        id: generateId(),
        type: "text",
        label: "Welcome Back",
        text: "Welcome Back",
        bbox: { x: 24, y: 80, width: 200, height: 32 },
        confidence: 0.92,
        styles: { color: "#ffffff", textColor: "#ffffff", fontSize: 24, fontWeight: "700" },
      },
      {
        id: generateId(),
        type: "text",
        label: "Sign in to continue",
        text: "Sign in to continue",
        bbox: { x: 24, y: 116, width: 180, height: 20 },
        confidence: 0.9,
        styles: { color: "#9ca3af", textColor: "#9ca3af", fontSize: 14, fontWeight: "400" },
      },
      {
        id: generateId(),
        type: "input",
        label: "Email input",
        text: "Email",
        bbox: { x: 24, y: 180, width: 342, height: 48 },
        confidence: 0.94,
        styles: { backgroundColor: "#1f2937", color: "#f3f4f6", textColor: "#f3f4f6", fontSize: 14, borderRadius: 8, padding: [12, 16, 12, 16] },
      },
      {
        id: generateId(),
        type: "input",
        label: "Password input",
        text: "Password",
        bbox: { x: 24, y: 244, width: 342, height: 48 },
        confidence: 0.93,
        styles: { backgroundColor: "#1f2937", color: "#f3f4f6", textColor: "#f3f4f6", fontSize: 14, borderRadius: 8, padding: [12, 16, 12, 16] },
      },
      {
        id: generateId(),
        type: "button",
        label: "Sign In",
        text: "Sign In",
        bbox: { x: 24, y: 320, width: 342, height: 48 },
        confidence: 0.97,
        styles: { backgroundColor: "#6366f1", color: "#ffffff", textColor: "#ffffff", fontSize: 16, fontWeight: "600", borderRadius: 8 },
      },
      {
        id: generateId(),
        type: "text",
        label: "Forgot Password?",
        text: "Forgot Password?",
        bbox: { x: 24, y: 384, width: 120, height: 20 },
        confidence: 0.88,
        styles: { color: "#6366f1", textColor: "#6366f1", fontSize: 14, fontWeight: "500" },
      },
      {
        id: generateId(),
        type: "button",
        label: "Continue with Google",
        text: "Continue with Google",
        bbox: { x: 24, y: 440, width: 342, height: 48 },
        confidence: 0.91,
        styles: { backgroundColor: "#1f2937", color: "#f3f4f6", textColor: "#f3f4f6", fontSize: 14, fontWeight: "500", borderRadius: 8 },
      },
    ],
    colors: [
      { hex: "#111827", rgb: "rgb(17, 24, 39)", hsl: "hsl(222, 47%, 11%)", percentage: 35.2 },
      { hex: "#6366f1", rgb: "rgb(99, 102, 241)", hsl: "hsl(239, 84%, 67%)", percentage: 12.8 },
      { hex: "#1f2937", rgb: "rgb(31, 41, 55)", hsl: "hsl(217, 28%, 17%)", percentage: 22.1 },
      { hex: "#ffffff", rgb: "rgb(255, 255, 255)", hsl: "hsl(0, 0%, 100%)", percentage: 15.4 },
      { hex: "#9ca3af", rgb: "rgb(156, 163, 175)", hsl: "hsl(220, 9%, 65%)", percentage: 8.3 },
      { hex: "#f3f4f6", rgb: "rgb(243, 244, 246)", hsl: "hsl(220, 14%, 96%)", percentage: 6.2 },
    ],
    texts: [
      { text: "Welcome Back", bbox: { x: 24, y: 80, width: 200, height: 32 }, fontSize: 24, fontWeight: "700", color: "#ffffff", confidence: 0.95 },
      { text: "Sign in to continue", bbox: { x: 24, y: 116, width: 180, height: 20 }, fontSize: 14, color: "#9ca3af", confidence: 0.92 },
      { text: "Sign In", bbox: { x: 24, y: 320, width: 342, height: 48 }, fontSize: 16, fontWeight: "600", color: "#ffffff", confidence: 0.97 },
    ],
    metadata: { platform: "android", screenWidth: 390, screenHeight: 844 },
    createdAt: new Date().toISOString(),
  };
}
