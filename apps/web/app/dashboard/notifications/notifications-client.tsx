"use client";

import { useState } from "react";
import { Button } from "@repo/ui";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardAction } from "@repo/ui";
import { Briefcase, CheckCheck, ExternalLink } from "lucide-react";
import { MarkNotificationsAsReadAction, type JobNotification } from "../../../modules/dashboard/server/actions";
import Link from "next/link";

type NotificationsClientProps = {
  initialJobs: JobNotification[];
  needsSetup?: boolean;
};

export default function NotificationsClient({ initialJobs, needsSetup }: NotificationsClientProps) {
  const [jobs, setJobs] = useState<JobNotification[]>(initialJobs);
  const [isMarking, setIsMarking] = useState(false);

  const unreadCount = jobs.filter(j => !j.isRead).length;

  const handleMarkAllRead = async () => {
    if (unreadCount === 0 || isMarking) return;
    setIsMarking(true);
    try {
      const res = await MarkNotificationsAsReadAction();
      if (res.success) {
        setJobs(prev => prev.map(j => ({ ...j, isRead: true })));
        // Dispatch event so navbar badge updates immediately
        window.dispatchEvent(new Event("preferences-updated"));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsMarking(false);
    }
  };

  const groupNotificationsByDate = (notifications: JobNotification[]) => {
    const today: JobNotification[] = [];
    const yesterday: JobNotification[] = [];
    const older: JobNotification[] = [];

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);

    notifications.forEach((job) => {
      const date = new Date(job.createdAt);
      if (date >= startOfToday) {
        today.push(job);
      } else if (date >= startOfYesterday) {
        yesterday.push(job);
      } else {
        older.push(job);
      }
    });

    return { today, yesterday, older };
  };

  const { today, yesterday, older } = groupNotificationsByDate(jobs);

  const renderJobCard = (job: JobNotification) => (
    <Card 
      key={job.id} 
      className={`relative border-border/50 hover:border-border transition-all duration-200 hover:shadow-md bg-card/45 backdrop-blur-sm ${
        !job.isRead ? "ring-1 ring-primary/25 bg-primary/5" : ""
      }`}
    >
      <CardHeader className="flex flex-row items-start justify-between gap-4 pb-2">
        <div className="flex items-start gap-3 min-w-0">
          <div className={`mt-1 flex items-center justify-center h-8 w-8 rounded-full shrink-0 ${
            !job.isRead ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
          }`}>
            <Briefcase className="h-4 w-4" />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-semibold truncate text-foreground">{job.title}</CardTitle>
              {!job.isRead && (
                <span className="h-2 w-2 rounded-full bg-primary shrink-0 animate-pulse" title="Unread" />
              )}
            </div>
            <CardDescription className="text-xs text-muted-foreground truncate">
              {job.company} • {job.location}
            </CardDescription>
          </div>
        </div>
        <CardAction className="flex items-center gap-3 shrink-0">
          <span className="text-[10px] text-emerald-500 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-sm">
            {job.matchScore}% Match
          </span>
          {job.url && (
            <a 
              href={job.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors p-1"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </CardAction>
      </CardHeader>
      <CardContent className="flex justify-between items-center text-[10px] text-muted-foreground pt-0 pb-3">
        <span>Matched {job.timeAgo}</span>
        <span>{new Date(job.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
      </CardContent>
    </Card>
  );

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full p-4 md:p-6 min-h-[80vh]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/50 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Notifications</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Automated job matches based on your profile defaults over the last 7 days.
          </p>
        </div>
        {unreadCount > 0 && (
          <Button 
            onClick={handleMarkAllRead} 
            disabled={isMarking}
            size="sm"
            variant="outline"
            className="flex items-center gap-2 hover:bg-muted/50 border-border/50 self-start"
          >
            <CheckCheck className="h-4 w-4 text-primary" />
            <span>Mark all as read</span>
          </Button>
        )}
      </div>

      {needsSetup ? (
        <Card className="border-dashed border-border/70 p-8 text-center flex flex-col items-center justify-center gap-3">
          <Briefcase className="h-10 w-10 text-muted-foreground/50" />
          <h2 className="text-sm font-semibold">Setup profile preferences</h2>
          <p className="text-xs text-muted-foreground max-w-sm">
            Configure your target roles, seniority level, and locations to start matching jobs automatically.
          </p>
          <Link href="/dashboard/settings" className="mt-2">
            <Button size="sm">Go to Settings</Button>
          </Link>
        </Card>
      ) : jobs.length === 0 ? (
        <Card className="p-8 text-center flex flex-col items-center justify-center gap-3 border-border/50 bg-card/25">
          <Briefcase className="h-10 w-10 text-muted-foreground/50" />
          <h2 className="text-sm font-semibold">No matches yet</h2>
          <p className="text-xs text-muted-foreground max-w-sm">
            We haven't found any job matches for your profile defaults in the last 7 days. Make sure your profile defaults are up-to-date.
          </p>
          <Link href="/dashboard/settings" className="mt-2">
            <Button size="sm" variant="outline">Update Profile Defaults</Button>
          </Link>
        </Card>
      ) : (
        <div className="flex flex-col gap-6">
          {today.length > 0 && (
            <div className="flex flex-col gap-3">
              <h2 className="text-xs font-bold text-muted-foreground tracking-wider uppercase">Today</h2>
              <div className="flex flex-col gap-3">
                {today.map(renderJobCard)}
              </div>
            </div>
          )}

          {yesterday.length > 0 && (
            <div className="flex flex-col gap-3">
              <h2 className="text-xs font-bold text-muted-foreground tracking-wider uppercase">Yesterday</h2>
              <div className="flex flex-col gap-3">
                {yesterday.map(renderJobCard)}
              </div>
            </div>
          )}

          {older.length > 0 && (
            <div className="flex flex-col gap-3">
              <h2 className="text-xs font-bold text-muted-foreground tracking-wider uppercase">Earlier this week</h2>
              <div className="flex flex-col gap-3">
                {older.map(renderJobCard)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
