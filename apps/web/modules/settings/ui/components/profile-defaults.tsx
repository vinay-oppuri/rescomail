"use client";

import { useState } from "react";
import { EditPreferenceAction } from "../../server/actions";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { Briefcase, Check, Loader2, MapPin } from "lucide-react";

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

export function ProfileDefaults() {
  const [seniority, setSeniority] = useState("");
  const [workMode, setWorkMode] = useState("");
  const [employmentType, setEmploymentType] = useState("");
  const [location, setLocation] = useState("");
  const [targetRole, setTargetRole] = useState("");

  const [isSavingPrefs, setIsSavingPrefs] = useState(false);
  const [prefsSaved, setPrefsSaved] = useState(false);

  const handleSavePrefs = async () => {
    setIsSavingPrefs(true);
    try {
      await EditPreferenceAction({
        targetRoles: targetRole ? [targetRole] : [],
        targetSeniority: (seniority as any) || undefined,
        workModes: workMode ? [workMode as any] : [],
        employmentTypes: employmentType ? [employmentType as any] : [],
        preferredLocations: location ? [{ city: location }] : [],
      });
      setPrefsSaved(true);
      setTimeout(() => setPrefsSaved(false), 2500);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSavingPrefs(false);
    }
  };

  return (
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
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
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
  );
}
