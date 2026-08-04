"use client";

import React, { useState, useRef } from "react";
import { Zap, Mail, ShieldCheck, FileText, CheckCircle2, Sparkles, Send } from "lucide-react";
import { cn } from "@repo/ui/lib/utils";

interface BentoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

function BentoCard({ children, className, ...props }: BentoCardProps) {
  const [transformClass, setTransformClass] = useState("translate-x-0 translate-y-0");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const w = rect.width;
    const h = rect.height;

    const distances = {
      top: y,
      bottom: h - y,
      left: x,
      right: w - x,
    };

    const closestEdge = Object.keys(distances).reduce((a, b) =>
      distances[a as keyof typeof distances] < distances[b as keyof typeof distances] ? a : b
    );

    switch (closestEdge) {
      case "top":
        setTransformClass("translate-y-2");
        break;
      case "bottom":
        setTransformClass("-translate-y-2");
        break;
      case "left":
        setTransformClass("translate-x-2");
        break;
      case "right":
        setTransformClass("-translate-x-2");
        break;
      default:
        setTransformClass("translate-x-0 translate-y-0");
    }

    timeoutRef.current = setTimeout(() => {
      setTransformClass("translate-x-0 translate-y-0");
    }, 200);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setTransformClass("translate-x-0 translate-y-0");
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-foreground/5 transition-transform duration-300 ease-out",
        transformClass,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function BentoFeatures() {
  return (
    <section id="features" className="py-12 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 md:mb-12">
          <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-primary mb-2 md:mb-3">Features</p>
          <h2 className="text-xl md:text-3xl font-extrabold tracking-tight text-foreground mb-3 md:mb-4">
            Everything you need to succeed
          </h2>
          <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
            Powerful AI tools built to give you an edge in the competitive job market.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">

          {/* Card 1: ATS — Wide (spans 2 cols on md+) */}
          <BentoCard className="bg-linear-to-b from-violet-500/15 dark:from-violet-500/5 to-violet-500/5 dark:to-violet-500/1 backdrop-blur-xl md:col-span-2 flex flex-col sm:flex-row">
            {/* Text side */}
            <div className="p-5 md:p-8 flex flex-col justify-center sm:min-w-50 sm:max-w-60 shrink-0">
              <div className="w-8 h-8 md:w-10 md:h-10 flex rounded-sm bg-violet-500/10 text-violet-500 items-center justify-center mb-3 md:mb-5">
                <Zap className="h-4 w-4 md:h-5 md:w-5" />
              </div>
              <h3 className="text-base md:text-lg font-bold mb-1.5 md:mb-2 text-violet-500/80">ATS Semantic Matching</h3>
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                Go beyond keywords. Our AI understands context to ensure your resume truly matches job requirements.
              </p>
            </div>

            {/* Divider — vertical on sm+, horizontal on mobile */}
            <div className="hidden sm:block w-px bg-border/50 my-6" />
            <div className="sm:hidden mx-5 h-px bg-border/50" />

            {/* Mockup side */}
            <div className="flex-1 p-4 md:p-6 flex items-center justify-center">
              <div className="w-full rounded-sm border border-border/50 bg-background/60 overflow-hidden">
                <div className="h-8 border-b border-border/50 flex items-center px-3 gap-1.5 bg-muted/20">
                  <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-destructive/50" />
                  <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-yellow-500/50" />
                  <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-green-500/50" />
                  <span className="ml-2 text-[9px] text-muted-foreground font-mono">resume_scan.pdf</span>
                </div>
                <div className="p-3 md:p-5 flex gap-3 md:gap-5">
                  {/* Score ring */}
                  <div className="flex flex-col items-center gap-1 shrink-0">
                    <div className="relative w-12 h-12 md:w-16 md:h-16 flex items-center justify-center">
                      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 64 64">
                        <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="none" className="text-muted" />
                        <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="none" className="text-primary" strokeDasharray="176" strokeDashoffset="14" strokeLinecap="round" />
                      </svg>
                      <span className="text-xs md:text-sm font-bold text-foreground">92%</span>
                    </div>
                    <span className="text-[8px] md:text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Match</span>
                  </div>
                  {/* Keywords */}
                  <div className="flex-1 flex flex-col gap-1.5 md:gap-2 justify-center">
                    <div className="h-1.5 w-3/4 rounded-full bg-muted" />
                    <div className="h-1.5 w-full rounded-full bg-muted" />
                    <div className="mt-1.5 flex flex-wrap gap-1 md:gap-1.5">
                      <span className="px-1.5 py-0.5 rounded-full bg-green-500/10 text-green-500 text-[8px] md:text-[9px] font-semibold border border-green-500/20 flex items-center gap-0.5">
                        <CheckCircle2 className="w-2 h-2" /> React.js
                      </span>
                      <span className="px-1.5 py-0.5 rounded-full bg-green-500/10 text-green-500 text-[8px] md:text-[9px] font-semibold border border-green-500/20 flex items-center gap-0.5">
                        <CheckCircle2 className="w-2 h-2" /> TypeScript
                      </span>
                      <span className="px-1.5 py-0.5 rounded-full bg-yellow-500/10 text-yellow-500 text-[8px] md:text-[9px] font-semibold border border-yellow-500/20 flex items-center gap-0.5">
                        <Sparkles className="w-2 h-2" /> System Design
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </BentoCard>

          {/* Card 2: Cold Emails — Tall (spans 2 rows on md+) */}
          <BentoCard className="bg-linear-to-b from-blue-500/15 dark:from-blue-500/5 via-blue-500/10 dark:via-blue-500/3 to-blue-500/5 dark:to-blue-500/1 backdrop-blur-xl md:row-span-2 flex flex-col">
            <div className="p-5 md:p-8 flex flex-col shrink-0">
              <div className="w-8 h-8 md:w-10 md:h-10 flex rounded-sm bg-blue-500/10 text-blue-500 items-center justify-center mb-3 md:mb-5">
                <Mail className="h-4 w-4 md:h-5 md:w-5" />
              </div>
              <h3 className="text-base md:text-lg font-bold mb-1.5 md:mb-2 text-blue-500/80">1-Click Cold Emails</h3>
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                Personalized outreach emails that get opened. AI analyzes company context to craft the perfect message.
              </p>
            </div>

            <div className="mx-5 md:mx-8 h-px bg-border/50" />

            {/* Email mockup */}
            <div className="flex-1 p-4 md:p-6 flex items-stretch min-h-50">
              <div className="w-full rounded-sm border border-border/50 bg-background/60 overflow-hidden flex flex-col">
                <div className="px-3 py-2 border-b border-border/50 flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span className="w-5 shrink-0">To:</span>
                    <span className="px-1.5 py-0.5 rounded-sm bg-muted/50 border border-border/50 text-foreground truncate">hiring@stripe.com</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span className="w-5 shrink-0">Sub:</span>
                    <span className="text-foreground font-medium truncate">Passionate Frontend Engineer</span>
                  </div>
                </div>
                <div className="p-3 flex-1 flex flex-col relative">
                  <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-blue-500 text-white rounded-full text-[8px] font-bold flex items-center gap-0.5 shadow-md shadow-blue-500/20 animate-pulse">
                    <Sparkles className="w-2 h-2" /> AI
                  </div>
                  <div className="text-[10px] text-muted-foreground leading-relaxed space-y-1.5 mt-3">
                    <p>Hi team,</p>
                    <p className="text-foreground bg-blue-500/10 border-b border-blue-500/30 px-1 py-0.5 rounded-sm inline-block">
                      I noticed you&apos;re expanding the billing dashboard team.
                    </p>
                    <p>With 4 years building React apps at scale, I&apos;d love to contribute.</p>
                    <div className="h-1.5 w-3/4 bg-muted rounded-full mt-2" />
                    <div className="h-1.5 w-1/2 bg-muted rounded-full" />
                  </div>
                  <div className="mt-auto pt-3 flex justify-between items-center">
                    <div className="flex gap-1.5">
                      <div className="w-3.5 h-3.5 rounded-sm bg-muted/80" />
                      <div className="w-3.5 h-3.5 rounded-sm bg-muted/80" />
                    </div>
                    <div className="px-2 py-1 bg-foreground text-background rounded-sm text-[9px] font-bold flex items-center gap-0.5">
                      Send <Send className="w-2 h-2" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </BentoCard>

          {/* Card 3: Privacy controls */}
          <BentoCard className="bg-linear-to-b from-orange-500/15 dark:from-orange-500/5 to-orange-500/5 dark:to-orange-500/1 backdrop-blur-xl flex flex-col">
            <div className="p-5 md:p-8 flex flex-col shrink-0">
              <div className="w-8 h-8 md:w-10 md:h-10 flex rounded-sm bg-purple-500/10 text-orange-500 items-center justify-center mb-3 md:mb-5">
                <ShieldCheck className="h-4 w-4 md:h-5 md:w-5" />
              </div>
              <h3 className="text-base md:text-lg font-bold mb-1.5 md:mb-2 text-orange-500/80">Private by Design</h3>
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                Your workspace is private to your account, with encrypted personal API keys.
              </p>
            </div>

            <div className="mx-5 md:mx-8 h-px bg-border/50" />

            <div className="flex-1 p-4 md:p-6 flex items-stretch min-h-35">
              <div className="w-full rounded-sm border border-border/50 bg-background/60 overflow-hidden p-2.5 flex gap-2">
                <div className="flex-1 bg-muted/30 rounded-sm p-1.5 flex flex-col gap-1.5">
                  <div className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Your data</div>
                  <div className="bg-muted/30 border border-border/50 rounded-sm p-1.5 space-y-1">
                    <div className="h-1 w-1/2 bg-purple-400/50 rounded-full" />
                    <div className="h-1 w-full bg-muted rounded-full" />
                  </div>
                  <div className="bg-muted/30 border border-border/50 rounded-sm p-1.5 space-y-1">
                    <div className="h-1 w-2/3 bg-blue-400/50 rounded-full" />
                    <div className="h-1 w-5/6 bg-muted rounded-full" />
                  </div>
                </div>
                <div className="flex-1 bg-muted/30 rounded-sm p-1.5 flex flex-col gap-1.5">
                  <div className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Encrypted</div>
                  <div className="bg-muted/30 border border-border/50 rounded-sm p-1.5 relative overflow-hidden">
                    <div className="absolute inset-0 bg-primary/5" />
                    <div className="h-1 w-3/4 bg-primary/40 rounded-full" />
                    <div className="h-1 w-full bg-muted rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </BentoCard>

          {/* Card 4: Actionable Feedback */}
          <BentoCard className="bg-linear-to-b from-green-500/15 dark:from-green-500/5 to-green-500/5 dark:to-green-500/1 backdrop-blur-xl flex flex-col">
            <div className="p-5 md:p-8 flex flex-col shrink-0">
              <div className="w-8 h-8 md:w-10 md:h-10 flex rounded-sm bg-green-500/10 text-green-500 items-center justify-center mb-3 md:mb-5">
                <FileText className="h-4 w-4 md:h-5 md:w-5" />
              </div>
              <h3 className="text-base md:text-lg font-bold mb-1.5 md:mb-2 text-green-500/80">Actionable Feedback</h3>
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                Concrete feedback on structure, impact statements, and phrasing.
              </p>
            </div>

            <div className="mx-5 md:mx-8 h-px bg-border/50" />

            <div className="flex-1 p-4 md:p-6 flex items-stretch min-h-35">
              <div className="w-full rounded-sm border border-border/50 bg-background/60 overflow-hidden p-3 relative">
                <div className="flex flex-col gap-1.5 opacity-50">
                  <div className="h-1.5 w-1/3 bg-foreground/20 rounded-full mx-auto mb-1" />
                  <div className="h-1 w-full bg-muted rounded-full" />
                  <div className="h-1 w-5/6 bg-muted rounded-full" />
                  <div className="h-1 w-full bg-muted rounded-full" />
                  <div className="h-1 w-4/5 bg-muted rounded-full" />
                </div>
                {/* AI popover */}
                <div className="absolute bottom-2.5 left-2.5 right-2.5 bg-muted/30 border border-border/80 backdrop-blur-sm rounded-sm p-2.5 shadow-xl flex gap-2">
                  <div className="w-5 h-5 rounded-full bg-green-500/15 text-green-500 flex items-center justify-center shrink-0">
                    <Sparkles className="w-2.5 h-2.5" />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-foreground">AI Suggestion</p>
                    <p className="text-[8px] text-muted-foreground mt-0.5 leading-relaxed">
                      Quantify this bullet. E.g., &quot;Improved load time by 40%...&quot;
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </BentoCard>

        </div>
      </div>
    </section>
  );
}
