"use client";

import {
  UseFormRegister,
  FieldErrors,
  Control,
  useFieldArray,
} from "react-hook-form";
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import { Button } from "@repo/ui/components/button";
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
import type { ProfileFormValues } from "./user-profile-dialog";

interface Step2Props {
  register: UseFormRegister<ProfileFormValues>;
  errors: FieldErrors<ProfileFormValues>;
  control: Control<ProfileFormValues>;
}

export default function UserDialogS2({ register, errors, control }: Step2Props) {
  const { fields, append, remove } = useFieldArray({ control, name: "extraLinks" });

  return (
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
          These links will appear on your generated resume so recruiters can find your work instantly.
        </DialogDescription>
      </DialogHeader>

      <div className="flex flex-col gap-4 mt-2 max-h-[45vh] overflow-y-auto pr-1">
        {/* Portfolio */}
        <div className="grid gap-2">
          <Label
            htmlFor="portfolioUrl"
            className="text-xs font-semibold text-foreground/80 flex items-center gap-1.5"
          >
            <Globe className="h-3.5 w-3.5 text-muted-foreground" /> Portfolio / Website
          </Label>
          <Input
            id="portfolioUrl"
            placeholder="https://johndoe.dev"
            className="h-10 border-border/50 bg-background/50 focus-visible:ring-primary focus-visible:border-primary transition-all text-xs"
            {...register("portfolioUrl")}
          />
          {errors.portfolioUrl && (
            <span className="text-[10px] font-semibold text-destructive">
              {errors.portfolioUrl.message}
            </span>
          )}
        </div>

        {/* GitHub */}
        <div className="grid gap-2">
          <Label
            htmlFor="githubUrl"
            className="text-xs font-semibold text-foreground/80 flex items-center gap-1.5"
          >
            <Github className="h-3.5 w-3.5 text-muted-foreground" /> GitHub
          </Label>
          <Input
            id="githubUrl"
            placeholder="https://github.com/johndoe"
            className="h-10 border-border/50 bg-background/50 focus-visible:ring-primary focus-visible:border-primary transition-all text-xs"
            {...register("githubUrl")}
          />
          {errors.githubUrl && (
            <span className="text-[10px] font-semibold text-destructive">
              {errors.githubUrl.message}
            </span>
          )}
        </div>

        {/* LinkedIn */}
        <div className="grid gap-2">
          <Label
            htmlFor="linkedinUrl"
            className="text-xs font-semibold text-foreground/80 flex items-center gap-1.5"
          >
            <Linkedin className="h-3.5 w-3.5 text-muted-foreground" /> LinkedIn
          </Label>
          <Input
            id="linkedinUrl"
            placeholder="https://linkedin.com/in/johndoe"
            className="h-10 border-border/50 bg-background/50 focus-visible:ring-primary focus-visible:border-primary transition-all text-xs"
            {...register("linkedinUrl")}
          />
          {errors.linkedinUrl && (
            <span className="text-[10px] font-semibold text-destructive">
              {errors.linkedinUrl.message}
            </span>
          )}
        </div>

        {/* Extra Links */}
        <div className="space-y-3 pt-3 border-t border-border/40">
          <div className="flex justify-between items-center">
            <Label className="text-xs font-bold text-foreground/80">
              Other links (optional)
            </Label>
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
            <div
              key={field.id}
              className="flex gap-2 items-start bg-muted/30 p-3 rounded-sm border border-border/30"
            >
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
  );
}
