"use client";

import React from "react";
import type { Editor } from "@tiptap/react";
import { ResumeEditableSection } from "../resume-editable-section";
import type { ResumeData } from "../../../pdf/resume-pdf";
import type { ResumeTemplateId } from "../types";

interface ResumeSummarySectionProps {
  summary?: string;
  updateResumeData: (updater: (prev: ResumeData) => ResumeData) => void;
  activeEditor: Editor | null;
  setActiveEditor: (editor: Editor) => void;
  setActiveSectionName: (name: string) => void;
  selectedTemplate: ResumeTemplateId;
}

export const ResumeSummarySection: React.FC<ResumeSummarySectionProps> = ({
  summary,
  updateResumeData,
  activeEditor,
  setActiveEditor,
  setActiveSectionName,
  selectedTemplate,
}) => {
  const isExecutive = selectedTemplate === "executive";

  return (
    <section className="mt-5">
      <h2
        className={`mb-2 border-b border-border/80 pb-1 text-[11px] font-bold uppercase tracking-[0.14em] text-foreground ${
          isExecutive ? "font-serif text-xs border-foreground/30" : ""
        }`}
      >
        Professional Summary
      </h2>
      <ResumeEditableSection
        content={summary ? `<p>${summary}</p>` : "<p></p>"}
        onEditorReady={(ed) => {
          if (!activeEditor) {
            setActiveEditor(ed);
            setActiveSectionName("Professional Summary");
          }
        }}
        onFocus={(ed) => {
          setActiveEditor(ed);
          setActiveSectionName("Professional Summary");
        }}
        onChange={(html) => {
          updateResumeData((prev) => ({
            ...prev,
            summary: html,
          }));
        }}
        placeholder="Write a compelling executive summary…"
      />
    </section>
  );
};
