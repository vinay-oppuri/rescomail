"use client";

import React from "react";
import { Code2, Printer } from "lucide-react";
import { Button } from "@repo/ui/components/button";

interface ResumeEditorHeaderProps {
  onOpenJsonModal: () => void;
}

export const ResumeEditorHeader: React.FC<ResumeEditorHeaderProps> = ({
  onOpenJsonModal,
}) => {
  return (
    <header className="shrink-0 border-b border-border/60 bg-background/95 backdrop-blur-md px-4 py-2.5 sm:px-6 print:hidden flex items-center justify-end gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onOpenJsonModal}
        className="h-8 px-2.5 text-xs border-border/60 text-foreground hover:bg-muted cursor-pointer"
        title="Inspect structured resume JSON"
      >
        <Code2 className="h-3.5 w-3.5 mr-1.5 text-custom" />
        <span>Resume JSON</span>
      </Button>

      <Button
        type="button"
        size="sm"
        onClick={() => window.print()}
        className="h-8 px-3 text-xs cursor-pointer"
        title="Print or Save as PDF"
      >
        <Printer className="h-3.5 w-3.5 mr-1.5" />
        <span>Print / PDF</span>
      </Button>
    </header>
  );
};
