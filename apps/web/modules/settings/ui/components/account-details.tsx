"use client";

import { useState } from "react";
import { EditProfileActions } from "../../server/actions";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/avatar";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { Separator } from "@repo/ui/components/separator";
import { Camera, Check, Loader2, Mail, Shield, Calendar, User } from "lucide-react";

interface AccountDetailsProps {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
    createdAt: Date;
    emailVerified: boolean;
  };
}

export function AccountDetails({ user }: AccountDetailsProps) {
  const [name, setName] = useState(user.name || "");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  const initials =
    user.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";

  const memberSince = new Date(user.createdAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    try {
      await EditProfileActions(name);
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2500);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSavingProfile(false);
    }
  };

  return (
    <section className="rounded-none border border-foreground/5 bg-card/20">
      <div className="border-b border-foreground/10 px-5 py-3.5">
        <h2 className="text-sm font-semibold">Account Profile</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Your personal information and account details.
        </p>
      </div>

      <div className="p-5 space-y-6">
        {/* Avatar row */}
        <div className="flex items-center gap-5">
          <div className="relative shrink-0">
            <Avatar className="h-20 w-20 border-2 border-foreground/5 bg-muted">
              <AvatarImage src={user.image ?? undefined} alt={user.name} />
              <AvatarFallback className="text-xl font-semibold text-muted-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <button
              className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border border-foreground/5 bg-background shadow-sm hover:bg-muted transition-colors"
              title="Change avatar"
            >
              <Camera className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </div>

          <div className="space-y-1.5 min-w-0">
            <p className="text-sm font-semibold truncate">
              {user.name || "Unknown User"}
            </p>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Mail className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{user.email}</span>
            </div>
            <div className="flex items-center gap-2">
              {user.emailVerified && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">
                  <Shield className="mr-1 h-2.5 w-2.5 text-green-500" />
                  Verified
                </Badge>
              )}
              <Badge variant="outline" className="text-[10px] px-1.5 py-0.5">
                <Calendar className="mr-1 h-2.5 w-2.5" />
                {memberSince}
              </Badge>
            </div>
          </div>
        </div>

        <Separator className="bg-foreground/5" />

        {/* Editable fields */}
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="full-name">Full Name</Label>
            <div className="relative">
              <User className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="full-name"
                className="h-9 pl-8 border border-foreground/10"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email-display">Email Address</Label>
            <div className="flex h-9 items-center gap-2.5 border border-foreground/5 bg-muted/40 px-2.5 text-sm text-muted-foreground">
              <Mail className="h-4 w-4 shrink-0" />
              <span className="truncate">{user.email}</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Email cannot be changed.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Account Status</Label>
            <div className="flex h-9 items-center gap-2.5 border border-foreground/10 px-2.5 text-sm">
              <Shield className="h-4 w-4 text-green-500 shrink-0" />
              <span className="font-medium">Active &amp; Secure</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-foreground/10 px-5 py-3.5">
        <Button
          size="sm"
          onClick={handleSaveProfile}
          disabled={isSavingProfile || name === user.name}
        >
          {isSavingProfile ? (
            <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
          ) : profileSaved ? (
            <Check className="mr-2 h-3.5 w-3.5 text-green-400" />
          ) : null}
          {profileSaved ? "Saved!" : "Save Profile"}
        </Button>
      </div>
    </section>
  );
}
