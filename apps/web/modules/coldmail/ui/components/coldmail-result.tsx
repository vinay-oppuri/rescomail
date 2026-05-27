"use client";

import { type ReactNode, useState } from "react";
import { Check, Clipboard, Mail, MessageSquareReply, Sparkles, Send } from "lucide-react";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";

import { useColdmailStore } from "../../store/coldmail-store";

const ColdmailResult = () => {
  const { draft } = useColdmailStore();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = async (key: string, value: string) => {
    await navigator.clipboard.writeText(value);
    setCopiedKey(key);
    window.setTimeout(() => setCopiedKey(null), 1400);
  };

  if (!draft) {
    return null;
  }

  const fullEmail = `Subject: ${draft.subject}\n\n${draft.body}`;
  const followUp = `Subject: ${draft.followUpSubject}\n\n${draft.followUpBody}`;

  return (
    <div className="flex flex-col">
      <div className="flex flex-col gap-4 border-b bg-card/10 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-card/60 shadow-sm rounded-none text-xs font-medium px-2.5 py-0.5">
              <Sparkles className="mr-1.5 h-3 w-3 text-primary" />
              {draft.estimatedReadTimeSeconds}s estimated read time
            </Badge>
          </div>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            <span className="font-semibold text-foreground mr-2">Preview:</span>
            {draft.previewText}
          </p>
        </div>
        <div className="flex shrink-0 gap-3">
          <CopyButton
            copied={copiedKey === "email"}
            onClick={() => copyToClipboard("email", fullEmail)}
          >
            Copy Email
          </CopyButton>
          <CopyButton
            copied={copiedKey === "follow-up"}
            onClick={() => copyToClipboard("follow-up", followUp)}
          >
            Copy Follow-up
          </CopyButton>
        </div>
      </div>

      <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="min-w-0 p-6 flex flex-col gap-6">
  
          <div className="rounded-none border bg-card/10 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between border-b bg-foreground px-4 py-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-background uppercase tracking-widest">
                <Send className="h-4 w-4" />
                <span>Initial Outreach</span>
              </div>
              <CopyIconButton 
                copied={copiedKey === "subject"} 
                onClick={() => copyToClipboard("subject", draft.subject)} 
                label="Copy Subject" 
              />
            </div>
            <div className="px-5 py-4 border-b">
              <p className="text-xs font-semibold text-foreground">
                <span className="text-muted-foreground font-medium mr-2">Subject:</span> 
                {draft.subject}
              </p>
            </div>
            <div className="px-5 py-5 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
              {draft.body}
            </div>
          </div>

          <div className="rounded-none border bg-card/10 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between border-b bg-foreground px-4 py-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-background uppercase tracking-widest">
                <MessageSquareReply className="h-4 w-4" />
                <span>Follow-up Sequence</span>
              </div>
              <CopyIconButton 
                copied={copiedKey === "follow-up-body"} 
                onClick={() => copyToClipboard("follow-up-body", followUp)} 
                label="Copy Follow-up" 
              />
            </div>
            <div className="px-5 py-4 border-b">
              <p className="text-xs font-semibold text-foreground">
                <span className="text-muted-foreground font-medium mr-2">Subject:</span> 
                {draft.followUpSubject}
              </p>
            </div>
            <div className="px-5 py-5">
              <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                {draft.followUpBody}
              </div>
            </div>
          </div>
          
        </div>

        <aside className="border-t bg-muted/5 p-6 lg:border-l lg:border-t-0 flex flex-col gap-5">
          <div className="flex items-center gap-2 text-foreground">
            <Sparkles className="h-4 w-4 text-primary" />
            <h3 className="text-xs font-semibold uppercase tracking-widest">AI Personalization</h3>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            The model identified these key insights to tailor your outreach.
          </p>
          <div className="space-y-3">
            {draft.personalizationNotes.map((note, idx) => (
              <div key={idx} className="relative rounded-none border bg-background p-4 shadow-sm transition-all hover:shadow-md">
                <div className="absolute -left-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-none bg-primary text-[9px] font-bold text-primary-foreground shadow-sm">
                  {idx + 1}
                </div>
                <p className="text-xs leading-relaxed text-foreground/80">{note}</p>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
};

interface CopyButtonProps {
  copied: boolean;
  children: ReactNode;
  onClick: () => void;
}

const CopyButton = ({ copied, children, onClick }: CopyButtonProps) => (
  <Button 
    type="button" 
    size="sm"
    onClick={onClick}
    className="h-8 rounded-none"
  >
    {copied ? <Check className="mr-1.5 h-3.5 w-3.5 text-green-500" /> : <Clipboard className="mr-1.5 h-3.5 w-3.5 text-muted-background" />}
    {copied ? "Copied" : children}
  </Button>
);

interface CopyIconButtonProps {
  copied: boolean;
  onClick: () => void;
  label: string;
}

const CopyIconButton = ({ copied, onClick, label }: CopyIconButtonProps) => (
  <Button 
    type="button" 
    size="sm"
    variant="ghost"
    onClick={onClick}
    className="h-7 px-2 text-background! hover:bg-background/10!"
    title={label}
  >
    {copied ? <Check className="mr-1.5 h-3 w-3 text-green-500" /> : <Clipboard className="mr-1.5 h-3 w-3" />}
    {copied ? "Copied" : label}
  </Button>
);

export default ColdmailResult;
