"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, FileUp, Loader2, X } from "lucide-react";

import { useUploadThing } from "@/lib/uploadthing";
import { Alert, AlertDescription, AlertTitle } from "@repo/ui/components/alert";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { cn } from "@repo/ui/lib/utils";

const MAX_RESUME_SIZE = 8 * 1024 * 1024;

const formatBytes = (bytes: number) => {
  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const isPdfFile = (file: File) =>
  file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

const ResumeUploadPanel = () => {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const { startUpload, isUploading } = useUploadThing("resumeUploader", {
    uploadProgressGranularity: "fine",
    onUploadProgress: setProgress,
    onClientUploadComplete: (res) => {
      const uploadedResume = res.at(0)?.serverData;

      setFile(null);
      setTitle("");
      setProgress(0);
      setSuccess(
        uploadedResume?.title
          ? `${uploadedResume.title} uploaded successfully.`
          : "Resume uploaded successfully.",
      );
      router.refresh();
    },
    onUploadError: (uploadError) => {
      setProgress(0);
      setError(uploadError.message || "Unable to upload resume.");
    },
  });

  const selectFile = (nextFile?: File) => {
    setError(null);
    setSuccess(null);

    if (!nextFile) {
      return;
    }

    if (!isPdfFile(nextFile)) {
      setFile(null);
      setError("Upload a PDF resume.");
      return;
    }

    if (nextFile.size > MAX_RESUME_SIZE) {
      setFile(null);
      setError("PDF must be 8 MB or smaller.");
      return;
    }

    setFile(nextFile);
  };

  const uploadResume = async () => {
    setError(null);
    setSuccess(null);

    if (!file) {
      setError("Choose a PDF resume first.");
      return;
    }

    const uploadResult = await startUpload([file], {
      title: title.trim() || undefined,
    });

    if (!uploadResult) {
      setProgress(0);
    }
  };

  return (
    <div className="space-y-4 border bg-muted/10 p-5">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold tracking-tight">Upload resume</h2>
        <p className="text-sm text-muted-foreground">
          Add a PDF resume and Rescomail will queue it for parsing.
        </p>
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Upload failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {success ? (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>Upload complete</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="resume-title">Resume title</Label>
        <Input
          id="resume-title"
          placeholder="Senior frontend engineer resume"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          disabled={isUploading}
        />
      </div>

      <button
        type="button"
        className={cn(
          "flex min-h-44 w-full flex-col items-center justify-center gap-3 border border-dashed px-4 py-8 text-center transition-colors",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/40 hover:bg-muted/40",
          isUploading && "pointer-events-none opacity-70",
        )}
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          selectFile(event.dataTransfer.files[0]);
        }}
        disabled={isUploading}
      >
        <div className="flex h-10 w-10 items-center justify-center border bg-card">
          <FileUp className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium">
            {file ? file.name : "Choose a PDF or drag it here"}
          </p>
          <p className="text-xs text-muted-foreground">
            {file ? formatBytes(file.size) : "One PDF, up to 8 MB"}
          </p>
        </div>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        onChange={(event) => selectFile(event.target.files?.[0])}
      />

      {file ? (
        <div className="flex items-center justify-between border bg-muted/30 px-3 py-2 text-sm">
          <span className="truncate">{file.name}</span>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => setFile(null)}
            disabled={isUploading}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Remove selected resume</span>
          </Button>
        </div>
      ) : null}

      {isUploading ? (
        <div className="space-y-2">
          <div className="h-1.5 overflow-hidden bg-muted">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Uploading resume, {progress}% complete
          </p>
        </div>
      ) : null}

      <Button
        type="button"
        className="h-10 w-full"
        onClick={uploadResume}
        disabled={isUploading || !file}
      >
        {isUploading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Uploading
          </>
        ) : (
          "Upload and parse"
        )}
      </Button>
    </div>
  );
};

export default ResumeUploadPanel;
