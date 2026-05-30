"use client";

import { Button } from "@repo/ui/components/button";
import { ConfirmDialog } from "@repo/ui";
import { DelectAccountAction } from "../../server/actions";
import { useRouter } from "next/navigation";

export function DangerActions() {
  const router = useRouter();
  const handleDeleteAccount = async () => {
    await DelectAccountAction();
    router.push("/");
  };
  return (
    <section className="flex flex-col rounded-none border border-destructive/20 bg-destructive/5 shadow-sm overflow-hidden">
      <div className="flex items-start justify-between gap-3 border-b border-destructive/20 bg-destructive/10 px-3 md:px-5 py-3 md:py-4">
        <div>
          <h2 className="text-sm font-semibold tracking-tight text-destructive">
            Danger Zone
          </h2>
          <p className="mt-1 text-xs text-destructive/80">
            Irreversible actions — proceed with caution.
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between p-3 sm:p-6">
        <div>
          <p className="text-sm font-medium">Delete Account</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Permanently delete your account and all associated data.
          </p>
        </div>
        <ConfirmDialog
          trigger={
            <Button variant="destructive" size="sm" className="rounded-none h-9">
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
