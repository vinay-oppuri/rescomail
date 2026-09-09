"use client";

import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { useResumeEditor } from "./use-resume-editor";
import { ResumeEditorHeader } from "./resume-editor-header";
import { ResumeEditorSidebar } from "./resume-editor-sidebar";
import { ResumeTopToolbar } from "./resume-top-toolbar";
import { ResumeDocumentSheet } from "./sections/resume-document-sheet";
import { ResumeJsonDialog } from "./resume-json-dialog";
import type { DbResumeSource } from "./types";

export type { DbResumeSource };

interface ResumeDocEditorProps {
  dbResumes?: DbResumeSource[];
  initialResumeId?: string;
}

export const ResumeDocEditor: React.FC<ResumeDocEditorProps> = ({
  dbResumes = [],
  initialResumeId,
}) => {
  const [showJsonModal, setShowJsonModal] = useState(false);

  const {
    loading,
    sources,
    selectedSourceId,
    selectSource,
    selectedTemplate,
    setSelectedTemplate,
    resume,
    docTitle,
    setDocTitle,
    activeEditor,
    setActiveEditor,
    activeSectionName,
    setActiveSectionName,
    updateResumeData,
    updateBasicsField,
    addExperience,
    removeExperience,
    addEducation,
    removeEducation,
  } = useResumeEditor({ dbResumes, initialResumeId });

  if (loading) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-background text-muted-foreground">
        <div className="flex h-12 w-12 items-center justify-center rounded-sm border border-border/60 bg-card shadow-xs">
          <Loader2 className="h-6 w-6 animate-spin text-foreground" />
        </div>
        <p className="mt-3 text-xs font-medium text-foreground">Loading resume studio document…</p>
        <p className="text-[11px] text-muted-foreground">Preparing interactive rich text document</p>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col bg-background text-foreground select-text">
      {/* 1. Studio Header: Print & JSON Buttons */}
      <ResumeEditorHeader onOpenJsonModal={() => setShowJsonModal(true)} />

      {/* 2. Workspace Body: Left Sidebar + Center Canvas */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar: Title, Info & 3 Template Skeletons */}
        <ResumeEditorSidebar
          docTitle={docTitle}
          onDocTitleChange={setDocTitle}
          candidateName={resume.basics?.fullName}
          selectedSourceId={selectedSourceId}
          onSelectSource={selectSource}
          sources={sources}
          selectedTemplate={selectedTemplate}
          onSelectTemplate={setSelectedTemplate}
        />

        {/* Center Canvas: Toolbar + Resume Sheet with Identical Width */}
        <main className="flex-1 overflow-y-auto bg-muted/25 dark:bg-muted/10 p-3 sm:p-6 lg:p-8 flex flex-col items-center print:p-0 print:bg-white print:overflow-visible">
          <div className="w-full max-w-[850px] flex flex-col print:max-w-none">
            {/* Tiptap Toolkit: Directly above resume with matching width */}
            <div className="sticky top-0 z-20 w-full rounded-t-sm border border-border/70 border-b-border/40 bg-card shadow-xs print:hidden">
              <ResumeTopToolbar
                editor={activeEditor}
                activeSectionName={activeSectionName}
              />
            </div>

            {/* Formatted Resume Document Sheet */}
            <ResumeDocumentSheet
              resume={resume}
              updateResumeData={updateResumeData}
              updateBasicsField={updateBasicsField}
              addExperience={addExperience}
              removeExperience={removeExperience}
              addEducation={addEducation}
              removeEducation={removeEducation}
              activeEditor={activeEditor}
              setActiveEditor={setActiveEditor}
              setActiveSectionName={setActiveSectionName}
              selectedTemplate={selectedTemplate}
            />
          </div>
        </main>
      </div>

      {/* 3. Structured JSON Inspector Modal */}
      <ResumeJsonDialog
        open={showJsonModal}
        onOpenChange={setShowJsonModal}
        resume={resume}
      />
    </div>
  );
};

export default ResumeDocEditor;
