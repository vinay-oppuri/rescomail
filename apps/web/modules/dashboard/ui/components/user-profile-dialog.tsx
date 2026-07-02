"use client";

import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ResponsiveDialog } from "@repo/ui/components/responsive-dialog";
import { Button } from "@repo/ui/components/button";
import { Loader2, ArrowRight, ArrowLeft, X } from "lucide-react";

import UserDialogS1 from "./user-dialog-s1";
import UserDialogS2 from "./user-dialog-s2";
import UserDialogS3, { UserDialogS3Ref } from "./user-dialog-s3";
import { profileFormSchema, type ProfileFormValues } from "../../server/user-profile-schema";
import type { UserProfile } from "@repo/db";

// ── Props ─────────────────────────────────────────────────────────────────
interface UserProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: (Partial<UserProfile> & {
    full_name?: string;
    portfolio_url?: string;
    github_url?: string;
    linkedin_url?: string;
    extra_links?: { label: string; url: string }[];
    preferences?: any;
  }) | null;
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
  const s3Ref = useRef<UserDialogS3Ref>(null);

  const {
    register,
    control,
    handleSubmit,
    trigger,
    reset,
    getValues,
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

  const saveProfileData = async (values: ProfileFormValues) => {
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
  };

  const handleNext = async () => {
    const isValid = await trigger(["fullName", "email", "phone", "location"]);
    if (!isValid) return;

    setSubmitting(true);
    try {
      await saveProfileData(getValues());
      setStep(2);
    } catch (error) {
      console.error("Profile save error:", error);
      alert("Error saving profile details. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => setStep((s) => s - 1);

  const onFormSubmit = async (values: ProfileFormValues) => {
    setSubmitting(true);
    try {
      await saveProfileData(values);
      setStep(3);
    } catch (error) {
      console.error("Profile save error:", error);
      alert("Error saving profile details. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={(val) => {
        if (!val && isAutomaticPrompt) return;
        onOpenChange(val);
      }}
      title="Profile Setup"
      description="Complete your profile setup to personalize your experience."
      hideHeader
      showCloseButton={false}
      className="rounded-sm sm:max-w-xl w-full p-0 overflow-hidden border-foreground/5 bg-background/95 backdrop-blur-2xl shadow-2xl h-145 sm:h-165 flex flex-col"
      drawerContentClassName="h-dvh max-h-none! rounded-none"
      bodyClassName="flex min-h-0 flex-1 flex-col"
      drawerBodyClassName="max-h-none!"
    >
        {/* ── Top bar: progress pills + close ── */}
        <div className="flex items-center justify-between px-6 py-4 shrink-0 border-b border-border/10">
          <div className="flex gap-1.5">
            {[1, 2, 3].map((s) => (
              <span
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${step === s
                    ? "w-10 bg-primary shadow-[0_0_8px_rgba(99,102,241,0.4)]"
                    : step > s
                      ? "w-10 bg-primary/40"
                      : "w-6 bg-muted"
                  }`}
              />
            ))}
          </div>
          {!isAutomaticPrompt && (
            <button
              onClick={() => onOpenChange(false)}
              className="rounded-full p-1.5 text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* ── Scrollable step content ── */}
        <div className="flex flex-col flex-1 overflow-y-auto px-6 py-5 min-h-0">
          {step === 1 && (
            <UserDialogS1 register={register} errors={errors} />
          )}
          {step === 2 && (
            <UserDialogS2 register={register} errors={errors} control={control} />
          )}
          {step === 3 && (
            <UserDialogS3
              ref={s3Ref}
              initialData={initialData?.preferences}
              onSavingChange={setSubmitting}
              onDone={() => { onSaveSuccess(); onOpenChange(false); }}
              onSkip={() => { onSaveSuccess(); onOpenChange(false); }}
              onPrevious={() => setStep(2)}
            />
          )}
        </div>

        {/* ── Shared Footer ── */}
        <div className="flex items-center justify-between border-t border-border/10 px-3 md:px-6 py-4 bg-muted/5 shrink-0">
          {step === 1 && (
            <>
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="h-7 md:h-9 text-xs text-muted-foreground hover:text-foreground font-semibold px-4"
              >
                {isAutomaticPrompt ? "Remind me later" : "Cancel"}
              </Button>
              <Button
                type="button"
                disabled={submitting}
                onClick={handleNext}
                className="h-7 md:h-9 text-xs font-semibold px-4 md:px-6 gap-1.5"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    Save & Next <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </Button>
            </>
          )}
          {step === 2 && (
            <>
              <Button
                type="button"
                variant="ghost"
                onClick={handleBack}
                className="h-7! md:h-9! text-xs font-semibold px-4 gap-1.5"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back
              </Button>
              <Button
                type="button"
                disabled={submitting}
                onClick={handleSubmit(onFormSubmit)}
                className="h-7 md:h-9 text-xs font-semibold px-4 md:px-6 gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    Save & Next <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </Button>
            </>
          )}
          {step === 3 && (
            <>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(2)}
                  className="h-7 md:h-9 text-xs font-semibold px-4 gap-1.5 border-foreground/5!"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Back
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => { onSaveSuccess(); onOpenChange(false); }}
                  className="h-7 md:h-9 text-xs text-muted-foreground hover:text-foreground font-semibold px-4"
                >
                  Skip <span className="hidden md:block">for now</span>
                </Button>
              </div>
              <Button
                type="button"
                disabled={submitting}
                onClick={() => s3Ref.current?.save()}
                className="h-7 md:h-9 text-xs font-semibold px-4 md:px-6 gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving...
                  </>
                ) : (
                  "Save & Finish"
                )}
              </Button>
            </>
          )}
        </div>
    </ResponsiveDialog>
  );
}
