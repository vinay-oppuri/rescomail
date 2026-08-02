"use client";

import { useState, forwardRef, useImperativeHandle } from "react";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import {
  CheckCircle2,
  Zap,
  Brain,
  X,
  Check,
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
  onDone: () => void;
  onSavingChange?: (saving: boolean) => void;
  initialData?: {
    primaryProvider?: "gemini" | "groq" | null;
    hasGeminiKey?: boolean;
    hasGroqKey?: boolean;
  };
}

export interface UserDialogS3Ref {
  save: () => Promise<void>;
}

// ── Component ──────────────────────────────────────────────────────────────
const UserDialogS3 = forwardRef<UserDialogS3Ref, Step3Props>(({
  onDone,
  onSavingChange,
  initialData,
}, ref) => {
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [detectedProvider, setDetectedProvider] = useState<DetectedProvider>(null);
  const [addKeyError, setAddKeyError] = useState("");

  const [stagedKeys, setStagedKeys] = useState<StagedKeys>({});
  const [hasGeminiKey, setHasGeminiKey] = useState(initialData?.hasGeminiKey || false);
  const [hasGroqKey, setHasGroqKey] = useState(initialData?.hasGroqKey || false);

  const [primaryProvider, setPrimaryProvider] = useState<"gemini" | "groq">(
    initialData?.primaryProvider === "groq" ? "groq" : "gemini"
  );

  const [saveError, setSaveError] = useState("");

  const activeGeminiKey =
    stagedKeys.gemini !== undefined ? stagedKeys.gemini : hasGeminiKey ? "saved" : null;
  const activeGroqKey =
    stagedKeys.groq !== undefined ? stagedKeys.groq : hasGroqKey ? "saved" : null;
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
      setAddKeyError("Unrecognized key. Gemini keys start with AIza, Groq keys start with gsk_.");
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
      const willHaveGemini = isGemini ? false : !!(stagedKeys.gemini || hasGeminiKey);
      const willHaveGroq = !isGemini ? false : !!(stagedKeys.groq || hasGroqKey);
      if (willHaveGemini) setPrimaryProvider("gemini");
      else if (willHaveGroq) setPrimaryProvider("groq");
    }
  };

  const handleSave = async () => {
    onSavingChange?.(true);
    setSaveError("");
    try {
      const payload: Record<string, unknown> = { primaryProvider };
      if (stagedKeys.gemini !== undefined) payload.geminiApiKey = stagedKeys.gemini;
      if (stagedKeys.groq !== undefined) payload.groqApiKey = stagedKeys.groq;
      const result = await EditPreferenceAction(payload);
      if (result?.error) { setSaveError(result.error); return; }
      onDone();
    } catch {
      setSaveError("An unexpected error occurred. Please try again.");
    } finally {
      onSavingChange?.(false);
    }
  };

  useImperativeHandle(ref, () => ({
    save: handleSave
  }));

  return (
    <div className="flex-1 flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-col items-start gap-2 pb-4">
        <h2 className="text-lg font-bold tracking-tight text-foreground leading-tight">
          Set up your AI engine
        </h2>
        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
          Paste your API key — we&apos;ll auto-detect the provider. Add one or both for automatic fallback.
        </p>
      </div>

      {/* Key Input */}
      <div className="grid gap-1.5">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              id="s3ApiKeyInput"
              type="password"
              placeholder="Paste Gemini (AIza…) or Groq (gsk_…) key"
              value={apiKeyInput}
              onChange={(e) => handleKeyChange(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddKey(); } }}
              className="h-9 border-border/60 bg-muted/20 focus-visible:ring-primary focus-visible:border-primary transition-all text-xs pr-28"
            />
            {detectedProvider && (
              <span
                className={`absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 pointer-events-none ${detectedProvider === "gemini"
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
            className="h-9 px-4 text-xs font-semibold shrink-0 transition-all duration-200 hover:scale-105"
          >
            Add
          </Button>
        </div>
        {addKeyError && <span className="text-[11px] text-destructive">{addKeyError}</span>}
      </div>

      {/* Active Keys */}
      {hasAnyKey && (
        <div className="grid gap-1.5">
          <Label className="text-xs font-medium text-foreground flex items-center gap-1.5">
            Active Keys
          </Label>
          <div className="flex flex-col gap-2">
            {activeGeminiKey && (
              <div className="flex items-center gap-3 px-2 md:px-4 py-1 md:py-2 border border-blue-500/10 bg-blue-500/5 rounded-sm">
                <Brain className="h-4 w-4 text-blue-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold text-blue-400">Google Gemini</p>
                    {stagedKeys.gemini ? (
                      <span className="text-[9px] bg-blue-500/10 text-blue-500 px-1.5 py-0.5 rounded-none border border-blue-500/10 uppercase font-bold tracking-wide">New</span>
                    ) : (
                      <span className="text-[9px] bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded-none border border-emerald-500/10 uppercase font-bold tracking-wide">Saved</span>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground font-mono truncate">
                    {stagedKeys.gemini ? maskKey(stagedKeys.gemini) : "••••••••••••"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveKey("gemini")}
                  className="shrink-0 text-muted-foreground hover:text-destructive transition-colors p-1 rounded-sm hover:bg-destructive/10"
                  aria-label="Remove Gemini key"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
            {activeGroqKey && (
              <div className="flex items-center gap-3 px-2 md:px-4 py-1 md:py-2 border border-orange-500/10 bg-orange-500/3 rounded-sm">
                <Zap className="h-4 w-4 text-orange-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold text-orange-400">Groq (Llama)</p>
                    {stagedKeys.groq ? (
                      <span className="text-[9px] bg-orange-500/10 text-orange-500 px-1.5 py-0.5 rounded-none border border-orange-500/10 uppercase font-bold tracking-wide">New</span>
                    ) : (
                      <span className="text-[9px] bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded-none border border-emerald-500/10 uppercase font-bold tracking-wide">Saved</span>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground font-mono truncate">
                    {stagedKeys.groq ? maskKey(stagedKeys.groq) : "••••••••••••"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveKey("groq")}
                  className="shrink-0 text-muted-foreground hover:text-destructive transition-colors p-1 rounded-md hover:bg-destructive/10"
                  aria-label="Remove Groq key"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Primary Provider */}
      <div className="grid gap-1.5">
        <Label className="text-xs font-medium text-foreground">Primary AI Model</Label>
        <div className="grid grid-cols-2 gap-2.5">
          {/* Gemini card */}
          <button
            type="button"
            disabled={!activeGeminiKey}
            onClick={() => setPrimaryProvider("gemini")}
            className={`relative flex flex-col items-start gap-2 p-3 rounded-sm border text-left transition-all duration-200 ${!activeGeminiKey
                ? "opacity-40 cursor-not-allowed border-border/30 bg-muted/5"
                : primaryProvider === "gemini"
                  ? "border-emerald-500/20 bg-emerald-500/5 shadow-sm shadow-emerald-500/10"
                  : "border-border/40 bg-muted/10 hover:border-border/60 hover:bg-muted/20"
              }`}
          >
            {primaryProvider === "gemini" && activeGeminiKey && (
              <span className="absolute top-2.5 right-2.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm">
                <Check className="h-2.5 w-2.5" />
              </span>
            )}
            <div className={`flex h-8 w-8 items-center justify-center rounded-sm ${primaryProvider === "gemini" && activeGeminiKey ? "bg-blue-500/15 text-blue-400" : "bg-muted text-muted-foreground"
              }`}>
              <Brain className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-semibold leading-tight">Google Gemini</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Flash · great quality</p>
            </div>
          </button>

          {/* Groq card */}
          <button
            type="button"
            disabled={!activeGroqKey}
            onClick={() => setPrimaryProvider("groq")}
            className={`relative flex flex-col items-start gap-2 p-3 rounded-sm border text-left transition-all duration-200 ${!activeGroqKey
                ? "opacity-40 cursor-not-allowed border-border/30 bg-muted/5"
                : primaryProvider === "groq"
                  ? "border-emerald-500/52 bg-emerald-500/5 shadow-sm shadow-emerald-500/10"
                  : "border-border/40 bg-muted/10 hover:border-border/60 hover:bg-muted/20"
              }`}
          >
            {primaryProvider === "groq" && activeGroqKey && (
              <span className="absolute top-2.5 right-2.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm">
                <Check className="h-2.5 w-2.5" />
              </span>
            )}
            <div className={`flex h-8 w-8 items-center justify-center rounded-sm ${primaryProvider === "groq" && activeGroqKey ? "bg-orange-500/15 text-orange-400" : "bg-muted text-muted-foreground"
              }`}>
              <Zap className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-semibold leading-tight">Groq (Llama)</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Ultra-fast inference</p>
            </div>
          </button>
        </div>
        <p className="text-[11px] text-muted-foreground">
          {!activeGeminiKey || !activeGroqKey
            ? "Add a key above to enable a model. The other acts as automatic fallback."
            : "The inactive provider will serve as an automatic fallback."}
        </p>
      </div>

      {saveError && <span className="text-[11px] text-destructive">{saveError}</span>}

      {/* API key links */}
      <div className="flex gap-8 text-[11px] text-muted-foreground pt-3 border-t border-border/20 mt-4">
        <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-blue-400 underline underline-offset-4 transition-colors">
          Get Gemini key
        </a>
        <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" className="text-orange-400 underline underline-offset-4 transition-colors">
          Get Groq key
        </a>
      </div>
    </div>
  );
});

UserDialogS3.displayName = "UserDialogS3";

export default UserDialogS3;
