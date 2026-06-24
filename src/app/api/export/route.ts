import { NextRequest, NextResponse } from "next/server";
import { generateCode } from "@/lib/code-generator";
import type { ExportFormat, DesignScreen } from "@/types/analysis";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Accept both { screens, format } and { nodes, format }
    let screens: DesignScreen[];
    const format = body.format as ExportFormat;

    if (body.screens) {
      screens = body.screens;
    } else if (body.nodes) {
      // Convert flat nodes array to a DesignScreen
      screens = [
        {
          id: "screen-1",
          name: "Main",
          nodes: body.nodes.map(
            (n: { id: string; type: string; props: Record<string, unknown> }) => ({
              id: n.id,
              type: n.type,
              props: n.props,
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
        { error: "No screens or nodes provided" },
        { status: 400 }
      );
    }

    if (!format) {
      return NextResponse.json(
        { error: "No export format specified" },
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
    if (!validFormats.includes(format)) {
      return NextResponse.json(
        {
          error: `Invalid format. Must be one of: ${validFormats.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const code = await generateCode(screens, format);

    return NextResponse.json({
      code,
      format,
      files: [
        {
          path: `export.${
            format === "json"
              ? "json"
              : format === "jetpack-compose" || format === "kotlin-xml"
              ? "kt"
              : format === "vue-tailwind"
              ? "vue"
              : format === "html-css"
              ? "html"
              : "tsx"
          }`,
          content: code,
        },
      ],
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Export failed" },
      { status: 500 }
    );
  }
}
