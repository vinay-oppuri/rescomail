"use client";

import { useState } from "react";
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import {
  Key,
  CheckCircle2,
  Zap,
  Brain,
  X,
  ShieldCheck,
} from "lucide-react";
import { EditPreferenceAction } from "@/modules/settings/server/actions";

// ── Types ──────────────────────────────────────────────────────────────────
type DetectedProvider = "gemini" | "groq" | null;
type StagedKeys = { gemini?: string | null; groq?: string | null };

// ── Helpers ────────────────────────────────────────────────────────────────
function detectProvider(key: string): DetectedProvider {
  const t = key.trim();
  if (t.startsWith("AIza")) return "gemini";
  if (t.startsWith("gsk_")) return "groq";
  return null;
}

function maskKey(key: string): string {
  if (key.length <= 8) return "••••••••";
  return key.slice(0, 6) + "••••••••" + key.slice(-4);
}

// ── Props ──────────────────────────────────────────────────────────────────
interface Step3Props {
  /** Called after a successful save or skip so the parent can close / refresh */
  onDone: () => void;
  /** Called when the user clicks "Skip for now" */
  onSkip: () => void;
  /** Called when saving is in progress (lets parent disable the footer Save button) */
  onSavingChange?: (saving: boolean) => void;
  initialData?: {
    primaryProvider?: "gemini" | "groq" | null;
    hasGeminiKey?: boolean;
    hasGroqKey?: boolean;
  };
}

