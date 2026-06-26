"use client";

import { UseFormRegister, FieldErrors } from "react-hook-form";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { User, Mail, Phone, MapPin, Sparkles } from "lucide-react";
import type { ProfileFormValues } from "../../server/user-profile-schema";

interface Step1Props {
  register: UseFormRegister<ProfileFormValues>;
  errors: FieldErrors<ProfileFormValues>;
}

function FieldGroup({
  id,
  label,
  icon: Icon,
  error,
  children,
}: {
  id: string;
  label: string;
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
        <span className="text-[11px] text-destructive flex items-center gap-1">
          {error}
        </span>
      )}
    </div>
  );
}

export default function UserDialogS1({ register, errors }: Step1Props) {
  return (
    <div className="flex-1 flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-col items-start gap-2 pb-4">
        <h2 className="text-lg font-bold tracking-tight text-foreground leading-tight">
          Let&apos;s personalize your resume
        </h2>
        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
          This info will pre-fill your generated resumes. You can update it anytime in Settings.
        </p>
      </div>

      {/* Form Fields */}
      <div className="grid gap-3.5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <FieldGroup id="fullName" label="Full Name" icon={User} error={errors.fullName?.message}>
            <Input
              id="fullName"
              placeholder="John Doe"
              className="h-9 border-border/60 bg-muted/20 focus-visible:ring-primary focus-visible:border-primary transition-all text-xs md:text-sm"
              {...register("fullName")}
            />
          </FieldGroup>
        </div>

        <div className="sm:col-span-2">
          <FieldGroup id="email" label="Email Address" icon={Mail} error={errors.email?.message}>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              className="h-9 border-border/60 bg-muted/20 focus-visible:ring-primary focus-visible:border-primary transition-all text-xs md:text-sm"
              {...register("email")}
            />
          </FieldGroup>
        </div>

        <FieldGroup id="phone" label="Phone (Optional)" icon={Phone} error={errors.phone?.message}>
          <Input
            id="phone"
            placeholder="+1 (555) 000-0000"
            className="h-9 border-border/60 bg-muted/20 focus-visible:ring-primary focus-visible:border-primary transition-all text-xs md:text-sm"
            {...register("phone")}
          />
        </FieldGroup>

        <FieldGroup id="location" label="Location (Optional)" icon={MapPin} error={errors.location?.message}>
          <Input
            id="location"
            placeholder="San Francisco, CA"
            className="h-9 border-border/60 bg-muted/20 focus-visible:ring-primary focus-visible:border-primary transition-all text-xs md:text-sm"
            {...register("location")}
          />
        </FieldGroup>
      </div>
    </div>
  );
}
