"use client";

import React from "react";
import { Plus, Trash2 } from "lucide-react";
import type { ResumeData, ResumeEducation } from "../../../pdf/resume-pdf";
import type { ResumeTemplateId } from "../types";

interface ResumeEducationSectionProps {
  education?: ResumeEducation[];
  updateResumeData: (updater: (prev: ResumeData) => ResumeData) => void;
  addEducation: () => void;
  removeEducation: (index: number) => void;
  selectedTemplate: ResumeTemplateId;
}

export const ResumeEducationSection: React.FC<ResumeEducationSectionProps> = ({
  education = [],
  updateResumeData,
  addEducation,
  removeEducation,
  selectedTemplate,
}) => {
  const isExecutive = selectedTemplate === "executive";
  const isCompact = selectedTemplate === "compact";

  return (
    <section className={isCompact ? "mt-4" : "mt-6"}>
      <div className="mb-2 flex items-center justify-between border-b border-border/80 pb-1">
        <h2
          className={`text-[11px] font-bold uppercase tracking-[0.14em] text-foreground ${
            isExecutive ? "font-serif text-xs border-foreground/30" : ""
          }`}
        >
          Education
        </h2>
        <button
          type="button"
          onClick={addEducation}
          className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground print:hidden cursor-pointer"
          title="Add education"
        >
          <Plus className="h-3 w-3" />
          <span>Add Education</span>
        </button>
      </div>

      <div className="space-y-3">
        {education.map((item, index) => (
          <div key={index} className="group/edu flex items-baseline justify-between gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={item.institution || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  updateResumeData((prev) => {
                    const list = [...(prev.education ?? [])];
                    list[index] = { ...list[index], institution: val };
                    return { ...prev, education: list };
                  });
                }}
                placeholder="Institution Name"
                className="bg-transparent font-bold text-foreground outline-none hover:bg-muted/40 focus:bg-muted/25 rounded px-0.5 transition-colors"
                style={{ width: `${Math.max(16, (item.institution || "").length + 1)}ch` }}
              />
              <div className="text-xs text-muted-foreground">
                <input
                  type="text"
                  value={item.degree || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    updateResumeData((prev) => {
                      const list = [...(prev.education ?? [])];
                      list[index] = { ...list[index], degree: val };
                      return { ...prev, education: list };
                    });
                  }}
                  placeholder="Degree"
                  className="bg-transparent outline-none hover:bg-muted/40 focus:bg-muted/25 rounded px-0.5 transition-colors"
                  style={{ width: `${Math.max(12, (item.degree || "").length + 1)}ch` }}
                />
                {item.field && (
                  <>
                    <span>, </span>
                    <input
                      type="text"
                      value={item.field}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateResumeData((prev) => {
                          const list = [...(prev.education ?? [])];
                          list[index] = { ...list[index], field: val };
                          return { ...prev, education: list };
                        });
                      }}
                      placeholder="Field of study"
                      className="bg-transparent outline-none hover:bg-muted/40 focus:bg-muted/25 rounded px-0.5 transition-colors"
                      style={{ width: `${Math.max(12, (item.field || "").length + 1)}ch` }}
                    />
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-right text-xs text-muted-foreground">
                <span>{item.startDate ? `${item.startDate} — ` : ""}</span>
                <span>{item.endDate}</span>
              </div>
              <button
                type="button"
                onClick={() => removeEducation(index)}
                className="opacity-0 transition-opacity group-hover/edu:opacity-100 text-muted-foreground hover:text-destructive p-1 rounded hover:bg-destructive/10 print:hidden cursor-pointer"
                title="Delete education"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
