import { Badge } from "@repo/ui/components/badge";
import { AlertCircle } from "lucide-react";
import { cn } from "@repo/ui/lib/utils";

interface AtsKeywordPanelProps {
  title: string;
  keywords: string[];
  muted?: boolean;
}

const AtsKeywordPanel = ({
  title,
  keywords,
  muted = false,
}: AtsKeywordPanelProps) => (
  <div className="p-5 md:p-6 bg-linear-to-br from-background to-rose-500/2">
    <div className="flex items-center gap-2 mb-4">
      <div className={cn(
        "flex h-7 w-7 items-center justify-center rounded-sm",
        muted ? "bg-muted text-muted-foreground" : "bg-rose-500/10 text-rose-500"
      )}>
        <AlertCircle className="h-4 w-4" />
      </div>
      <h3 className="text-xs md:text-sm font-semibold tracking-tight text-foreground truncate">{title}</h3>
    </div>
    <div className="flex flex-wrap gap-2">
      {keywords.length === 0 ? (
        <p className="text-xs text-muted-foreground">None detected</p>
      ) : (
        keywords.map((keyword) => (
          <Badge
            key={keyword}
            variant="outline"
            className={cn(
              "px-2.5 py-0.5 text-xs font-medium rounded-none border shadow-xs transition-all hover:scale-105",
              muted
                ? "text-muted-foreground border-muted-foreground/15 bg-muted/20"
                : "text-rose-600 dark:text-rose-400 border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10"
            )}
          >
            {keyword}
          </Badge>
        ))
      )}
    </div>
  </div>
);

export default AtsKeywordPanel;
