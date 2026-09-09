"use client";

import React from "react";
import { ExternalLink } from "lucide-react";
import type { ResumeData } from "../../../pdf/resume-pdf";
import type { ResumeTemplateId } from "../types";

interface ResumeHeaderSectionProps {
  basics: NonNullable<ResumeData["basics"]>;
  onUpdateField: (field: keyof NonNullable<ResumeData["basics"]>, value: string) => void;
  selectedTemplate: ResumeTemplateId;
}

export const ResumeHeaderSection: React.FC<ResumeHeaderSectionProps> = ({
  basics,
  onUpdateField,
  selectedTemplate,
}) => {
  const isExecutive = selectedTemplate === "executive";

  return (
    <header
      className={`border-b border-border/80 pb-5 ${
        isExecutive ? "text-left border-b-2 border-foreground/30" : "text-center"
      }`}
    >
      {/* Candidate Full Name */}
      <input
        type="text"
        value={basics.fullName || ""}
        onChange={(e) => onUpdateField("fullName", e.target.value)}
        placeholder="Candidate Full Name"
        className={`w-full bg-transparent text-3xl font-bold tracking-tight text-foreground outline-none placeholder:text-muted-foreground/30 hover:bg-muted/40 focus:bg-muted/25 rounded px-1 transition-colors ${
          isExecutive ? "text-left font-serif" : "text-center font-sans"
        }`}
      />

      {/* Professional Headline */}
      <input
        type="text"
        value={basics.headline || ""}
        onChange={(e) => onUpdateField("headline", e.target.value)}
        placeholder="Professional Headline / Title"
        className={`mt-1 w-full bg-transparent text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground outline-none placeholder:text-muted-foreground/30 hover:bg-muted/40 focus:bg-muted/25 rounded px-1 transition-colors ${
          isExecutive ? "text-left" : "text-center"
        }`}
      />

      {/* Contact Information Bar */}
      <div
        className={`mt-2.5 flex flex-wrap items-center gap-x-2 text-[11px] text-muted-foreground ${
          isExecutive ? "justify-start" : "justify-center"
        }`}
      >
        <input
          type="text"
          value={basics.email || ""}
          onChange={(e) => onUpdateField("email", e.target.value)}
          placeholder="email@example.com"
          className="bg-transparent outline-none hover:bg-muted/40 focus:bg-muted/25 rounded px-1 transition-colors"
          style={{ width: `${Math.max(14, (basics.email || "").length + 2)}ch` }}
        />
        <span className="text-border">|</span>
        <input
          type="text"
          value={basics.phone || ""}
          onChange={(e) => onUpdateField("phone", e.target.value)}
          placeholder="+1 (555) 000-0000"
          className="bg-transparent outline-none hover:bg-muted/40 focus:bg-muted/25 rounded px-1 transition-colors"
          style={{ width: `${Math.max(14, (basics.phone || "").length + 2)}ch` }}
        />
        <span className="text-border">|</span>
        <input
          type="text"
          value={basics.location || ""}
          onChange={(e) => onUpdateField("location", e.target.value)}
          placeholder="City, State"
          className="bg-transparent outline-none hover:bg-muted/40 focus:bg-muted/25 rounded px-1 transition-colors"
          style={{ width: `${Math.max(12, (basics.location || "").length + 2)}ch` }}
        />

        {(basics.links ?? []).map((link, idx) => {
          const label = typeof link === "string" ? link : link.label || link.url;
          const url = typeof link === "string" ? link : link.url;
          return (
            <React.Fragment key={idx}>
              <span className="text-border">|</span>
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-0.5 text-custom hover:underline"
              >
                {label}
                <ExternalLink className="h-2.5 w-2.5 opacity-60" />
              </a>
            </React.Fragment>
          );
        })}
      </div>
    </header>
  );
};
