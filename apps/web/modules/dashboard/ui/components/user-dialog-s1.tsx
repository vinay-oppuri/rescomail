"use client";

import { UseFormRegister, FieldErrors } from "react-hook-form";
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { User, Mail, Phone, MapPin, Sparkles } from "lucide-react";
import type { ProfileFormValues } from "./user-profile-dialog";

interface Step1Props {
  register: UseFormRegister<ProfileFormValues>;
  errors: FieldErrors<ProfileFormValues>;
}

export default function UserDialogS1({ register, errors }: Step1Props) {
  return (
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
          This information will be used to fill your generated resumes automatically. You can update it anytime.
        </DialogDescription>
      </DialogHeader>

      <div className="flex flex-col gap-4 mt-2">
        {/* Full Name */}
        <div className="grid gap-2">
          <Label
            htmlFor="fullName"
            className="text-xs font-semibold text-foreground/80 flex items-center gap-1.5"
          >
            <User className="h-3.5 w-3.5 text-muted-foreground" /> Full Name
          </Label>
          <Input
            id="fullName"
            placeholder="John Doe"
            className="h-10 border-border/50 bg-background/50 focus-visible:ring-primary focus-visible:border-primary transition-all text-xs"
            {...register("fullName")}
          />
          {errors.fullName && (
            <span className="text-[10px] font-semibold text-destructive">
              {errors.fullName.message}
            </span>
          )}
        </div>

        {/* Email */}
        <div className="grid gap-2">
          <Label
            htmlFor="email"
            className="text-xs font-semibold text-foreground/80 flex items-center gap-1.5"
          >
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
            <span className="text-[10px] font-semibold text-destructive">
              {errors.email.message}
            </span>
          )}
        </div>

        {/* Phone */}
        <div className="grid gap-2">
          <Label
            htmlFor="phone"
            className="text-xs font-semibold text-foreground/80 flex items-center gap-1.5"
          >
            <Phone className="h-3.5 w-3.5 text-muted-foreground" /> Phone Number (Optional)
          </Label>
          <Input
            id="phone"
            placeholder="+1 (555) 000-0000"
            className="h-10 border-border/50 bg-background/50 focus-visible:ring-primary focus-visible:border-primary transition-all text-xs"
            {...register("phone")}
          />
          {errors.phone && (
            <span className="text-[10px] font-semibold text-destructive">
              {errors.phone.message}
            </span>
          )}
        </div>

        {/* Location */}
        <div className="grid gap-2">
          <Label
            htmlFor="location"
            className="text-xs font-semibold text-foreground/80 flex items-center gap-1.5"
          >
            <MapPin className="h-3.5 w-3.5 text-muted-foreground" /> Location (Optional)
          </Label>
          <Input
            id="location"
            placeholder="San Francisco, CA or Bangalore, India"
            className="h-10 border-border/50 bg-background/50 focus-visible:ring-primary focus-visible:border-primary transition-all text-xs"
            {...register("location")}
          />
          {errors.location && (
            <span className="text-[10px] font-semibold text-destructive">
              {errors.location.message}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
