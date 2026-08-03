"use client";

import { useRef, useState } from "react";
import { AlertCircle, CheckCircle2, FileUp, Loader2, Type } from "lucide-react";

import { Label } from "@repo/ui/components/label";
import { Textarea } from "@repo/ui/components/textarea";
import { cn } from "@repo/ui/lib/utils";

import { useAtsStore } from "../../../store/ats-store";

const MAX_FILE_BYTES = 5 * 1024 * 1024;

type InputMode = "file" | "text";

const isSupportedFile = (file: File) => {
  const name = file.name.toLowerCase();
  return (
    file.type === "application/pdf" ||
    file.type === "text/markdown" ||
    name.endsWith(".pdf") ||
    name.endsWith(".md") ||
    name.endsWith(".markdown")
  );
};

const getResponseError = (value: unknown) => {
  if (
    value &&
    typeof value === "object" &&
    "error" in value &&
    typeof value.error === "string"
  ) {
    return value.error;
  }
  return "Unable to read that job-description file.";
};

const getResponseText = (value: unknown) => {
  if (
    value &&
    typeof value === "object" &&
    "text" in value &&
    typeof value.text === "string"
  ) {
    return value.text;
  }
  return null;
};

const wordCount = (value: string) =>
  value.trim() ? value.trim().split(/\s+/).length : 0;

const AtsJobDescriptionInput = () => {
  const { jobDescription, setJobDescription } = useAtsStore();
  const [mode, setMode] = useState<InputMode>(jobDescription ? "text" : "file");
  const [manualText, setManualText] = useState(jobDescription);
  const [uploadedText, setUploadedText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeModeRef = useRef<InputMode>(mode);
  const extractionIdRef = useRef(0);

  const changeMode = (nextMode: InputMode) => {
    activeModeRef.current = nextMode;
    setMode(nextMode);
    setError(null);
    setJobDescription(nextMode === "text" ? manualText : uploadedText);
  };

  const extractFile = async (nextFile?: File) => {
    if (!nextFile) return;

    const extractionId = ++extractionIdRef.current;
    setError(null);

    if (!isSupportedFile(nextFile)) {
      setFile(null);
      setUploadedText("");
      setJobDescription("");
      setIsExtracting(false);
      setError("Upload a PDF or Markdown file.");
      return;
    }
    if (nextFile.size > MAX_FILE_BYTES) {
      setFile(null);
      setUploadedText("");
      setJobDescription("");
      setIsExtracting(false);
      setError("File must be 5 MB or smaller.");
      return;
    }

    setFile(nextFile);
    setUploadedText("");
    setJobDescription("");
    setIsExtracting(true);

    try {
      const formData = new FormData();
      formData.set("file", nextFile);

      const response = await fetch("/api/ats/extract-job-description", {
        method: "POST",
        body: formData,
      });
      const data: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(getResponseError(data));
      }

      const text = getResponseText(data);
      if (!text) {
        throw new Error("No readable text was found in that file.");
      }
      if (extractionId !== extractionIdRef.current) return;

      setUploadedText(text);
      if (activeModeRef.current === "file") setJobDescription(text);
    } catch (uploadError) {
      if (extractionId !== extractionIdRef.current) return;
      setFile(null);
      setUploadedText("");
      if (activeModeRef.current === "file") setJobDescription("");
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Unable to read that job-description file.",
      );
    } finally {
      if (extractionId === extractionIdRef.current) setIsExtracting(false);
    }
  };

  const currentWordCount = wordCount(jobDescription);

  return (
    <div className="space-y-3">
      <Label>Job Description</Label>

      <div
        className="grid grid-cols-2 gap-2"
        role="group"
        aria-label="Job description input method"
      >
        <button
          type="button"
          aria-pressed={mode === "file"}
          className={cn(
            "flex items-center gap-3 rounded-sm border p-3 text-left transition-colors",
            mode === "file"
              ? "border-primary/40 bg-primary/5"
              : "border-foreground/5 bg-muted/10 hover:border-primary/30 hover:bg-muted/30",
          )}
          onClick={() => changeMode("file")}
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border border-foreground/5 bg-card shadow-xs">
            <FileUp
              className={cn(
                "h-4 w-4",
                mode === "file" ? "text-primary" : "text-muted-foreground",
              )}
            />
          </span>
          <span className="min-w-0">
            <span className="block text-xs font-medium text-foreground">
              Upload file
            </span>
            <span className="block text-xs text-muted-foreground">
              PDF or Markdown
            </span>
          </span>
        </button>

        <button
          type="button"
          aria-pressed={mode === "text"}
          className={cn(
            "flex items-center gap-3 rounded-sm border p-3 text-left transition-colors",
            mode === "text"
              ? "border-primary/40 bg-primary/5"
              : "border-foreground/5 bg-muted/10 hover:border-primary/30 hover:bg-muted/30",
          )}
          onClick={() => changeMode("text")}
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border border-foreground/5 bg-card shadow-xs">
            <Type
              className={cn(
                "h-4 w-4",
                mode === "text" ? "text-primary" : "text-muted-foreground",
              )}
            />
          </span>
          <span className="min-w-0">
            <span className="block text-xs font-medium text-foreground">
              Paste text
            </span>
            <span className="block text-xs text-muted-foreground">
              Type or paste the JD
            </span>
          </span>
        </button>
      </div>

      {mode === "file" ? (
        <>
          <button
            type="button"
            className={cn(
              "relative flex min-h-40 w-full flex-col items-center justify-center gap-3 overflow-hidden rounded-sm border border-dashed border-foreground/10 bg-muted/10 px-4 py-8 text-center transition-all duration-300",
              isDragging &&
                "scale-[1.01] border-primary bg-primary/5 shadow-sm",
              !isExtracting && "hover:border-primary/40 hover:bg-muted/40",
              isExtracting &&
                "pointer-events-none border-primary/30 bg-primary/5",
            )}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setIsDragging(false);
              void extractFile(event.dataTransfer.files[0]);
            }}
            disabled={isExtracting}
          >
            {isExtracting ? (
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            ) : uploadedText ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            ) : (
              <FileUp
                className={cn(
                  "h-5 w-5 text-muted-foreground",
                  isDragging && "text-primary",
                )}
              />
            )}

            <div className="space-y-1">
              <p className="text-xs font-medium text-foreground">
                {isExtracting
                  ? "Reading job description..."
                  : file
                    ? file.name
                    : "Choose a PDF or Markdown file, or drag it here"}
              </p>
              <p className="text-xs text-muted-foreground">
                {uploadedText
                  ? `${wordCount(uploadedText)} words extracted - choose another file to replace it`
                  : "One .pdf, .md, or .markdown file, up to 5 MB"}
              </p>
            </div>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf,text/markdown,.pdf,.md,.markdown"
            className="hidden"
            onChange={(event) => {
              void extractFile(event.target.files?.[0]);
              event.target.value = "";
            }}
          />
        </>
      ) : (
        <Textarea
          id="job-description"
          value={manualText}
          onChange={(event) => {
            setManualText(event.target.value);
            setJobDescription(event.target.value);
          }}
          className="h-24 resize-y rounded-sm border-foreground/5! bg-muted/20! leading-relaxed scrollbar-thin md:h-48"
          placeholder="Paste the role description here..."
        />
      )}

      {error ? (
        <div className="flex items-start gap-2 rounded-sm border border-destructive/20 bg-destructive/5 p-3 text-xs text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}

      <p className="text-xs text-muted-foreground">{currentWordCount} words</p>
    </div>
  );
};

export default AtsJobDescriptionInput;
