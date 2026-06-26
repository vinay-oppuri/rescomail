import { Button } from "@repo/ui/components/button";
import { Separator } from "@repo/ui/components/separator";
import { cn } from "@repo/ui/lib/utils";
import { User, Mail, Phone, MapPin, Globe, Github, Linkedin, Link2, Brain, Zap, Pencil } from "lucide-react";

interface ResumeProfileSectionProps {
  profile?: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    portfolioUrl: string;
    githubUrl: string;
    linkedinUrl: string;
    extraLinks: { label: string; url: string }[];
  } | null;
  geminiApiKey?: string | null;
  groqApiKey?: string | null;
  openDialogAtStep: (step: number) => void;
}

export function ResumeProfileSection({ profile, geminiApiKey, groqApiKey, openDialogAtStep }: ResumeProfileSectionProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-medium text-foreground">
            Resume Profile Details
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            These contact details are used to pre-fill generated resumes.
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => openDialogAtStep(1)}
          className="h-7 text-xs gap-1.5 px-2.5 shadow-sm"
        >
          <Pencil className="h-3 w-3 text-muted-foreground!" />
          Edit Details
        </Button>
      </div>

      {profile ? (
        <div className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider pl-1">Full Name</span>
              <div className="flex items-center gap-2.5 text-sm text-foreground bg-muted/20 border border-foreground/5 px-3 py-2 rounded-sm transition-colors hover:bg-muted/30">
                <User className="h-4 w-4 text-primary/70 shrink-0" />
                <span className="text-xs md:text-sm truncate font-medium">{profile.fullName || "—"}</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider pl-1">Email Address</span>
              <div className="flex items-center gap-2.5 text-sm text-foreground bg-muted/20 border border-foreground/5 px-3 py-2 rounded-sm transition-colors hover:bg-muted/30">
                <Mail className="h-4 w-4 text-primary/70 shrink-0" />
                <span className="text-xs md:text-sm truncate font-medium">{profile.email || "—"}</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider pl-1">Phone Number</span>
              <div className="flex items-center gap-2.5 text-sm text-foreground bg-muted/20 border border-foreground/5 px-3 py-2 rounded-sm transition-colors hover:bg-muted/30">
                <Phone className="h-4 w-4 text-primary/70 shrink-0" />
                <span className="text-xs md:text-sm truncate font-medium">{profile.phone || "—"}</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider pl-1">Location</span>
              <div className="flex items-center gap-2.5 text-sm text-foreground bg-muted/20 border border-foreground/5 px-3 py-2 rounded-sm transition-colors hover:bg-muted/30">
                <MapPin className="h-4 w-4 text-primary/70 shrink-0" />
                <span className="text-xs md:text-sm truncate font-medium">{profile.location || "—"}</span>
              </div>
            </div>
          </div>

          <Separator className="bg-foreground/5" />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-foreground">Links & Social Profiles</h4>
                <p className="text-[11px] text-muted-foreground mt-0.5">Your online presence for employers.</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => openDialogAtStep(2)}
                className="h-7 text-xs font-medium gap-1.5 px-2 shadow-sm"
              >
                <Pencil className="h-3 w-3 text-muted-foreground" />
                Edit Links
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 mt-2">
              {profile.portfolioUrl && (
                <a
                  href={profile.portfolioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-primary bg-muted/40 hover:bg-muted/60 px-3 py-1.5 rounded-sm border border-foreground/5 transition-all font-medium shadow-sm hover:shadow"
                >
                  <Globe className="h-3.5 w-3.5" />
                  Portfolio
                </a>
              )}
              {profile.githubUrl && (
                <a
                  href={profile.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-foreground bg-green-500/20 hover:bg-green-500/30 px-3 py-1.5 rounded-sm border border-green-500/5 transition-all font-medium shadow-sm hover:shadow"
                >
                  <Github className="h-3.5 w-3.5" />
                  GitHub
                </a>
              )}
              {profile.linkedinUrl && (
                <a
                  href={profile.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 bg-blue-500/10 hover:bg-blue-500/15 px-3 py-1.5 rounded-sm border border-blue-500/20 transition-all font-medium shadow-sm hover:shadow"
                >
                  <Linkedin className="h-3.5 w-3.5" />
                  LinkedIn
                </a>
              )}
              {profile.extraLinks && profile.extraLinks.map((link, idx) => (
                <a
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground bg-muted/30 hover:bg-muted/50 px-3 py-1.5 rounded-sm border border-foreground/5 transition-all font-medium shadow-sm hover:shadow"
                >
                  <Link2 className="h-3.5 w-3.5" />
                  {link.label}
                </a>
              ))}
              {!profile.portfolioUrl && !profile.githubUrl && !profile.linkedinUrl && (!profile.extraLinks || profile.extraLinks.length === 0) && (
                <span className="text-xs text-muted-foreground italic px-1">No links added yet.</span>
              )}
            </div>
          </div>

          <Separator className="bg-foreground/5" />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-foreground">AI Engine Setup</h4>
                <p className="text-[11px] text-muted-foreground mt-0.5">Configure your preferred LLM providers.</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => openDialogAtStep(3)}
                className="h-7 text-xs font-medium gap-1.5 px-2 shadow-sm"
              >
                <Pencil className="h-3 w-3 text-muted-foreground" />
                Edit API Keys
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 mt-2">
              <div className="flex items-center justify-between px-2 py-2 md:px-4 bg-muted/10 border border-foreground/5 rounded-sm hover:bg-muted/20 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-blue-500/10 rounded-sm">
                    <Brain className="h-4 w-4 text-blue-500 shrink-0" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs md:text-sm font-medium">Google Gemini</span>
                  </div>
                </div>
                <span
                  className={cn(
                    "text-[9px] px-2 py-0.5 rounded-none border font-semibold tracking-wide uppercase",
                    geminiApiKey
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                      : "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
                  )}
                >
                  {geminiApiKey ? "Active Key" : "No Key"}
                </span>
              </div>

              <div className="flex items-center justify-between px-2 py-2 md:px-4 bg-muted/10 border border-foreground/5 rounded-sm hover:bg-muted/20 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-orange-500/10 rounded-sm">
                    <Zap className="h-4 w-4 text-orange-500 shrink-0" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs md:text-sm font-medium">Groq (Llama)</span>
                  </div>
                </div>
                <span
                  className={cn(
                    "text-[9px] px-2 py-0.5 rounded-none border font-semibold tracking-wide uppercase",
                    groqApiKey
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                      : "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
                  )}
                >
                  {groqApiKey ? "Active Key" : "No Key"}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-center border border-dashed border-foreground/15 rounded-lg bg-muted/5">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
            <User className="h-5 w-5 text-primary" />
          </div>
          <h4 className="text-sm font-medium text-foreground">No Resume Profile</h4>
          <p className="text-xs text-muted-foreground mt-1 mb-4 max-w-sm">
            Set up your resume profile to automatically pre-fill your generated resumes.
          </p>
          <Button
            size="sm"
            onClick={() => openDialogAtStep(1)}
            className="text-xs font-semibold shadow-sm"
          >
            Set up profile
          </Button>
        </div>
      )}
    </div>
  );
}
