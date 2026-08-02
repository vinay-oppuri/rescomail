"use client";

import { Button } from "@repo/ui/components/button";
import { ConfirmDialog } from "@repo/ui";
import { DeleteAccountAction } from "../../server/actions";
import { useRouter } from "next/navigation";

export function DangerActions() {
  const router = useRouter();
  const handleDeleteAccount = async () => {
    await DeleteAccountAction();
    router.push("/");
  };
  return (
    <section className="flex flex-col border border-destructive/20 bg-destructive/5 shadow-sm overflow-hidden rounded-sm">
      <div className="flex items-start justify-between gap-3 border-b border-destructive/20 bg-destructive/10 px-3 md:px-5 py-3 md:py-4">
        <div>
          <h2 className="text-xs md:text-sm font-semibold tracking-tight text-destructive">
            Danger Zone
          </h2>
          <p className="mt-1 text-[10px] md:text-xs text-destructive/80">
            Irreversible actions — proceed with caution.
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between border-b border-destructive/20 p-3 sm:p-6">
        <div>
          <p className="text-xs md:text-sm font-medium">Export Account Data</p>
          <p className="mt-1 text-[10px] md:text-xs text-muted-foreground">
            Download your profile, resumes, analyses, and generated emails as JSON.
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="h-7 md:h-9">
          <a href="/api/account/export" download>Export Data</a>
        </Button>
      </div>
      <div className="flex items-center justify-between p-3 sm:p-6">
        <div>
          <p className="text-xs md:text-sm font-medium">Delete Account</p>
          <p className="mt-1 text-[10px] md:text-xs text-muted-foreground">
            Permanently delete your account and all associated data.
          </p>
        </div>
        <ConfirmDialog
          trigger={
            <Button variant="destructive" size="sm" className="h-7 md:h-9">
              Delete Account
            </Button>
          }
          title="Delete account?"
          description="Are you sure you want to permanently delete your account? All your data, preferences, and generated content will be lost. This action cannot be undone."
          onConfirm={handleDeleteAccount}
          confirmText="Delete Account"
          destructive
        />
      </div>
    </section>
  );
}
