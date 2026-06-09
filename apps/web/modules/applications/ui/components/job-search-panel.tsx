"use client";

import React, { useState } from "react";
import {
  Button,
  Input,
  Card,
  Badge,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Skeleton,
} from "@repo/ui";
import { Search, MapPin, Briefcase, ExternalLink, Plus, Check, Loader2 } from "lucide-react";
import { searchJobsAction, createApplicationAction } from "../../server/actions";

interface JobResult {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  apply_link: string;
  posted_at: string;
  source: string;
}

interface JobSearchPanelProps {
  onAddSuccess: () => void;
}

const POPULAR_TITLES = [
  "Software Engineer",
  "Frontend Engineer",
  "Backend Engineer",
  "Full Stack Developer",
  "Data Scientist",
  "Machine Learning Engineer",
  "DevOps Engineer",
  "Product Manager",
  "Mobile Developer",
  "UI/UX Designer",
];

const POPULAR_LOCATIONS = [
  "Remote",
  "San Francisco, CA",
  "New York, NY",
  "Austin, TX",
  "Seattle, WA",
  "London, UK",
  "Berlin, Germany",
  "Toronto, Canada",
  "Bangalore, India",
];

interface JobDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  job: JobResult | null;
  isTracked: boolean;
  onTrack: () => void;
}

