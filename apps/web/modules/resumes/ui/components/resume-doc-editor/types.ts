import type { ResumeData } from "../../pdf/resume-pdf";

export interface DbResumeSource {
  id: string;
  title: string;
  parsedJson: unknown;
}

export type ResumeTemplateId = "modern" | "executive" | "compact";

export interface ResumeSectionProps {
  resume: ResumeData;
  updateResumeData: (updater: (prev: ResumeData) => ResumeData) => void;
  setActiveEditor: (editor: any) => void;
  setActiveSectionName: (name: string) => void;
  selectedTemplate?: ResumeTemplateId;
}
