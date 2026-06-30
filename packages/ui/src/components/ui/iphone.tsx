"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"

// CVA
const iphoneVariants = cva("relative mx-auto select-none", {
  variants: {
    size: {
      xs: "w-[200px] h-[390px]",
      sm: "w-[250px] h-[490px]",
      md: "w-[280px] h-[560px]",
      lg: "w-[310px] h-[620px]",
      xl: "w-[360px] h-[720px]",
    },
    color: {
      normal: "[--iphone-frame:#ffffff] [--iphone-border:#e4e4e7] [--iphone-btn:#d4d4d8] [--iphone-island:#09090b] dark:[--iphone-frame:#18181b] dark:[--iphone-border:#161616] dark:[--iphone-btn:#3f3f46]",
      black: "[--iphone-frame:#09090b] [--iphone-border:#18181b] [--iphone-btn:#27272a]   [--iphone-island:#000000]",
      light: "[--iphone-frame:#f4f4f5] [--iphone-border:#d4d4d8] [--iphone-btn:#a1a1aa]  [--iphone-island:#09090b]",
      silver: "[--iphone-frame:#e4e4e7] [--iphone-border:#d4d4d8] [--iphone-btn:#a1a1aa]  [--iphone-island:#09090b]",
      gold: "[--iphone-frame:#fef3c7] [--iphone-border:#fde68a] [--iphone-btn:#fcd34d]  [--iphone-island:#09090b]",
      blue: "[--iphone-frame:#172554] [--iphone-border:#1e3a8a] [--iphone-btn:#1d4ed8]  [--iphone-island:#09090b]",
    },
  },
  defaultVariants: {
    size: "md",
    color: "normal",
  },
})

// Exported types
export type IphoneSize  = NonNullable<VariantProps<typeof iphoneVariants>["size"]>
export type IphoneColor = NonNullable<VariantProps<typeof iphoneVariants>["color"]>

// Size lookups
const borderWidth: Record<IphoneSize, string> = {
  xs: "border-[6px]",
  sm: "border-[7px]",
  md: "border-[8px]",
  lg: "border-[9px]",
  xl: "border-[10px]",
}

const outerRadius: Record<IphoneSize, string> = {
  xs: "rounded-[2rem]",
  sm: "rounded-[2.25rem]",
  md: "rounded-[2.5rem]",
  lg: "rounded-[2.75rem]",
  xl: "rounded-[3rem]",
}

const innerRadius: Record<IphoneSize, string> = {
  xs: "rounded-[1.65rem]",
  sm: "rounded-[1.9rem]",
  md: "rounded-[2.15rem]",
  lg: "rounded-[2.35rem]",
  xl: "rounded-[2.6rem]",
}

const islandTokens: Record<IphoneSize, {
  top: string; h: string; w: string; cam: string; sensor: string
}> = {
  xs: { top: "top-[10px]", h: "h-[18px]", w: "w-[60px]",  cam: "size-[6px]",  sensor: "size-[4px]" },
  sm: { top: "top-[11px]", h: "h-[22px]", w: "w-[72px]",  cam: "size-[7px]",  sensor: "size-[4px]" },
  md: { top: "top-[12px]", h: "h-[26px]", w: "w-[84px]",  cam: "size-[8px]",  sensor: "size-[5px]" },
  lg: { top: "top-[13px]", h: "h-[28px]", w: "w-[92px]",  cam: "size-[9px]",  sensor: "size-[5px]" },
  xl: { top: "top-[14px]", h: "h-[30px]", w: "w-[104px]", cam: "size-[10px]", sensor: "size-[6px]" },
}

