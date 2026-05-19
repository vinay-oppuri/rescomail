import type { AtsAnalysisResponse } from "@repo/validations";
import { Badge } from "@repo/ui/components/badge";

interface AtsSuggestionsPanelProps {
  suggestions: AtsAnalysisResponse["suggestions"];
}

const AtsSuggestionsPanel = ({ suggestions }: AtsSuggestionsPanelProps) => (
  <div className="border-t p-5">
    <h3 className="text-sm font-semibold">Suggestions</h3>
    <div className="mt-4 divide-y border">
      {suggestions.map((suggestion) => (
        <div key={suggestion.title} className="p-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant={suggestion.priority === "high" ? "destructive" : "outline"}
            >
              {suggestion.priority}
            </Badge>
            <p className="text-sm font-medium">{suggestion.title}</p>
          </div>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {suggestion.detail}
          </p>
          {suggestion.example ? (
            <p className="mt-2 border-l-2 border-primary/40 pl-3 text-sm leading-6">
              {suggestion.example}
            </p>
          ) : null}
        </div>
      ))}
    </div>
  </div>
);

export default AtsSuggestionsPanel;
