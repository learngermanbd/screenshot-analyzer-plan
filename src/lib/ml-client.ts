import type { AnalysisResult } from "@/types/analysis";

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";

export async function analyzeScreenshot(imageBuffer: ArrayBuffer): Promise<AnalysisResult> {
  const formData = new FormData();
  formData.append("file", new Blob([imageBuffer]), "screenshot.png");

  const response = await fetch(`${ML_SERVICE_URL}/analyze`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`ML service error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function healthCheck(): Promise<boolean> {
  try {
    const response = await fetch(`${ML_SERVICE_URL}/health`, {
      method: "GET",
      signal: AbortSignal.timeout(5000),
    });
    return response.ok;
  } catch {
    return false;
  }
}
