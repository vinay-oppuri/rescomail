"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@repo/ui/components/dialog";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Loader2, Key } from "lucide-react";
import { EditPreferenceAction } from "@/modules/settings/server/actions";

export default function ApiKeyPromptDialog({ hasApiKey }: { hasApiKey: boolean }) {
  const [open, setOpen] = useState(!hasApiKey);
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) return;

    setLoading(true);
    setError("");

    try {
      const result = await EditPreferenceAction({ geminiApiKey: apiKey.trim() });
      if (result.error) {
        setError(result.error);
      } else if (result.success) {
        setOpen(false);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="rounded-sm sm:max-w-sm p-0 overflow-hidden border-foreground/5 bg-background/95 backdrop-blur-2xl shadow-2xl">
        <div className="p-6">
          <DialogHeader className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-primary/10 text-primary">
                <Key className="h-4 w-4" />
              </div>
              <DialogTitle className="text-xl font-extrabold tracking-tight">
                Gemini API Key
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground">
              To use the AI Copilot features (like ATS optimization and Cold Emails), please provide your Gemini API key.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Input
                type="password"
                placeholder="Enter your Gemini API Key..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="h-9 border-border/50 bg-background/50 focus-visible:ring-primary focus-visible:border-primary transition-all px-4"
                required
              />
              {error && <span className="text-xs text-destructive font-medium">{error}</span>}
            </div>

            <div className="text-xs text-muted-foreground mb-2">
              Don't have one? Get it from{" "}
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-primary hover:underline underline-offset-4"
              >
                Google AI Studio
              </a>.
            </div>

            <Button
              type="submit"
              disabled={loading || !apiKey.trim()}
              className="h-9 w-full gap-2 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-md"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save API Key"}
            </Button>

            <div className="mt-2 text-center">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors hover:underline underline-offset-4"
              >
                Skip for now
              </button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