// ── Component ──────────────────────────────────────────────────────────────
export default function UserDialogS3({
  onDone,
  onSkip,
  onSavingChange,
  initialData,
}: Step3Props) {
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [detectedProvider, setDetectedProvider] = useState<DetectedProvider>(null);
  const [addKeyError, setAddKeyError] = useState("");

  const [stagedKeys, setStagedKeys] = useState<StagedKeys>({});
  const [hasGeminiKey, setHasGeminiKey] = useState(initialData?.hasGeminiKey || false);
  const [hasGroqKey, setHasGroqKey] = useState(initialData?.hasGroqKey || false);

  const [primaryProvider, setPrimaryProvider] = useState<"gemini" | "groq">(
    initialData?.primaryProvider === "groq" ? "groq" : "gemini"
  );

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const activeGeminiKey =
    stagedKeys.gemini !== undefined
      ? stagedKeys.gemini
      : hasGeminiKey
      ? "saved"
      : null;
  const activeGroqKey =
    stagedKeys.groq !== undefined
      ? stagedKeys.groq
      : hasGroqKey
      ? "saved"
      : null;

  const hasAnyKey = !!(activeGeminiKey || activeGroqKey);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleKeyChange = (value: string) => {
    setApiKeyInput(value);
    setAddKeyError("");
    setSaveError("");
    setDetectedProvider(detectProvider(value));
  };

  const handleAddKey = () => {
    const trimmed = apiKeyInput.trim();
    if (!trimmed) return;
    if (!detectedProvider) {
      setAddKeyError(
        "Unrecognized key format. Gemini keys start with AIza, Groq keys start with gsk_."
      );
      return;
    }
    setStagedKeys((prev) => ({ ...prev, [detectedProvider]: trimmed }));
    setPrimaryProvider(detectedProvider);
    setApiKeyInput("");
    setDetectedProvider(null);
    setAddKeyError("");
  };

  const handleRemoveKey = (provider: "gemini" | "groq") => {
    const isGemini = provider === "gemini";
    const hasKey = isGemini ? hasGeminiKey : hasGroqKey;

    if (hasKey) {
      if (isGemini) {
        setHasGeminiKey(false);
        setStagedKeys((prev) => ({ ...prev, gemini: null }));
      } else {
        setHasGroqKey(false);
        setStagedKeys((prev) => ({ ...prev, groq: null }));
      }
    } else {
      setStagedKeys((prev) => {
        const next = { ...prev };
        if (isGemini) delete next.gemini;
        else delete next.groq;
        return next;
      });
    }

    if (primaryProvider === provider) {
      // Determine what will be active after this removal
      const willHaveGemini = isGemini ? false : !!(stagedKeys.gemini || hasGeminiKey);
      const willHaveGroq = !isGemini ? false : !!(stagedKeys.groq || hasGroqKey);
      if (willHaveGemini) {
        setPrimaryProvider("gemini");
      } else if (willHaveGroq) {
        setPrimaryProvider("groq");
      }
    }
  };

  const handleSave = async () => {
    setSaving(true);
    onSavingChange?.(true);
    setSaveError("");

    try {
      const payload: Record<string, any> = { primaryProvider };
      if (stagedKeys.gemini !== undefined) payload.geminiApiKey = stagedKeys.gemini;
      if (stagedKeys.groq !== undefined) payload.groqApiKey = stagedKeys.groq;

      const result = await EditPreferenceAction(payload);
      if (result?.error) {
        setSaveError(result.error);
        return;
      }
      onDone();
    } catch {
      setSaveError("An unexpected error occurred. Please try again.");
    } finally {
      setSaving(false);
      onSavingChange?.(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between h-full min-h-[460px]">
      <div className="space-y-4">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-violet-500/10 text-violet-500 shrink-0">
              <Key className="h-4.5 w-4.5" />
            </div>
            <DialogTitle className="text-xl font-extrabold tracking-tight text-foreground">
              Set up your AI engine
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground leading-relaxed pl-12">
            Paste your API key — we&apos;ll auto-detect the provider and store it securely.
            Add one or both providers.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3.5">
          {/* ── Smart single key input ── */}
          <div className="grid gap-2">
            <Label
              htmlFor="s3ApiKeyInput"
              className="text-xs font-semibold text-foreground/80 flex items-center gap-1.5"
            >
              <Key className="h-3.5 w-3.5 text-muted-foreground" /> API Key
            </Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="s3ApiKeyInput"
                  type="password"
                  placeholder="Paste your Gemini (AIza…) or Groq (gsk_…) key"
                  value={apiKeyInput}
                  onChange={(e) => handleKeyChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddKey();
                    }
                  }}
                  className="h-10 border-border/50 bg-background/50 focus-visible:ring-primary focus-visible:border-primary transition-all text-xs pr-28"
                />
                {detectedProvider && (
                  <span
                    className={`absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 pointer-events-none ${
                      detectedProvider === "gemini"
                        ? "bg-blue-500/15 text-blue-400 border border-blue-500/20"
                        : "bg-orange-500/15 text-orange-400 border border-orange-500/20"
                    }`}
                  >
                    <CheckCircle2 className="h-2.5 w-2.5" />
                    {detectedProvider === "gemini" ? "Gemini" : "Groq"}
                  </span>
                )}
              </div>
              <Button
                type="button"
                disabled={!apiKeyInput.trim() || !detectedProvider}
                onClick={handleAddKey}
                className="h-10 px-4 text-xs font-semibold shrink-0 transition-all duration-200 hover:scale-105"
              >
                Add
              </Button>
            </div>
            {addKeyError && (
              <span className="text-[10px] font-semibold text-destructive">
                {addKeyError}
              </span>
            )}
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              Gemini keys start with{" "}
              <code className="bg-muted px-1 rounded text-[9px]">AIza</code>. Groq
              keys start with{" "}
              <code className="bg-muted px-1 rounded text-[9px]">gsk_</code>. You
              can add both for automatic fallback.
            </p>
          </div>

          {/* ── Staged/Saved keys display ── */}
          {hasAnyKey && (
            <div className="flex flex-col gap-2">
              <Label className="text-xs font-semibold text-foreground/80 flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Active API Keys
              </Label>
              <div className="flex flex-col gap-2 max-h-[110px] overflow-y-auto pr-1">
                {activeGeminiKey && (
                  <div className="flex items-center gap-2.5 px-3 py-2 border border-blue-500/20 bg-blue-500/5 rounded-sm">
                    <Brain className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-[11px] font-bold text-blue-400">
                          Google Gemini
                        </p>
                        {stagedKeys.gemini ? (
                          <span className="text-[9px] bg-blue-500/10 text-blue-500 px-1 rounded-sm border border-blue-500/20">
                            Staged
                          </span>
                        ) : (
                          <span className="text-[9px] bg-emerald-500/10 text-emerald-500 px-1 rounded-sm border border-emerald-500/20">
                            Saved
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground font-mono mt-0.5 truncate">
                        {stagedKeys.gemini
                          ? maskKey(stagedKeys.gemini)
                          : "••••••••••••"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveKey("gemini")}
                      className="ml-auto shrink-0 text-muted-foreground hover:text-destructive transition-colors p-0.5 rounded"
                      aria-label="Remove Gemini key"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
                {activeGroqKey && (
                  <div className="flex items-center gap-2.5 px-3 py-2 border border-orange-500/20 bg-orange-500/5 rounded-sm">
                    <Zap className="h-3.5 w-3.5 text-orange-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-[11px] font-bold text-orange-400">
                          Groq (Llama)
                        </p>
                        {stagedKeys.groq ? (
                          <span className="text-[9px] bg-orange-500/10 text-orange-500 px-1 rounded-sm border border-orange-500/20">
                            Staged
                          </span>
                        ) : (
                          <span className="text-[9px] bg-emerald-500/10 text-emerald-500 px-1 rounded-sm border border-emerald-500/20">
                            Saved
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground font-mono mt-0.5 truncate">
                        {stagedKeys.groq
                          ? maskKey(stagedKeys.groq)
                          : "••••••••••••"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveKey("groq")}
                      className="ml-auto shrink-0 text-muted-foreground hover:text-destructive transition-colors p-0.5 rounded"
                      aria-label="Remove Groq key"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Primary Provider selector ── */}
          <div className="grid gap-2">
            <Label className="text-xs font-semibold text-foreground/80">
              Primary AI Model
            </Label>
            <div className="grid grid-cols-2 gap-3">
              {/* Gemini card */}
              <button
                type="button"
                disabled={!activeGeminiKey}
                onClick={() => setPrimaryProvider("gemini")}
                className={`relative flex flex-col items-start gap-2 p-2.5 rounded-sm border text-left transition-all duration-200 ${
                  !activeGeminiKey
                    ? "opacity-50 cursor-not-allowed border-border bg-muted/10"
                    : primaryProvider === "gemini"
                    ? "border-emerald-500/60 bg-emerald-500/10 shadow-[0_0_12px_rgba(16,185,129,0.15)]"
                    : "border-border/45 bg-muted/15 hover:border-border/70 hover:bg-muted/30"
                }`}
              >
                {primaryProvider === "gemini" && activeGeminiKey && (
                  <span className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white">
                    <CheckCircle2 className="h-2.5 w-2.5" />
                  </span>
                )}
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-sm ${
                    primaryProvider === "gemini" && activeGeminiKey
                      ? "bg-emerald-500/15 text-emerald-400"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <Brain className="h-3.5 w-3.5" />
                </div>
                <div>
                  <p className="text-xs font-bold leading-tight">Google Gemini</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">
                    Flash · great quality
                  </p>
                </div>
              </button>

              {/* Groq card */}
              <button
                type="button"
                disabled={!activeGroqKey}
                onClick={() => setPrimaryProvider("groq")}
                className={`relative flex flex-col items-start gap-2 p-2.5 rounded-sm border text-left transition-all duration-200 ${
                  !activeGroqKey
                    ? "opacity-50 cursor-not-allowed border-border bg-muted/10"
                    : primaryProvider === "groq"
                    ? "border-emerald-500/60 bg-emerald-500/10 shadow-[0_0_12px_rgba(16,185,129,0.15)]"
                    : "border-border/45 bg-muted/15 hover:border-border/70 hover:bg-muted/30"
                }`}
              >
                {primaryProvider === "groq" && activeGroqKey && (
                  <span className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white">
                    <CheckCircle2 className="h-2.5 w-2.5" />
                  </span>
                )}
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-sm ${
                    primaryProvider === "groq" && activeGroqKey
                      ? "bg-emerald-500/15 text-emerald-400"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <Zap className="h-3.5 w-3.5" />
                </div>
                <div>
                  <p className="text-xs font-bold leading-tight">Groq (Llama)</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">
                    Ultra-fast inference
                  </p>
                </div>
              </button>
            </div>
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              {!activeGeminiKey || !activeGroqKey ? (
                "Add an API key above to enable and select its model as your primary provider."
              ) : (
                "The other provider will serve as an automatic fallback."
              )}
            </p>
          </div>

          {saveError && (
            <span className="text-[10px] font-semibold text-destructive">
              {saveError}
            </span>
          )}

          {/* ── Get API key links ── */}
          <div className="flex gap-4 text-[10px] text-muted-foreground pt-1 border-t border-border/30">
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="text-blue-400 hover:underline underline-offset-4"
            >
              → Get Gemini key
            </a>
            <a
              href="https://console.groq.com/keys"
              target="_blank"
              rel="noreferrer"
              className="text-orange-400 hover:underline underline-offset-4"
            >
              → Get Groq key
            </a>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-border/40 bg-muted/10 -mx-6 -mb-8 px-6 py-4 shrink-0">
        <button
          type="button"
          onClick={onSkip}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors font-semibold"
        >
          Skip for now
        </button>
        <Button
          type="button"
          disabled={saving}
          onClick={handleSave}
          className="h-9 text-xs font-semibold px-6 gap-2 transition-all duration-300 hover:scale-105"
        >
          {saving ? (
            <>
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Saving…
            </>
          ) : (
            "Save & Finish"
          )}
        </Button>
      </div>
    </div>
  );
}
