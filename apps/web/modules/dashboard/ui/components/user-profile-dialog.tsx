"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
} from "@repo/ui/components/dialog";
import { Button } from "@repo/ui/components/button";
import { Loader2, ArrowRight, ArrowLeft } from "lucide-react";

import UserDialogS1 from "./user-dialog-s1";
import UserDialogS2 from "./user-dialog-s2";
import UserDialogS3 from "./user-dialog-s3";

// ── Zod schema (exported so step files can share the inferred type) ───────
const profileFormSchema = z.object({
  fullName: z.string().trim().min(2, "Full name must be at least 2 characters"),
  email: z.string().trim().min(1, "Email is required").email("Invalid email address"),
  phone: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .superRefine((val, ctx) => {
      if (val) {
        const phoneRegex = /^[0-9+\s\-()]+$/;
        if (!phoneRegex.test(val)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Only digits, spaces, dashes, parentheses and + allowed",
          });
        }
      }
    }),
  location: z.string().trim().optional(),
  portfolioUrl: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .superRefine((val, ctx) => {
      if (val) {
        if (!val.startsWith("https://")) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: "URL must start with https://" });
          return;
        }
        try { new URL(val); } catch {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Invalid URL format" });
        }
      }
    }),
  githubUrl: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .superRefine((val, ctx) => {
      if (val) {
        if (!val.startsWith("https://")) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: "URL must start with https://" });
          return;
        }
        try { new URL(val); } catch {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Invalid URL format" });
        }
      }
    }),
  linkedinUrl: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .superRefine((val, ctx) => {
      if (val) {
        if (!val.startsWith("https://")) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: "URL must start with https://" });
          return;
        }
        try { new URL(val); } catch {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Invalid URL format" });
        }
      }
    }),
  extraLinks: z
    .array(
      z.object({
        label: z.string().trim().min(1, "Label is required"),
        url: z
          .string()
          .trim()
          .min(1, "URL is required")
          .superRefine((val, ctx) => {
            if (!val.startsWith("https://")) {
              ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Must start with https://" });
              return;
            }
            try { new URL(val); } catch {
              ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Invalid URL format" });
            }
          }),
      })
    )
    .max(5),
});

/** Exported so user-dialog-s1.tsx and user-dialog-s2.tsx can share it */
export type ProfileFormValues = z.infer<typeof profileFormSchema>;

// ── Props ─────────────────────────────────────────────────────────────────
interface UserProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: any;
  onSaveSuccess: () => void;
  isAutomaticPrompt?: boolean;
  initialStep?: number;
}

const TOTAL_STEPS = 3;

// ── Orchestrator ──────────────────────────────────────────────────────────
export default function UserProfileDialog({
  open,
  onOpenChange,
  initialData,
  onSaveSuccess,
  isAutomaticPrompt = false,
  initialStep = 1,
}: UserProfileDialogProps) {
  const [step, setStep] = useState(initialStep);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    trigger,
    reset,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      location: "",
      portfolioUrl: "",
      githubUrl: "",
      linkedinUrl: "",
      extraLinks: [],
    },
    mode: "onTouched",
  });

  // Reset form & step whenever the dialog opens
  useEffect(() => {
    if (open) {
      setStep(initialStep);
      if (initialData) {
        reset({
          fullName: initialData.fullName || initialData.full_name || "",
          email: initialData.email || "",
          phone: initialData.phone || "",
          location: initialData.location || "",
          portfolioUrl: initialData.portfolioUrl || initialData.portfolio_url || "",
          githubUrl: initialData.githubUrl || initialData.github_url || "",
          linkedinUrl: initialData.linkedinUrl || initialData.linkedin_url || "",
          extraLinks: initialData.extraLinks || initialData.extra_links || [],
        });
      } else {
        reset({
          fullName: "", email: "", phone: "", location: "",
          portfolioUrl: "", githubUrl: "", linkedinUrl: "", extraLinks: [],
        });
      }
    }
  }, [open, initialData, reset]);

  // Update last_prompted_at cooldown
  useEffect(() => {
    if (open && isAutomaticPrompt) {
      fetch("/api/user-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ last_prompted_at: new Date().toISOString() }),
      }).catch((err) => console.error("Failed to update last_prompted_at cooldown:", err));
    }
  }, [open, isAutomaticPrompt]);

  const handleNext = async () => {
    const isValid = await trigger(["fullName", "email", "phone", "location"]);
    if (isValid) setStep(2);
  };

  const handleBack = () => setStep((s) => s - 1);

  const onFormSubmit = async (values: ProfileFormValues) => {
    setSubmitting(true);
    try {
      const response = await fetch("/api/user-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: values.fullName,
          email: values.email,
          phone: values.phone || null,
          location: values.location || null,
          portfolio_url: values.portfolioUrl || null,
          github_url: values.githubUrl || null,
          linkedin_url: values.linkedinUrl || null,
          extra_links: values.extraLinks,
        }),
      });
      if (!response.ok) throw new Error("Failed to update profile details");
      setStep(3);
    } catch (error) {
      console.error("Profile save error:", error);
      alert("Error saving profile details. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        showCloseButton={false}
        className="rounded-lg sm:max-w-lg w-full p-0 overflow-hidden border-foreground/5 bg-background/95 backdrop-blur-2xl shadow-2xl transition-all h-[100dvh] sm:h-[600px] flex flex-col justify-between"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div className="flex flex-col flex-1 overflow-y-auto px-6 py-8">
          {/* Step Progress Indicator */}
          <div className="flex items-center justify-between mb-8 shrink-0">
            <div className="flex gap-2">
              {[1, 2, 3].map((s) => (
                <span
                  key={s}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    step === s
                      ? "w-12 bg-primary shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                      : step > s
                      ? "w-12 bg-primary/40"
                      : "w-8 bg-muted"
                  }`}
                />
              ))}
            </div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-muted/50 px-2 py-0.5 rounded-sm">
              Step {step} of {TOTAL_STEPS}
            </span>
          </div>

          {/* ── Step 1: Personal Info ── */}
          {step === 1 && (
            <UserDialogS1 register={register} errors={errors} />
          )}

          {/* ── Step 2: Online Profiles ── */}
          {step === 2 && (
            <UserDialogS2 register={register} errors={errors} control={control} />
          )}

          {/* ── Step 3: AI Setup (self-contained — owns its own footer) ── */}
          {step === 3 && (
            <UserDialogS3
              initialData={initialData?.preferences}
              onDone={() => { onSaveSuccess(); onOpenChange(false); }}
              onSkip={() => { onSaveSuccess(); onOpenChange(false); }}
            />
          )}
        </div>

        {/* ── Shared footer for steps 1 & 2 only ── */}
        {step !== 3 && (
          <div className="flex items-center justify-between border-t border-border/40 p-4 bg-muted/10 shrink-0">
            {step === 1 && (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => onOpenChange(false)}
                  className="text-xs text-muted-foreground hover:text-foreground font-semibold"
                >
                  Remind me later
                </Button>
                <Button
                  type="button"
                  onClick={handleNext}
                  className="h-9 text-xs font-semibold px-5 gap-1.5 transition-all duration-300 hover:scale-105"
                >
                  Next <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </>
            )}

            {step === 2 && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  className="h-9 text-xs font-semibold px-4 gap-1.5 border-border/50 bg-card/50"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Back
                </Button>
                <Button
                  type="button"
                  disabled={submitting}
                  onClick={handleSubmit(onFormSubmit)}
                  className="h-9 text-xs font-semibold px-6 gap-2 transition-all duration-300 hover:scale-105"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      Next <ArrowRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
