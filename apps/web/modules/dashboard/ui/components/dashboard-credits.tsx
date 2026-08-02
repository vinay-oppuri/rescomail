import Link from "next/link";
import { Sparkles } from "lucide-react";
import { getMonthlyUsageSummary } from "../../server/usage-limits";

interface Props {
  userId: string;
}

/**
 * Async server component. Fetches real monthly usage and renders the credit bar
 * in the sidebar. Imported as a slot by DashboardSidebar.
 */
const DashboardCredits = async ({ userId }: Props) => {
  const { atsUsed, coldEmailUsed, atsLimit, coldEmailLimit: emailLimit } =
    await getMonthlyUsageSummary(userId);

  const primaryUsed = Math.max(atsUsed, coldEmailUsed);
  const primaryLimit = primaryUsed === atsUsed ? atsLimit : emailLimit;

  const pct = Math.min(100, Math.round((primaryUsed / primaryLimit) * 100));
  const isExhausted = primaryUsed >= primaryLimit;

  return (
    <div className="relative overflow-hidden rounded-xl border border-foreground/5 bg-primary/5 p-4">
      <div className="absolute top-0 right-0 p-2 opacity-5">
        <Sparkles className="h-10 w-10 text-primary" />
      </div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] font-bold text-primary uppercase tracking-wider">
          AI Credits
        </p>
        <span
          className={`rounded-sm px-1.5 py-0.5 text-[10px] font-bold ${
            isExhausted
                ? "bg-destructive/10 text-destructive"
                : "bg-primary/10 text-primary"
          }`}
        >
          {isExhausted
              ? "Limit reached"
              : `${100 - pct}% left`}
        </span>
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-primary/10">
          <div
            className={`h-full transition-all duration-1000 ease-out ${
              isExhausted ? "bg-destructive" : "bg-primary"
            }`}
            style={{ width: `${pct}%` }}
          />
      </div>

      <div className="mt-3 space-y-2">
        <div className="flex justify-between items-center">
          <p className="text-[10px] text-muted-foreground font-medium">
            ATS: {Math.min(atsUsed, atsLimit)}/{atsLimit}
          </p>
          <p className="text-[10px] text-muted-foreground font-medium">
            Emails: {Math.min(coldEmailUsed, emailLimit)}/{emailLimit}
          </p>
        </div>

        {isExhausted && (
          <p className="text-[9px] rounded-sm text-destructive font-semibold leading-tight bg-destructive/10 p-1.5 border border-destructive/20 text-center">
            Monthly platform limit reached.
          </p>
        )}

        <div className="flex justify-end gap-2 pt-1">
          <Link
            href="/dashboard/settings"
            className="text-[10px] text-muted-foreground font-bold hover:text-foreground hover:underline underline-offset-4"
          >
            Manage API Key
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardCredits;
