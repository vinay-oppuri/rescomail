"use client";

import React from "react";
import type { Editor } from "@tiptap/react";
import type { ResumeData } from "../../../pdf/resume-pdf";
import type { ResumeTemplateId } from "../types";
import { ResumeHeaderSection } from "./resume-header-section";
import { ResumeSummarySection } from "./resume-summary-section";
import { ResumeExperienceSection } from "./resume-experience-section";
import { ResumeSkillsSection } from "./resume-skills-section";
import { ResumeProjectsSection } from "./resume-projects-section";
import { ResumeEducationSection } from "./resume-education-section";
import { ResumeCertificationsSection } from "./resume-certifications-section";

interface ResumeDocumentSheetProps {
  resume: ResumeData;
  updateResumeData: (updater: (prev: ResumeData) => ResumeData) => void;
  updateBasicsField: (field: keyof NonNullable<ResumeData["basics"]>, val: string) => void;
  addExperience: () => void;
  removeExperience: (index: number) => void;
  addEducation: () => void;
  removeEducation: (index: number) => void;
  activeEditor: Editor | null;
  setActiveEditor: (editor: Editor) => void;
  setActiveSectionName: (name: string) => void;
  selectedTemplate: ResumeTemplateId;
}

export const ResumeDocumentSheet: React.FC<ResumeDocumentSheetProps> = ({
  resume,
  updateResumeData,
  updateBasicsField,
  addExperience,
  removeExperience,
  addEducation,
  removeEducation,
  activeEditor,
  setActiveEditor,
  setActiveSectionName,
  selectedTemplate,
}) => {
  const basics = resume.basics ?? {};
  const isExecutive = selectedTemplate === "executive";

  return (
    <article
      className={`relative min-h-[1080px] w-full rounded-b-sm border-x border-b border-border/70 bg-card px-8 py-10 text-card-foreground shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-2xl sm:px-14 sm:py-14 print:border-none print:shadow-none print:p-0 print:bg-white print:text-black ${
        isExecutive ? "font-serif" : "font-sans"
      }`}
      aria-label="Resume Document Sheet"
    >
      {/* 1. Header & Candidate Basics */}
      <ResumeHeaderSection
        basics={basics}
        onUpdateField={updateBasicsField}
        selectedTemplate={selectedTemplate}
      />

      {/* 2. Professional Summary */}
      <ResumeSummarySection
        summary={resume.summary}
        updateResumeData={updateResumeData}
        activeEditor={activeEditor}
        setActiveEditor={setActiveEditor}
        setActiveSectionName={setActiveSectionName}
        selectedTemplate={selectedTemplate}
      />

      {/* 3. Experience & Accomplishments */}
      <ResumeExperienceSection
        experience={resume.experience}
        updateResumeData={updateResumeData}
        addExperience={addExperience}
        removeExperience={removeExperience}
        setActiveEditor={setActiveEditor}
        setActiveSectionName={setActiveSectionName}
        selectedTemplate={selectedTemplate}
      />

      {/* 4. Skills & Technologies */}
      <ResumeSkillsSection
        skills={resume.skills}
        updateResumeData={updateResumeData}
        setActiveEditor={setActiveEditor}
        setActiveSectionName={setActiveSectionName}
        selectedTemplate={selectedTemplate}
      />

      {/* 5. Projects */}
      <ResumeProjectsSection
        projects={resume.projects}
        updateResumeData={updateResumeData}
        setActiveEditor={setActiveEditor}
        setActiveSectionName={setActiveSectionName}
        selectedTemplate={selectedTemplate}
      />

      {/* 6. Education */}
      <ResumeEducationSection
        education={resume.education}
        updateResumeData={updateResumeData}
        addEducation={addEducation}
        removeEducation={removeEducation}
        selectedTemplate={selectedTemplate}
      />

      {/* 7. Certifications */}
      <ResumeCertificationsSection
        certifications={resume.certifications}
        selectedTemplate={selectedTemplate}
      />
    </article>
  );
};
