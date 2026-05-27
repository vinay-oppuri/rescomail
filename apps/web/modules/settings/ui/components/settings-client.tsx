"use client";

import { AccountDetails } from "./account-details";
import { ProfileDefaults } from "./profile-defaults";
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
}

export default function SettingsClient({ user }: SettingsClientProps) {

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
      {/* Page Header */}
      <div className="space-y-1">
        <h1 className="text-xl font-bold tracking-tight">Settings</h1>
        <p className="text-xs text-muted-foreground">
          Manage your profile and workspace preferences.
        </p>
      </div>

      <AccountDetails user={user} />
      <ProfileDefaults />
      <DangerActions />
    </div>
  );
}
