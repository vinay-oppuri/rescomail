"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EditPreferenceAction } from "../../server/actions";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { Check, Loader2, Key, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@repo/ui/components/confirm-dialog";

export function ApiKeys({
  geminiApiKey,
  groqApiKey,
}: {
  geminiApiKey?: string | null;
  groqApiKey?: string | null;
}) {
  const router = useRouter();
  const [apiKey, setApiKey] = useState("");
  const [groqApiKeyInput, setGroqApiKeyInput] = useState("");
  const [isSavingGemini, setIsSavingGemini] = useState(false);
  const [isSavingGroq, setIsSavingGroq] = useState(false);
  const [savedGemini, setSavedGemini] = useState(false);
  const [savedGroq, setSavedGroq] = useState(false);
  const [geminiError, setGeminiError] = useState<string | null>(null);
  const [groqError, setGroqError] = useState<string | null>(null);

  const handleSaveGemini = async () => {
    setIsSavingGemini(true);
    setGeminiError(null);

    try {
      const result = await EditPreferenceAction({
        geminiApiKey: apiKey,
      });

      if (result?.error) {
        setGeminiError(result.error);
        return;
      }

      setApiKey("");
      setSavedGemini(true);
      router.refresh();
      setTimeout(() => setSavedGemini(false), 2500);
    } catch (error) {
      setGeminiError(
        error instanceof Error
          ? error.message
          : "Failed to save Gemini API key. Please try again.",
      );
    } finally {
      setIsSavingGemini(false);
    }
  };

  const handleSaveGroq = async () => {
    setIsSavingGroq(true);
    setGroqError(null);

    try {
      const result = await EditPreferenceAction({
        groqApiKey: groqApiKeyInput,
      });

      if (result?.error) {
        setGroqError(result.error);
        return;
      }

      setGroqApiKeyInput("");
      setSavedGroq(true);
      router.refresh();
      setTimeout(() => setSavedGroq(false), 2500);
    } catch (error) {
      setGroqError(
        error instanceof Error
          ? error.message
          : "Failed to save Groq API key. Please try again.",
      );
    } finally {
      setIsSavingGroq(false);
    }
  };

  const handleDeleteGemini = async () => {
    const result = await EditPreferenceAction({ geminiApiKey: null });

    if (result?.error) {
      throw new Error(result.error);
    }

    setApiKey("");
    router.refresh();
  };

  const handleDeleteGroq = async () => {
    const result = await EditPreferenceAction({ groqApiKey: null });

    if (result?.error) {
      throw new Error(result.error);
    }

    setGroqApiKeyInput("");
    router.refresh();
  };

  return (
    <section className="flex flex-col border border-foreground/5 bg-card/20 shadow-sm overflow-hidden rounded-sm w-full">
      <div className="flex items-start justify-between gap-3 border-b border-foreground/5 bg-muted/10 px-3 md:px-5 py-3 md:py-4">
        <div>
          <h2 className="text-sm font-semibold tracking-tight text-foreground">
            Custom API Keys
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Provide your custom keys to customize model pipelines or fallback providers.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-6 p-3 sm:p-6">
        {/* Gemini API Key */}
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
          {geminiError && <p className="text-xs text-red-500 font-medium">{geminiError}</p>}
          <div className="flex justify-end pt-1">
            <Button
              size="sm"
              className="h-8"
              onClick={handleSaveGemini}
              disabled={isSavingGemini || !apiKey}
            >
              {isSavingGemini && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {savedGemini ? "Saved!" : "Save Gemini Key"}
            </Button>
          </div>
        </div>

        <div className="border-t border-foreground/5 my-2" />

        {/* Groq API Key */}
        <div className="space-y-2">
          <Label htmlFor="groq-api-key">Groq API Key (Fallback)</Label>
          <div className="relative">
            <Key className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="groq-api-key"
              type="password"
              className="h-9 pl-8 bg-muted/20! border-foreground/5! rounded-sm"
              placeholder="gsk_..."
              value={groqApiKeyInput}
              onChange={(event) => setGroqApiKeyInput(event.target.value)}
            />
          </div>
          {groqError && <p className="text-xs text-red-500 font-medium">{groqError}</p>}
          <div className="flex justify-end pt-1">
            <Button
              size="sm"
              className="h-8"
              onClick={handleSaveGroq}
              disabled={isSavingGroq || !groqApiKeyInput}
            >
              {isSavingGroq && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {savedGroq ? "Saved!" : "Save Groq Key"}
            </Button>
          </div>
        </div>
      </div>

      {(geminiApiKey || groqApiKey) && (
        <div className="border-t border-foreground/5 p-3 sm:p-6 space-y-4">
          <h3 className="text-xs font-medium">Saved API Keys</h3>
          {geminiApiKey && (
            <div className="flex items-center justify-between border border-foreground/10 bg-background px-3 py-1 gap-4 rounded-sm">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <Key className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-xs font-semibold text-muted-foreground shrink-0">Gemini</span>
                <div className="font-mono text-xs break-all truncate">{geminiApiKey}</div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <ConfirmDialog
                  title="Remove Gemini Key"
                  description="Are you sure you want to remove your Gemini API key?"
                  confirmText="Remove Key"
                  onConfirm={handleDeleteGemini}
                  trigger={
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  }
                />
              </div>
            </div>
          )}
          {groqApiKey && (
            <div className="flex items-center justify-between border border-foreground/10 bg-background px-3 py-1 gap-4 rounded-sm mt-2">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <Key className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-xs font-semibold text-muted-foreground shrink-0">Groq</span>
                <div className="font-mono text-xs break-all truncate">{groqApiKey}</div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <ConfirmDialog
                  title="Remove Groq Key"
                  description="Are you sure you want to remove your Groq API key?"
                  confirmText="Remove Key"
                  onConfirm={handleDeleteGroq}
                  trigger={
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  }
                />
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

