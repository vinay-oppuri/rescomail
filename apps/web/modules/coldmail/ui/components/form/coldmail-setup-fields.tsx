"use client";

import Link from "next/link";
import type { ColdEmailLength, ColdEmailTone } from "@repo/validations";
import { Button } from "@repo/ui/components/button";
import { Label } from "@repo/ui/components/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";

import { useColdmailStore } from "../../../store/coldmail-store";
import { lengthOptions, toneOptions } from "./coldmail-options";

const ColdmailSetupFields = () => {
  const { resumes, resumeId, tone, length, setResumeId, setTone, setLength } =
    useColdmailStore();
  const selectedResume = resumes.find((resume) => resume.id === resumeId);
  const parsedCount = resumes.filter(
    (resume) => resume.status === "parsed",
  ).length;

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
      <div className="space-y-2">
        <Label htmlFor="coldmail-resume">
          Resume <span className="text-muted-foreground">(required)</span>
        </Label>
        <Select
          value={resumeId}
          onValueChange={setResumeId}
          disabled={resumes.length === 0}
        >
          <SelectTrigger
            id="coldmail-resume"
            className="w-full rounded-sm border-foreground/5! bg-muted/20!"
          >
            <SelectValue placeholder="Select a parsed resume" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {resumes.map((resume) => (
                <SelectItem
                  key={resume.id}
                  value={resume.id}
                  disabled={resume.status !== "parsed"}
                >
                  {resume.title}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        {resumes.length === 0 ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-sm border border-foreground/5 bg-muted/10 p-3">
            <p className="text-xs text-muted-foreground">
              Upload and parse a resume before generating a draft.
            </p>
            <Button asChild type="button" size="sm" variant="outline">
              <Link href="/dashboard/resumes">Upload resume</Link>
            </Button>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            {selectedResume?.status === "parsed"
              ? selectedResume.fileName
              : `${parsedCount} parsed resumes available`}
          </p>
        )}
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
              className="w-full rounded-sm border-foreground/5! bg-muted/20!"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {toneOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
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
              className="w-full rounded-sm border-foreground/5! bg-muted/20!"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {lengthOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default ColdmailSetupFields;
