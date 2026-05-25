import { create } from "zustand";
import type { FormEvent } from "react";
import type {
  ColdEmailCallToAction,
  ColdEmailGenerateInput,
  ColdEmailLength,
  ColdEmailResponse,
  ColdEmailTone,
} from "@repo/validations";

import type { ColdEmailHistoryItem } from "../server/coldmail-history";
import type { ColdmailResumeOption } from "../server/coldmail-resumes";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const requestColdEmail = async (payload: ColdEmailGenerateInput) => {
  const response = await fetch("/api/coldmail/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = (await response.json()) as ColdEmailResponse | { error?: string };

  if (!response.ok) {
    throw new Error(
      "error" in data && data.error
        ? data.error
        : "Unable to generate cold email.",
    );
  }

  return data as ColdEmailResponse;
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
  personalNote: string;
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
  setPersonalNote: (value: string) => void;
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
  personalNote: "",
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

      return { resumes, history: emails, resumeId: nextResumeId, draft: nextDraft };
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
  setPersonalNote: (value) => set({ personalNote: value }),
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
      personalNote,
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
          "Choose a parsed resume, add the company website, and add a job description.",
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
        personalNote,
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
