"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EditPreferenceAction } from "../../server/actions";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { Check, Loader2, Key, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@repo/ui/components/confirm-dialog";

export function ApiKeys({ geminiApiKey }: { geminiApiKey?: string | null }) {
  const router = useRouter();
  const [apiKey, setApiKey] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      const result = await EditPreferenceAction({
        geminiApiKey: apiKey,
      });

      if (result?.error) {
        setError(result.error);
        return;
      }

      setApiKey("");
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 2500);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to save API key. Please try again.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    const result = await EditPreferenceAction({ geminiApiKey: null });

    if (result?.error) {
      throw new Error(result.error);
    }

    setApiKey("");
    router.refresh();
  };

  return (
    <section className="flex flex-col border border-foreground/5 bg-card/20 shadow-sm overflow-hidden rounded-sm">
      <div className="flex items-start justify-between gap-3 border-b border-foreground/5 bg-muted/10 px-3 md:px-5 py-3 md:py-4">
        <div>
          <h2 className="text-sm font-semibold tracking-tight text-foreground">
            Custom API Keys
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Provide your own Gemini API key to unlock unlimited AI credits.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-6 p-3 sm:p-6">
        <div className="space-y-2">
          <Label htmlFor="gemini-api-key">Gemini API Key</Label>
          <div className="relative">
            <Key className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="gemini-api-key"
              type="password"
              className="h-9 pl-8 bg-muted/20! border-foreground/5! rounded-sm"
              placeholder="AIza..."
              value={apiKey}
              onChange={(event) => setApiKey(event.target.value)}
            />
          </div>
          <p className="text-[10px] text-muted-foreground">
            Your API key is encrypted before storage and used only for AI
            features like resume analysis and cold email generation.
          </p>
          {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 px-3 md:px-5 py-3 md:py-4">
        <Button
          size="sm"
          className="h-9"
          onClick={handleSave}
          disabled={isSaving || !apiKey}
        >
          {isSaving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : saved ? (
            <Check className="mr-2 h-4 w-4 text-green-400" />
          ) : null}
          {saved ? "Saved!" : "Save API Key"}
        </Button>
      </div>

      {geminiApiKey && (
        <div className="border-t border-foreground/5 p-3 sm:p-6 space-y-4">
          <h3 className="text-xs font-medium">Saved API Keys</h3>
          <div className="flex items-center justify-between border border-foreground/10 bg-background px-3 py-1 gap-4 rounded-sm">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <Key className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="font-mono text-xs break-all">{geminiApiKey}</div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <ConfirmDialog
                title="Remove API Key"
                description="Are you sure you want to remove your saved Gemini API key? You will lose access to unlimited AI features."
                confirmText="Remove Key"
                onConfirm={handleDelete}
                trigger={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                }
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
