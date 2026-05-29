"use client";

import { useState } from "react";
import { EditPreferenceAction } from "../../server/actions";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { Check, Loader2, Key } from "lucide-react";

export function ApiKeys() {
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

      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Failed to save API key. Please try again.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="rounded-none border border-foreground/5 bg-card/20">
      <div className="border-b border-foreground/10 px-5 py-3.5">
        <h2 className="text-sm font-semibold">Custom API Keys</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Provide your own Gemini API key to unlock unlimited AI credits.
        </p>
      </div>

      <div className="grid gap-5 p-5 sm:grid-cols-1">
        <div className="space-y-2">
          <Label htmlFor="gemini-api-key">Gemini API Key</Label>
          <div className="relative">
            <Key className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="gemini-api-key"
              type="password"
              className="h-9 pl-8 border border-foreground/10"
              placeholder="AIza..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </div>
          <p className="text-[10px] text-muted-foreground">
            Your API key is stored securely in our database and will be used for all AI features like resume analysis and cold email generation instead of our rate-limited trials.
          </p>
          {error && (
            <p className="text-xs text-red-500 font-medium">
              {error}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-foreground/5 px-5 py-3.5">
        <Button size="sm" onClick={handleSave} disabled={isSaving || !apiKey}>
          {isSaving ? (
            <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
          ) : saved ? (
            <Check className="mr-2 h-3.5 w-3.5 text-green-400" />
          ) : null}
          {saved ? "Saved!" : "Save API Key"}
        </Button>
      </div>
    </section>
  );
}
