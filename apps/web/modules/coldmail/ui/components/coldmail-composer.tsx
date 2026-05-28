"use client";

import type { FormEvent } from "react";
import type {
  ColdEmailCallToAction,
  ColdEmailLength,
  ColdEmailTone,
} from "@repo/validations";
import {
  AlertTriangle,
  ArrowRight,
  Loader2,
  Sparkles,
  Building2,
  Settings2,
  FileText,
} from "lucide-react";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { Textarea } from "@repo/ui/components/textarea";

import { useColdmailStore } from "../../store/coldmail-store";

const toneOptions: Array<{ value: ColdEmailTone; label: string }> = [
  { value: "warm", label: "Warm" },
  { value: "confident", label: "Confident" },
  { value: "direct", label: "Direct" },
  { value: "friendly", label: "Friendly" },
];

const lengthOptions: Array<{ value: ColdEmailLength; label: string }> = [
  { value: "concise", label: "Concise" },
  { value: "standard", label: "Standard" },
  { value: "detailed", label: "Detailed" },
];

const callToActionOptions: Array<{
  value: ColdEmailCallToAction;
  label: string;
}> = [
  { value: "conversation", label: "Conversation" },
  { value: "referral", label: "Referral" },
  { value: "interview", label: "Interview" },
  { value: "feedback", label: "Feedback" },
];

