"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles, Trash2 } from "lucide-react";

import { Button } from "@repo/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/components/dialog";

import { deleteResumeAction } from "../../server/actions";

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
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = () => {
    setError(null);
    startTransition(async () => {
      const result = await deleteResumeAction(resumeId);
      if (result.success) {
        setOpen(false);
        router.refresh();
      } else {
        setError(result.error ?? "Something went wrong.");
      }
    });
  };

  return (
    <div className="flex items-center gap-2">
      {canAnalyse && (
        <Button
          variant="outline"
          size="sm"
          asChild
        >
          <a href={`/dashboard/ats?resumeId=${resumeId}`}>
            <Sparkles className="h-3.5 w-3.5" />
            Analyse
          </a>
        </Button>
      )}

      <Dialog open={open} onOpenChange={(next) => { if (!isPending) setOpen(next); }}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            aria-label="Delete resume"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </DialogTrigger>

        <DialogContent showCloseButton={!isPending}>
          <DialogHeader>
            <DialogTitle>Delete resume?</DialogTitle>
            <DialogDescription>
              <span className="font-medium text-foreground">&ldquo;{resumeTitle}&rdquo;</span> will be
              permanently deleted along with its parsed data and file. This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {error ? (
            <p className="text-xs text-destructive border border-destructive/20 bg-destructive/10 px-3 py-2">
              {error}
            </p>
          ) : null}

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Deleting…
                </>
              ) : (
                <>
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete resume
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ResumeActionsRow;
