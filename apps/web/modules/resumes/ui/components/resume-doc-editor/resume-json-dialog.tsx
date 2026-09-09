"use client";

import React, { useState } from "react";
import { Code2, Copy, Check } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@repo/ui/components/dialog";
import type { ResumeData } from "../../pdf/resume-pdf";

interface ResumeJsonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resume: ResumeData;
}

export const ResumeJsonDialog: React.FC<ResumeJsonDialogProps> = ({
  open,
  onOpenChange,
  resume,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(resume, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden border-border bg-card">
        <DialogHeader className="px-5 py-3.5 border-b border-border/60">
          <div className="flex items-center justify-between pr-6">
            <div className="flex items-center gap-2">
              <Code2 className="h-4 w-4 text-custom" />
              <DialogTitle className="text-sm font-semibold text-foreground">
                Live Resume JSON
              </DialogTitle>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleCopy}
              className="h-7 text-xs cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3 mr-1 text-emerald-500" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3 mr-1" /> Copy JSON
                </>
              )}
            </Button>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Real-time structured JSON synced directly with PostgreSQL and your in-place edits.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-auto p-4 bg-muted/20">
          <pre className="rounded-sm bg-muted/50 p-4 text-[11.5px] font-mono text-foreground overflow-auto border border-border/60 leading-relaxed max-h-[60vh]">
            {JSON.stringify(resume, null, 2)}
          </pre>
        </div>
      </DialogContent>
    </Dialog>
  );
};
