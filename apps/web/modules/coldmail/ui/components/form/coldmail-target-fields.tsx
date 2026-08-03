"use client";

import type { ColdEmailCallToAction } from "@repo/validations";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";

import { useColdmailStore } from "../../../store/coldmail-store";
import { callToActionOptions } from "./coldmail-options";

const OptionalLabel = ({ children }: { children: string }) => (
  <>
    {children} <span className="text-muted-foreground">(optional)</span>
  </>
);

const ColdmailTargetFields = () => {
  const {
    jobTitle,
    companyName,
    companyWebsiteUrl,
    recipientName,
    recipientRole,
    callToAction,
    setJobTitle,
    setCompanyName,
    setCompanyWebsiteUrl,
    setRecipientName,
    setRecipientRole,
    setCallToAction,
  } = useColdmailStore();

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div className="space-y-2">
        <Label htmlFor="job-title">
          <OptionalLabel>Role title</OptionalLabel>
        </Label>
        <Input
          id="job-title"
          value={jobTitle}
          onChange={(event) => setJobTitle(event.target.value)}
          placeholder="e.g. Product Engineer"
          className="rounded-sm border-foreground/5! bg-muted/20!"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="company-name">
          <OptionalLabel>Company name</OptionalLabel>
        </Label>
        <Input
          id="company-name"
          value={companyName}
          onChange={(event) => setCompanyName(event.target.value)}
          placeholder="e.g. Acme Corp"
          className="rounded-sm border-foreground/5! bg-muted/20!"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="company-website">
          Company website{" "}
          <span className="text-muted-foreground">(required)</span>
        </Label>
        <Input
          id="company-website"
          type="url"
          value={companyWebsiteUrl}
          onChange={(event) => setCompanyWebsiteUrl(event.target.value)}
          placeholder="https://acme.com"
          inputMode="url"
          className="rounded-sm border-foreground/5! bg-muted/20!"
          aria-describedby="company-website-help"
        />
        <p id="company-website-help" className="text-xs text-muted-foreground">
          Used to research the company and personalize the opening.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="recipient-name">
          <OptionalLabel>Recipient name</OptionalLabel>
        </Label>
        <Input
          id="recipient-name"
          value={recipientName}
          onChange={(event) => setRecipientName(event.target.value)}
          placeholder="e.g. Alex Morgan"
          className="rounded-sm border-foreground/5! bg-muted/20!"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="recipient-role">
          <OptionalLabel>Recipient role</OptionalLabel>
        </Label>
        <Input
          id="recipient-role"
          value={recipientRole}
          onChange={(event) => setRecipientRole(event.target.value)}
          placeholder="e.g. Recruiting Lead"
          className="rounded-sm border-foreground/5! bg-muted/20!"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="cta">Call to action</Label>
        <Select
          value={callToAction}
          onValueChange={(value) =>
            setCallToAction(value as ColdEmailCallToAction)
          }
        >
          <SelectTrigger
            id="cta"
            className="w-full rounded-sm border-foreground/5! bg-muted/20!"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {callToActionOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default ColdmailTargetFields;
