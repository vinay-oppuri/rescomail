import { z } from "zod";

const optionalTrimmedString = (maxLength: number) =>
  z
    .string()
    .trim()
    .max(maxLength)
    .optional()
    .transform((value) => value ?? "");

export const atsAnalyzeSchema = z.object({
  resumeId: z.string().uuid(),
  jobTitle: optionalTrimmedString(200),
  companyName: optionalTrimmedString(200),
  jobDescription: z.string().trim().min(20).max(100_000),
  targetKeywords: z.array(z.string().trim().min(1).max(100)).max(80).default([]),
});

export const atsScoreBreakdownSchema = z.object({
  keywords: z.number().int().min(0).max(100),
  semantic: z.number().int().min(0).max(100),
  skills: z.number().int().min(0).max(100),
  experience: z.number().int().min(0).max(100),
  impact: z.number().int().min(0).max(100),
  formatting: z.number().int().min(0).max(100),
});

export const atsSuggestionSchema = z.object({
  priority: z.enum(["high", "medium", "low"]),
  title: z.string(),
  detail: z.string(),
  example: z.string().nullable().optional(),
});

export const atsJobProfileSchema = z.object({
  title: z.string(),
  seniority: z.string(),
  yearsRequired: z.number().int().min(0),
  requiredKeywords: z.array(z.string()),
  preferredKeywords: z.array(z.string()),
  responsibilities: z.array(z.string()),
  certifications: z.array(z.string()),
});

export const atsKeywordEvidenceSchema = z.object({
  keyword: z.string(),
  status: z.enum(["exact", "semantic", "missing"]),
  strength: z.number().int().min(0).max(100),
  sourceSection: z.string(),
  snippets: z.array(z.string()),
});

export const atsRewriteSuggestionSchema = z.object({
  target: z.string(),
  reason: z.string(),
  before: z.string().nullable().optional(),
  after: z.string(),
});

export const atsSemanticMatchSchema = z.object({
  resumeToJob: z.number().int().min(0).max(100),
  titleAlignment: z.number().int().min(0).max(100),
  requiredSkillCoverage: z.number().int().min(0).max(100),
  embeddingModel: z.string(),
  matchedConcepts: z.array(z.string()),
});

export const atsModelSignalSchema = z.object({
  label: z.string(),
  impact: z.number().int().min(-100).max(100),
  direction: z.enum(["positive", "negative"]),
});

export const atsCompatibilityPredictionSchema = z.object({
  modelVersion: z.string(),
  modelType: z.string(),
  probability: z.number().int().min(0).max(100),
  confidence: z.enum(["low", "medium", "high"]),
  signals: z.array(atsModelSignalSchema),
});

export const atsSkillGapSchema = z.object({
  skill: z.string(),
  severity: z.enum(["critical", "important", "optional"]),
  currentEvidence: z.enum(["missing", "weak", "semantic"]),
  recommendation: z.string(),
  learningFocus: z.string(),
});

export const atsRetrievalCitationSchema = z.object({
  id: z.string(),
  title: z.string(),
  sourceType: z.enum([
    "recruiter_guideline",
    "resume_pattern",
    "domain_knowledge",
  ]),
  relevance: z.number().int().min(0).max(100),
});

export const atsGroundedSuggestionSchema = z.object({
  title: z.string(),
  detail: z.string(),
  citations: z.array(atsRetrievalCitationSchema),
});

const defaultAtsIntelligence = {
  semanticMatch: {
    resumeToJob: 0,
    titleAlignment: 0,
    requiredSkillCoverage: 0,
    embeddingModel: "legacy-analysis",
    matchedConcepts: [],
  },
  compatibilityPrediction: {
    modelVersion: "legacy-analysis",
    modelType: "legacy-analysis",
    probability: 0,
    confidence: "low" as const,
    signals: [],
  },
  skillGaps: [],
  recruiterGuidance: [],
};

export const atsIntelligenceSchema = z
  .object({
    semanticMatch: atsSemanticMatchSchema,
    compatibilityPrediction: atsCompatibilityPredictionSchema,
    skillGaps: z.array(atsSkillGapSchema),
    recruiterGuidance: z.array(atsGroundedSuggestionSchema),
  })
  .default(defaultAtsIntelligence);

export const atsAnalysisResponseSchema = z.object({
  analysisId: z.string().uuid().optional(),
  resumeId: z.string().nullable().optional(),
  overallScore: z.number().int().min(0).max(100),
  verdict: z.enum(["strong_match", "good_match", "partial_match", "needs_work"]),
  categoryScores: atsScoreBreakdownSchema,
  jobProfile: atsJobProfileSchema,
  evidence: z.array(atsKeywordEvidenceSchema),
  matchedKeywords: z.array(z.string()),
  missingKeywords: z.array(z.string()),
  strengths: z.array(z.string()),
  risks: z.array(z.string()),
  suggestions: z.array(atsSuggestionSchema),
  rewriteSuggestions: z.array(atsRewriteSuggestionSchema),
  intelligence: atsIntelligenceSchema,
  summary: z.string(),
});

export type AtsAnalyzeInput = z.infer<typeof atsAnalyzeSchema>;
export type AtsAnalysisResponse = z.infer<typeof atsAnalysisResponseSchema>;
