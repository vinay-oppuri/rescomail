"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EditProfileActions } from "../../server/actions";
import { Button } from "@repo/ui/components/button";
import { Separator } from "@repo/ui/components/separator";
import { FileText, Check, Loader2 } from "lucide-react";
import UserProfileDialog from "@/modules/dashboard/ui/components/user-profile-dialog";
import { AccountProfileBasic } from "./account-profile-basic";
import { ResumeProfileSection } from "./resume-profile-section";

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
          className="h-8 text-xs gap-1.5 border-foreground/5! bg-background! shrink-0"
        >
          <FileText className="h-3.5 w-3.5" />
          Edit Resume Profile
        </Button>
      </div>

      <div className="flex flex-col gap-6 p-3 sm:p-6">
        <AccountProfileBasic user={user} name={name} setName={setName} />

        <Separator className="bg-foreground/5" />

        <ResumeProfileSection
          profile={profile}
          geminiApiKey={geminiApiKey}
          groqApiKey={groqApiKey}
          openDialogAtStep={openDialogAtStep}
        />
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
