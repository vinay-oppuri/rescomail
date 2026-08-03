import { create } from "zustand";
import type { FormEvent } from "react";
import type {
  ColdEmailCallToAction,
  ColdEmailGenerateInput,
  ColdEmailLength,
  ColdEmailResponse,
  ColdEmailTone,
} from "@repo/validations";
import { coldEmailResponseSchema } from "@repo/validations";

import type { ColdEmailHistoryItem } from "../server/coldmail-history";
import type { ColdmailResumeOption } from "../server/coldmail-resumes";
import { getApiErrorMessage, readApiJson, sleep } from "@/lib/api-client";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const POLL_INTERVAL_MS = 3000;
const MAX_POLL_TIME_MS = 10 * 60 * 1000;

type ColdEmailProcessingResponse = {
  status: "processing";
  coldEmailId: string;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const isProcessingResponse = (
  value: unknown,
): value is ColdEmailProcessingResponse =>
  isRecord(value) &&
  value.status === "processing" &&
  typeof value.coldEmailId === "string";

const parseColdEmailResponse = (value: unknown): ColdEmailResponse => {
  const parsed = coldEmailResponseSchema.safeParse(value);

  if (!parsed.success) {
    throw new Error("Cold email generation returned an invalid response.");
  }

  return parsed.data;
};

const pollColdEmail = async (coldEmailId: string) => {
  const startedAt = Date.now();

  while (Date.now() - startedAt < MAX_POLL_TIME_MS) {
    await sleep(POLL_INTERVAL_MS);

    const response = await fetch(`/api/coldmail/${coldEmailId}`);
    const data = await readApiJson(response);

    if (!response.ok && response.status !== 202) {
      throw new Error(
        getApiErrorMessage(data, "Error while processing cold email."),
      );
    }

    if (isProcessingResponse(data)) {
      continue;
    }

    return parseColdEmailResponse(data);
  }

  throw new Error(
    "Cold email is still processing. Refresh history in a few minutes.",
  );
};

const requestColdEmail = async (payload: ColdEmailGenerateInput) => {
  const response = await fetch("/api/coldmail/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await readApiJson(response);

  if (!response.ok) {
    throw new Error(
      getApiErrorMessage(data, "Unable to trigger cold email generation."),
    );
  }

  if (isProcessingResponse(data)) {
    return pollColdEmail(data.coldEmailId);
  }

  return parseColdEmailResponse(data);
};

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

interface ColdmailStore {
  // Server data (refreshed via initStore)
  resumes: ColdmailResumeOption[];
  history: ColdEmailHistoryItem[];

  // Form fields (survive route navigation)
  resumeId: string;
  jobTitle: string;
  companyName: string;
  companyWebsiteUrl: string;
  recipientName: string;
  recipientRole: string;
  jobDescription: string;
  tone: ColdEmailTone;
  length: ColdEmailLength;
  callToAction: ColdEmailCallToAction;

  // Result & UI
  draft: ColdEmailResponse | null;
  isGenerating: boolean;
  error: string | null;
  showComposer: boolean;

  // -------------------------------------------------------------------------
  // Actions
  // -------------------------------------------------------------------------

  /**
   * Called once on view mount (and on server-data refresh).
   * Updates resumes + history from the server while preserving form fields.
   */
  initStore: (
    emails: ColdEmailHistoryItem[],
    resumes: ColdmailResumeOption[],
  ) => void;

  setResumeId: (value: string) => void;
  setJobTitle: (value: string) => void;
  setCompanyName: (value: string) => void;
  setCompanyWebsiteUrl: (value: string) => void;
  setRecipientName: (value: string) => void;
  setRecipientRole: (value: string) => void;
  setJobDescription: (value: string) => void;
  setTone: (value: ColdEmailTone) => void;
  setLength: (value: ColdEmailLength) => void;
  setCallToAction: (value: ColdEmailCallToAction) => void;
  setDraft: (draft: ColdEmailResponse | null) => void;
  setShowComposer: (show: boolean) => void;

  /** Submits the email generation form. Returns true on success. */
  handleGenerate: (event: FormEvent<HTMLFormElement>) => Promise<boolean>;
}

export const useColdmailStore = create<ColdmailStore>((set, get) => ({
  resumes: [],
  history: [],
  resumeId: "",
  jobTitle: "",
  companyName: "",
  companyWebsiteUrl: "",
  recipientName: "",
  recipientRole: "",
  jobDescription: "",
  tone: "warm",
  length: "standard",
  callToAction: "conversation",
  draft: null,
  isGenerating: false,
  error: null,
  showComposer: true,

  // ---------------------------------------------------------------------------
  initStore: (emails, resumes) => {
    set((state) => {
      const firstParsed = resumes.find((r) => r.status === "parsed");
      const nextResumeId =
        state.resumeId && resumes.some((r) => r.id === state.resumeId)
          ? state.resumeId
          : (firstParsed?.id ?? "");

      // Seed draft from the latest email if we don't have one yet
      const nextDraft = state.draft ?? emails[0]?.draft ?? null;

      return {
        resumes,
        history: emails,
        resumeId: nextResumeId,
        draft: nextDraft,
      };
    });
  },

  // Field setters
  setResumeId: (value) => set({ resumeId: value }),
  setJobTitle: (value) => set({ jobTitle: value }),
  setCompanyName: (value) => set({ companyName: value }),
  setCompanyWebsiteUrl: (value) => set({ companyWebsiteUrl: value }),
  setRecipientName: (value) => set({ recipientName: value }),
  setRecipientRole: (value) => set({ recipientRole: value }),
  setJobDescription: (value) => set({ jobDescription: value }),
  setTone: (value) => set({ tone: value }),
  setLength: (value) => set({ length: value }),
  setCallToAction: (value) => set({ callToAction: value }),
  setDraft: (draft) => set({ draft }),
  setShowComposer: (showComposer) => set({ showComposer }),

  // ---------------------------------------------------------------------------
  handleGenerate: async (event) => {
    event.preventDefault();
    const {
      resumeId,
      jobTitle,
      companyName,
      companyWebsiteUrl,
      recipientName,
      recipientRole,
      jobDescription,
      tone,
      length,
      callToAction,
      resumes,
    } = get();

    const selectedResume = resumes.find((r) => r.id === resumeId);
    const hasParsedResume = selectedResume?.status === "parsed";
    const canGenerate = Boolean(
      resumeId &&
      hasParsedResume &&
      companyWebsiteUrl.trim() &&
      jobDescription.trim().length >= 20,
    );

    set({ error: null });

    if (!canGenerate) {
      set({
        error:
          "Choose a parsed resume, add the company website, and add a job description with at least 20 characters.",
      });
      return false;
    }

    set({ isGenerating: true });

    try {
      const nextDraft = await requestColdEmail({
        resumeId,
        jobTitle,
        companyName,
        companyWebsiteUrl,
        recipientName,
        recipientRole,
        jobDescription,
        tone,
        length,
        callToAction,
      });

      const coldEmailId = nextDraft.coldEmailId;
      set({ draft: nextDraft, showComposer: false });

      if (coldEmailId) {
        const savedDraft = { ...nextDraft, coldEmailId };
        set((s) => ({
          history: [
            {
              id: coldEmailId,
              resumeId,
              resumeTitle: selectedResume?.title ?? "Resume",
              jobTitle,
              companyName,
              companyWebsiteUrl,
              recipientName,
              recipientRole,
              tone,
              length,
              callToAction,
              subject: nextDraft.subject,
              previewText: nextDraft.previewText,
              body: nextDraft.body,
              qualityScore: nextDraft.qualityScore,
              draft: savedDraft,
              createdAt: new Date().toISOString(),
            },
            ...s.history.filter((item) => item.id !== coldEmailId),
          ],
        }));
      }

      return true;
    } catch (err) {
      set({
        error:
          err instanceof Error ? err.message : "Unable to generate cold email.",
      });
      return false;
    } finally {
      set({ isGenerating: false });
    }
  },
}));
