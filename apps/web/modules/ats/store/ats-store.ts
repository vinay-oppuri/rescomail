import { create } from "zustand";
import type { FormEvent } from "react";
import type { AtsAnalysisResponse } from "@repo/validations";

import type { AtsAnalysisHistoryItem } from "../server/ats-history";
import type { AtsResumeOption } from "../server/ats-resumes";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const parseKeywords = (value: string) =>
  value
    .split(/[,\n]/)
    .map((kw) => kw.trim())
    .filter(Boolean)
    .slice(0, 80);

const requestAnalysis = async (payload: {
  resumeId: string;
  jobTitle: string;
  companyName: string;
  jobDescription: string;
  targetKeywords: string[];
}) => {
  const response = await fetch("/api/ats/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = (await response.json()) as AtsAnalysisResponse | { error?: string };

  if (!response.ok) {
    throw new Error(
      "error" in data && data.error ? data.error : "Unable to run ATS analysis.",
    );
  }

  return data as AtsAnalysisResponse;
};

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

interface AtsStore {
  // Server data (refreshed via initStore)
  resumes: AtsResumeOption[];
  history: AtsAnalysisHistoryItem[];

  // Form fields (survive route navigation)
  resumeId: string;
  jobTitle: string;
  companyName: string;
  jobDescription: string;
  keywordText: string;

  // Result & UI
  analysis: AtsAnalysisResponse | null;
  isAnalyzing: boolean;
  error: string | null;
  showForm: boolean;

  // -------------------------------------------------------------------------
  // Actions
  // -------------------------------------------------------------------------

  /**
   * Called once on view mount (and on server-data refresh).
   * Updates resumes + history from the server while preserving form fields.
   */
  initStore: (analyses: AtsAnalysisHistoryItem[], resumes: AtsResumeOption[]) => void;

  setResumeId: (value: string) => void;
  setJobTitle: (value: string) => void;
  setCompanyName: (value: string) => void;
  setJobDescription: (value: string) => void;
  setKeywordText: (value: string) => void;
  setAnalysis: (analysis: AtsAnalysisResponse | null) => void;
  setShowForm: (show: boolean) => void;

  /** Submits the analysis form. Returns true on success. */
  handleAnalyze: (event: FormEvent<HTMLFormElement>) => Promise<boolean>;
}

export const useAtsStore = create<AtsStore>((set, get) => ({
  resumes: [],
  history: [],
  resumeId: "",
  jobTitle: "",
  companyName: "",
  jobDescription: "",
  keywordText: "",
  analysis: null,
  isAnalyzing: false,
  error: null,
  showForm: true,

  // ---------------------------------------------------------------------------
  initStore: (analyses, resumes) => {
    set((state) => {
      const firstParsed =
        resumes.find((r) => r.status === "parsed") ?? resumes[0];
      // Preserve the current resumeId if it still exists in the fresh list;
      // otherwise fall back to the first parsed resume.
      const nextResumeId =
        state.resumeId && resumes.some((r) => r.id === state.resumeId)
          ? state.resumeId
          : (firstParsed?.id ?? "");

      return { resumes, history: analyses, resumeId: nextResumeId };
    });
  },

  // Field setters
  setResumeId: (value) => set({ resumeId: value }),
  setJobTitle: (value) => set({ jobTitle: value }),
  setCompanyName: (value) => set({ companyName: value }),
  setJobDescription: (value) => set({ jobDescription: value }),
  setKeywordText: (value) => set({ keywordText: value }),
  setAnalysis: (analysis) => set({ analysis }),
  setShowForm: (showForm) => set({ showForm }),

  // ---------------------------------------------------------------------------
  handleAnalyze: async (event) => {
    event.preventDefault();
    const {
      resumeId,
      jobTitle,
      companyName,
      jobDescription,
      keywordText,
      resumes,
    } = get();

    const canAnalyze = Boolean(
      resumeId && jobDescription.trim().length >= 20,
    );

    set({ error: null, analysis: null });

    if (!canAnalyze) {
      set({ error: "Choose a resume and add a job description." });
      return false;
    }

    set({ isAnalyzing: true });

    try {
      const nextAnalysis = await requestAnalysis({
        resumeId,
        jobTitle,
        companyName,
        jobDescription,
        targetKeywords: parseKeywords(keywordText),
      });

      const selectedResume = resumes.find((r) => r.id === resumeId);
      const analysisId = nextAnalysis.analysisId;

      set({ analysis: nextAnalysis, showForm: false });

      if (analysisId) {
        const savedAnalysis = { ...nextAnalysis, analysisId };
        set((s) => ({
          history: [
            {
              id: analysisId,
              resumeId,
              resumeTitle: selectedResume?.title ?? "Resume",
              jobTitle,
              companyName,
              overallScore: nextAnalysis.overallScore,
              verdict: nextAnalysis.verdict,
              analysis: savedAnalysis,
              createdAt: new Date().toISOString(),
            },
            ...s.history.filter((item) => item.id !== analysisId),
          ],
        }));
      }

      return true;
    } catch (err) {
      set({
        error:
          err instanceof Error ? err.message : "Unable to run ATS analysis.",
      });
      return false;
    } finally {
      set({ isAnalyzing: false });
    }
  },
}));
