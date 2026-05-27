"use client";

import { updateUser } from "@repo/auth/client";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
} from "@repo/ui";
import {
  Briefcase,
  Calendar,
  Camera,
  Check,
  Loader2,
  Mail,
  MapPin,
  Shield,
  User,
} from "lucide-react";
import { useState } from "react";

interface SettingsClientProps {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
    createdAt: Date;
    emailVerified: boolean;
  };
}

const seniorityOptions = [
  { value: "intern", label: "Intern" },
  { value: "new_grad", label: "New Grad" },
  { value: "junior", label: "Junior" },
  { value: "mid", label: "Mid-Level" },
  { value: "senior", label: "Senior" },
  { value: "lead", label: "Lead / Staff" },
];

const workModeOptions = [
  { value: "remote", label: "Remote" },
  { value: "hybrid", label: "Hybrid" },
  { value: "onsite", label: "Onsite" },
];

const employmentTypeOptions = [
  { value: "internship", label: "Internship" },
  { value: "full_time", label: "Full-Time" },
  { value: "part_time", label: "Part-Time" },
  { value: "contract", label: "Contract" },
  { value: "freelance", label: "Freelance" },
];

export default function SettingsClient({ user }: SettingsClientProps) {
  const [name, setName] = useState(user.name || "");
  const [seniority, setSeniority] = useState("");
  const [workMode, setWorkMode] = useState("");
  const [employmentType, setEmploymentType] = useState("");
  const [location, setLocation] = useState("");

  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [isSavingPrefs, setIsSavingPrefs] = useState(false);
  const [prefsSaved, setPrefsSaved] = useState(false);

  const initials =
    user.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";

  const memberSince = new Date(user.createdAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    try {
      await updateUser({ name });
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2500);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSavePrefs = async () => {
    setIsSavingPrefs(true);
    // Simulate save — wire to tRPC/server action in the future
    await new Promise((r) => setTimeout(r, 800));
    setPrefsSaved(true);
    setTimeout(() => setPrefsSaved(false), 2500);
    setIsSavingPrefs(false);
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
      {/* Page Header */}
      <div className="space-y-1">
        <h1 className="text-xl font-bold tracking-tight">Settings</h1>
        <p className="text-xs text-muted-foreground">
          Manage your profile and workspace preferences.
        </p>
      </div>

      {/* ── Account Profile ────────────────────────────────────── */}
      <section className="rounded-none border border-foreground/5 bg-card/20">
        <div className="border-b border-foreground/10 px-5 py-3.5">
          <h2 className="text-sm font-semibold">Account Profile</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Your personal information and account details.
          </p>
        </div>

        <div className="p-5 space-y-6">
          {/* Avatar row */}
          <div className="flex items-center gap-5">
            <div className="relative shrink-0">
              <Avatar className="h-20 w-20 border-2 border-foreground/5 bg-muted">
                <AvatarImage src={user.image ?? undefined} alt={user.name} />
                <AvatarFallback className="text-xl font-semibold text-muted-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <button
                className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border border-foreground/5 bg-background shadow-sm hover:bg-muted transition-colors"
                title="Change avatar"
              >
                <Camera className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </div>

            <div className="space-y-1.5 min-w-0">
              <p className="text-sm font-semibold truncate">
                {user.name || "Unknown User"}
              </p>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Mail className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{user.email}</span>
              </div>
              <div className="flex items-center gap-2">
                {user.emailVerified && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">
                    <Shield className="mr-1 h-2.5 w-2.5 text-green-500" />
                    Verified
                  </Badge>
                )}
                <Badge variant="outline" className="text-[10px] px-1.5 py-0.5">
                  <Calendar className="mr-1 h-2.5 w-2.5" />
                  {memberSince}
                </Badge>
              </div>
            </div>
          </div>

          <Separator className="bg-foreground/5" />

          {/* Editable fields */}
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="full-name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="full-name"
                  className="h-9 pl-8 border border-foreground/10"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email-display">Email Address</Label>
              <div className="flex h-9 items-center gap-2.5 border border-foreground/5 bg-muted/40 px-2.5 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 shrink-0" />
                <span className="truncate">{user.email}</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Email cannot be changed.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Account Status</Label>
              <div className="flex h-9 items-center gap-2.5 border border-foreground/10 px-2.5 text-sm">
                <Shield className="h-4 w-4 text-green-500 shrink-0" />
                <span className="font-medium">Active &amp; Secure</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-foreground/10 px-5 py-3.5">
          <Button
            size="sm"
            onClick={handleSaveProfile}
            disabled={isSavingProfile || name === user.name}
          >
            {isSavingProfile ? (
              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
            ) : profileSaved ? (
              <Check className="mr-2 h-3.5 w-3.5 text-green-400" />
            ) : null}
            {profileSaved ? "Saved!" : "Save Profile"}
          </Button>
        </div>
      </section>

      {/* ── Profile Defaults ───────────────────────────────────── */}
      <section className="rounded-none border border-foreground/5 bg-card/20">
        <div className="border-b border-foreground/10 px-5 py-3.5">
          <h2 className="text-sm font-semibold">Profile Defaults</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Used to pre-fill ATS scans and job applications.
          </p>
        </div>

        <div className="grid gap-5 p-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Target Seniority</Label>
            <Select value={seniority} onValueChange={setSeniority}>
              <SelectTrigger className="h-9! w-full border border-foreground/10">
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                {seniorityOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Work Mode</Label>
            <Select value={workMode} onValueChange={setWorkMode}>
              <SelectTrigger className="h-9! w-full border border-foreground/10">
                <SelectValue placeholder="Select work mode" />
              </SelectTrigger>
              <SelectContent>
                {workModeOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Employment Type</Label>
            <Select value={employmentType} onValueChange={setEmploymentType}>
              <SelectTrigger className="h-9! w-full border border-foreground/10">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {employmentTypeOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="preferred-location">Preferred Location</Label>
            <div className="relative">
              <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="preferred-location"
                className="h-9 pl-8 border border-foreground/10"
                placeholder="e.g. San Francisco, Remote"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="target-role">Target Role</Label>
            <div className="relative">
              <Briefcase className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="target-role"
                className="h-9 pl-8 border border-foreground/10"
                placeholder="e.g. Software Engineer"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-foreground/5 px-5 py-3.5">
          <Button
            size="sm"
            onClick={handleSavePrefs}
            disabled={isSavingPrefs}
          >
            {isSavingPrefs ? (
              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
            ) : prefsSaved ? (
              <Check className="mr-2 h-3.5 w-3.5 text-green-400" />
            ) : null}
            {prefsSaved ? "Saved!" : "Save Preferences"}
          </Button>
        </div>
      </section>

      {/* ── Danger Zone ────────────────────────────────────────── */}
      <section className="rounded-none border border-destructive/30 bg-destructive/10">
        <div className="border-b border-destructive/30 px-5 py-3.5">
          <h2 className="text-sm font-semibold text-destructive">Danger Zone</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Irreversible actions — proceed with caution.
          </p>
        </div>
        <div className="flex items-center justify-between px-5 py-4">
          <div>
            <p className="text-sm font-medium">Delete Account</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Permanently delete your account and all associated data.
            </p>
          </div>
          <Button variant="destructive" size="sm" disabled>
            Delete Account
          </Button>
        </div>
      </section>
    </div>
  );
}
