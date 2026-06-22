"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import {
  Loader2,
  ArrowRight,
  ArrowLeft,
  Plus,
  Trash2,
  Globe,
  Github,
  Linkedin,
  Link2,
  User,
  Mail,
  Phone,
  MapPin,
  Sparkles,
} from "lucide-react";

// URL validation helper (must start with https:// and be a valid URL)
const urlValidation = z.string().trim().superRefine((val, ctx) => {
  if (val) {
    if (!val.startsWith("https://")) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "URL must start with https://",
      });
      return;
    }
    try {
      new URL(val);
    } catch {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid URL format",
      });
    }
  }
});

const profileFormSchema = z.object({
  fullName: z.string().trim().min(2, "Full name must be at least 2 characters"),
  email: z.string().trim().min(1, "Email is required").email("Invalid email address"),
  phone: z.string().trim().optional().or(z.literal("")).superRefine((val, ctx) => {
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
  portfolioUrl: z.string().trim().optional().or(z.literal("")).superRefine((val, ctx) => {
    if (val) {
      if (!val.startsWith("https://")) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "URL must start with https://",
        });
        return;
      }
      try {
        new URL(val);
      } catch {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Invalid URL format",
        });
      }
    }
  }),
  githubUrl: z.string().trim().optional().or(z.literal("")).superRefine((val, ctx) => {
    if (val) {
      if (!val.startsWith("https://")) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "URL must start with https://",
        });
        return;
      }
      try {
        new URL(val);
      } catch {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Invalid URL format",
        });
      }
    }
  }),
  linkedinUrl: z.string().trim().optional().or(z.literal("")).superRefine((val, ctx) => {
    if (val) {
      if (!val.startsWith("https://")) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "URL must start with https://",
        });
        return;
      }
      try {
        new URL(val);
      } catch {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Invalid URL format",
        });
      }
    }
  }),
  extraLinks: z.array(
    z.object({
      label: z.string().trim().min(1, "Label is required"),
      url: z.string().trim().min(1, "URL is required").superRefine((val, ctx) => {
        if (!val.startsWith("https://")) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Must start with https://",
          });
          return;
        }
        try {
          new URL(val);
        } catch {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Invalid URL format",
          });
        }
      }),
    })
  ).max(5),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface UserProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: any;
  onSaveSuccess: () => void;
  isAutomaticPrompt?: boolean;
}

