import Link from "next/link";
import { Sparkles } from "lucide-react";
import { getMonthlyUsageSummary, FREE_PLAN_LIMITS } from "../../server/usage-limits";

interface Props {
  userId: string;
}

/**
 * Async server component — fetches real monthly usage and renders the
 * credit bar in the sidebar. Imported as a slot by DashboardSidebar.
 */
const DashboardCredits = async ({ userId }: Props) => {
  const { atsUsed, coldEmailUsed } = await getMonthlyUsageSummary(userId);

  const atsLimit = FREE_PLAN_LIMITS.ats_analysis;
  const emailLimit = FREE_PLAN_LIMITS.cold_email_generate;

  // Show the "tighter" credit as the primary bar.
  const primaryUsed = Math.max(atsUsed, coldEmailUsed);
  const primaryLimit = primaryUsed === atsUsed ? atsLimit : emailLimit;
  const primaryLabel = primaryUsed === atsUsed ? "ATS" : "Emails";

  const pct = Math.min(100, Math.round((primaryUsed / primaryLimit) * 100));
  const isExhausted = primaryUsed >= primaryLimit;

  return (
    <div className="relative mb-4 overflow-hidden rounded-none border border-primary/10 bg-primary/5 p-4">
      <div className="absolute top-0 right-0 p-2 opacity-5">
        <Sparkles className="h-10 w-10 text-primary" />
      </div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] font-bold text-primary uppercase tracking-wider">
          AI Credits
        </p>
        <span
          className={`rounded-none px-1.5 py-0.5 text-[10px] font-bold ${
            isExhausted
              ? "bg-destructive/10 text-destructive"
              : "bg-primary/10 text-primary"
          }`}
        >
          {isExhausted ? "Limit reached" : `${100 - pct}% left`}
        </span>
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-none bg-primary/10">
        <div
          className={`h-full rounded-none transition-all duration-1000 ease-out ${
            isExhausted ? "bg-destructive" : "bg-primary"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="mt-3 space-y-1">
        <div className="flex justify-between items-center">
          <p className="text-[10px] text-muted-foreground font-medium">
            ATS: {atsUsed}/{atsLimit}
          </p>
          <p className="text-[10px] text-muted-foreground font-medium">
            Emails: {coldEmailUsed}/{emailLimit}
          </p>
        </div>
        <div className="flex justify-end">
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
