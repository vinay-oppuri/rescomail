import Link from "next/link";
import { Sparkles } from "lucide-react";
import {
  getMonthlyUsageSummary,
  FREE_PLAN_LIMITS,
} from "../../server/usage-limits";
import { db, userPreferences } from "@repo/db";
import { eq } from "drizzle-orm";

import { hasUsableSecret } from "@/lib/server/secrets";

interface Props {
  userId: string;
}

/**
 * Async server component. Fetches real monthly usage and renders the credit bar
 * in the sidebar. Imported as a slot by DashboardSidebar.
 */
const DashboardCredits = async ({ userId }: Props) => {
  const { atsUsed, coldEmailUsed } = await getMonthlyUsageSummary(userId);

  const atsLimit = FREE_PLAN_LIMITS.ats_analysis;
  const emailLimit = FREE_PLAN_LIMITS.cold_email_generate;

  const primaryUsed = Math.max(atsUsed, coldEmailUsed);
  const primaryLimit = primaryUsed === atsUsed ? atsLimit : emailLimit;

  const prefs = await db.query.userPreferences.findFirst({
    where: eq(userPreferences.userId, userId),
  });
  const hasApiKey = hasUsableSecret(prefs?.geminiApiKey);

  const pct = hasApiKey
    ? 0
    : Math.min(100, Math.round((primaryUsed / primaryLimit) * 100));
  const isExhausted = hasApiKey ? false : primaryUsed >= primaryLimit;

  const displayAtsUsed = hasApiKey ? "Unlimited" : Math.min(atsUsed, atsLimit);
  const displayEmailUsed = hasApiKey
    ? "Unlimited"
    : Math.min(coldEmailUsed, emailLimit);

  return (
    <div className="relative mb-4 overflow-hidden rounded-sm border border-primary/10 bg-primary/5 p-4">
      <div className="absolute top-0 right-0 p-2 opacity-5">
        <Sparkles className="h-10 w-10 text-primary" />
      </div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] font-bold text-primary uppercase tracking-wider">
          AI Credits
        </p>
        <span
          className={`rounded-sm px-1.5 py-0.5 text-[10px] font-bold ${
            hasApiKey
              ? "bg-green-500/10 text-green-600 dark:text-green-400"
              : isExhausted
                ? "bg-destructive/10 text-destructive"
                : "bg-primary/10 text-primary"
          }`}
        >
          {hasApiKey
            ? "Unlimited"
            : isExhausted
              ? "Limit reached"
              : `${100 - pct}% left`}
        </span>
      </div>

      {!hasApiKey && (
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-primary/10">
          <div
            className={`h-full transition-all duration-1000 ease-out ${
              isExhausted ? "bg-destructive" : "bg-primary"
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}

      <div className="mt-3 space-y-2">
        <div className="flex justify-between items-center">
          <p className="text-[10px] text-muted-foreground font-medium">
            ATS: {displayAtsUsed}
            {!hasApiKey && `/${atsLimit}`}
          </p>
          <p className="text-[10px] text-muted-foreground font-medium">
            Emails: {displayEmailUsed}
            {!hasApiKey && `/${emailLimit}`}
          </p>
        </div>

        {isExhausted && !hasApiKey && (
          <p className="text-[9px] rounded-sm text-destructive font-semibold leading-tight bg-destructive/10 p-1.5 border border-destructive/20 text-center">
            Limit reached. Please add your personal API key for more.
          </p>
        )}

        <div className="flex justify-end gap-2 pt-1">
          {!hasApiKey && (
            <Link
              href="/dashboard/settings"
              className="text-[10px] text-muted-foreground font-bold hover:text-foreground hover:underline underline-offset-4"
            >
              Add API Key
            </Link>
          )}
          <Link
            href="/dashboard/billing"
            className="text-[10px] text-primary font-bold hover:underline underline-offset-4"
          >
            Upgrade
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardCredits;