const JobDetailsDialog = ({ isOpen, onClose, job, isTracked, onTrack }: JobDetailsDialogProps) => {
  if (!job) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-5xl max-w-none w-[90vw] h-[85vh] max-h-[85vh] overflow-hidden flex flex-col p-6 text-sm">
        <DialogHeader className="mb-4 border-b border-border/50 pb-4">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <DialogTitle className="text-base font-bold text-foreground">
              {job.title}
            </DialogTitle>
            <Badge variant="secondary" className="text-[8px] uppercase tracking-wider font-bold rounded-sm py-0.5 px-1 bg-muted/80">
              {job.source}
            </Badge>
          </div>
          <DialogDescription className="text-xs font-semibold text-muted-foreground flex flex-wrap items-center gap-2">
            <span>{job.company}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {job.location || "Remote / Unspecified"}
            </span>
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable Job Description */}
        <div className="grow overflow-y-auto pr-4 scrollbar-thin text-sm leading-relaxed whitespace-pre-wrap my-4 text-foreground/90 font-sans max-h-none">
          {job.description ? (
            <div className="whitespace-pre-wrap">{job.description}</div>
          ) : (
            <p className="text-muted-foreground italic">No description provided for this listing.</p>
          )}
        </div>

        <DialogFooter className="shrink-0 flex flex-row items-center justify-between gap-3 pt-4 border-t border-border/50 mt-auto">
          {job.apply_link ? (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="rounded-sm gap-1.5 text-xs px-4 border border-border/40"
            >
              <a href={job.apply_link} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Apply Direct</span>
              </a>
            </Button>
          ) : (
            <div />
          )}

          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
            <Button
              onClick={onTrack}
              variant={isTracked ? "outline" : "default"}
              size="sm"
              className="rounded-sm gap-1.5 text-xs px-4"
            >
              {isTracked ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Tracked</span>
                </>
              ) : (
                <>
                  <Plus className="h-3.5 w-3.5" />
                  <span>Track Job</span>
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const JobSearchPanel = ({ onAddSuccess }: JobSearchPanelProps) => {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [showQuerySuggestions, setShowQuerySuggestions] = useState(false);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<JobResult[]>([]);
  const [trackedJobIds, setTrackedJobIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  // Job Details Dialog states
  const [selectedJob, setSelectedJob] = useState<JobResult | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);
    setResults([]);

    const res = await searchJobsAction(query.trim(), location.trim());
    setIsLoading(false);

    if (res.success && res.results) {
      setResults(res.results);
    } else {
      setError(res.error || "Failed to find any jobs. Make sure API keys are configured.");
    }
  };

  const handleTrackJob = async (job: JobResult) => {
    if (trackedJobIds.has(job.id)) return;

    const res = await createApplicationAction({
      jobTitle: job.title,
      companyName: job.company,
      jobUrl: job.apply_link,
      stage: "saved",
    });

    if (res.success) {
      setTrackedJobIds((prev) => new Set([...prev, job.id]));
      onAddSuccess();
    } else {
      alert(`Error saving job: ${res.error}`);
    }
  };

  const handleViewDetails = (job: JobResult) => {
    setSelectedJob(job);
    setIsDetailsOpen(true);
  };

  const filteredTitles = POPULAR_TITLES.filter((t) =>
    t.toLowerCase().includes(query.toLowerCase())
  );

  const filteredLocations = POPULAR_LOCATIONS.filter((l) =>
    l.toLowerCase().includes(location.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Search Bar Form */}
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 bg-muted/20 border border-border/40 p-4 rounded-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowQuerySuggestions(true);
            }}
            onFocus={() => setShowQuerySuggestions(true)}
            onBlur={() => setTimeout(() => setShowQuerySuggestions(false), 200)}
            placeholder="Job title, keywords, or company..."
            required
            className="pl-9 bg-card text-foreground"
          />
          {showQuerySuggestions && filteredTitles.length > 0 && (
            <div className="absolute z-20 w-full bg-popover/95 backdrop-blur-sm border border-border/80 rounded-sm shadow-lg mt-1 max-h-56 overflow-y-auto">
              <div className="px-2.5 py-1.5 text-[9px] font-bold tracking-wider text-muted-foreground uppercase border-b border-border/30 bg-muted/10">
                Suggested Titles
              </div>
              {filteredTitles.map((title) => (
                <div
                  key={title}
                  onMouseDown={() => {
                    setQuery(title);
                    setShowQuerySuggestions(false);
                  }}
                  className="px-3 py-2 text-xs text-foreground hover:bg-muted/80 cursor-pointer transition-colors flex items-center justify-between"
                >
                  <span>{title}</span>
                  <Briefcase className="h-3 w-3 text-muted-foreground/50" />
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="sm:w-60 relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={location}
            onChange={(e) => {
              setLocation(e.target.value);
              setShowLocationSuggestions(true);
            }}
            onFocus={() => setShowLocationSuggestions(true)}
            onBlur={() => setTimeout(() => setShowLocationSuggestions(false), 200)}
            placeholder="City, state, country, or 'Remote'"
            className="pl-9 bg-card text-foreground"
          />
          {showLocationSuggestions && filteredLocations.length > 0 && (
            <div className="absolute z-20 w-full bg-popover/95 backdrop-blur-sm border border-border/80 rounded-sm shadow-lg mt-1 max-h-56 overflow-y-auto">
              <div className="px-2.5 py-1.5 text-[9px] font-bold tracking-wider text-muted-foreground uppercase border-b border-border/30 bg-muted/10">
                Suggested Locations
              </div>
              {filteredLocations.map((loc) => (
                <div
                  key={loc}
                  onMouseDown={() => {
                    setLocation(loc);
                    setShowLocationSuggestions(false);
                  }}
                  className="px-3 py-2 text-xs text-foreground hover:bg-muted/80 cursor-pointer transition-colors flex items-center justify-between"
                >
                  <span>{loc}</span>
                  <MapPin className="h-3 w-3 text-muted-foreground/50" />
                </div>
              ))}
            </div>
          )}
        </div>
        <Button type="submit" disabled={isLoading} className="gap-1.5 rounded-sm shrink-0">
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          <span>Search</span>
        </Button>
      </form>

      {error && (
        <div className="text-xs text-red-500 bg-red-500/10 p-3 rounded-sm border border-red-500/20">
          {error}
        </div>
      )}

      {/* Results Section */}
      <div className="space-y-4">
        {isLoading && (
          <div className="flex flex-col gap-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <Card
                key={idx}
                className="border border-border/40 bg-card/45 rounded-sm p-5 flex flex-col sm:flex-row gap-4 justify-between items-start"
              >
                <div className="flex-1 space-y-3 min-w-0 w-full animate-pulse">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-1/3 rounded-sm" />
                    <Skeleton className="h-4 w-12 rounded-sm" />
                  </div>
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-4 w-24 rounded-sm" />
                    <span className="text-muted-foreground/40">•</span>
                    <Skeleton className="h-4 w-32 rounded-sm" />
                  </div>
                  <div className="space-y-1.5 pt-1">
                    <Skeleton className="h-3 w-full rounded-sm" />
                    <Skeleton className="h-3 w-5/6 rounded-sm" />
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 pt-3 sm:pt-0 border-t border-border/20 sm:border-t-0 justify-end animate-pulse">
                  <Skeleton className="h-8 w-24 rounded-sm animate-pulse" />
                  <Skeleton className="h-8 w-20 rounded-sm animate-pulse" />
                </div>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && results.length > 0 && (
          <div className="flex flex-col gap-4">
            {results.map((job) => {
              const isTracked = trackedJobIds.has(job.id);
              return (
                <Card
                  key={job.id}
                  className="border border-border/40 bg-card/45 hover:bg-card/75 transition-all duration-200 rounded-sm p-5 flex flex-col sm:flex-row gap-4 justify-between items-start group"
                >
                  <div className="flex-1 space-y-2.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-bold text-foreground truncate">
                        {job.title}
                      </h3>
                      <Badge variant="secondary" className="text-[8px] uppercase tracking-wider font-bold rounded-sm py-0.5 px-1 bg-muted/80">
                        {job.source}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground font-semibold">
                      <span>{job.company}</span>
                      <span className="text-muted-foreground/40">•</span>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>{job.location || "Remote / Unspecified"}</span>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground/80 leading-relaxed line-clamp-2 max-w-3xl">
                      {job.description || "No description provided."}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 pt-3 sm:pt-0 border-t border-border/20 sm:border-t-0 justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(job)}
                      className="rounded-sm text-xs px-3 border border-border/40"
                    >
                      View Details
                    </Button>
                    <Button
                      onClick={() => handleTrackJob(job)}
                      variant={isTracked ? "outline" : "default"}
                      size="sm"
                      className="rounded-sm gap-1 text-xs px-3.5"
                    >
                      {isTracked ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-500" />
                          <span>Tracked</span>
                        </>
                      ) : (
                        <>
                          <Plus className="h-3.5 w-3.5" />
                          <span>Track</span>
                        </>
                      )}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {!isLoading && results.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center border border-dashed border-border/60 py-20 rounded-sm bg-card/10 text-muted-foreground">
            <Briefcase className="h-8 w-8 mb-3 text-muted-foreground/50" />
            <p className="text-xs">Search for positions to view and track live postings.</p>
          </div>
        )}
      </div>

      {/* Details Dialog */}
      {selectedJob && (
        <JobDetailsDialog
          isOpen={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
          job={selectedJob}
          isTracked={trackedJobIds.has(selectedJob.id)}
          onTrack={() => {
            handleTrackJob(selectedJob);
          }}
        />
      )}
    </div>
  );
};
