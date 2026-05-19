import { cn } from "@repo/ui/lib/utils";
import type { LucideIcon } from "lucide-react";

interface AtsListSectionProps {
  icon: LucideIcon;
  title: string;
  items: string[];
  tone?: "default" | "warning";
}

const AtsListSection = ({
  icon: Icon,
  title,
  items,
  tone = "default",
}: AtsListSectionProps) => (
  <div className="border-b p-5 lg:border-r lg:[&:nth-child(2)]:border-r-0">
    <div className="flex items-center gap-2">
      <Icon
        className={cn(
          "h-4 w-4",
          tone === "warning" ? "text-amber-600" : "text-emerald-600",
        )}
      />
      <h3 className="text-sm font-semibold">{title}</h3>
    </div>
    <div className="mt-4 space-y-3">
      {items.map((item) => (
        <p key={item} className="text-sm leading-6 text-muted-foreground">
          {item}
        </p>
      ))}
    </div>
  </div>
);

export default AtsListSection;
