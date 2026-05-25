import type { AtsAnalysisResponse } from "@repo/validations";
import { Badge } from "@repo/ui/components/badge";
import { cn } from "@repo/ui/lib/utils";
import { BrainCircuit, Database, Target, TrendingUp } from "lucide-react";

interface AtsIntelligencePanelProps {
  intelligence: AtsAnalysisResponse["intelligence"];
}

const confidenceTone: Record<
  AtsAnalysisResponse["intelligence"]["compatibilityPrediction"]["confidence"],
  string
> = {
  high: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700",
  medium: "border-blue-500/20 bg-blue-500/10 text-blue-700",
  low: "border-amber-500/20 bg-amber-500/10 text-amber-700",
};

const sourceTypeLabel: Record<
  AtsAnalysisResponse["intelligence"]["recruiterGuidance"][number]["citations"][number]["sourceType"],
  string
> = {
  recruiter_guideline: "Recruiter",
  resume_pattern: "Resume pattern",
  domain_knowledge: "Domain",
};

const AtsIntelligencePanel = ({ intelligence }: AtsIntelligencePanelProps) => {
  const prediction = intelligence.compatibilityPrediction;
  const semantic = intelligence.semanticMatch;

  return (
    <div className="border-t">
      <div className="grid gap-0 xl:grid-cols-[300px_1fr]">
        <div className="border-b p-5 xl:border-r">
          <div className="flex items-center gap-2">
            <BrainCircuit className="h-4 w-4 text-blue-600" />
            <h3 className="text-sm font-semibold">ML compatibility</h3>
          </div>

          <div className="mt-4 flex items-end gap-3">
            <p className="text-4xl font-bold tracking-tight">
              {prediction.probability}%
            </p>
            <Badge
              variant="outline"
              className={cn("mb-1 capitalize", confidenceTone[prediction.confidence])}
            >
              {prediction.confidence}
            </Badge>
          </div>

          <p className="mt-2 text-xs text-muted-foreground">
            {prediction.modelVersion}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {prediction.modelType}
          </p>

          <div className="mt-4 space-y-2">
            {prediction.signals.length === 0 ? (
              <p className="text-sm text-muted-foreground">No model signals yet</p>
            ) : (
              prediction.signals.map((signal) => (
                <div
                  key={`${signal.label}-${signal.direction}`}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <span className="text-muted-foreground">{signal.label}</span>
                  <span
                    className={cn(
                      "font-medium",
                      signal.direction === "positive"
                        ? "text-emerald-700"
                        : "text-destructive",
                    )}
                  >
                    {signal.impact > 0 ? "+" : ""}
                    {signal.impact}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="border-b p-5">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-emerald-600" />
            <h3 className="text-sm font-semibold">Semantic match</h3>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <Metric label="Resume/job" value={semantic.resumeToJob} />
            <Metric label="Title alignment" value={semantic.titleAlignment} />
            <Metric
              label="Required skills"
              value={semantic.requiredSkillCoverage}
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {semantic.matchedConcepts.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No shared concepts detected
              </p>
            ) : (
              semantic.matchedConcepts.slice(0, 10).map((concept) => (
                <Badge key={concept} variant="outline">
                  {concept}
                </Badge>
              ))
            )}
          </div>

          <p className="mt-3 text-xs text-muted-foreground">
            {semantic.embeddingModel}
          </p>
        </div>
      </div>

      <div className="grid gap-0 xl:grid-cols-2">
        <div className="border-b p-5 xl:border-r">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-amber-600" />
            <h3 className="text-sm font-semibold">Skill gaps</h3>
          </div>

          <div className="mt-4 divide-y border">
            {intelligence.skillGaps.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">
                No priority gaps detected
              </p>
            ) : (
              intelligence.skillGaps.slice(0, 6).map((gap) => (
                <div key={gap.skill} className="p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={severityVariant(gap.severity)}>
                      {gap.severity}
                    </Badge>
                    <p className="text-sm font-medium">{gap.skill}</p>
                    <Badge variant="outline" className="capitalize">
                      {gap.currentEvidence}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {gap.recommendation}
                  </p>
                  <p className="mt-2 text-sm leading-6">{gap.learningFocus}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="border-b p-5">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-violet-600" />
            <h3 className="text-sm font-semibold">Retrieved guidance</h3>
          </div>

          <div className="mt-4 divide-y border">
            {intelligence.recruiterGuidance.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">
                No guidance retrieved
              </p>
            ) : (
              intelligence.recruiterGuidance.map((item) => (
                <div key={item.title} className="p-4">
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {item.detail}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {item.citations.map((citation) => (
                      <Badge key={citation.id} variant="outline">
                        {sourceTypeLabel[citation.sourceType]} /{" "}
                        {citation.relevance}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface MetricProps {
  label: string;
  value: number;
}

const severityVariant = (
  severity: AtsAnalysisResponse["intelligence"]["skillGaps"][number]["severity"],
) => {
  if (severity === "critical") {
    return "destructive";
  }

  if (severity === "important") {
    return "outline";
  }

  return "secondary";
};

const Metric = ({ label, value }: MetricProps) => (
  <div className="border p-3">
    <div className="flex items-center justify-between text-xs font-medium">
      <span>{label}</span>
      <span>{value}/100</span>
    </div>
    <div className="mt-2 h-1.5 bg-muted">
      <div className="h-full bg-emerald-500" style={{ width: `${value}%` }} />
    </div>
  </div>
);

export default AtsIntelligencePanel;
