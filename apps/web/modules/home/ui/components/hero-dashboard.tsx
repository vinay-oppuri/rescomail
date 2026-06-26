import { Iphone } from "@repo/ui/components/iphone";

const suggestions = [
  "Add a measurable outcome to your project work.",
  "Mention the tools named in the role description.",
  "Lead with your most relevant experience.",
];

export function HeroDashboard() {
  return (
    <section
      aria-labelledby="workspace-preview-title"
      className="relative z-20 w-full px-4 pb-32"
    >
      <div className="mx-auto grid max-w-5xl items-center gap-10 md:grid-cols-[1fr_auto_1fr] md:gap-12">
        <div className="space-y-4 text-center md:text-right">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground not-md:text-left px-2 md:px-0">
            Clear, practical guidance
          </p>
          <h2
            id="workspace-preview-title"
            className="text-lg md:text-2xl font-bold tracking-tight text-foreground not-md:text-left px-2 md:px-0"
          >
            Improve your application before you send it.
          </h2>
          <p className="px-2 md:px-0 ml-auto max-w-sm text-xs md:text-sm leading-relaxed text-muted-foreground not-md:text-left">
            See how your resume reads to an ATS, make focused improvements, and prepare a tailored cold email from the same place.
          </p>
        </div>

        <div className="flex justify-center">
          <Iphone size="md" className="shadow-md">
            <div className="h-full w-full bg-muted/30 px-4 pb-4 pt-12 font-sans text-foreground">
              <div className="border-b border-foreground/5 pb-2">
                <p className="text-[10px] text-muted-foreground">Resume analysis</p>
                <p className="mt-0.5 text-xs md:text-base font-semibold">Product Designer</p>
              </div>

              <div className="mt-4 rounded-lg border border-foreground/5 p-3">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[10px] text-muted-foreground">ATS match</p>
                    <p className="mt-0.5 text-2xl font-semibold tracking-tight">82%</p>
                  </div>
                  <p className="text-[10px] text-muted-foreground">Good foundation</p>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div className="h-full w-[82%] rounded-full bg-foreground" />
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold">Suggested improvements</p>
                  <p className="text-[10px] text-muted-foreground">3 items</p>
                </div>
                <div className="mt-2 divide-y divide-border rounded-sm border border-foreground/5">
                  {suggestions.map((suggestion, index) => (
                    <div key={suggestion} className="flex gap-2 p-2">
                      <span className="text-[10px] text-muted-foreground">0{index + 1}</span>
                      <p className="text-[10px] leading-relaxed text-foreground/80">{suggestion}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 rounded-lg border border-foreground/5 p-3">
                <p className="text-[10px] font-medium text-muted-foreground">Cold email draft</p>
                <p className="mt-2 text-[10px] leading-relaxed text-foreground/80">
                  Hi Maya, I noticed your team is refining the onboarding experience. My work on activation flows could be a useful fit.
                </p>
                <p className="mt-2 text-[10px] font-medium text-foreground">Review draft</p>
              </div>
            </div>
          </Iphone>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-1">
          <FeatureDetail
            title="ATS analysis"
            description="Find the missing skills and language that matter for a specific role."
          />
          <FeatureDetail
            title="Enhancement suggestions"
            description="Turn vague experience into clearer, more credible resume bullets."
          />
          <FeatureDetail
            title="Cold email generation"
            description="Draft concise outreach grounded in your experience and the company context."
          />
        </div>
      </div>
    </section>
  );
}

function FeatureDetail({ title, description }: { title: string; description: string }) {
  return (
    <div className="border-l-2 border-border py-1 pl-3 text-left">
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{description}</p>
    </div>
  );
}
