"use client";

import React from "react";
import { Plus, Trash2 } from "lucide-react";
import type { Editor } from "@tiptap/react";
import { ResumeEditableSection } from "../resume-editable-section";
import { bulletsToHtml, htmlToBullets } from "../resume-utils";
import type { ResumeData, ResumeExperience } from "../../../pdf/resume-pdf";
import type { ResumeTemplateId } from "../types";

interface ResumeExperienceSectionProps {
  experience?: ResumeExperience[];
  updateResumeData: (updater: (prev: ResumeData) => ResumeData) => void;
  addExperience: () => void;
  removeExperience: (index: number) => void;
  setActiveEditor: (editor: Editor) => void;
  setActiveSectionName: (name: string) => void;
  selectedTemplate: ResumeTemplateId;
}

export const ResumeExperienceSection: React.FC<ResumeExperienceSectionProps> = ({
  experience = [],
  updateResumeData,
  addExperience,
  removeExperience,
  setActiveEditor,
  setActiveSectionName,
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
          Experience & Accomplishments
        </h2>
        <button
          type="button"
          onClick={addExperience}
          className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground print:hidden cursor-pointer"
          title="Add new role"
        >
          <Plus className="h-3 w-3" />
          <span>Add Role</span>
        </button>
      </div>

      <div className={isCompact ? "space-y-3" : "space-y-4"}>
        {experience.map((item, index) => (
          <div key={index} className="group/item relative">
            {/* Role Header */}
            <div className="flex items-baseline justify-between gap-4">
              <div className="flex-1">
                <div className="flex flex-wrap items-baseline gap-1.5">
                  <input
                    type="text"
                    value={item.role || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateResumeData((prev) => {
                        const list = [...(prev.experience ?? [])];
                        list[index] = { ...list[index], role: val };
                        return { ...prev, experience: list };
                      });
                    }}
                    placeholder="Role / Title"
                    className="bg-transparent font-bold text-foreground outline-none hover:bg-muted/40 focus:bg-muted/25 rounded px-0.5 transition-colors"
                    style={{ width: `${Math.max(12, (item.role || "").length + 1)}ch` }}
                  />
                  <span className="text-muted-foreground/50">·</span>
                  <input
                    type="text"
                    value={item.company || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateResumeData((prev) => {
                        const list = [...(prev.experience ?? [])];
                        list[index] = { ...list[index], company: val };
                        return { ...prev, experience: list };
                      });
                    }}
                    placeholder="Company Name"
                    className="bg-transparent font-semibold text-foreground/80 outline-none hover:bg-muted/40 focus:bg-muted/25 rounded px-0.5 transition-colors"
                    style={{ width: `${Math.max(10, (item.company || "").length + 1)}ch` }}
                  />
                  {item.location && (
                    <>
                      <span className="text-muted-foreground/50">·</span>
                      <input
                        type="text"
                        value={item.location}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateResumeData((prev) => {
                            const list = [...(prev.experience ?? [])];
                            list[index] = { ...list[index], location: val };
                            return { ...prev, experience: list };
                          });
                        }}
                        placeholder="Location"
                        className="bg-transparent text-xs text-muted-foreground outline-none hover:bg-muted/40 focus:bg-muted/25 rounded px-0.5 transition-colors"
                        style={{ width: `${Math.max(10, (item.location || "").length + 1)}ch` }}
                      />
                    </>
                  )}
                </div>
              </div>

              {/* Dates & Delete Action */}
              <div className="flex items-center gap-2">
                <div className="text-right text-xs text-muted-foreground">
                  <input
                    type="text"
                    value={item.startDate || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateResumeData((prev) => {
                        const list = [...(prev.experience ?? [])];
                        list[index] = { ...list[index], startDate: val };
                        return { ...prev, experience: list };
                      });
                    }}
                    placeholder="Start"
                    className="w-12 bg-transparent text-right outline-none hover:bg-muted/40 focus:bg-muted/25 rounded px-0.5 transition-colors"
                  />
                  <span> — </span>
                  <input
                    type="text"
                    value={item.endDate || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateResumeData((prev) => {
                        const list = [...(prev.experience ?? [])];
                        list[index] = { ...list[index], endDate: val };
                        return { ...prev, experience: list };
                      });
                    }}
                    placeholder="End"
                    className="w-14 bg-transparent text-left outline-none hover:bg-muted/40 focus:bg-muted/25 rounded px-0.5 transition-colors"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => removeExperience(index)}
                  className="opacity-0 transition-opacity group-hover/item:opacity-100 text-muted-foreground hover:text-destructive p-1 rounded hover:bg-destructive/10 print:hidden cursor-pointer"
                  title="Delete role"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Accomplishments Bullets (Tiptap Rich Text Region) */}
            <div className="mt-1">
              <ResumeEditableSection
                content={bulletsToHtml(item.bullets)}
                onFocus={(ed) => {
                  setActiveEditor(ed);
                  setActiveSectionName(item.company ? `${item.company} bullets` : `Role ${index + 1} bullets`);
                }}
                onChange={(html) => {
                  const bullets = htmlToBullets(html);
                  updateResumeData((prev) => {
                    const list = [...(prev.experience ?? [])];
                    list[index] = { ...list[index], bullets };
                    return { ...prev, experience: list };
                  });
                }}
                placeholder="Add key accomplishments…"
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
