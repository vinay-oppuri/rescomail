"use client";

import React from "react";
import type { Editor } from "@tiptap/react";
import { ResumeEditableSection } from "../resume-editable-section";
import type { ResumeData } from "../../../pdf/resume-pdf";
import type { ResumeTemplateId } from "../types";

interface ResumeSkillsSectionProps {
  skills?: ResumeData["skills"];
  updateResumeData: (updater: (prev: ResumeData) => ResumeData) => void;
  setActiveEditor: (editor: Editor) => void;
  setActiveSectionName: (name: string) => void;
  selectedTemplate: ResumeTemplateId;
}

export const ResumeSkillsSection: React.FC<ResumeSkillsSectionProps> = ({
  skills = [],
  updateResumeData,
  setActiveEditor,
  setActiveSectionName,
  selectedTemplate,
}) => {
  const isExecutive = selectedTemplate === "executive";
  const isCompact = selectedTemplate === "compact";

  return (
    <section className={isCompact ? "mt-4" : "mt-6"}>
      <h2
        className={`mb-2 border-b border-border/80 pb-1 text-[11px] font-bold uppercase tracking-[0.14em] text-foreground ${
          isExecutive ? "font-serif text-xs border-foreground/30" : ""
        }`}
      >
        Skills & Technologies
      </h2>
      <div className="space-y-1.5 text-[13px] leading-relaxed">
        {skills.map((skillGroup, idx) => {
          if (typeof skillGroup === "string") {
            return (
              <div key={idx} className="text-foreground/90">
                {skillGroup}
              </div>
            );
          }
          return (
            <div key={idx} className="flex flex-wrap items-baseline gap-1.5">
              <span className="font-bold text-foreground">{skillGroup.category}:</span>
              <ResumeEditableSection
                content={`<p>${skillGroup.skills.join(", ")}</p>`}
                onFocus={(ed) => {
                  setActiveEditor(ed);
                  setActiveSectionName(`Skills (${skillGroup.category})`);
                }}
                onChange={(html) => {
                  const cleanText = html.replace(/<[^>]*>/g, "").trim();
                  const skillList = cleanText.split(",").map((s) => s.trim()).filter(Boolean);
                  updateResumeData((prev) => {
                    const list = [...(prev.skills ?? [])];
                    list[idx] = { category: skillGroup.category, skills: skillList };
                    return { ...prev, skills: list };
                  });
                }}
                className="inline-block"
              />
            </div>
          );
        })}
      </div>
    </section>
  );
};
