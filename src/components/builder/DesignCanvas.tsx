"use client";

import { Frame, Element } from "@craftjs/core";
import { cn } from "@/lib/utils";
import {
  CraftContainer,
  CraftButton,
  CraftText,
  CraftHeading,
  CraftInput,
  CraftImage,
  CraftCard,
  CraftNavbar,
  CraftRow,
  CraftDivider,
} from "./CraftNodes";

interface DesignCanvasProps {
  mode: "freeform" | "grid";
  zoom: number;
  className?: string;
}

export default function DesignCanvas({
  mode,
  zoom,
  className,
}: DesignCanvasProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-white/10 bg-slate-900",
        mode === "grid" &&
          "bg-[length:16px_16px] bg-[image:radial-gradient(circle,rgba(255,255,255,.05)_1px,transparent_1px)]",
        className
      )}
    >
      <div
        style={{
          transform: `scale(${zoom / 100})`,
          transformOrigin: "top left",
          minHeight: "600px",
        }}
      >
        <Frame>
          <Element
            is={CraftContainer}
            canvas
            padding="20px"
            background="#0f172a"
            minHeight="560px"
            flexDirection="column"
            gap="12px"
          >
            <Element
              is={CraftNavbar}
              title="My App"
              background="#111827"
            />
            <Element
              is={CraftHeading}
              text="Welcome Back"
              fontSize="28px"
              color="#ffffff"
            />
            <Element
              is={CraftText}
              text="Sign in to continue"
              fontSize="14px"
              color="#94a3b8"
            />
            <Element
              is={CraftInput}
              placeholder="Email"
              width="100%"
            />
            <Element
              is={CraftInput}
              placeholder="Password"
              width="100%"
            />
            <Element
              is={CraftButton}
              text="Sign In"
              background="#6366f1"
              width="100%"
            />
            <Element
              is={CraftDivider}
              color="#334155"
            />
            <Element
              is={CraftText}
              text="Don't have an account? Sign up"
              fontSize="13px"
              color="#6366f1"
            />
          </Element>
        </Frame>
      </div>
    </div>
  );
}
