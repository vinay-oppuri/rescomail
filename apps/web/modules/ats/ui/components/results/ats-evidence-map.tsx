import type { AtsAnalysisResponse } from "@repo/validations";
import { Badge } from "@repo/ui/components/badge";

interface AtsEvidenceMapProps {
  evidence: AtsAnalysisResponse["evidence"];
}

const AtsEvidenceMap = ({ evidence }: AtsEvidenceMapProps) => (
  <div className="border-b p-5">
    <h3 className="text-sm font-semibold">Evidence map</h3>
    <div className="mt-4 divide-y border">
      {evidence.slice(0, 10).map((item) => (
        <div
          key={item.keyword}
          className="grid gap-3 p-3 md:grid-cols-[160px_110px_1fr]"
        >
          <p className="text-sm font-medium">{item.keyword}</p>
          <Badge
            variant={item.status === "missing" ? "destructive" : "outline"}
            className="w-fit capitalize"
          >
            {item.status}
          </Badge>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p>
              {item.sourceSection} / {item.strength}/100
            </p>
            {item.snippets[0] ? (
              <p className="line-clamp-2 text-foreground">{item.snippets[0]}</p>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default AtsEvidenceMap;
