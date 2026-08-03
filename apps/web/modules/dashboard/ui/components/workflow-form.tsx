import type { ComponentType, ReactNode } from "react";
import { cn } from "@repo/ui/lib/utils";

interface WorkflowSectionProps {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
  step: number;
  separated?: boolean;
  children: ReactNode;
}

export const WorkflowSection = ({
  icon: Icon,
  title,
  description,
  step,
  separated = false,
  children,
}: WorkflowSectionProps) => (
  <section
    className={cn(
      "space-y-4",
      separated && "border-t border-foreground/5 pt-5",
    )}
  >
    <div className="flex items-start gap-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border border-foreground/5 bg-muted/20">
        <Icon className="h-4 w-4 text-primary" />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
          Step {step}
        </p>
        <h3 className="text-xs sm:text-sm font-semibold text-foreground">{title}</h3>
        <p className="mt-1 text-[10px] sm:text-xs leading-5 text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
    {children}
  </section>
);
