"use client";

import React from "react";
import { Check } from "lucide-react";
import { Badge } from "@repo/ui/components/badge";

export type ResumeTemplateId = "modern" | "executive" | "compact";

interface TemplateOption {
  id: ResumeTemplateId;
  name: string;
  badge: string;
  description: string;
}

const TEMPLATES: TemplateOption[] = [
  {
    id: "modern",
    name: "Modern Clean",
    badge: "Popular",
    description: "Centered header, clean sans-serif typography, balanced sections",
  },
  {
    id: "executive",
    name: "Executive Serif",
    badge: "Classic",
    description: "Editorial serif style with left-aligned header and high elegance",
  },
  {
    id: "compact",
    name: "Compact Tech",
    badge: "Engineering",
    description: "Dense 2-column technical layout with skill tags and high information density",
  },
];

interface ResumeTemplateSkeletonsProps {
  selectedTemplate: ResumeTemplateId;
  onSelectTemplate: (template: ResumeTemplateId) => void;
}

export const ResumeTemplateSkeletons: React.FC<ResumeTemplateSkeletonsProps> = ({
  selectedTemplate,
  onSelectTemplate,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
          Choose Template
        </label>
        <span className="text-[10px] font-mono text-muted-foreground">3 layouts</span>
      </div>

      <div className="grid grid-cols-1 gap-2.5">
        {TEMPLATES.map((tmpl) => {
          const isSelected = selectedTemplate === tmpl.id;

          return (
            <button
              key={tmpl.id}
              type="button"
              onClick={() => onSelectTemplate(tmpl.id)}
              className={`group relative flex flex-col rounded-sm border p-2.5 text-left transition-all cursor-pointer ${
                isSelected
                  ? "border-custom bg-custom/5 ring-1 ring-custom/30 shadow-xs"
                  : "border-border/60 bg-card hover:border-border hover:bg-muted/30"
              }`}
            >
              {/* Header with Title and Badge */}
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-xs font-semibold ${
                      isSelected ? "text-foreground" : "text-foreground/90 group-hover:text-foreground"
                    }`}
                  >
                    {tmpl.name}
                  </span>
                  <Badge
                    variant="outline"
                    className={`text-[9px] font-mono px-1 py-0 h-4 border-border/60 ${
                      isSelected ? "text-custom border-custom/30" : "text-muted-foreground"
                    }`}
                  >
                    {tmpl.badge}
                  </Badge>
                </div>

                {isSelected && (
                  <div className="flex h-4 w-4 items-center justify-center rounded-full bg-custom text-white">
                    <Check className="h-2.5 w-2.5 stroke-[3]" />
                  </div>
                )}
              </div>

              {/* Realistic Miniature Document Skeleton Preview */}
              <div className="relative h-28 w-full overflow-hidden rounded-xs border border-border/50 bg-background/80 p-2 shadow-2xs group-hover:border-border transition-colors">
                {tmpl.id === "modern" && (
                  /* Modern Clean Skeleton: Centered header, single column, balanced bullets */
                  <div className="flex flex-col h-full gap-1 justify-between">
                    <div className="flex flex-col items-center gap-1">
                      <div className="h-2 w-16 rounded-xs bg-foreground/60" />
                      <div className="h-1 w-10 rounded-xs bg-muted-foreground/40" />
                      <div className="h-0.5 w-24 rounded-xs bg-muted-foreground/30" />
                    </div>
                    <div className="h-px w-full bg-border/80 my-0.5" />
                    {/* Summary */}
                    <div className="space-y-0.5">
                      <div className="h-1 w-10 rounded-xs bg-foreground/50" />
                      <div className="h-0.5 w-full rounded-xs bg-muted-foreground/30" />
                      <div className="h-0.5 w-4/5 rounded-xs bg-muted-foreground/30" />
                    </div>
                    {/* Experience */}
                    <div className="space-y-0.5">
                      <div className="flex items-center justify-between">
                        <div className="h-1 w-12 rounded-xs bg-foreground/50" />
                        <div className="h-0.5 w-6 rounded-xs bg-muted-foreground/40" />
                      </div>
                      <div className="flex items-center gap-1 pl-1">
                        <div className="h-0.5 w-0.5 rounded-full bg-muted-foreground/50 shrink-0" />
                        <div className="h-0.5 w-full rounded-xs bg-muted-foreground/30" />
                      </div>
                      <div className="flex items-center gap-1 pl-1">
                        <div className="h-0.5 w-0.5 rounded-full bg-muted-foreground/50 shrink-0" />
                        <div className="h-0.5 w-3/4 rounded-xs bg-muted-foreground/30" />
                      </div>
                    </div>
                  </div>
                )}

                {tmpl.id === "executive" && (
                  /* Executive Skeleton: Left-aligned bold serif header, double divider, structured lines */
                  <div className="flex flex-col h-full gap-1 justify-between">
                    <div className="flex items-baseline justify-between">
                      <div className="space-y-0.5">
                        <div className="h-2.5 w-14 rounded-xs bg-foreground/70" />
                        <div className="h-1 w-8 rounded-xs bg-muted-foreground/40" />
                      </div>
                      <div className="space-y-0.5 text-right flex flex-col items-end">
                        <div className="h-0.5 w-10 rounded-xs bg-muted-foreground/35" />
                        <div className="h-0.5 w-8 rounded-xs bg-muted-foreground/35" />
                      </div>
                    </div>
                    <div className="h-0.5 w-full bg-foreground/30 my-0.5" />
                    {/* Summary Block */}
                    <div className="space-y-0.5">
                      <div className="h-0.5 w-full rounded-xs bg-muted-foreground/35" />
                      <div className="h-0.5 w-full rounded-xs bg-muted-foreground/35" />
                      <div className="h-0.5 w-2/3 rounded-xs bg-muted-foreground/35" />
                    </div>
                    {/* Experience Block */}
                    <div className="space-y-0.5">
                      <div className="flex items-center justify-between">
                        <div className="h-1 w-14 rounded-xs bg-foreground/60" />
                        <div className="h-0.5 w-7 rounded-xs bg-muted-foreground/40" />
                      </div>
                      <div className="h-0.5 w-full rounded-xs bg-muted-foreground/30" />
                      <div className="h-0.5 w-4/5 rounded-xs bg-muted-foreground/30" />
                    </div>
                  </div>
                )}

                {tmpl.id === "compact" && (
                  /* Compact Technical Skeleton: 2-column layout with left skills sidebar */
                  <div className="flex h-full gap-1.5">
                    {/* Left Column (30%) */}
                    <div className="w-[32%] border-r border-border/60 pr-1 flex flex-col gap-1 justify-between">
                      <div className="h-3 w-3 rounded-xs bg-custom/20 border border-custom/30" />
                      <div className="space-y-0.5">
                        <div className="h-0.5 w-6 rounded-xs bg-foreground/50" />
                        <div className="h-1 w-full rounded-xs bg-custom/30" />
                        <div className="h-1 w-3/4 rounded-xs bg-custom/30" />
                        <div className="h-1 w-4/5 rounded-xs bg-custom/30" />
                      </div>
                      <div className="space-y-0.5">
                        <div className="h-0.5 w-5 rounded-xs bg-foreground/50" />
                        <div className="h-0.5 w-full rounded-xs bg-muted-foreground/30" />
                      </div>
                    </div>
                    {/* Right Column (70%) */}
                    <div className="flex-1 flex flex-col gap-1 justify-between">
                      <div>
                        <div className="h-2 w-14 rounded-xs bg-foreground/70" />
                        <div className="h-0.5 w-10 rounded-xs bg-muted-foreground/40 mt-0.5" />
                      </div>
                      <div className="h-px w-full bg-border/60" />
                      <div className="space-y-0.5">
                        <div className="h-1 w-10 rounded-xs bg-foreground/50" />
                        <div className="h-0.5 w-full rounded-xs bg-muted-foreground/30" />
                        <div className="h-0.5 w-4/5 rounded-xs bg-muted-foreground/30" />
                      </div>
                      <div className="space-y-0.5">
                        <div className="h-1 w-12 rounded-xs bg-foreground/50" />
                        <div className="h-0.5 w-full rounded-xs bg-muted-foreground/30" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <p className="mt-1.5 text-[10px] text-muted-foreground leading-tight line-clamp-1">
                {tmpl.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
