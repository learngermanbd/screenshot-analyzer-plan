import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { generateCode } from "@/lib/code-generator";
import type { ExportFormat, DesignScreen } from "@/types/analysis";

const API_KEY = process.env.API_SECRET_KEY;

/**
 * POST /api/v1/export
 *
 * Public REST API endpoint for code export.
 *
 * Authentication: Bearer token via Authorization header
 *
 * Request:
 *   - Content-Type: application/json
 *   - Body: { screens: DesignScreen[], format: ExportFormat }
 *
 * Supported formats:
 *   - react-tailwind, vue-tailwind, html-css,
 *   - jetpack-compose, kotlin-xml, json
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
          message: "Missing or invalid API key.",
          docs: "/docs/api",
        },
        { status: 401 }
      );
    }
  }

  try {
    const body = await request.json();
    let screens: DesignScreen[];
    const format = body.format as ExportFormat;

    if (body.screens) {
      screens = body.screens;
    } else if (body.nodes) {
      screens = [
        {
          id: "screen-1",
          name: "Main",
          nodes: body.nodes.map(
            (n: {
              id: string;
              type: string;
              props: Record<string, unknown>;
            }) => ({
              id: n.id,
              type: n.type,
              props: n.props || {},
              children: [],
              displayName: n.type,
            })
          ),
          width: 390,
          height: 844,
        },
      ];
    } else {
      return NextResponse.json(
        { error: "Bad Request", message: "Provide screens or nodes array." },
        { status: 400 }
      );
    }

    const validFormats: ExportFormat[] = [
      "react-tailwind",
      "vue-tailwind",
      "html-css",
      "jetpack-compose",
      "kotlin-xml",
      "json",
    ];
    if (!format || !validFormats.includes(format)) {
      return NextResponse.json(
        {
          error: "Bad Request",
          message: `Invalid format. Must be one of: ${validFormats.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const code = await generateCode(screens, format);

    const ext =
      format === "json"
        ? "json"
        : format === "jetpack-compose" || format === "kotlin-xml"
          ? "kt"
          : format === "vue-tailwind"
            ? "vue"
            : format === "html-css"
              ? "html"
              : "tsx";

    return NextResponse.json({
      code,
      format,
      files: [{ path: `export.${ext}`, content: code }],
    });
  } catch (error) {
    console.error("[API v1] Export error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Export failed." },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    name: "ScreenAnalyzer Export API",
    version: "v1",
    supportedFormats: [
      "react-tailwind",
      "vue-tailwind",
      "html-css",
      "jetpack-compose",
      "kotlin-xml",
      "json",
    ],
  });
}
