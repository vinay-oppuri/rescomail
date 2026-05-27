"use client";

import type { FormEvent } from "react";
import { AlertTriangle, ArrowRight, Loader2, Sparkles, Zap } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { Badge } from "@repo/ui/components/badge";

import { useAtsStore } from "../../store/ats-store";
import AtsJobFields from "./form/ats-job-fields";
import AtsResumePicker from "./form/ats-resume-picker";

const AtsAnalysisForm = () => {
  const { handleAnalyze, error, isAnalyzing, resumeId, jobDescription } =
    useAtsStore();

  const canAnalyze = Boolean(resumeId && jobDescription.trim().length >= 20);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    void handleAnalyze(event);
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col border-0 bg-muted/10 shadow-xl ring-1 ring-border/50 backdrop-blur-2xl transition-all duration-500">
      <div className="flex items-start justify-between gap-3 border-b border-border/40 bg-card/20 px-4 py-3">
        <div>
          <h2 className="flex items-center gap-2 text-base font-semibold tracking-tight text-foreground">
            <Zap className="h-4 w-4 text-primary" />
            Analysis setup
          </h2>
          <p className="mt-1.5 text-sm text-muted-foreground/80">
            Provide the resume and target role to extract actionable intelligence.
          </p>
        </div>
        <Badge variant="outline" className="shrink-0 rounded-none border-primary/5 bg-muted/30 text-xs text-primary shadow-sm p-3">
          Live BGE Model
        </Badge>
      </div>

      <div className="flex flex-col gap-4 p-4">
        <AtsResumePicker />
        
        <div className="h-px w-full bg-border/40 m-4 mx-auto" />

        <AtsJobFields />

        {error ? (
          <div className="flex gap-3 border-l-4 border-l-destructive border-y border-r border-y-destructive/20 border-r-destructive/20 bg-destructive/5 p-4 text-sm text-destructive shadow-sm">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <p className="font-medium">{error}</p>
          </div>
        ) : null}

        <Button 
          type="submit" 
          disabled={!canAnalyze || isAnalyzing}
          className="group relative mt-2 h-12 w-full overflow-hidden rounded-none bg-primary text-primary-foreground shadow-md transition-all hover:shadow-lg disabled:opacity-50"
        >
          <div className="absolute inset-0 flex h-full w-full justify-center transform-[skew(-12deg)_translateX(-100%)] group-hover:duration-1000 group-hover:transform-[skew(-12deg)_translateX(100%)]">
            <div className="relative h-full w-8 bg-white/20" />
          </div>
          {isAnalyzing ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
          )}
          <span className="font-semibold tracking-wide">
            {isAnalyzing ? "Analyzing Fit..." : "Analyze Match"}
          </span>
          {!isAnalyzing && <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />}
        </Button>
      </div>
    </form>
  );
};

export default AtsAnalysisForm;
