import { Badge } from "@repo/ui/components/badge";

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
  <div className="p-5">
    <h3 className="text-sm font-semibold">{title}</h3>
    <div className="mt-4 flex flex-wrap gap-2">
      {keywords.length === 0 ? (
        <p className="text-sm text-muted-foreground">None detected</p>
      ) : (
        keywords.map((keyword) => (
          <Badge key={keyword} variant={muted ? "outline" : "default"}>
            {keyword}
          </Badge>
        ))
      )}
    </div>
  </div>
);

export default AtsKeywordPanel;
