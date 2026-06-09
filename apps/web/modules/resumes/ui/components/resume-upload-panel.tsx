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
      
      setTimeout(() => setSuccess(null), 300);
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
    <div className="flex flex-col border border-foreground/5 bg-card/20 shadow-sm overflow-hidden rounded-sm">
      <div className="flex items-start justify-between gap-3 border-b border-foreground/5 bg-muted/10 px-3 md:px-5 py-3 md:py-4">
        <div>
          <h2 className="text-sm font-semibold tracking-tight text-foreground">
            Upload Resume
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Add a PDF resume and Rescomail will queue it for parsing.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-6 p-3 sm:p-6">

      {error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Upload failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
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
          className="bg-muted/20! border-foreground/5! rounded-sm"
        />
      </div>

      <button
        type="button"
        className={cn(
          "flex min-h-44 w-full flex-col items-center justify-center gap-3 border border-dashed border-foreground/10 px-4 py-8 text-center transition-all duration-300 ease-in-out bg-muted/10! rounded-sm relative overflow-hidden",
          isDragging
            ? "border-primary bg-primary/5! scale-[1.01] shadow-sm"
            : "hover:border-primary/40 hover:bg-muted/40!",
          isUploading && "pointer-events-none border-primary/30 bg-primary/5!",
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
        {isUploading && (
          <div className="absolute inset-0 bg-linear-to-tr from-primary/5 via-transparent to-primary/10 animate-pulse mix-blend-overlay" />
        )}
        <div className="flex h-10 w-10 items-center justify-center border border-foreground/5 bg-card rounded-sm shadow-xs transition-transform duration-300 group-hover:scale-110 z-10">
          <FileUp className={cn("h-5 w-5 text-muted-foreground transition-colors", isDragging && "text-primary")} />
        </div>
        <div className="space-y-1 z-10">
          <p className="text-xs font-medium">
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



      {isUploading ? (
        <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-500 pt-2">
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted/50 border border-muted/20 shadow-inner">
            <div
              className="h-full bg-linear-to-r from-primary/80 to-primary transition-all duration-300 ease-out relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse" />
            </div>
          </div>
          <div className="flex justify-between items-center px-1">
            <p className="text-xs font-medium text-muted-foreground animate-pulse">
              {progress < 100 ? "Securely uploading resume..." : "Finalizing upload..."}
            </p>
            <p className="text-xs font-semibold text-primary">{progress}%</p>
          </div>
        </div>
      ) : null}

      <Button
        type="button"
        className={cn(
          "mt-2 h-9 w-full font-semibold text-xs md:text-sm transition-colors",
          success && "bg-emerald-500 hover:bg-emerald-600 text-white"
        )}
        onClick={uploadResume}
        disabled={isUploading || (!file && !success)}
      >
        {success ? (
          <div className="flex items-center gap-2 animate-in fade-in slide-in-from-bottom-1">
            <CheckCircle2 className="h-4 w-4" />
            {success}
          </div>
        ) : isUploading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Uploading
          </>
        ) : (
          "Upload and parse"
        )}
      </Button>
    </div>
  </div>
  );
};

export default ResumeUploadPanel;
