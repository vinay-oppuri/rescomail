"use client";

import { useTheme } from "next-themes";
import {
  ChromaFlow,
  CursorRipples,
  DotGrid,
  LinearGradient,
  Shader,
} from "shaders/react";

type CursorTrailEffectProps = {
  fixed?: boolean;
};

export function CursorTrailEffect({ fixed = false }: CursorTrailEffectProps) {
  const { resolvedTheme } = useTheme();
  const isLightTheme = resolvedTheme === "light";

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none inset-0 overflow-hidden bg-transparent motion-reduce:hidden [@media(hover:none)]:hidden [@media(pointer:coarse)]:hidden ${fixed ? "fixed z-[5]" : "absolute z-0"}`}
    >
      <Shader className="pointer-events-none absolute inset-0 block h-full w-full bg-transparent">
        {/* ChromaFlow drives DotGrid, which masks the theme-aware color layer. */}
        <DotGrid
          id="trailDots"
          density={40}
          dotSize={{
            type: "map",
            source: "trailFlow",
            channel: "alpha",
            inputMax: 1,
            inputMin: 0,
            outputMax: 1,
            outputMin: 0,
          }}
          twinkle={0.9}
          visible={false}
        />
        <ChromaFlow
          id="trailFlow"
          intensity={1.4}
          radius={2.9}
          visible={false}
        />
        <LinearGradient
          colorA={isLightTheme ? "#0284c7" : "#ffffff"}
          colorB={isLightTheme ? "#38bdf8" : "#ffffff"}
          colorSpace="hsl"
          end={{ x: 1, y: 0 }}
          maskSource="trailDots"
          start={{ x: 0, y: 1 }}
        />
        <CursorRipples />
      </Shader>
    </div>
  );
}