const ColdmailComposer = () => {
  const {
    resumes,
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
    error,
    isGenerating,
    setResumeId,
    setJobTitle,
    setCompanyName,
    setCompanyWebsiteUrl,
    setRecipientName,
    setRecipientRole,
    setJobDescription,
    setPersonalNote,
    setTone,
    setLength,
    setCallToAction,
    handleGenerate,
  } = useColdmailStore();

  const selectedResume = resumes.find((r) => r.id === resumeId);
  const parsedCount = resumes.filter((r) => r.status === "parsed").length;
  const hasParsedResume = selectedResume?.status === "parsed";
  const canGenerate = Boolean(
    resumeId &&
    hasParsedResume &&
    companyWebsiteUrl.trim() &&
    jobDescription.trim().length >= 20,
  );

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    void handleGenerate(event);
  };

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col rounded-none border border-foreground/5 bg-card/20 shadow-sm overflow-hidden"
    >
      <div className="flex items-start justify-between gap-3 border-b border-foreground/5 bg-muted/10 px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold tracking-tight text-foreground">
            Email Composer
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Configure the parameters for your AI-generated outreach.
          </p>
        </div>
        <Badge
          variant="secondary"
          className="shrink-0 gap-1.5 rounded-none shadow-sm"
        >
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          AI Draft
        </Badge>
      </div>

      <div className="flex flex-col gap-6 p-5 sm:p-6">
        {/* Section 1: Setup */}
        <div className="space-y-4">
          <h3 className="flex items-center gap-2 text-xs font-semibold text-foreground uppercase tracking-widest">
            <Settings2 className="h-4 w-4 text-primary" />
            Core Configuration
          </h3>
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
            <div className="space-y-2">
              <Label htmlFor="resume">Resume Source</Label>
              <Select value={resumeId} onValueChange={setResumeId}>
                <SelectTrigger
                  id="resume"
                  className="w-full rounded-none bg-muted/20! border-foreground/5!"
                >
                  <SelectValue placeholder="Select parsed resume" />
                </SelectTrigger>
                <SelectContent className="rounded-none">
                  <SelectGroup>
                    {resumes.map((resume) => (
                      <SelectItem
                        key={resume.id}
                        value={resume.id}
                        disabled={resume.status !== "parsed"}
                        className="rounded-none"
                      >
                        {resume.title}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {selectedResume
                  ? selectedResume.status === "parsed"
                    ? selectedResume.fileName
                    : (selectedResume.parsingError ??
                      "Resume is not parsed yet.")
                  : `${parsedCount} parsed resumes available`}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="tone">Tone</Label>
                <Select
                  value={tone}
                  onValueChange={(value) => setTone(value as ColdEmailTone)}
                >
                  <SelectTrigger
                    id="tone"
                    className="w-full rounded-none bg-muted/20! border-foreground/5!"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-none">
                    <SelectGroup>
                      {toneOptions.map((option) => (
                        <SelectItem
                          key={option.value}
                          value={option.value}
                          className="rounded-none"
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="length">Length</Label>
                <Select
                  value={length}
                  onValueChange={(value) => setLength(value as ColdEmailLength)}
                >
                  <SelectTrigger
                    id="length"
                    className="w-full rounded-none bg-muted/20! border-foreground/5!"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-none">
                    <SelectGroup>
                      {lengthOptions.map((option) => (
                        <SelectItem
                          key={option.value}
                          value={option.value}
                          className="rounded-none"
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Target */}
        <div className="space-y-4 pt-5 border-t border-foreground/5">
          <h3 className="flex items-center gap-2 text-xs font-semibold text-foreground uppercase tracking-widest">
            <Building2 className="h-4 w-4 text-primary" />
            Target Information
          </h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="job-title">Role Title</Label>
              <Input
                id="job-title"
                value={jobTitle}
                onChange={(event) => setJobTitle(event.target.value)}
                placeholder="e.g. Product Engineer"
                className="rounded-none bg-muted/20! border-foreground/5!"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company-name">Company Name</Label>
              <Input
                id="company-name"
                value={companyName}
                onChange={(event) => setCompanyName(event.target.value)}
                placeholder="e.g. Acme Corp"
                className="rounded-none bg-muted/20! border-foreground/5!"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company-website">Company Website</Label>
              <Input
                id="company-website"
                value={companyWebsiteUrl}
                onChange={(event) => setCompanyWebsiteUrl(event.target.value)}
                placeholder="https://acme.com"
                inputMode="url"
                className="rounded-none bg-muted/20! border-foreground/5!"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="recipient-name">Recipient Name</Label>
              <Input
                id="recipient-name"
                value={recipientName}
                onChange={(event) => setRecipientName(event.target.value)}
                placeholder="e.g. Alex Morgan"
                className="rounded-none bg-muted/20! border-foreground/5!"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="recipient-role">Recipient Role</Label>
              <Input
                id="recipient-role"
                value={recipientRole}
                onChange={(event) => setRecipientRole(event.target.value)}
                placeholder="e.g. Recruiting Lead"
                className="rounded-none bg-muted/20! border-foreground/5!"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Content */}
        <div className="space-y-4 pt-5 border-t border-foreground/5">
          <h3 className="flex items-center gap-2 text-xs font-semibold text-foreground uppercase tracking-widest">
            <FileText className="h-4 w-4 text-primary" />
            Content & Personalization
          </h3>

          <div className="grid gap-4 sm:grid-cols-[1fr_220px]">
            <div className="space-y-2">
              <Label htmlFor="job-description">Job Description</Label>
              <Textarea
                id="job-description"
                value={jobDescription}
                onChange={(event) => setJobDescription(event.target.value)}
                placeholder="Paste the target role or recruiter post"
                className="min-h-48 resize-y rounded-none bg-muted/20! border-foreground/5! leading-relaxed"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cta">Call to Action (Ask)</Label>
              <Select
                value={callToAction}
                onValueChange={(value) =>
                  setCallToAction(value as ColdEmailCallToAction)
                }
              >
                <SelectTrigger
                  id="cta"
                  className="w-full rounded-none bg-muted/20! border-foreground/5!"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-none">
                  <SelectGroup>
                    {callToActionOptions.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                        className="rounded-none"
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-3 pt-2">
            <div className="space-y-2">
              <Label htmlFor="personal-note">Candidate Personal Note</Label>
              <Textarea
                id="personal-note"
                value={personalNote}
                onChange={(event) => setPersonalNote(event.target.value)}
                placeholder="Add any specific angle, personal connection, or context to include in the draft..."
                className="min-h-24 resize-y rounded-none bg-muted/20! border-foreground/5!"
              />
            </div>
          </div>
        </div>

        {error ? (
          <div className="mt-2 flex gap-3 rounded-none border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive shadow-sm">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <p className="leading-relaxed">{error}</p>
          </div>
        ) : null}

        <Button
          type="submit"
          disabled={!canGenerate || isGenerating}
          className="mt-4 h-12 w-full rounded-none bg-linear-to-r from-primary to-primary/80 text-primary-foreground shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none font-semibold text-sm"
        >
          {isGenerating ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-5 w-5" />
          )}
          {isGenerating
            ? "Drafting your email..."
            : "Generate Professional Draft"}
          {!isGenerating ? <ArrowRight className="ml-2 h-5 w-5" /> : null}
        </Button>
      </div>
    </form>
  );
};

export default ColdmailComposer;
