"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EditProfileActions } from "../../server/actions";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/avatar";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { Separator } from "@repo/ui/components/separator";
import {
  Camera,
  Check,
  Loader2,
  Mail,
  Shield,
  Calendar,
  User,
  FileText,
  Phone,
  MapPin,
  Globe,
  Github,
  Linkedin,
  Link2,
  Brain,
  Zap,
} from "lucide-react";
import UserProfileDialog from "@/modules/dashboard/ui/components/user-profile-dialog";

interface AccountDetailsProps {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
    createdAt: Date;
    emailVerified: boolean;
  };
  profile?: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    portfolioUrl: string;
    githubUrl: string;
    linkedinUrl: string;
    extraLinks: { label: string; url: string }[];
  } | null;
  geminiApiKey?: string | null;
  groqApiKey?: string | null;
  primaryProvider?: string;
}

export function AccountDetails({
  user,
  profile,
  geminiApiKey,
  groqApiKey,
  primaryProvider,
}: AccountDetailsProps) {
  const router = useRouter();
  const [name, setName] = useState(user.name || "");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [resumeDialogOpen, setResumeDialogOpen] = useState(false);
  const [dialogStep, setDialogStep] = useState(1);

  const openDialogAtStep = (stepNumber: number) => {
    setDialogStep(stepNumber);
    setResumeDialogOpen(true);
  };

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
    <section className="flex flex-col border border-foreground/5 bg-card/20 shadow-sm overflow-hidden w-full rounded-sm">
      <div className="flex items-start justify-between gap-3 border-b border-foreground/5 bg-muted/10 px-3 md:px-5 py-3 md:py-4">
        <div>
          <h2 className="text-sm font-semibold tracking-tight text-foreground">
            Account Profile
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Your personal information and account details.
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => openDialogAtStep(1)}
          className="h-8 text-xs font-semibold gap-1.5 border-foreground/10 bg-background/50 hover:bg-muted/60 shrink-0"
        >
          <FileText className="h-3.5 w-3.5" />
          Edit Resume Profile
        </Button>
      </div>

      <div className="flex flex-col gap-6 p-3 sm:p-6">
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
                className="h-9 pl-8 bg-muted/20! border-foreground/5! rounded-sm"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email-display">Email Address</Label>
            <div className="flex h-9 items-center gap-2.5 bg-muted/20! border border-foreground/5! px-2.5 text-sm text-muted-foreground rounded-sm">
              <Mail className="h-4 w-4 shrink-0" />
              <span className="truncate">{user.email}</span>
            </div>
          </div>
        </div>

        <Separator className="bg-foreground/5" />

        {/* Resume Profile Details */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground/80">
                Resume Profile Details
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                These contact details are used to pre-fill generated resumes.
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => openDialogAtStep(1)}
              className="h-7 text-xs font-semibold text-primary hover:text-primary/80 hover:bg-primary/5 gap-1 px-2 shrink-0"
            >
              Edit Contact Details
            </Button>
          </div>

          {profile ? (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Full Name</span>
                  <div className="flex items-center gap-2 text-sm text-foreground bg-muted/10 border border-foreground/5 px-2.5 py-1.5 rounded-sm">
                    <User className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="truncate font-medium">{profile.fullName || "—"}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Email</span>
                  <div className="flex items-center gap-2 text-sm text-foreground bg-muted/10 border border-foreground/5 px-2.5 py-1.5 rounded-sm">
                    <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="truncate font-medium">{profile.email || "—"}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Phone</span>
                  <div className="flex items-center gap-2 text-sm text-foreground bg-muted/10 border border-foreground/5 px-2.5 py-1.5 rounded-sm">
                    <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="truncate font-medium">{profile.phone || "—"}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Location</span>
                  <div className="flex items-center gap-2 text-sm text-foreground bg-muted/10 border border-foreground/5 px-2.5 py-1.5 rounded-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="truncate font-medium">{profile.location || "—"}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block">
                    Links & Social Profiles
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openDialogAtStep(2)}
                    className="h-6 text-[10px] font-semibold text-primary hover:text-primary/80 hover:bg-primary/5 px-2 gap-1 shrink-0"
                  >
                    Edit Links
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.portfolioUrl && (
                    <a
                      href={profile.portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline bg-primary/5 hover:bg-primary/10 px-2.5 py-1 rounded-sm border border-primary/10 transition-colors font-medium"
                    >
                      <Globe className="h-3.5 w-3.5" />
                      Portfolio
                    </a>
                  )}
                  {profile.githubUrl && (
                    <a
                      href={profile.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-foreground hover:underline bg-muted/40 hover:bg-muted/60 px-2.5 py-1 rounded-sm border border-foreground/5 transition-colors font-medium"
                    >
                      <Github className="h-3.5 w-3.5" />
                      GitHub
                    </a>
                  )}
                  {profile.linkedinUrl && (
                    <a
                      href={profile.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline bg-primary/5 hover:bg-primary/10 px-2.5 py-1 rounded-sm border border-primary/10 transition-colors font-medium"
                    >
                      <Linkedin className="h-3.5 w-3.5" />
                      LinkedIn
                    </a>
                  )}
                  {profile.extraLinks && profile.extraLinks.map((link, idx) => (
                    <a
                      key={idx}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground hover:underline bg-muted/20 hover:bg-muted/40 px-2.5 py-1 rounded-sm border border-foreground/5 transition-colors font-medium"
                    >
                      <Link2 className="h-3.5 w-3.5" />
                      {link.label}
                    </a>
                  ))}
                  {!profile.portfolioUrl && !profile.githubUrl && !profile.linkedinUrl && (!profile.extraLinks || profile.extraLinks.length === 0) && (
                    <span className="text-xs text-muted-foreground italic">No links added yet.</span>
                  )}
                </div>
              </div>

              <Separator className="bg-foreground/5" />

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block">
                    AI Engine Setup
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openDialogAtStep(3)}
                    className="h-6 text-[10px] font-semibold text-primary hover:text-primary/80 hover:bg-primary/5 px-2 gap-1 shrink-0"
                  >
                    Edit API Keys
                  </Button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="flex items-center justify-between px-3 py-2 bg-muted/10 border border-foreground/5 rounded-sm">
                    <div className="flex items-center gap-2">
                      <Brain className="h-4 w-4 text-blue-400 shrink-0" />
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold">Google Gemini</span>
                        <span className="text-[10px] text-muted-foreground">
                          {geminiApiKey ? "API Key Configured" : "Not configured"}
                        </span>
                      </div>
                    </div>
                    {geminiApiKey && (
                      <span className="text-[9px] bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded-sm border border-emerald-500/20 font-medium">
                        Active
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between px-3 py-2 bg-muted/10 border border-foreground/5 rounded-sm">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-orange-400 shrink-0" />
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold">Groq (Llama)</span>
                        <span className="text-[10px] text-muted-foreground">
                          {groqApiKey ? "API Key Configured" : "Not configured"}
                        </span>
                      </div>
                    </div>
                    {groqApiKey && (
                      <span className="text-[9px] bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded-sm border border-emerald-500/20 font-medium">
                        Active
                      </span>
                    )}
                  </div>
                </div>

              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-center border border-dashed border-foreground/10 rounded-sm bg-muted/5">
              <p className="text-xs text-muted-foreground">
                No resume profile set up yet.
              </p>
              <Button
                size="sm"
                variant="link"
                onClick={() => openDialogAtStep(1)}
                className="mt-1 h-auto p-0 text-xs font-semibold text-primary"
              >
                Set up resume profile
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-foreground/5 bg-muted/10 px-3 md:px-5 py-3 md:py-4">
        <Button
          size="sm"
          className="h-9"
          onClick={handleSaveProfile}
          disabled={isSavingProfile || name === user.name}
        >
          {isSavingProfile ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : profileSaved ? (
            <Check className="mr-2 h-4 w-4 text-green-400" />
          ) : null}
          {profileSaved ? "Saved!" : "Save Profile"}
        </Button>
      </div>

      <UserProfileDialog
        open={resumeDialogOpen}
        onOpenChange={setResumeDialogOpen}
        initialStep={dialogStep}
        initialData={{
          ...profile,
          preferences: {
            primaryProvider: primaryProvider,
            hasGeminiKey: !!geminiApiKey,
            hasGroqKey: !!groqApiKey,
          }
        }}
        onSaveSuccess={() => {
          setResumeDialogOpen(false);
          router.refresh();
        }}
      />
    </section>
  );
}
