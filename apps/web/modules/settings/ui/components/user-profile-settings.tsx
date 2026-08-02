"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { Loader2, User, Mail, Phone, MapPin, Globe, Github, Linkedin } from "lucide-react";

interface UserProfileSettingsProps {
  profile?: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    portfolioUrl: string;
    githubUrl: string;
    linkedinUrl: string;
    extraLinks: { label: string; url: string }[];
  };
}

export function UserProfileSettings({ profile }: UserProfileSettingsProps) {
  const router = useRouter();
  const [fullName, setFullName] = useState(profile?.fullName || "");
  const [email, setEmail] = useState(profile?.email || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [location, setLocation] = useState(profile?.location || "");
  const [portfolioUrl, setPortfolioUrl] = useState(profile?.portfolioUrl || "");
  const [githubUrl, setGithubUrl] = useState(profile?.githubUrl || "");
  const [linkedinUrl, setLinkedinUrl] = useState(profile?.linkedinUrl || "");

  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateUrls = () => {
    const urls = [
      { name: "Portfolio", val: portfolioUrl },
      { name: "GitHub", val: githubUrl },
      { name: "LinkedIn", val: linkedinUrl }
    ];

    for (const url of urls) {
      if (url.val && !url.val.startsWith("https://")) {
        return `${url.name} URL must start with https://`;
      }
      if (url.val) {
        try {
          new URL(url.val);
        } catch {
          return `Invalid URL format for ${url.name}`;
        }
      }
    }
    return null;
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setError(null);

    const urlError = validateUrls();
    if (urlError) {
      setError(urlError);
      setIsSaving(false);
      return;
    }

    if (!fullName.trim()) {
      setError("Full Name is required.");
      setIsSaving(false);
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      setError("A valid Email Address is required.");
      setIsSaving(false);
      return;
    }

    try {
      const response = await fetch("/api/user-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          full_name: fullName.trim(),
          email: email.trim(),
          phone: phone.trim() || null,
          location: location.trim() || null,
          portfolio_url: portfolioUrl.trim() || null,
          github_url: githubUrl.trim() || null,
          linkedin_url: linkedinUrl.trim() || null,
          extra_links: profile?.extraLinks || [],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile details");
      }

      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="flex flex-col border border-foreground/5 bg-card/20 shadow-sm overflow-hidden rounded-sm w-full">
      <div className="flex items-start justify-between gap-3 border-b border-foreground/5 bg-muted/10 px-3 md:px-5 py-3 md:py-4">
        <div>
          <h2 className="text-sm font-semibold tracking-tight text-foreground">
            Contact & Online Profiles
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Configure your personal contact info and links to pre-fill generated resumes.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-5 p-3 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="settings-fullname" className="text-xs font-semibold text-foreground/80 flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-muted-foreground" /> Full Name
            </Label>
            <Input
              id="settings-fullname"
              placeholder="John Doe"
              className="h-9 bg-muted/20! border-foreground/5! rounded-sm text-xs"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="settings-email" className="text-xs font-semibold text-foreground/80 flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-muted-foreground" /> Email Address
            </Label>
            <Input
              id="settings-email"
              type="email"
              placeholder="john@example.com"
              className="h-9 bg-muted/20! border-foreground/5! rounded-sm text-xs"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="settings-phone" className="text-xs font-semibold text-foreground/80 flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-muted-foreground" /> Phone Number (Optional)
            </Label>
            <Input
              id="settings-phone"
              placeholder="+1 (555) 000-0000"
              className="h-9 bg-muted/20! border-foreground/5! rounded-sm text-xs"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="settings-location" className="text-xs font-semibold text-foreground/80 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-muted-foreground" /> Location (Optional)
            </Label>
            <Input
              id="settings-location"
              placeholder="San Francisco, CA"
              className="h-9 bg-muted/20! border-foreground/5! rounded-sm text-xs"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          {/* Portfolio */}
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="settings-portfolio" className="text-xs font-semibold text-foreground/80 flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-muted-foreground" /> Portfolio / Website URL
            </Label>
            <Input
              id="settings-portfolio"
              placeholder="https://johndoe.dev"
              className="h-9 bg-muted/20! border-foreground/5! rounded-sm text-xs"
              value={portfolioUrl}
              onChange={(e) => setPortfolioUrl(e.target.value)}
            />
          </div>

          {/* GitHub */}
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="settings-github" className="text-xs font-semibold text-foreground/80 flex items-center gap-1.5">
              <Github className="h-3.5 w-3.5 text-muted-foreground" /> GitHub Profile URL
            </Label>
            <Input
              id="settings-github"
              placeholder="https://github.com/johndoe"
              className="h-9 bg-muted/20! border-foreground/5! rounded-sm text-xs"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
            />
          </div>

          {/* LinkedIn */}
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="settings-linkedin" className="text-xs font-semibold text-foreground/80 flex items-center gap-1.5">
              <Linkedin className="h-3.5 w-3.5 text-muted-foreground" /> LinkedIn Profile URL
            </Label>
            <Input
              id="settings-linkedin"
              placeholder="https://linkedin.com/in/johndoe"
              className="h-9 bg-muted/20! border-foreground/5! rounded-sm text-xs"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
            />
          </div>
        </div>

        {error && <p className="text-xs text-red-500 font-medium">{error}</p>}

        <div className="flex justify-end pt-1">
          <Button
            size="sm"
            className="h-8"
            onClick={handleSaveProfile}
            disabled={isSaving}
          >
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {saved ? "Saved!" : "Save Profile Details"}
          </Button>
        </div>
      </div>
    </section>
  );
}
