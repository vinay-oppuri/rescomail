"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { Briefcase, Search, Layout } from "lucide-react";
import { TrackerBoard } from "../components/tracker-board";
import { JobSearchPanel } from "../components/job-search-panel";
import { ApplicationDialog } from "../components/application-dialog";
import type { ApplicationItem, ResumeOption } from "../../server/queries";

interface ApplicationsViewProps {
  initialApplications: ApplicationItem[];
  resumes: ResumeOption[];
}

export default function ApplicationsView({
  initialApplications,
  resumes,
}: ApplicationsViewProps) {
  const [applications, setApplications] = useState<ApplicationItem[]>(initialApplications);
  const [activeTab, setActiveTab] = useState<"tracker" | "search">("tracker");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<ApplicationItem | null>(null);

  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (searchParams.get("new") === "true") {
      handleAddClick();
      router.replace("/dashboard/applications");
    }
  }, [searchParams, router]);

  const refreshApplications = async () => {
    const { getApplicationsAction } = await import("../../server/actions");
    const res = await getApplicationsAction();
    if (res.success && res.data) {
      setApplications(res.data);
    }
  };

  const handleEditClick = (app: ApplicationItem) => {
    setSelectedApplication(app);
    setIsDialogOpen(true);
  };

  const handleAddClick = () => {
    setSelectedApplication(null);
    setIsDialogOpen(true);
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 md:gap-8">
      {/* Standard Header */}
      <div className="flex flex-col gap-4 border-b border-border/50 pb-6 md:flex-row md:items-end md:justify-between md:gap-12">
        <div className="max-w-3xl space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <Briefcase className="h-3 w-3" />
              <span>{applications.length} roles tracked</span>
            </Badge>
          </div>
          <h1 className="text-xl font-bold tracking-tight md:text-2xl">
            Job Applications
          </h1>
          <p className="text-xs leading-6 text-muted-foreground">
            Search live job postings, organize your interview pipeline, link resumes, and save interview preparation notes.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-1 border border-border/60 bg-muted/30 p-1 rounded-sm w-fit max-w-full">
          <Button
            onClick={() => setActiveTab("tracker")}
            variant={activeTab === "tracker" ? "default" : "ghost"}
            size="sm"
            className="text-xs h-7 rounded-sm gap-1 px-3"
          >
            <Layout className="h-3.5 w-3.5" />
            <span>Tracker Board</span>
          </Button>
          <Button
            onClick={() => setActiveTab("search")}
            variant={activeTab === "search" ? "default" : "ghost"}
            size="sm"
            className="text-xs h-7 rounded-sm gap-1 px-3"
          >
            <Search className="h-3.5 w-3.5" />
            <span>Search Jobs</span>
          </Button>
        </div>
      </div>

      <div className="flex w-full flex-col gap-6">
        {activeTab === "tracker" ? (
          <TrackerBoard
            applications={applications}
            onEditClick={handleEditClick}
            onAddClick={handleAddClick}
            onRefresh={refreshApplications}
          />
        ) : (
          <JobSearchPanel onAddSuccess={refreshApplications} />
        )}
      </div>

      <ApplicationDialog
        key={`${selectedApplication?.id ?? "new"}:${isDialogOpen}`}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        application={selectedApplication}
        resumes={resumes}
        onSaveSuccess={refreshApplications}
      />
    </div>
  );
}
