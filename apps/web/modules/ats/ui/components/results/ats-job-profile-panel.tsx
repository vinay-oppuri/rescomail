import type { AtsAnalysisResponse } from "@repo/validations";
import { Badge } from "@repo/ui/components/badge";

interface AtsJobProfilePanelProps {
  jobProfile: AtsAnalysisResponse["jobProfile"];
}

const AtsJobProfilePanel = ({ jobProfile }: AtsJobProfilePanelProps) => (
  <div className="border-b p-5 xl:border-r">
    <h3 className="text-sm font-semibold">Job profile</h3>
    <div className="mt-4 space-y-4 text-sm">
      <div>
        <p className="text-xs font-medium text-muted-foreground">Seniority</p>
        <p className="mt-1 font-medium capitalize">{jobProfile.seniority}</p>
      </div>
      <div>
        <p className="text-xs font-medium text-muted-foreground">
          Required experience
        </p>
        <p className="mt-1 font-medium">
          {jobProfile.yearsRequired
            ? `${jobProfile.yearsRequired}+ years`
            : "Not stated"}
        </p>
      </div>
      <div>
        <p className="text-xs font-medium text-muted-foreground">
          Must-have terms
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {jobProfile.requiredKeywords.slice(0, 10).map((term) => (
            <Badge key={term} variant="outline">
              {term}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default AtsJobProfilePanel;
