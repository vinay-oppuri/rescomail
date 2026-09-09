"use client";

import React from "react";
import Link from "next/link";
import { ChevronLeft, Database } from "lucide-react";
import { Badge } from "@repo/ui/components/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import {
  ResumeTemplateSkeletons,
  type ResumeTemplateId,
} from "./resume-template-skeletons";
import type { DbResumeSource } from "./types";

interface ResumeEditorSidebarProps {
  docTitle: string;
  onDocTitleChange: (title: string) => void;
  candidateName?: string;
  selectedSourceId: string;
  onSelectSource: (sourceId: string) => void;
  sources: DbResumeSource[];
  selectedTemplate: ResumeTemplateId;
  onSelectTemplate: (template: ResumeTemplateId) => void;
}

export const ResumeEditorSidebar: React.FC<ResumeEditorSidebarProps> = ({
  docTitle,
  onDocTitleChange,
  candidateName,
  selectedSourceId,
  onSelectSource,
  sources,
  selectedTemplate,
  onSelectTemplate,
}) => {
  return (
    <aside className="w-64 sm:w-72 lg:w-80 shrink-0 border-r border-border/60 bg-background/80 overflow-y-auto p-4 sm:p-5 space-y-5 print:hidden">
      {/* Return to Resumes Navigation */}
      <Link
        href="/dashboard/resumes"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-medium transition-colors"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        <span>Back to Resumes</span>
      </Link>

      {/* Resume Title Input */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
          Resume Title
        </label>
        <input
          type="text"
          value={docTitle}
          onChange={(e) => onDocTitleChange(e.target.value)}
          placeholder="Untitled Resume"
          className="w-full text-xs font-semibold rounded-sm border border-border/60 bg-card px-2.5 py-1.5 text-foreground hover:border-border focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
          title="Rename document"
        />
      </div>

      {/* Candidate Metadata & Source Status */}
      <div className="rounded-sm border border-border/60 bg-card/50 p-2.5 space-y-2 text-xs">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-[11px]">Candidate:</span>
          <span className="font-semibold text-foreground truncate max-w-[140px]">
            {candidateName || "Candidate"}
          </span>
        </div>
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-[11px]">Source:</span>
          {selectedSourceId !== "sample" ? (
            <Badge variant="outline" className="text-[10px] font-mono gap-1 text-custom border-custom/30 py-0 h-5">
              <Database className="h-2.5 w-2.5" /> DB Synced
            </Badge>
          ) : (
            <Badge variant="outline" className="text-[10px] font-mono gap-1 text-muted-foreground py-0 h-5">
              Sample Data
            </Badge>
          )}
        </div>

        {sources.length > 1 && (
          <div className="pt-2 border-t border-border/50 space-y-1">
            <label className="text-[9px] font-mono uppercase text-muted-foreground block">
              Switch Database Resume
            </label>
            <Select value={selectedSourceId} onValueChange={onSelectSource}>
              <SelectTrigger className="h-7 text-xs bg-background border-border/60">
                <SelectValue placeholder="Select resume" />
              </SelectTrigger>
              <SelectContent>
                {sources.map((s) => (
                  <SelectItem key={s.id} value={s.id} className="text-xs">
                    {s.title}
                  </SelectItem>
                ))}
                <SelectItem value="sample" className="text-xs">
                  Sample Template
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="h-px w-full bg-border/60" />

      {/* 3 Interactive Template Skeletons */}
      <ResumeTemplateSkeletons
        selectedTemplate={selectedTemplate}
        onSelectTemplate={onSelectTemplate}
      />
    </aside>
  );
};
