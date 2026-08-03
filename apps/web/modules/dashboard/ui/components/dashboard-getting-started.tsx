import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui";
import { cn } from "@repo/ui/lib/utils";

interface DashboardGettingStartedProps {
  resumesCount: number;
  atsCount: number;
  coldEmailsCount: number;
}

interface JourneyStep {
  title: string;
  description: string;
  href: string;
  actionLabel: string;
  completed: boolean;
}

const createJourneySteps = ({
  resumesCount,
  atsCount,
  coldEmailsCount,
}: DashboardGettingStartedProps): JourneyStep[] => [
  {
    title: "Add a resume",
    description:
      "Upload a PDF once. Parsed resumes can be reused in every workflow.",
    href: "/dashboard/resumes",
    actionLabel: resumesCount > 0 ? "View resumes" : "Upload resume",
    completed: resumesCount > 0,
  },
  {
    title: "Check the role fit",
    description:
      "Compare it with a role to find missing keywords and rewrite priorities.",
    href: "/dashboard/ats",
    actionLabel: atsCount > 0 ? "View analyses" : "Run ATS analysis",
    completed: atsCount > 0,
  },
  {
    title: "Create the outreach",
    description:
      "Generate a personalized email and follow-up from the same context.",
    href: "/dashboard/emails",
    actionLabel: coldEmailsCount > 0 ? "View drafts" : "Create email draft",
    completed: coldEmailsCount > 0,
  },
];

const DashboardGettingStarted = (props: DashboardGettingStartedProps) => {
  const steps = createJourneySteps(props);
  const completedCount = steps.filter((step) => step.completed).length;
  const nextStepIndex = steps.findIndex((step) => !step.completed);

  return (
    <Card>
      <CardHeader className="space-y-2 border-b px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-base">Getting started</CardTitle>
          <Badge variant="outline" className="shrink-0 font-normal">
            {completedCount}/3 complete
          </Badge>
        </div>
        <CardDescription className="text-xs leading-5">
          A simple path from resume to outreach.
        </CardDescription>
      </CardHeader>

      <CardContent className="px-5 py-5">
        <ol>
          {steps.map((step, index) => {
            const isNext = index === nextStepIndex;

            return (
              <li
                key={step.title}
                aria-current={isNext ? "step" : undefined}
                className="relative grid grid-cols-[2rem_minmax(0,1fr)] gap-3 pb-5 last:pb-0"
              >
                {index < steps.length - 1 ? (
                  <span
                    aria-hidden="true"
                    className="absolute bottom-1 left-4 top-8 w-px bg-border"
                  />
                ) : null}

                <span
                  className={cn(
                    "relative z-10 flex h-8 w-8 items-center justify-center rounded-sm border bg-card text-xs font-semibold text-muted-foreground",
                    step.completed &&
                      "border-primary bg-primary text-primary-foreground",
                  )}
                >
                  {step.completed ? (
                    <Check className="h-4 w-4" aria-label="Completed" />
                  ) : (
                    index + 1
                  )}
                </span>

                <div className="min-w-0 pt-0.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium text-foreground">
                      {step.title}
                    </p>
                    {isNext ? (
                      <Badge variant="secondary" className="text-[10px]">
                        Next
                      </Badge>
                    ) : null}
                  </div>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    {step.description}
                  </p>
                  <Link
                    href={step.href}
                    className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-foreground underline-offset-4 hover:underline"
                  >
                    {step.actionLabel}
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
};

export default DashboardGettingStarted;
