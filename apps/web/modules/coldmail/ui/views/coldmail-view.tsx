"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { ConfirmDialog } from "@repo/ui/components/confirm-dialog";

import WorkflowPageHeader from "@/modules/dashboard/ui/components/workflow-page-header";
import type { ColdEmailHistoryItem } from "../../server/coldmail-history";
import type { ColdmailResumeOption } from "../../server/coldmail-resumes";
import { useColdmailStore } from "../../store/coldmail-store";
import ColdmailComposer from "../components/coldmail-composer";
import ColdmailResult from "../components/coldmail-result";

interface ColdmailViewProps {
  emails: ColdEmailHistoryItem[];
  resumes: ColdmailResumeOption[];
}

const ColdmailView = ({ emails, resumes }: ColdmailViewProps) => {
  const router = useRouter();
  const { initStore, showComposer, setShowComposer, draft, setDraft, history } =
    useColdmailStore();
  const parsedResumeCount = resumes.filter(
    (resume) => resume.status === "parsed",
  ).length;

  useEffect(() => {
    initStore(emails, resumes);
  }, [emails, resumes, initStore]);

  const startNewDraft = () => {
    setDraft(null);
    setShowComposer(true);
  };

  const selectDraft = (id: string) => {
    const selected = history.find((item) => item.id === id);
    if (!selected?.draft) return;

    setDraft(selected.draft);
    setShowComposer(false);
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 md:gap-8">
      <WorkflowPageHeader
        title="Cold email generator"
        description="Turn a resume and target role into a personalized outreach email, subject line, and follow-up."
        metadata={
          <>
            <span>{parsedResumeCount} parsed resumes</span>
            <span aria-hidden="true">·</span>
            <span>{history.length} saved drafts</span>
          </>
        }
        historyLabel="Draft history"
        historyPlaceholder={
          history.length ? "Select a saved draft" : "No saved drafts yet"
        }
        historyOptions={history.map((email) => ({
          id: email.id,
          title: email.subject || "Untitled email",
          detail: email.companyName || email.resumeTitle,
        }))}
        selectedHistoryId={showComposer ? undefined : draft?.coldEmailId}
        onSelectHistory={selectDraft}
        action={
          showComposer ? undefined : (
            <Button type="button" onClick={startNewDraft} className="w-full">
              <Plus className="h-4 w-4" />
              Start a new draft
            </Button>
          )
        }
      />

      {showComposer ? (
        <ColdmailComposer />
      ) : (
        <section className="min-h-175 overflow-hidden rounded-sm border border-foreground/5 bg-card/60 shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b border-foreground/5 px-5 py-3">
            <div className="flex flex-col gap-1">
              <h2 className="text-sm font-semibold tracking-tight">
                Generated draft
              </h2>
              <p className="text-xs text-muted-foreground">
                Personalized outreach and follow-up
              </p>
            </div>
            <div className="flex items-center gap-3">
              {draft ? (
                <Badge variant="outline">{draft.qualityScore}/100</Badge>
              ) : null}

              {draft?.coldEmailId ? (
                <ConfirmDialog
                  title="Delete draft"
                  description="Delete this draft permanently? This action cannot be undone."
                  confirmText="Delete"
                  onConfirm={async () => {
                    const { deleteColdmailAction } =
                      await import("../../server/actions");
                    const result = await deleteColdmailAction(
                      draft.coldEmailId!,
                    );

                    if (!result.success) {
                      throw new Error(
                        result.error || "Failed to delete draft.",
                      );
                    }

                    startNewDraft();
                    router.refresh();
                  }}
                  trigger={
                    <Button
                      variant="destructive"
                      size="icon"
                      title="Delete draft"
                      aria-label="Delete draft"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  }
                />
              ) : null}
            </div>
          </div>

          <ColdmailResult />
        </section>
      )}
    </div>
  );
};

export default ColdmailView;
