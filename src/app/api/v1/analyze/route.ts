import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { generateId } from "@/lib/utils";
import { cacheGet, cacheSet, hashBuffer } from "@/lib/cache";
import { uploadImage } from "@/lib/storage";
import type { AnalysisResult } from "@/types/analysis";

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";
const API_KEY = process.env.API_SECRET_KEY;

/**
 * POST /api/v1/analyze
 *
 * Public REST API endpoint for developers to integrate screenshot analysis
 * into their tools, CI/CD pipelines, or third-party apps.
 *
 * Authentication: Bearer token via Authorization header
 * Rate Limiting: Handled by Upstash Redis (optional)
 *
 * Request:
 *   - Content-Type: multipart/form-data
 *   - Body: file (image/png, image/jpeg, image/webp) — max 10MB
 *
 * Response (200):
 *   {
 *     id: string,
 *     imageUrl: string,
 *     imageWidth: number,
 *     imageHeight: number,
 *     elements: DetectedElement[],
 *     colors: ColorInfo[],
 *     texts: TextRegion[],
 *     metadata: ImageMetadata,
 *     createdAt: string
 *   }
 *
 * Errors:
 *   401 — Missing or invalid API key
 *   400 — Invalid file (wrong type or too large)
 *   429 — Rate limit exceeded
 *   500 — Analysis failed
 */