export default function UserProfileDialog({
  open,
  onOpenChange,
  initialData,
  onSaveSuccess,
  isAutomaticPrompt = false,
}: UserProfileDialogProps) {
  const [step, setStep] = useState(1);
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

  const { fields, append, remove } = useFieldArray({
    control,
    name: "extraLinks",
  });

  // Pre-populate fields on open/initialData load
  useEffect(() => {
    if (open) {
      setStep(1); // Always reset to step 1 when opening
      if (initialData) {
        reset({
          fullName: initialData.full_name || "",
          email: initialData.email || "",
          phone: initialData.phone || "",
          location: initialData.location || "",
          portfolioUrl: initialData.portfolio_url || "",
          githubUrl: initialData.github_url || "",
          linkedinUrl: initialData.linkedin_url || "",
          extraLinks: initialData.extra_links || [],
        });
      } else {
        reset({
          fullName: "",
          email: "",
          phone: "",
          location: "",
          portfolioUrl: "",
          githubUrl: "",
          linkedinUrl: "",
          extraLinks: [],
        });
      }
    }
  }, [open, initialData, reset]);

  // Trigger POST for automatic cooldown when prompted
  useEffect(() => {
    if (open && isAutomaticPrompt) {
      fetch("/api/user-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ last_prompted_at: new Date().toISOString() }),
      }).catch((err) => {
        console.error("Failed to update last_prompted_at cooldown:", err);
      });
    }
  }, [open, isAutomaticPrompt]);

  const handleNext = async () => {
    // Validate fields on Step 1
    const isValid = await trigger(["fullName", "email", "phone", "location"]);
    if (isValid) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
  };

  const onFormSubmit = async (values: ProfileFormValues) => {
    setSubmitting(true);
    try {
      const response = await fetch("/api/user-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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

      if (!response.ok) {
        throw new Error("Failed to update profile details");
      }

      onSaveSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Profile save error:", error);
      alert("Error saving profile details. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemindLater = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        showCloseButton={false}
        className="rounded-lg sm:max-w-lg p-0 overflow-hidden border-foreground/5 bg-background/95 backdrop-blur-2xl shadow-2xl transition-all h-[100dvh] sm:h-auto flex flex-col justify-between"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div className="flex flex-col flex-1 overflow-y-auto px-6 py-8">
          {/* Header Step Indicator */}
          <div className="flex items-center justify-between mb-8 shrink-0">
            <div className="flex gap-2">
              <span
                className={`h-1.5 w-12 rounded-full transition-all duration-300 ${
                  step === 1 ? "bg-primary shadow-[0_0_8px_rgba(59,130,246,0.5)]" : "bg-muted"
                }`}
              />
              <span
                className={`h-1.5 w-12 rounded-full transition-all duration-300 ${
                  step === 2 ? "bg-primary shadow-[0_0_8px_rgba(59,130,246,0.5)]" : "bg-muted"
                }`}
              />
            </div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-muted/50 px-2 py-0.5 rounded-sm">
              Step {step} of 2
            </span>
          </div>

          {step === 1 ? (
            <div className="flex-1 flex flex-col gap-6">
              <DialogHeader>
                <div className="flex items-center gap-3 mb-1">
                  <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-primary/10 text-primary shrink-0">
                    <Sparkles className="h-4.5 w-4.5" />
                  </div>
                  <DialogTitle className="text-xl font-extrabold tracking-tight text-foreground">
                    Let&apos;s personalize your resume
                  </DialogTitle>
                </div>
                <DialogDescription className="text-xs text-muted-foreground leading-relaxed pl-12">
                  This information will be used to fill your generated resumes automatically. You
                  can update it anytime.
                </DialogDescription>
              </DialogHeader>

              <div className="flex flex-col gap-4.5 mt-2">
                <div className="grid gap-2">
                  <Label htmlFor="fullName" className="text-xs font-semibold text-foreground/80 flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-muted-foreground" /> Full Name
                  </Label>
                  <Input
                    id="fullName"
                    placeholder="John Doe"
                    className="h-10 border-border/50 bg-background/50 focus-visible:ring-primary focus-visible:border-primary transition-all text-xs"
                    {...register("fullName")}
                  />
                  {errors.fullName && (
                    <span className="text-[10px] font-semibold text-destructive">{errors.fullName.message}</span>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-xs font-semibold text-foreground/80 flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" /> Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    className="h-10 border-border/50 bg-background/50 focus-visible:ring-primary focus-visible:border-primary transition-all text-xs"
                    {...register("email")}
                  />
                  {errors.email && (
                    <span className="text-[10px] font-semibold text-destructive">{errors.email.message}</span>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="phone" className="text-xs font-semibold text-foreground/80 flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground" /> Phone Number (Optional)
                  </Label>
                  <Input
                    id="phone"
                    placeholder="+1 (555) 000-0000"
                    className="h-10 border-border/50 bg-background/50 focus-visible:ring-primary focus-visible:border-primary transition-all text-xs"
                    {...register("phone")}
                  />
                  {errors.phone && (
                    <span className="text-[10px] font-semibold text-destructive">{errors.phone.message}</span>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="location" className="text-xs font-semibold text-foreground/80 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" /> Location (Optional)
                  </Label>
                  <Input
                    id="location"
                    placeholder="San Francisco, CA or Bangalore, India"
                    className="h-10 border-border/50 bg-background/50 focus-visible:ring-primary focus-visible:border-primary transition-all text-xs"
                    {...register("location")}
                  />
                  {errors.location && (
                    <span className="text-[10px] font-semibold text-destructive">{errors.location.message}</span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col gap-6">
              <DialogHeader>
                <div className="flex items-center gap-3 mb-1">
                  <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-blue-500/10 text-blue-500 shrink-0">
                    <Link2 className="h-4.5 w-4.5" />
                  </div>
                  <DialogTitle className="text-xl font-extrabold tracking-tight text-foreground">
                    Add your online profiles
                  </DialogTitle>
                </div>
                <DialogDescription className="text-xs text-muted-foreground leading-relaxed pl-12">
                  These links will appear on your generated resume so recruiters can find your work
                  instantly.
                </DialogDescription>
              </DialogHeader>

              <div className="flex flex-col gap-4.5 mt-2 max-h-[45vh] overflow-y-auto pr-1">
                <div className="grid gap-2">
                  <Label htmlFor="portfolioUrl" className="text-xs font-semibold text-foreground/80 flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5 text-muted-foreground" /> Portfolio / Website
                  </Label>
                  <Input
                    id="portfolioUrl"
                    placeholder="https://johndoe.dev"
                    className="h-10 border-border/50 bg-background/50 focus-visible:ring-primary focus-visible:border-primary transition-all text-xs"
                    {...register("portfolioUrl")}
                  />
                  {errors.portfolioUrl && (
                    <span className="text-[10px] font-semibold text-destructive">{errors.portfolioUrl.message}</span>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="githubUrl" className="text-xs font-semibold text-foreground/80 flex items-center gap-1.5">
                    <Github className="h-3.5 w-3.5 text-muted-foreground" /> GitHub
                  </Label>
                  <Input
                    id="githubUrl"
                    placeholder="https://github.com/johndoe"
                    className="h-10 border-border/50 bg-background/50 focus-visible:ring-primary focus-visible:border-primary transition-all text-xs"
                    {...register("githubUrl")}
                  />
                  {errors.githubUrl && (
                    <span className="text-[10px] font-semibold text-destructive">{errors.githubUrl.message}</span>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="linkedinUrl" className="text-xs font-semibold text-foreground/80 flex items-center gap-1.5">
                    <Linkedin className="h-3.5 w-3.5 text-muted-foreground" /> LinkedIn
                  </Label>
                  <Input
                    id="linkedinUrl"
                    placeholder="https://linkedin.com/in/johndoe"
                    className="h-10 border-border/50 bg-background/50 focus-visible:ring-primary focus-visible:border-primary transition-all text-xs"
                    {...register("linkedinUrl")}
                  />
                  {errors.linkedinUrl && (
                    <span className="text-[10px] font-semibold text-destructive">{errors.linkedinUrl.message}</span>
                  )}
                </div>

                {/* Dynamic Extra Links */}
                <div className="space-y-3 pt-3 border-t border-border/40">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs font-bold text-foreground/80">Other links (optional)</Label>
                    {fields.length < 5 && (
                      <button
                        type="button"
                        onClick={() => append({ label: "", url: "" })}
                        className="text-xs font-bold text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
                      >
                        <Plus className="h-3 w-3" /> Add another link
                      </button>
                    )}
                  </div>

                  {fields.map((field, index) => (
                    <div key={field.id} className="flex gap-2 items-start bg-muted/30 p-3 rounded-sm border border-border/30">
                      <div className="flex-1 grid gap-2">
                        <Input
                          placeholder="Label (e.g. Blog)"
                          className="h-9 border-border/50 bg-background/50 text-xs"
                          {...register(`extraLinks.${index}.label` as const)}
                        />
                        {errors.extraLinks?.[index]?.label && (
                          <span className="text-[10px] font-semibold text-destructive">
                            {errors.extraLinks[index]?.label?.message}
                          </span>
                        )}
                        <Input
                          placeholder="URL (starts with https://)"
                          className="h-9 border-border/50 bg-background/50 text-xs"
                          {...register(`extraLinks.${index}.url` as const)}
                        />
                        {errors.extraLinks?.[index]?.url && (
                          <span className="text-[10px] font-semibold text-destructive">
                            {errors.extraLinks[index]?.url?.message}
                          </span>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                        className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer controls */}
        <div className="flex items-center justify-between border-t border-border/40 p-4 bg-muted/10 shrink-0">
          {step === 1 ? (
            <>
              <Button
                type="button"
                variant="ghost"
                onClick={handleRemindLater}
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
          ) : (
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
                  "Save & Continue"
                )}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
