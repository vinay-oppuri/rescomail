"use client";

import type { ReactNode } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { Label } from "@repo/ui/components/label";

export interface WorkflowHistoryOption {
  id: string;
  title: string;
  detail: string;
}

interface WorkflowPageHeaderProps {
  title: string;
  description: string;
  metadata: ReactNode;
  action?: ReactNode;
  historyLabel: string;
  historyPlaceholder: string;
  historyOptions: WorkflowHistoryOption[];
  selectedHistoryId?: string;
  onSelectHistory: (id: string) => void;
}

const WorkflowPageHeader = ({
  title,
  description,
  metadata,
  action,
  historyLabel,
  historyPlaceholder,
  historyOptions,
  selectedHistoryId,
  onSelectHistory,
}: WorkflowPageHeaderProps) => (
  <header className="grid gap-5 border-b border-border/50 pb-6 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-end lg:gap-12">
    <div className="min-w-0 max-w-3xl space-y-3">
      <div className="space-y-2">
        <h1 className="text-xl font-bold tracking-tight md:text-2xl">
          {title}
        </h1>
        <p className="text-xs leading-6 text-muted-foreground">{description}</p>
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
        {metadata}
      </div>
    </div>

    <div className="flex w-full flex-col gap-3">
      <div className="space-y-2">
        <Label className="block text-xs font-medium text-muted-foreground">
          {historyLabel}
        </Label>
        <Select
          value={selectedHistoryId ?? ""}
          onValueChange={onSelectHistory}
          disabled={historyOptions.length === 0}
        >
          <SelectTrigger className="w-full bg-card">
            <SelectValue placeholder={historyPlaceholder} />
          </SelectTrigger>
          <SelectContent>
            {historyOptions.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                <span className="flex min-w-0 items-center gap-2">
                  <span className="truncate font-medium text-foreground">
                    {option.title}
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    — {option.detail}
                  </span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {action}
    </div>
  </header>
);

export default WorkflowPageHeader;