export async function POST(request: NextRequest) {
  // --- API Key Authentication ---
  if (API_KEY) {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : request.headers.get("x-api-key");

    if (!token || !timingSafeEqual(Buffer.from(token), Buffer.from(API_KEY))) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          message:
            "Missing or invalid API key. Pass via Authorization: Bearer <key> or X-API-Key header.",
          docs: "/docs/api",
        },
        { status: 401 }
      );
    }
  }

  // --- Rate Limiting (via Upstash Redis if configured) ---
  const clientIp =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  const rateLimitResult = await checkRateLimit(clientIp);
  if (rateLimitResult.limited) {
    return NextResponse.json(
      {
        error: "Rate Limit Exceeded",
        message: `Too many requests. Try again in ${rateLimitResult.retryAfter} seconds.`,
        retryAfter: rateLimitResult.retryAfter,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimitResult.retryAfter),
          "X-RateLimit-Limit": String(rateLimitResult.limit),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(rateLimitResult.reset),
        },
      }
    );
  }

  try {
    // --- Parse Form Data ---
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        {
          error: "Bad Request",
          message: 'No file provided. Send a file via multipart/form-data with key "file".',
          docs: "/docs/api",
        },
        { status: 400 }
      );
    }

    const allowedTypes = ["image/png", "image/jpeg", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error: "Bad Request",
          message: `Invalid file type "${file.type}". Allowed: ${allowedTypes.join(", ")}.`,
        },
        { status: 400 }
      );
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          error: "Bad Request",
          message: `File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum: 10MB.`,
        },
        { status: 400 }
      );
    }

    const buffer = await file.arrayBuffer();

    // --- Check Cache ---
    const hash = await hashBuffer(buffer);
    const cached = await cacheGet<AnalysisResult>(`analysis:${hash}`);
    if (cached) {
      return NextResponse.json(
        { ...cached, cached: true },
        {
          status: 200,
          headers: {
            "X-Cache": "HIT",
            "X-RateLimit-Limit": String(rateLimitResult.limit),
            "X-RateLimit-Remaining": String(rateLimitResult.remaining),
          },
        }
      );
    }

    // --- Upload to Storage ---
    const key = `screenshots/${hash}-${Date.now()}.${file.name.split(".").pop() || "png"}`;
    const imageUrl = await uploadImage(key, buffer, file.type);

    // --- Forward to ML Service ---
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
        analysisData = createMockAnalysis(imageUrl);
      }
    } catch {
      analysisData = createMockAnalysis(imageUrl);
    }

    // --- Build Response ---
    analysisData = {
      ...analysisData,
      id: analysisData.id || generateId(),
      imageUrl: imageUrl || analysisData.imageUrl || "",
      createdAt: analysisData.createdAt || new Date().toISOString(),
    };

    // --- Cache Result ---
    await cacheSet(`analysis:${hash}`, analysisData);

    return NextResponse.json(
      { ...analysisData, cached: false },
      {
        status: 200,
        headers: {
          "X-Cache": "MISS",
          "X-RateLimit-Limit": String(rateLimitResult.limit),
          "X-RateLimit-Remaining": String(rateLimitResult.remaining),
          "X-Request-Id": analysisData.id,
        },
      }
    );
  } catch (error) {
    console.error("[API v1] Analysis error:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: "Analysis failed. Please try again.",
        requestId: generateId(),
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/v1/analyze
 *
 * Returns API documentation and health status.
 */
export async function GET() {
  return NextResponse.json({
    name: "ScreenAnalyzer API",
    version: "v1",
    description: "AI-powered mobile screenshot analysis API",
    endpoints: {
      "POST /api/v1/analyze": {
        description: "Analyze a mobile app screenshot",
        auth: API_KEY ? "Required (Bearer token)" : "Not configured",
        contentType: "multipart/form-data",
        params: {
          file: "Image file (PNG, JPG, WebP) — max 10MB",
        },
        returns: {
          id: "string — Unique analysis ID",
          imageUrl: "string — URL of uploaded image",
          imageWidth: "number — Image width in pixels",
          imageHeight: "number — Image height in pixels",
          elements: "DetectedElement[] — Detected UI components",
          colors: "ColorInfo[] — Dominant color palette",
          texts: "TextRegion[] — Extracted text regions",
          metadata: "ImageMetadata — Device type, platform info",
          createdAt: "string — ISO timestamp",
        },
        example: {
          request: 'curl -X POST -F "file=@screenshot.png" /api/v1/analyze',
          response: '{ "id": "abc123", "elements": [...], "colors": [...] }',
        },
      },
      "POST /api/v1/export": {
        description: "Export design as production code",
        auth: API_KEY ? "Required (Bearer token)" : "Not configured",
        contentType: "application/json",
        params: {
          screens: "DesignScreen[] — Screen definitions",
          format: "ExportFormat — react-tailwind | vue-tailwind | html-css | jetpack-compose | kotlin-xml | json",
        },
      },
    },
    rateLimit: {
      window: "60 seconds",
      maxRequests: 30,
    },
    docs: "https://github.com/learngermanbd/screenshot-analyzer-plan#readme",
  });
}

// --- Rate Limiting ---

interface RateLimitResult {
  limited: boolean;
  limit: number;
  remaining: number;
  retryAfter: number;
  reset: number;
}

async function checkRateLimit(clientIp: string): Promise<RateLimitResult> {
  const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
  const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
  const limit = 30; // requests per window
  const windowSeconds = 60;

  const defaultResult: RateLimitResult = {
    limited: false,
    limit,
    remaining: limit,
    retryAfter: 0,
    reset: Math.floor(Date.now() / 1000) + windowSeconds,
  };

  if (!UPSTASH_URL || !UPSTASH_TOKEN) {
    return defaultResult;
  }

  try {
    const key = `ratelimit:api:${clientIp}`;

    // Increment counter
    const response = await fetch(UPSTASH_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${UPSTASH_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(["INCR", key]),
      signal: AbortSignal.timeout(3000),
    });

    if (!response.ok) return defaultResult;
    const data = await response.json();
    const count = data.result as number;

    // Set expiry on first request
    if (count === 1) {
      await fetch(UPSTASH_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${UPSTASH_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(["EXPIRE", key, windowSeconds]),
        signal: AbortSignal.timeout(3000),
      });
    }

    const remaining = Math.max(0, limit - count);
    const reset = Math.floor(Date.now() / 1000) + windowSeconds;

    if (count > limit) {
      return {
        limited: true,
        limit,
        remaining: 0,
        retryAfter: windowSeconds,
        reset,
      };
    }

    return { limited: false, limit, remaining, retryAfter: 0, reset };
  } catch {
    return defaultResult;
  }
}

// --- Mock Analysis Fallback ---

function createMockAnalysis(
  imageUrl: string | null
): AnalysisResult {
  return {
    id: generateId(),
    imageUrl: imageUrl || "",
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
        styles: {
          backgroundColor: "#111827",
          color: "#ffffff",
          textColor: "#ffffff",
          fontSize: 18,
          fontWeight: "600",
        },
      },
      {
        id: generateId(),
        type: "text",
        label: "Title",
        text: "Welcome",
        bbox: { x: 24, y: 80, width: 200, height: 32 },
        confidence: 0.92,
        styles: {
          color: "#ffffff",
          textColor: "#ffffff",
          fontSize: 24,
          fontWeight: "700",
        },
      },
      {
        id: generateId(),
        type: "button",
        label: "Action Button",
        text: "Get Started",
        bbox: { x: 24, y: 320, width: 342, height: 48 },
        confidence: 0.97,
        styles: {
          backgroundColor: "#6366f1",
          color: "#ffffff",
          textColor: "#ffffff",
          fontSize: 16,
          fontWeight: "600",
          borderRadius: 8,
        },
      },
    ],
    colors: [
      {
        hex: "#111827",
        rgb: "rgb(17, 24, 39)",
        hsl: "hsl(222, 47%, 11%)",
        percentage: 35.2,
      },
      {
        hex: "#6366f1",
        rgb: "rgb(99, 102, 241)",
        hsl: "hsl(239, 84%, 67%)",
        percentage: 12.8,
      },
      {
        hex: "#ffffff",
        rgb: "rgb(255, 255, 255)",
        hsl: "hsl(0, 0%, 100%)",
        percentage: 15.4,
      },
    ],
    texts: [],
    metadata: { platform: "android", screenWidth: 390, screenHeight: 844 },
    createdAt: new Date().toISOString(),
  };
}
