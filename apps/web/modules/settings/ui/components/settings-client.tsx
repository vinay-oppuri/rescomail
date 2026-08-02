"use client";

import { AccountDetails } from "./account-details";
import { DangerActions } from "./danger-actions";

interface SettingsClientProps {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
    createdAt: Date;
    emailVerified: boolean;
  };
  geminiApiKey?: string | null;
  groqApiKey?: string | null;
  primaryProvider?: "gemini" | "groq";
  profile?: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    portfolioUrl: string;
    githubUrl: string;
    linkedinUrl: string;
    extraLinks: { label: string; url: string }[];
  };
}

export default function SettingsClient({
  user,
  geminiApiKey,
  groqApiKey,
  primaryProvider,
  profile,
}: SettingsClientProps) {

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 border-b border-border/50 pb-6">
        <div className="space-y-2 max-w-3xl">
          <h1 className="text-xl font-bold tracking-tight md:text-2xl">Settings</h1>
          <p className="text-xs leading-6 text-muted-foreground">
            Manage your profile and workspace preferences.
          </p>
        </div>
      </div>

      <AccountDetails
        user={user}
        profile={profile}
        geminiApiKey={geminiApiKey}
        groqApiKey={groqApiKey}
        primaryProvider={primaryProvider}
      />
      <DangerActions />
    </div>
  );
}