const buttonTokens: Record<IphoneSize, {
  w: string; l: string; r: string
  mute: string; vUp: string; vDn: string; pwr: string
}> = {
  xs: { w: "w-[3px]", l: "-left-[8px]",  r: "-right-[8px]",  mute: "top-[56px] h-[22px]",  vUp: "top-[88px] h-[32px]",  vDn: "top-[128px] h-[32px]", pwr: "top-[100px] h-[52px]" },
  sm: { w: "w-[3px]", l: "-left-[9px]",  r: "-right-[9px]",  mute: "top-[64px] h-[26px]",  vUp: "top-[100px] h-[38px]", vDn: "top-[146px] h-[38px]", pwr: "top-[114px] h-[60px]" },
  md: { w: "w-[4px]", l: "-left-[10px]", r: "-right-[10px]", mute: "top-[72px] h-[28px]",  vUp: "top-[112px] h-[42px]", vDn: "top-[162px] h-[42px]", pwr: "top-[128px] h-[68px]" },
  lg: { w: "w-[4px]", l: "-left-[11px]", r: "-right-[11px]", mute: "top-[80px] h-[30px]",  vUp: "top-[124px] h-[46px]", vDn: "top-[178px] h-[46px]", pwr: "top-[142px] h-[76px]" },
  xl: { w: "w-[4px]", l: "-left-[12px]", r: "-right-[12px]", mute: "top-[90px] h-[34px]",  vUp: "top-[140px] h-[52px]", vDn: "top-[200px] h-[52px]", pwr: "top-[160px] h-[88px]" },
}

// Props
export interface IphoneProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color">,
    VariantProps<typeof iphoneVariants> {
  gloss?: boolean
  showIsland?: boolean
  showButtons?: boolean
  children?: React.ReactNode
}

// Component
const Iphone = React.forwardRef<HTMLDivElement, IphoneProps>(({
      className,
      size = "md",
      color = "normal",
      gloss = false,
      showIsland = true,
      showButtons = true,
      children,
      ...props
    }, ref ) => {
      
    const s: IphoneSize  = size  ?? "md"
    const island  = islandTokens[s]
    const buttons = buttonTokens[s]

    const bezelStyle: React.CSSProperties = {
      backgroundColor: "var(--iphone-frame)",
      borderColor:     "var(--iphone-border)",
    }

    return (
      <div
        ref={ref}
        role="img"
        aria-label="iPhone device frame"
        className={cn(iphoneVariants({ size, color }), outerRadius[s], className)}
        {...props}
      >
        {/* Bezel */}
        <div
          style={bezelStyle}
          className={cn(
            "absolute inset-0 border shadow-xl",
            outerRadius[s],
            borderWidth[s]
          )}
        >
          {/* Optional gloss shine */}
          {gloss && (
            <div
              aria-hidden="true"
              className={cn(
                "pointer-events-none absolute inset-0 z-20 opacity-[0.07]",
                "b-linear-to-br from-white via-transparent to-transparent",
                outerRadius[s]
              )}
            />
          )}

          {/* Side buttons */}
          {showButtons && (
            <>
              <div aria-hidden="true" className={cn("absolute rounded-full bg-(--iphone-btn)", buttons.w, buttons.l, buttons.mute)} />
              <div aria-hidden="true" className={cn("absolute rounded-full bg-(--iphone-btn)", buttons.w, buttons.l, buttons.vUp)}  />
              <div aria-hidden="true" className={cn("absolute rounded-full bg-(--iphone-btn)", buttons.w, buttons.l, buttons.vDn)}  />
              <div aria-hidden="true" className={cn("absolute rounded-full bg-(--iphone-btn)", buttons.w, buttons.r,  buttons.pwr)} />
            </>
          )}

          {/* Screen */}
          <div className={cn("h-full w-full overflow-hidden bg-white dark:bg-black", innerRadius[s])}>
            <div className="relative h-full w-full">

              {/* Dynamic Island */}
              {showIsland && (
                <div
                  aria-hidden="true"
                  className={cn(
                    "absolute left-1/2 z-50 flex -translate-x-1/2 items-center justify-end gap-1 rounded-full px-2",
                    "bg-(--iphone-island)",
                    island.top, island.h, island.w
                  )}
                >
                  <div className={cn("rounded-full bg-zinc-900/80 ring-1 ring-white/10", island.cam)} />
                  <div className={cn("rounded-full bg-indigo-950/40", island.sensor)} />
                </div>
              )}

              {children}
            </div>
          </div>
        </div>
      </div>
    )
  }
)

Iphone.displayName = "Iphone"

export { Iphone, iphoneVariants }