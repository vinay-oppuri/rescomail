"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@repo/ui/components/button";
import { Separator } from "@repo/ui/components/separator";
import { FileText } from "lucide-react";
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
  const [resumeDialogOpen, setResumeDialogOpen] = useState(false);
  const [dialogStep, setDialogStep] = useState(1);

  const openDialogAtStep = (stepNumber: number) => {
    setDialogStep(stepNumber);
    setResumeDialogOpen(true);
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
          className="h-8 text-xs gap-1.5 border-foreground/5! bg-muted/60! shrink-0"
        >
          <FileText className="h-3.5 w-3.5" />
          Edit Resume Profile
        </Button>
      </div>

      <div className="flex flex-col gap-6 p-3 sm:p-6">
        <AccountProfileBasic user={user} />

        <Separator className="bg-foreground/5" />

        <ResumeProfileSection
          profile={profile}
          geminiApiKey={geminiApiKey}
          groqApiKey={groqApiKey}
          openDialogAtStep={openDialogAtStep}
        />
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
