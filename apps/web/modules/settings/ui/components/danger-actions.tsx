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
    <section className="rounded-none border border-destructive/30 bg-destructive/10">
      <div className="border-b border-destructive/30 px-5 py-3.5">
        <h2 className="text-sm font-semibold text-destructive">Danger Zone</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Irreversible actions — proceed with caution.
        </p>
      </div>
      <div className="flex items-center justify-between px-5 py-4">
        <div>
          <p className="text-sm font-medium">Delete Account</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Permanently delete your account and all associated data.
          </p>
        </div>
        <ConfirmDialog
          trigger={
            <Button variant="destructive" size="sm">
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
