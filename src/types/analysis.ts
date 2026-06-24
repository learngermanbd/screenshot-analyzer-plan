export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DetectedElement {
  id: string;
  type:
    | "button"
    | "input"
    | "text"
    | "image"
    | "icon"
    | "card"
    | "navbar"
    | "container"
    | "list"
    | "modal"
    | "tab"
    | "toggle"
    | "slider"
    | "dropdown"
    | "avatar"
    | "badge"
    | "divider"
    | "unknown";
  label?: string;
  text?: string;
  bbox: BoundingBox;
  confidence: number;
  styles: ElementStyles;
  children?: DetectedElement[];
}

export interface ElementStyles {
  backgroundColor?: string;
  textColor?: string;
  color?: string;
  fontSize?: number;
  fontWeight?: string | number;
  fontFamily?: string;
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
  padding?: number[];
  margin?: number[];
  opacity?: number;
  shadow?: string;
}

export interface ColorInfo {
  hex: string;
  rgb: string;
  hsl: string;
  percentage: number;
  name?: string;
}

export interface AnalysisResult {
  id: string;
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  elements: DetectedElement[];
  colors: ColorInfo[];
  texts: TextRegion[];
  metadata: ImageMetadata;
  createdAt: string;
}

export interface TextRegion {
  text: string;
  bbox: BoundingBox;
  fontSize: number;
  fontWeight?: string;
  color?: string;
  confidence: number;
}

export interface ImageMetadata {
  deviceType?: string;
  screenWidth?: number;
  screenHeight?: number;
  platform?: "ios" | "android" | "web";
}

export interface CraftNode {
  id: string;
  type: string;
  props: Record<string, unknown>;
  children: CraftNode[];
  parentId?: string;
  displayName: string;
}

export interface DesignScreen {
  id: string;
  name: string;
  nodes: CraftNode[];
  width: number;
  height: number;
}

export interface PrototypeInteraction {
  id: string;
  triggerElementId: string;
  targetScreenId: string;
  transition: "slide-left" | "slide-right" | "slide-up" | "slide-down" | "fade" | "zoom" | "none";
  duration: number;
}

export type ExportFormat =
  | "react-tailwind"
  | "vue-tailwind"
  | "html-css"
  | "jetpack-compose"
  | "kotlin-xml"
  | "json";

export type CodeExportFormat = ExportFormat;

export interface ExportRequest {
  screens: DesignScreen[];
  format: ExportFormat;
}

export interface ExportResponse {
  code: string;
  format: ExportFormat;
  files: { path: string; content: string }[];
}
