"use client";

import React from "react";
import { ExternalLink } from "lucide-react";
import type { Editor } from "@tiptap/react";
import { ResumeEditableSection } from "../resume-editable-section";
import { bulletsToHtml, htmlToBullets } from "../resume-utils";
import type { ResumeData, ResumeProject } from "../../../pdf/resume-pdf";
import type { ResumeTemplateId } from "../types";

interface ResumeProjectsSectionProps {
  projects?: ResumeProject[];
  updateResumeData: (updater: (prev: ResumeData) => ResumeData) => void;
  setActiveEditor: (editor: Editor) => void;
  setActiveSectionName: (name: string) => void;
  selectedTemplate: ResumeTemplateId;
}

export const ResumeProjectsSection: React.FC<ResumeProjectsSectionProps> = ({
  projects = [],
  updateResumeData,
  setActiveEditor,
  setActiveSectionName,
  selectedTemplate,
}) => {
  if (!projects || projects.length === 0) return null;

  const isExecutive = selectedTemplate === "executive";
  const isCompact = selectedTemplate === "compact";

  return (
    <section className={isCompact ? "mt-4" : "mt-6"}>
      <h2
        className={`mb-2 border-b border-border/80 pb-1 text-[11px] font-bold uppercase tracking-[0.14em] text-foreground ${
          isExecutive ? "font-serif text-xs border-foreground/30" : ""
        }`}
      >
        Projects
      </h2>
      <div className="space-y-3">
        {projects.map((project, index) => (
          <div key={index} className="space-y-1">
            <div className="flex items-baseline justify-between gap-4">
              <div className="flex items-baseline gap-2">
                <span className="font-bold text-foreground">{project.name}</span>
                {project.link && (
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-custom hover:underline inline-flex items-center gap-0.5"
                  >
                    {project.link}
                    <ExternalLink className="h-2.5 w-2.5 opacity-60" />
                  </a>
                )}
              </div>
            </div>

            {project.description && (
              <p className="text-[13px] italic text-muted-foreground">{project.description}</p>
            )}

            {project.bullets && project.bullets.length > 0 && (
              <ResumeEditableSection
                content={bulletsToHtml(project.bullets)}
                onFocus={(ed) => {
                  setActiveEditor(ed);
                  setActiveSectionName(`Project: ${project.name || index + 1}`);
                }}
                onChange={(html) => {
                  const bullets = htmlToBullets(html);
                  updateResumeData((prev) => {
                    const list = [...(prev.projects ?? [])];
                    list[index] = { ...list[index], bullets };
                    return { ...prev, projects: list };
                  });
                }}
              />
            )}
          </div>
        ))}
      </div>
    </section>
  );
};
