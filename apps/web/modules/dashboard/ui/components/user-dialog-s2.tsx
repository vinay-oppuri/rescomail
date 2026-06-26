"use client";

import {
  UseFormRegister,
  FieldErrors,
  Control,
  useFieldArray,
} from "react-hook-form";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import {
  Globe,
  Github,
  Linkedin,
  Link2,
  Plus,
  Trash2,
} from "lucide-react";
import type { ProfileFormValues } from "../../server/user-profile-schema";

interface Step2Props {
  register: UseFormRegister<ProfileFormValues>;
  errors: FieldErrors<ProfileFormValues>;
  control: Control<ProfileFormValues>;
}

function UrlField({
  id,
  label,
  placeholder,
  icon: Icon,
  error,
  children,
}: {
  id: string;
  label: string;
  placeholder: string;
  icon: React.ElementType;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id} className="text-xs font-medium text-foreground/70 flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        {label}
      </Label>
      {children}
      {error && (
        <span className="text-[11px] text-destructive">{error}</span>
      )}
    </div>
  );
}

export default function UserDialogS2({ register, errors, control }: Step2Props) {
  const { fields, append, remove } = useFieldArray({ control, name: "extraLinks" });

  return (
    <div className="flex-1 flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-col items-start gap-2 pb-4">
        <h2 className="text-lg font-bold tracking-tight text-foreground leading-tight">
          Add your online profiles
        </h2>
        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
          These links appear on your resume so recruiters can find your work instantly. All fields are optional.
        </p>
      </div>

      {/* Social Links */}
      <div className="flex flex-col gap-4">
        <UrlField
          id="portfolioUrl"
          label="Portfolio / Website"
          placeholder="https://johndoe.dev"
          icon={Globe}
          error={errors.portfolioUrl?.message}
        >
          <Input
            id="portfolioUrl"
            placeholder="https://johndoe.dev"
            className="h-9 border-border/60 bg-muted/20 focus-visible:ring-primary focus-visible:border-primary transition-all text-xs md:text-sm"
            {...register("portfolioUrl")}
          />
        </UrlField>

        <UrlField
          id="githubUrl"
          label="GitHub"
          placeholder="https://github.com/johndoe"
          icon={Github}
          error={errors.githubUrl?.message}
        >
          <Input
            id="githubUrl"
            placeholder="https://github.com/johndoe"
            className="h-9 border-border/60 bg-muted/20 focus-visible:ring-primary focus-visible:border-primary transition-all text-xs md:text-sm"
            {...register("githubUrl")}
          />
        </UrlField>

        <UrlField
          id="linkedinUrl"
          label="LinkedIn"
          placeholder="https://linkedin.com/in/johndoe"
          icon={Linkedin}
          error={errors.linkedinUrl?.message}
        >
          <Input
            id="linkedinUrl"
            placeholder="https://linkedin.com/in/johndoe"
            className="h-9 border-border/60 bg-muted/20 focus-visible:ring-primary focus-visible:border-primary transition-all text-xs md:text-sm"
            {...register("linkedinUrl")}
          />
        </UrlField>

        {/* Extra Links */}
        <div className="pt-2 border-t border-border/30 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[10px] md:text-xs font-medium text-foreground/60">Other links (up to 5)</span>
            {fields.length < 5 && (
              <button
                type="button"
                onClick={() => append({ label: "", url: "" })}
                className="text-[10px] md:text-xs font-semibold text-primary hover:text-primary/80 transition-colors flex items-center gap-1 py-1 px-2 rounded-sm hover:bg-primary/5"
              >
                <Plus className="h-3 w-3" /> Add link
              </button>
            )}
          </div>

          {fields.length === 0 && (
            <p className="text-[11px] text-muted-foreground italic text-center py-2">No extra links added yet.</p>
          )}

          <div className="space-y-2">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="flex gap-2 items-start bg-muted/20 p-3 rounded-lg border border-border/30"
              >
                <div className="flex-1 grid gap-2">
                  <Input
                    placeholder="Label (e.g. Blog, Portfolio)"
                    className="h-9 border-border/50 bg-background/50 text-xs"
                    {...register(`extraLinks.${index}.label` as const)}
                  />
                  {errors.extraLinks?.[index]?.label && (
                    <span className="text-[10px] text-destructive">
                      {errors.extraLinks[index]?.label?.message}
                    </span>
                  )}
                  <Input
                    placeholder="https://..."
                    className="h-9 border-border/50 bg-background/50 text-xs"
                    {...register(`extraLinks.${index}.url` as const)}
                  />
                  {errors.extraLinks?.[index]?.url && (
                    <span className="text-[10px] text-destructive">
                      {errors.extraLinks[index]?.url?.message}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="p-2 mt-0.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors shrink-0"
                  aria-label="Remove link"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
