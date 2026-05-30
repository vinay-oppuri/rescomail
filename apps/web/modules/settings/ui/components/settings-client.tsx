"use client";

import { AccountDetails } from "./account-details";
import { ProfileDefaults } from "./profile-defaults";
import { DangerActions } from "./danger-actions";
import { ApiKeys } from "./api-keys";

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
}

export default function SettingsClient({ user, geminiApiKey }: SettingsClientProps) {

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 md:gap-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 border-b border-border/50 pb-6">
        <div className="space-y-2 max-w-3xl">
          <h1 className="text-xl font-bold tracking-tight md:text-2xl">Settings</h1>
          <p className="text-xs leading-6 text-muted-foreground">
            Manage your profile and workspace preferences.
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 w-full">
        <AccountDetails user={user} />
        <ApiKeys geminiApiKey={geminiApiKey} />
      </div>
      <ProfileDefaults />
      <DangerActions />
    </div>
  );
}
