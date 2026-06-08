"use client";

import React, { useState, useRef } from "react";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/card";
import {
  Briefcase,
  Calendar,
  Link as LinkIcon,
  Plus,
  FileText,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { updateApplicationAction } from "../../server/actions";
import type { ApplicationItem } from "../../server/queries";

const COLUMNS = [
  { id: "saved", label: "Saved", color: "border-blue-500/20 text-blue-500 bg-blue-500/5" },
  { id: "applied", label: "Applied", color: "border-amber-500/20 text-amber-500 bg-amber-500/5" },
  { id: "phone_screen", label: "Phone Screen", color: "border-purple-500/20 text-purple-500 bg-purple-500/5" },
  { id: "interview", label: "Interviewing", color: "border-indigo-500/20 text-indigo-500 bg-indigo-500/5" },
  { id: "offer", label: "Offer Received", color: "border-emerald-500/20 text-emerald-500 bg-emerald-500/5" },
  { id: "rejected", label: "No Go / Archived", color: "border-red-500/10 text-red-400 bg-red-500/5" },
] as const;

interface TrackerBoardProps {
  applications: ApplicationItem[];
  onEditClick: (app: ApplicationItem) => void;
  onAddClick: () => void;
  onRefresh?: () => void;
}

export const TrackerBoard = ({
  applications,
  onEditClick,
  onAddClick,
  onRefresh,
}: TrackerBoardProps) => {
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [activeColumnIndex, setActiveColumnIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Group applications by stage
  const grouped = COLUMNS.reduce(
    (acc, col) => {
      acc[col.id] = applications.filter((app) => app.stage === col.id);
      return acc;
    },
    {} as Record<string, ApplicationItem[]>
  );

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const columns = container.children;
    if (!columns || columns.length === 0) return;

    const containerLeft = container.getBoundingClientRect().left;
    const containerCenter = containerLeft + container.clientWidth / 2;

    let closestIndex = 0;
    let minDistance = Infinity;

    for (let i = 0; i < columns.length; i++) {
      const colElement = columns[i] as HTMLElement;
      if (!colElement || !colElement.getBoundingClientRect) continue;

      const rect = colElement.getBoundingClientRect();
      const colCenter = rect.left + rect.width / 2;
      const distance = Math.abs(colCenter - containerCenter);

      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = i;
      }
    }

    if (closestIndex >= 0 && closestIndex < COLUMNS.length) {
      setActiveColumnIndex(closestIndex);
    }
  };

  const handleScrollCarousel = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const column = container.firstElementChild as HTMLElement;
      if (!column) return;
      const columnWidth = column.clientWidth;
      const gap = 16; // gap-4 is 16px
      const scrollAmount = direction === "left" ? -(columnWidth + gap) : (columnWidth + gap);

      container.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const handleMoveStage = async (
    e: React.MouseEvent,
    app: ApplicationItem,
    direction: "prev" | "next"
  ) => {
    e.stopPropagation();
    if (updatingId) return;

    const colIndex = COLUMNS.findIndex((c) => c.id === app.stage);
    if (colIndex === -1) return;

    const nextIndex = direction === "next" ? colIndex + 1 : colIndex - 1;
    if (nextIndex < 0 || nextIndex >= COLUMNS.length) return;

    const nextCol = COLUMNS[nextIndex];
    if (!nextCol) return;
    const newStage = nextCol.id;

    setUpdatingId(app.id);
    const res = await updateApplicationAction(app.id, { stage: newStage });
    setUpdatingId(null);

    if (res.success) {
      onRefresh?.();
    } else {
      alert(`Failed to move application: ${res.error}`);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-foreground">
            Application Board
          </h2>
          <p className="text-xs text-muted-foreground">
            Track interview progress and key action points for your saved jobs.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Carousel Arrows */}
          <div className="flex items-center border border-border/60 bg-muted/20 p-0.5 rounded-sm mr-1.5">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 p-0 rounded-sm"
              onClick={() => handleScrollCarousel("left")}
              title="Previous column"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 p-0 rounded-sm"
              onClick={() => handleScrollCarousel("right")}
              title="Next column"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button onClick={onAddClick} size="sm" className="gap-1.5 rounded-sm">
            <Plus className="h-4 w-4" />
            <span>Add Application</span>
          </Button>
        </div>
      </div>

      {applications.length === 0 ? (
        <div className="flex flex-col items-center justify-center border border-dashed border-border/60 rounded-sm py-16 text-center bg-card/20 min-h-[300px]">
          <div className="flex h-12 w-12 items-center justify-center border border-foreground/5 bg-muted/40 rounded-sm mb-4">
            <Briefcase className="h-5 w-5 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-base mb-1">No applications tracked</h3>
          <p className="max-w-xs text-xs text-muted-foreground mb-6">
            Track jobs manually or search live job listings to add roles straight to your tracker.
          </p>
          <Button onClick={onAddClick} variant="outline" size="sm" className="rounded-sm">
            Add manual application
          </Button>
        </div>
      ) : (
        <div className="flex flex-col w-full gap-4">
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex flex-row overflow-x-auto gap-4 items-stretch w-full pb-4 scrollbar-none snap-x snap-mandatory"
          >
            {COLUMNS.map((col) => {
              const list = grouped[col.id] || [];

              return (
                <div
                  key={col.id}
                  className="flex flex-col gap-3 min-w-[82vw] w-[82vw] md:min-w-[calc((100%-32px)/3)] md:w-[calc((100%-32px)/3)] shrink-0 bg-muted/20 border border-border/40 p-3.5 rounded-sm snap-center transition-all duration-200 min-h-[150px]"
                >
                  <div className="flex items-center justify-between border-b border-border/50 pb-2">
                    <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                      {col.label}
                    </span>
                    <Badge variant="secondary" className="px-1.5 py-0.5 text-[10px] font-bold rounded-sm">
                      {list.length}
                    </Badge>
                  </div>

                  <div className="flex flex-col gap-2.5">
                    {list.map((app) => {
                      const colIndex = COLUMNS.findIndex((c) => c.id === app.stage);

                      return (
                        <Card
                          key={app.id}
                          onClick={() => onEditClick(app)}
                          className="border border-border/40 bg-card hover:bg-card/85 transition-colors cursor-pointer rounded-sm group relative"
                        >
                          <CardHeader className="p-3 pb-1.5 space-y-1">
                            <CardTitle className="text-xs font-bold leading-tight group-hover:text-foreground/90 transition-colors truncate">
                              {app.jobTitle}
                            </CardTitle>
                            <p className="text-[10px] font-semibold text-muted-foreground truncate">
                              {app.companyName}
                            </p>
                          </CardHeader>
                          <CardContent className="p-3 pt-0 space-y-2.5">
                            {app.jobUrl && (
                              <a
                                href={app.jobUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center gap-1 text-[9px] text-muted-foreground hover:text-primary max-w-fit transition-colors"
                              >
                                <LinkIcon className="h-2.5 w-2.5 shrink-0" />
                                <span className="truncate underline">View Job Posting</span>
                              </a>
                            )}

                            {app.resumeTitle && (
                              <div className="flex items-center gap-1 text-[9px] text-emerald-500 bg-emerald-500/5 border border-emerald-500/10 px-1.5 py-0.5 rounded-sm w-fit max-w-full">
                                <FileText className="h-2.5 w-2.5 shrink-0" />
                                <span className="truncate max-w-[100px]">{app.resumeTitle}</span>
                              </div>
                            )}

                            <div className="flex items-center justify-between text-[9px] text-muted-foreground pt-1.5 border-t border-border/30">
                              {colIndex > 0 ? (
                                <button
                                  onClick={(e) => handleMoveStage(e, app, "prev")}
                                  disabled={updatingId !== null}
                                  className="hover:text-foreground hover:bg-muted p-0.5 rounded-sm transition-colors disabled:opacity-50"
                                  title={`Move to ${COLUMNS[colIndex - 1]?.label || ""}`}
                                >
                                  {updatingId === app.id ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <ChevronLeft className="h-3 w-3" />
                                  )}
                                </button>
                              ) : (
                                <div className="w-4" />
                              )}

                              <div className="flex items-center gap-1 font-medium">
                                <Calendar className="h-2.5 w-2.5" />
                                <span>
                                  {app.appliedAt
                                    ? new Date(app.appliedAt).toLocaleDateString(undefined, {
                                        month: "short",
                                        day: "numeric",
                                      })
                                    : new Date(app.createdAt).toLocaleDateString(undefined, {
                                        month: "short",
                                        day: "numeric",
                                      })}
                                </span>
                              </div>

                              {colIndex < COLUMNS.length - 1 ? (
                                <button
                                  onClick={(e) => handleMoveStage(e, app, "next")}
                                  disabled={updatingId !== null}
                                  className="hover:text-foreground hover:bg-muted p-0.5 rounded-sm transition-colors disabled:opacity-50"
                                  title={`Move to ${COLUMNS[colIndex + 1]?.label || ""}`}
                                >
                                  {updatingId === app.id ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <ChevronRight className="h-3 w-3" />
                                  )}
                                </button>
                              ) : (
                                <div className="w-4" />
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}

                    {list.length === 0 && (
                      <div className="text-[10px] text-center text-muted-foreground/60 py-6 border border-dashed border-border/30 rounded-sm bg-card/5">
                        Empty column
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Carousel Navigation Indicator Dots */}
          <div className="flex justify-center gap-1.5 mt-2">
            {COLUMNS.map((col, idx) => (
              <button
                key={col.id}
                onClick={() => {
                  if (scrollContainerRef.current) {
                    const columns = scrollContainerRef.current.children;
                    const targetElement = columns[idx] as HTMLElement;
                    if (targetElement) {
                      targetElement.scrollIntoView({
                        behavior: "smooth",
                        block: "nearest",
                        inline: "center",
                      });
                      setActiveColumnIndex(idx);
                    }
                  }
                }}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  activeColumnIndex === idx ? "w-4 bg-primary" : "w-1.5 bg-muted-foreground/30"
                }`}
                title={`View ${col.label}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
