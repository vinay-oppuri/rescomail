import type { AtsAnalysisResponse } from "@repo/validations";

export const verdictLabel: Record<AtsAnalysisResponse["verdict"], string> = {
  strong_match: "Strong match",
  good_match: "Good match",
  partial_match: "Partial match",
  needs_work: "Needs work",
};

export const verdictTone: Record<AtsAnalysisResponse["verdict"], string> = {
  strong_match: "text-emerald-700 bg-emerald-500/10 border-emerald-500/20",
  good_match: "text-blue-700 bg-blue-500/10 border-blue-500/20",
  partial_match: "text-amber-700 bg-amber-500/10 border-amber-500/20",
  needs_work: "text-destructive bg-destructive/10 border-destructive/20",
};

export const categoryLabels: Record<
  keyof AtsAnalysisResponse["categoryScores"],
  string
> = {
  keywords: "Keywords",
  semantic: "Semantic",
  skills: "Skills",
  experience: "Experience",
  impact: "Impact",
  formatting: "Formatting",
};

export const scoreColor = (score: number) => {
  if (score >= 80) {
    return "bg-emerald-500";
  }

  if (score >= 65) {
    return "bg-blue-500";
  }

  if (score >= 50) {
    return "bg-amber-500";
  }

  return "bg-destructive";
};
