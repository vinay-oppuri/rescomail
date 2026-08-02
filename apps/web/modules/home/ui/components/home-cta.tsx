"use client"

import Link from "next/link";
import { Button } from "@repo/ui/components/button";
import { ArrowRight } from "lucide-react";

export function HomeCta() {
  return (
    <section className="py-12 md:py-20 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-2 border border-foreground/5 dark:border-border/30 rounded-2xl overflow-hidden bg-linear-to-b from-blue-500/10 via-blue-500/5 to-transparent dark:from-blue-500/5 dark:via-blue-500/3 dark:to-blue-500/1 shadow-xl">

          {/* Left — copy + actions */}
          <div className="px-6 py-10 md:px-10 md:py-14 flex flex-col justify-center">
            <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-primary mb-3">
              AI resume and outreach workspace
            </p>
            <h2 className="text-xl md:text-3xl font-bold tracking-tight text-foreground leading-snug mb-4">
              Land your next <span className="font-bold text-blue-500 dark:text-purple-400">dream job</span> faster — with AI working alongside you
            </h2>
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed mb-8 max-w-sm">
              Rescomail compares your resume with a role description and drafts personalized cold emails.
            </p>
            <div className="flex flex-col gap-3">
              <Button size="lg" className="h-9 md:h-11 text-xs md:text-sm font-semibold rounded-full bg-blue-600 hover:bg-blue-500! dark:bg-blue-500/20 dark:hover:bg-blue-500/25! text-white transition-all duration-200" asChild>
                <Link href="/login">
                  Get started free <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-9 md:h-11 text-xs md:text-sm font-semibold rounded-full border-foreground/5! hover:bg-foreground/2 transition-all duration-200" asChild>
                <Link href="#features">See how it works</Link>
              </Button>
            </div>
            <p className="mt-6 text-[9px] md:text-xs text-muted-foreground/60">
              No credit card required · Free plan forever
            </p>
          </div>

          {/* Right — live product preview */}
          <div className="hidden md:flex flex-col gap-4 bg-white/10 dark:bg-neutral-950/20 backdrop-blur-xs px-7 py-8 border-l border-foreground/5">
            <HomeCTAPreview />
          </div>

        </div>
      </div>
    </section>
  );
}


import { useEffect, useState } from "react";

const SCAN_STEPS = [
  "Scanning resume…",
  "Checking keyword density…",
  "Analysing impact verbs…",
  "Flagging passive language…",
  "Scan complete — 3 suggestions",
];

export function HomeCTAPreview() {
  const [scanStep, setScanStep] = useState(0);
  const [kwWidth, setKwWidth] = useState(0);
  const [ilWidth, setIlWidth] = useState(0);
  const [atsScore, setAtsScore] = useState<string | null>(null);
  const [dotColor, setDotColor] = useState("bg-blue-500");

  useEffect(() => {
    const t1 = setTimeout(() => setKwWidth(82), 600);
    const t2 = setTimeout(() => setIlWidth(54), 900);
    const t3 = setTimeout(() => setAtsScore("87 / 100"), 1200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setScanStep((prev) => {
        const next = (prev + 1) % SCAN_STEPS.length;
        if (next === SCAN_STEPS.length - 1) {
          setDotColor("bg-emerald-500");
          setTimeout(() => { setDotColor("bg-blue-500"); setScanStep(0); }, 3000);
        }
        return next;
      });
    }, 1600);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Resume scan card */}
      <div className="px-2">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 font-mono">
          Resume scan
        </p>
        <div className="border border-foreground/5 bg-background/50 backdrop-blur-xs rounded-xl overflow-hidden text-sm shadow-xs">
          <div className="flex items-center gap-2.5 px-4 py-3 border-b border-foreground/5">
            <div className="w-7 h-7 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center text-[10px] font-medium shrink-0">
              AK
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground leading-none mb-0.5">Arjun K. — Product Designer</p>
              <p className="text-[11px] text-muted-foreground">Applying to Stripe · Design Lead</p>
            </div>
          </div>

          <div className="flex items-center justify-between px-4 py-2.5 border-b border-foreground/5">
            <span className="text-[11px] text-muted-foreground">ATS match score</span>
            <span className="text-[12px] font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
              {atsScore ?? "—"}
            </span>
          </div>

          {[
            { label: "Keywords matched", width: kwWidth, color: "bg-emerald-500" },
            { label: "Impact language", width: ilWidth, color: "bg-amber-400" },
          ].map(({ label, width, color }) => (
            <div key={label} className="px-4 py-2.5 border-b border-foreground/5">
              <div className="flex justify-between mb-1.5">
                <span className="text-[11px] text-muted-foreground">{label}</span>
                <span className="text-[11px] text-muted-foreground tabular-nums">{width}%</span>
              </div>
              <div className="h-1 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1500 ease-out ${color}`}
                  style={{ width: `${width}%` }}
                />
              </div>
            </div>
          ))}

          <div className="flex items-center gap-2 px-4 py-2.5">
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors duration-300 ${dotColor}`} />
            <span className="text-[11px] text-muted-foreground transition-all duration-300">
              {SCAN_STEPS[scanStep]}
            </span>
          </div>
        </div>
      </div>

      {/* Outreach preview */}
      <div className="px-2">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 font-mono">
          Cold email draft
        </p>
        <div className="border border-foreground/5 bg-background/50 backdrop-blur-xs rounded-xl overflow-hidden p-4 shadow-xs">
          <p className="text-xs font-semibold text-foreground">Subject: Product design collaboration</p>
          <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
            A concise, personalized draft grounded in your resume and the company context you provide.
          </p>
        </div>
      </div>
    </>
  );
}
