"use client";

import { useEffect } from "react";
import { Badge } from "@repo/ui/components/badge";
import { Plus, Sparkles, Trash2 } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { ConfirmDialog } from "@repo/ui/components/confirm-dialog";

import type { ColdEmailHistoryItem } from "../../server/coldmail-history";
import type { ColdmailResumeOption } from "../../server/coldmail-resumes";
import { useColdmailStore } from "../../store/coldmail-store";
import ColdmailComposer from "../components/coldmail-composer";
import ColdmailResult from "../components/coldmail-result";
import { Button, Label } from "@repo/ui";

interface ColdmailViewProps {
  emails: ColdEmailHistoryItem[];
  resumes: ColdmailResumeOption[];
}

const ColdmailView = ({ emails, resumes }: ColdmailViewProps) => {
  const { initStore, showComposer, setShowComposer, draft, setDraft, history } =
    useColdmailStore();

  useEffect(() => {
    initStore(emails, resumes);
  }, [emails, resumes, initStore]);

  const parsedResumes = resumes.filter((r) => r.status === "parsed").length;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 md:gap-8">
      <div className="flex flex-col gap-4 border-b border-border/50 pb-6 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
        <div className="max-w-3xl space-y-2">
          <h1 className="text-xl font-bold tracking-tight md:text-2xl">
            Cold email generator
          </h1>
          <p className="text-xs leading-6 text-muted-foreground">
            Turn a resume and target role into a personalized outreach email,
            subject line, and follow-up.
          </p>
        </div>

        <div className="w-full shrink-0 lg:w-72">
          <Label className="mb-2 block text-xs font-medium text-muted-foreground">
            Draft history
          </Label>
          <Select
            value={showComposer ? "new" : draft?.coldEmailId ?? "new"}
            onValueChange={(val) => {
              if (val === "new") {
                setShowComposer(true);
              } else {
                const selected = history.find((h) => h.id === val);
                if (selected && selected.draft) {
                  setDraft(selected.draft);
                  setShowComposer(false);
                }
              }
            }}
          >
            <SelectTrigger className="bg-card">
              <SelectValue placeholder="Select a past draft..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new">
                <div className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  <span>Create new draft</span>
                </div>
              </SelectItem>
              {history.length > 0 && (
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                  Saved Drafts
                </div>
              )}
              {history.map((email) => (
                <SelectItem key={email.id} value={email.id}>
                  <div className="flex w-full items-center gap-2 overflow-hidden">
                    <span className="truncate font-medium text-foreground">
                      {email.subject || "Untitled email"}
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      • {email.companyName || email.resumeTitle}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex w-full flex-col gap-6">
        {showComposer ? (
          <ColdmailComposer />
        ) : (
          <section className="min-h-175 overflow-hidden border border-foreground/5 bg-card/60 shadow-sm rounded-sm">
            <div className="flex items-center justify-between gap-3 border-b border-foreground/5 px-5 py-3">
              <div className="flex flex-col gap-1">
                <h2 className="text-sm font-semibold tracking-tight">Generated draft</h2>
                <p className="text-xs text-muted-foreground">
                  Personalized outreach and follow-up
                </p>
              </div>
              <div className="flex items-center gap-3">
                {draft ? (
                  <Badge variant="outline">{draft.qualityScore}/100</Badge>
                ) : null}

                <Button
                  onClick={() => setShowComposer(true)}
                  className="inline-flex h-8 w-8 items-center"
                  title="New Draft"
                >
                  <Plus className="h-4 w-4" />
                </Button>

                {draft?.coldEmailId && (
                  <ConfirmDialog
                    title="Delete Draft"
                    description="Are you sure you want to delete this draft? This action cannot be undone."
                    confirmText="Delete"
                    onConfirm={async () => {
                      const { deleteColdmailAction } = await import("../../server/actions");
                      const res = await deleteColdmailAction(draft.coldEmailId!);
                      if (res.success) {
                        setShowComposer(true);
                      } else {
                        throw new Error(res.error || "Failed to delete.");
                      }
                    }}
                    trigger={
                      <Button
                        variant="destructive"
                        className="inline-flex h-8 w-8 items-center"
                        title="Delete Draft"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    }
                  />
                )}
              </div>
            </div>

            <ColdmailResult />
          </section>
        )}
      </div>
    </div>
  );
};

export default ColdmailView;