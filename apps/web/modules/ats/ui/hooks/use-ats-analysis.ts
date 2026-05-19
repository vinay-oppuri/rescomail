import { type FormEvent, useMemo, useState } from "react";
import type { AtsAnalysisResponse } from "@repo/validations";

import type { AtsAnalysisHistoryItem } from "../../server/ats-history";
import type { AtsResumeOption } from "../../server/ats-resumes";

const parseKeywords = (value: string) =>
  value
    .split(/[,\n]/)
    .map((keyword) => keyword.trim())
    .filter(Boolean)
    .slice(0, 80);

export const useAtsAnalysis = (
  analyses: AtsAnalysisHistoryItem[],
  resumes: AtsResumeOption[],
) => {
  const defaultResume = useMemo(
    () => resumes.find((resume) => resume.status === "parsed") ?? resumes[0],
    [resumes],
  );
  const [resumeId, setResumeId] = useState(defaultResume?.id ?? "");
  const [jobTitle, setJobTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [keywordText, setKeywordText] = useState("");
  const [analysis, setAnalysis] = useState<AtsAnalysisResponse | null>(null);
  const [history, setHistory] = useState(analyses);
  const [error, setError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const selectedResume = resumes.find((resume) => resume.id === resumeId);
  const canAnalyze = Boolean(resumeId && jobDescription.trim().length >= 20);

  const handleAnalyze = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setAnalysis(null);

    if (!canAnalyze) {
      setError("Choose a resume and add a job description.");
      return;
    }

    setIsAnalyzing(true);

    try {
      const nextAnalysis = await requestAnalysis({
        resumeId,
        jobTitle,
        companyName,
        jobDescription,
        targetKeywords: parseKeywords(keywordText),
      });

      setAnalysis(nextAnalysis);
      saveAnalysisToHistory(nextAnalysis);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to run ATS analysis.",
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveAnalysisToHistory = (nextAnalysis: AtsAnalysisResponse) => {
    const analysisId = nextAnalysis.analysisId;

    if (!analysisId) {
      return;
    }

    const savedAnalysis = { ...nextAnalysis, analysisId };
    setHistory((currentHistory) => [
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
      ...currentHistory.filter((item) => item.id !== analysisId),
    ]);
  };

  return {
    analysis,
    canAnalyze,
    companyName,
    error,
    handleAnalyze,
    history,
    isAnalyzing,
    jobDescription,
    jobTitle,
    keywordText,
    resumeId,
    selectedResume,
    setAnalysis,
    setCompanyName,
    setJobDescription,
    setJobTitle,
    setKeywordText,
    setResumeId,
  };
};

type AnalysisRequest = {
  resumeId: string;
  jobTitle: string;
  companyName: string;
  jobDescription: string;
  targetKeywords: string[];
};

const requestAnalysis = async (payload: AnalysisRequest) => {
  const response = await fetch("/api/ats/analyze", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
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
