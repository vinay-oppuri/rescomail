"use client";

import React, { useState } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from "@repo/ui";
import { Loader2, Trash2 } from "lucide-react";
import {
  createApplicationAction,
  updateApplicationAction,
  deleteApplicationAction,
} from "../../server/actions";
import type { ApplicationItem, ResumeOption } from "../../server/queries";

interface ApplicationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  application: ApplicationItem | null;
  resumes: ResumeOption[];
  onSaveSuccess: () => void;
}

type ApplicationStage =
  | "saved"
  | "applied"
  | "phone_screen"
  | "interview"
  | "offer"
  | "rejected";

export const ApplicationDialog = ({
  isOpen,
  onClose,
  application,
  resumes,
  onSaveSuccess,
}: ApplicationDialogProps) => {
  const [jobTitle, setJobTitle] = useState(application?.jobTitle ?? "");
  const [companyName, setCompanyName] = useState(application?.companyName ?? "");
  const [jobUrl, setJobUrl] = useState(application?.jobUrl ?? "");
  const [stage, setStage] = useState<ApplicationStage>(
    application?.stage ?? "saved",
  );
  const [notes, setNotes] = useState(application?.notes ?? "");
  const [resumeId, setResumeId] = useState(application?.resumeId ?? "none");
  const [appliedAt, setAppliedAt] = useState(
    application?.appliedAt
      ? (new Date(application.appliedAt).toISOString().split("T")[0] ?? "")
      : "",
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobTitle.trim() || !companyName.trim()) {
      setError("Job Title and Company Name are required.");
      return;
    }

    setIsLoading(true);
    setError(null);

    const payload = {
      jobTitle: jobTitle.trim(),
      companyName: companyName.trim(),
      jobUrl: jobUrl.trim() || undefined,
      stage,
      notes: notes.trim() || undefined,
      resumeId: resumeId === "none" ? undefined : resumeId,
      appliedAt: appliedAt || undefined,
    };

    let result;
    if (application) {
      result = await updateApplicationAction(application.id, payload);
    } else {
      result = await createApplicationAction(payload);
    }

    setIsLoading(false);

    if (result.success) {
      onSaveSuccess();
      onClose();
    } else {
      setError(result.error || "An error occurred while saving.");
    }
  };

  const handleDelete = async () => {
    if (!application) return;
    if (!confirm("Are you sure you want to delete this application?")) return;

    setIsLoading(true);
    setError(null);

    const result = await deleteApplicationAction(application.id);
    setIsLoading(false);

    if (result.success) {
      onSaveSuccess();
      onClose();
    } else {
      setError(result.error || "An error occurred while deleting.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md max-w-lg overflow-y-auto max-h-[90vh] p-6 text-sm">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-lg font-bold">
            {application ? "Edit Application" : "Track New Role"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {application
              ? "Update details or status of your job application."
              : "Track a new job opportunity in your dashboard."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-4">
          {error && (
            <div className="text-xs text-red-500 bg-red-500/10 p-2.5 rounded-sm border border-red-500/20">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="jobTitle" className="text-xs font-semibold text-muted-foreground">Job Title *</Label>
              <Input
                id="jobTitle"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="Software Engineer"
                required
                className="bg-card text-foreground"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="companyName" className="text-xs font-semibold text-muted-foreground">Company Name *</Label>
              <Input
                id="companyName"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Google"
                required
                className="bg-card text-foreground"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="jobUrl" className="text-xs font-semibold text-muted-foreground">Job Post / Website URL</Label>
            <Input
              id="jobUrl"
              value={jobUrl}
              onChange={(e) => setJobUrl(e.target.value)}
              placeholder="https://careers.google.com/jobs/..."
              className="bg-card text-foreground"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="stage" className="text-xs font-semibold text-muted-foreground">Current Stage</Label>
              <Select
                value={stage}
                onValueChange={(value) => setStage(value as ApplicationStage)}
              >
                <SelectTrigger className="bg-card text-foreground">
                  <SelectValue placeholder="Select stage" />
                </SelectTrigger>
                <SelectContent className="bg-popover text-foreground">
                  <SelectItem value="saved">Saved</SelectItem>
                  <SelectItem value="applied">Applied</SelectItem>
                  <SelectItem value="phone_screen">Phone Screen</SelectItem>
                  <SelectItem value="interview">Interview</SelectItem>
                  <SelectItem value="offer">Offer</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="appliedAt" className="text-xs font-semibold text-muted-foreground">Applied Date</Label>
              <Input
                id="appliedAt"
                type="date"
                value={appliedAt}
                onChange={(e) => setAppliedAt(e.target.value)}
                className="bg-card text-foreground block w-full"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="resume" className="text-xs font-semibold text-muted-foreground">Linked Resume</Label>
            <Select value={resumeId} onValueChange={setResumeId}>
              <SelectTrigger className="bg-card text-foreground">
                <SelectValue placeholder="Link a resume" />
              </SelectTrigger>
              <SelectContent className="bg-popover text-foreground">
                <SelectItem value="none">None</SelectItem>
                {resumes.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="notes" className="text-xs font-semibold text-muted-foreground">Notes & Checklist</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contacts, interview prep steps, questions to ask..."
              rows={3}
              className="bg-card text-foreground"
            />
          </div>

          <DialogFooter className="flex items-center justify-between gap-4 pt-4 border-t border-border/50">
            {application ? (
              <Button
                type="button"
                variant="ghost"
                onClick={handleDelete}
                className="text-red-500 hover:text-red-600 hover:bg-red-500/10 text-xs gap-1.5"
                disabled={isLoading}
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete</span>
              </Button>
            ) : (
              <div />
            )}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="gap-1.5">
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                <span>Save</span>
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
