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
import { Briefcase, Check, Loader2, MapPin, X } from "lucide-react";

const predefinedRoles = [
  "Software Engineer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Engineer",
  "Product Manager",
  "Data Scientist",
  "UI/UX Designer",
  "DevOps Engineer",
  "Machine Learning Engineer",
  "Mobile Developer"
];const seniorityOptions = [
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
  const [targetRoles, setTargetRoles] = useState<string[]>([]);
  const [roleInput, setRoleInput] = useState("");

  const addRole = (role: string) => {
    const trimmed = role.trim();
    if (trimmed && !targetRoles.includes(trimmed)) {
      setTargetRoles([...targetRoles, trimmed]);
    }
    setRoleInput("");
    // Keep suggestions open so user can select more roles without re-focusing
  };

  const removeRole = (roleToRemove: string) => {
    setTargetRoles(targetRoles.filter(role => role !== roleToRemove));
  };
  const [isSavingPrefs, setIsSavingPrefs] = useState(false);
  const [prefsSaved, setPrefsSaved] = useState(false);

  const handleSavePrefs = async () => {
    setIsSavingPrefs(true);
    try {
      const result = await EditPreferenceAction({
        targetRoles: targetRoles.length > 0 ? targetRoles : undefined,
        targetSeniority: (seniority as "intern" | "new_grad" | "junior" | "mid" | "senior" | "lead") || undefined,
        workModes: workMode ? [workMode as "remote" | "hybrid" | "onsite"] : [],
        employmentTypes: employmentType ? [employmentType as "internship" | "full_time" | "part_time" | "contract" | "freelance"] : [],
        preferredLocations: location ? [{ city: location }] : [],
      });

      if (result?.error) {
        console.error(result.error);
        return;
      }

      setPrefsSaved(true);
      setTimeout(() => setPrefsSaved(false), 2500);
      
      // Notify other components (like the navbar) to refresh their data
      window.dispatchEvent(new Event("preferences-updated"));
    } catch (error) {
      console.error(error);
    } finally {
      setIsSavingPrefs(false);
    }
  };

  return (
    <section className="flex flex-col border border-foreground/5 bg-card/20 shadow-sm overflow-hidden rounded-sm">
      <div className="flex items-start justify-between gap-3 border-b border-foreground/5 bg-muted/10 px-3 md:px-5 py-3 md:py-4">
        <div>
          <h2 className="text-sm font-semibold tracking-tight text-foreground">
            Profile Defaults
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Used to pre-fill ATS scans and job applications.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-6 p-3 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Target Seniority</Label>
            <Select value={seniority} onValueChange={setSeniority}>
              <SelectTrigger className="h-9! w-full bg-muted/20! border-foreground/5! rounded-sm">
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent className="">
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
              <SelectTrigger className="h-9! w-full bg-muted/20! border-foreground/5! rounded-sm">
                <SelectValue placeholder="Select work mode" />
              </SelectTrigger>
              <SelectContent className="">
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
              <SelectTrigger className="h-9! w-full bg-muted/20! border-foreground/5! rounded-sm">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className="">
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
                className="h-9 pl-8 bg-muted/20! border-foreground/5! rounded-sm"
                placeholder="e.g. San Francisco, Remote"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="target-roles">Target Roles</Label>
            {targetRoles.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {targetRoles.map((role) => (
                  <div key={role} className="flex items-center gap-1 bg-primary/10 border border-primary/20 text-primary px-2 py-0.5 rounded-sm text-xs font-medium">
                    {role}
                    <button 
                      type="button" 
                      onClick={() => removeRole(role)}
                      className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="relative">
              <div className="relative flex items-center w-full">
                <Briefcase className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="target-roles"
                  className="h-9! pl-8! bg-muted/20! border-foreground/5! rounded-sm! w-full"
                  value={roleInput}
                  onChange={(e) => setRoleInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addRole(roleInput);
                    }
                  }}
                  placeholder={targetRoles.length === 0 ? "e.g. Software Engineer" : "Add another role..."}
                />
              </div>

              <div className="flex flex-wrap gap-1.5 mt-2">
                  {predefinedRoles
                    .filter(
                      (r) =>
                        r.toLowerCase().includes(roleInput.toLowerCase()) &&
                        !targetRoles.includes(r)
                    )
                    .map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => addRole(role)}
                        className="flex items-center gap-1 bg-muted/30 hover:bg-primary/10 text-muted-foreground hover:text-primary border border-foreground/5 hover:border-primary/20 px-2 py-0.5 rounded-sm text-xs font-medium transition-colors"
                      >
                        + {role}
                      </button>
                    ))}
                  {roleInput.trim() &&
                    !predefinedRoles.find((r) => r.toLowerCase() === roleInput.trim().toLowerCase()) &&
                    !targetRoles.find((r) => r.toLowerCase() === roleInput.trim().toLowerCase()) && (
                      <button
                        type="button"
                        onClick={() => addRole(roleInput)}
                        className="flex items-center gap-1 bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-sm text-xs font-medium transition-colors"
                      >
                        + Add "{roleInput.trim()}"
                      </button>
                    )}
                </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-foreground/5 bg-muted/10 px-3 md:px-5 py-3 md:py-4">
        <Button
          className="h-8 md:h-9"
          onClick={handleSavePrefs}
          disabled={isSavingPrefs}
        >
          {isSavingPrefs ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : prefsSaved ? (
            <Check className="mr-2 h-4 w-4 text-green-400" />
          ) : null}
          {prefsSaved ? "Saved!" : "Save Preferences"}
        </Button>
      </div>
    </section>
  );
}
