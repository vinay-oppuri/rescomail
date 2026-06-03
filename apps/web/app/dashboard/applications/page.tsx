import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Briefcase, Bell, CheckCircle2, Layout, Inbox } from "lucide-react";

const Page = () => {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 md:gap-8">
      {/* Standard Header */}
      <div className="flex flex-col gap-4 border-b border-border/50 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2 max-w-3xl">
          <h1 className="text-xl font-bold tracking-tight md:text-2xl">Job Tracker</h1>
          <p className="text-xs md:text-sm leading-6 text-muted-foreground">
            Track roles, contacts, next steps, and interview progress.
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center border border-foreground/5 bg-card/20 shadow-sm px-6 py-16 text-center rounded-sm min-h-[500px]">
        <div className="flex h-12 w-12 items-center justify-center border border-foreground/5 bg-muted/40 rounded-sm mb-4">
          <Briefcase className="h-5 w-5 text-foreground" />
        </div>
        
        <Badge variant="secondary" className="rounded-sm mb-6">Coming Soon</Badge>
        
        <h2 className="text-xl md:text-2xl font-bold tracking-tight mb-2">
          Smart Application Tracking
        </h2>
        
        <p className="max-w-md text-sm text-muted-foreground mb-8">
          The ultimate pipeline for your job hunt is under construction. Track roles, manage contacts, and stay on top of interviews all in one unified view.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left w-full max-w-3xl border-t border-border/50 pt-10">
          {[
            { icon: Layout, title: "Kanban Pipeline", desc: "Drag and drop applications across different interview stages." },
            { icon: Inbox, title: "Auto-sync", desc: "Automatically sync interview invites straight from your inbox." },
            { icon: CheckCircle2, title: "Task Manager", desc: "Never miss a follow-up with built-in smart reminders." },
          ].map((feature, i) => (
            <div key={i} className="flex flex-col gap-2">
              <div className="flex items-center gap-2 mb-1">
                <feature.icon className="h-4 w-4 text-foreground" />
                <h3 className="font-semibold text-sm">{feature.title}</h3>
              </div>
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Page;
