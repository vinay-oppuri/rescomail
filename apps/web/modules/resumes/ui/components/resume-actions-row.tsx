"use client";

import { startTransition } from "react";
import { Sparkles, Trash2 } from "lucide-react";

import { Button } from "@repo/ui/components/button";
import { ConfirmDialog } from "@repo/ui";

import { deleteResumeAction } from "../../server/actions";
import { useRouter } from "next/navigation";

interface ResumeActionsRowProps {
  resumeId: string;
  resumeTitle: string;
  canAnalyse: boolean;
}

const ResumeActionsRow = ({
  resumeId,
  resumeTitle,
  canAnalyse,
}: ResumeActionsRowProps) => {
  const router = useRouter();
  const handleDelete = async () => {
    return new Promise<void>((resolve, reject) => {
      startTransition(async () => {
        const result = await deleteResumeAction(resumeId);
        if (result.success) {
          router.refresh();
          resolve();
        } else {
          reject(new Error(result.error ?? "Something went wrong."));
        }
      });
    });
  };

  return (
    <div className="flex items-center gap-2">
      {canAnalyse ? (
        <Button
          variant="outline"
          size="sm"
          asChild
          className="border-foreground/5!"
        >
          <a href={`/dashboard/ats?resumeId=${resumeId}`}>
            <Sparkles className="h-3.5 w-3.5" />
            Analyse
          </a>
        </Button>
      ) : (
        <Button
          variant="outline"
          size="sm"
          disabled
          className="border-foreground/5!"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Analyse
        </Button>
      )}

      <ConfirmDialog
        trigger={
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            aria-label="Delete resume"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        }
        title="Delete resume?"
        description={
          <>
            <span className="font-medium text-foreground">&ldquo;{resumeTitle}&rdquo;</span> will be
            permanently deleted along with its parsed data and file. This
            action cannot be undone.
          </>
        }
        onConfirm={handleDelete}
        confirmText={
          <>
            <Trash2 className="mr-1 h-3.5 w-3.5 inline" /> Delete resume
          </>
        }
        destructive
      />
    </div>
  );
};

export default ResumeActionsRow;
