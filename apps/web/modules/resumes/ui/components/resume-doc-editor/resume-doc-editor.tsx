"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Code2,
  Printer,
  Plus,
  Trash2,
  ExternalLink,
  ChevronLeft,
  FileText,
  Loader2,
  Database,
  Copy,
  Check,
} from "lucide-react";
import type { Editor } from "@tiptap/react";
import { Button } from "@repo/ui/components/button";
import { Badge } from "@repo/ui/components/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@repo/ui/components/dialog";
import {
  resumeDataFromParsedJson,
  type ResumeData,
} from "../../pdf/resume-pdf";
import { getParsedResumesAction, updateResumeParsedJsonAction } from "@/modules/resumes/server/actions";
import { SAMPLE_RESUME_DATA, fetchResume, updateResume } from "./sample-resume";
import { ResumeEditableSection } from "./resume-editable-section";
import { ResumeTopToolbar } from "./resume-top-toolbar";
import {
  ResumeTemplateSkeletons,
  type ResumeTemplateId,
} from "./resume-template-skeletons";

function bulletsToHtml(bullets?: string[]): string {
  if (!bullets || bullets.length === 0) return "<ul><li>Accomplished key milestones…</li></ul>";
  return `<ul>${bullets.map((b) => `<li>${b}</li>`).join("")}</ul>`;
}

function htmlToBullets(html: string): string[] {
  if (typeof window === "undefined") return [];
  const div = document.createElement("div");
  div.innerHTML = html;
  const lis = Array.from(div.querySelectorAll("li"));
  if (lis.length > 0) {
    return lis.map((li) => li.innerHTML.trim()).filter(Boolean);
  }
  const ps = Array.from(div.querySelectorAll("p"));
  if (ps.length > 0) {
    return ps.map((p) => p.innerHTML.trim()).filter(Boolean);
  }
  return [div.innerHTML.trim()].filter(Boolean);
}

export interface DbResumeSource {
  id: string;
  title: string;
  parsedJson: unknown;
}

interface ResumeDocEditorProps {
  dbResumes?: DbResumeSource[];
  initialResumeId?: string;
}

export const ResumeDocEditor: React.FC<ResumeDocEditorProps> = ({
  dbResumes = [],
  initialResumeId,
}) => {
  const [loading, setLoading] = useState(true);
  const [sources, setSources] = useState<DbResumeSource[]>(dbResumes);
  const [selectedSourceId, setSelectedSourceId] = useState<string>(() => {
    if (initialResumeId && dbResumes.some((r) => r.id === initialResumeId)) {
      return initialResumeId;
    }
    return dbResumes[0]?.id ?? "sample";
  });
  const [selectedTemplate, setSelectedTemplate] = useState<ResumeTemplateId>("modern");
  const [resume, setResume] = useState<ResumeData>(SAMPLE_RESUME_DATA);
  const [docTitle, setDocTitle] = useState("Elena Rostova – Resume");
  const [showJsonModal, setShowJsonModal] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);

  // Active Tiptap editor reference for top toolbar controls
  const [activeEditor, setActiveEditor] = useState<Editor | null>(null);
  const [activeSectionName, setActiveSectionName] = useState<string>("Professional Summary");

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. On load, fetch parsed resume JSON from database or fallback to sample
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      try {
        let currentSources = dbResumes;
        if (!currentSources || currentSources.length === 0) {
          const res = await getParsedResumesAction();
          if (res.success && res.resumes.length > 0) {
            currentSources = res.resumes;
            if (isMounted) setSources(res.resumes);
          }
        }

        const targetId =
          initialResumeId && currentSources.some((r) => r.id === initialResumeId)
            ? initialResumeId
            : currentSources[0]?.id ?? "sample";

        if (isMounted) setSelectedSourceId(targetId);

        if (targetId !== "sample") {
          const match = currentSources.find((r) => r.id === targetId);
          if (match && match.parsedJson) {
            const parsedData = resumeDataFromParsedJson(match.parsedJson);
            if (isMounted) {
              setResume(parsedData);
              const fullName = parsedData.basics?.fullName || match.title;
              setDocTitle(`${fullName} – Resume`);
            }
            return;
          }
        }

        // Fallback to sample data
        const sampleData = await fetchResume();
        if (isMounted) {
          setResume(sampleData);
          if (sampleData.basics?.fullName) {
            setDocTitle(`${sampleData.basics.fullName} – Resume`);
          }
        }
      } catch (err) {
        console.error("Failed to load resume:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [dbResumes, initialResumeId]);

  // Switch between database parsed resumes or sample
  const selectSource = useCallback(
    (sourceId: string) => {
      setSelectedSourceId(sourceId);
      if (sourceId === "sample") {
        setResume(SAMPLE_RESUME_DATA);
        setDocTitle(`${SAMPLE_RESUME_DATA.basics?.fullName || "Elena Rostova"} – Resume`);
        return;
      }

      const match = sources.find((s) => s.id === sourceId);
      if (match && match.parsedJson) {
        const parsed = resumeDataFromParsedJson(match.parsedJson);
        setResume(parsed);
        const fullName = parsed.basics?.fullName || match.title;
        setDocTitle(`${fullName} – Resume`);
      }
    },
    [sources]
  );

  // 2. Debounced save to PostgreSQL database if DB resume selected, else cloud sample
  const triggerDebouncedSave = useCallback(
    (latestData: ResumeData) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(async () => {
        try {
          if (selectedSourceId && selectedSourceId !== "sample") {
            const res = await updateResumeParsedJsonAction(selectedSourceId, latestData);
            if (res.success) {
              setSources((prev) =>
                prev.map((s) => (s.id === selectedSourceId ? { ...s, parsedJson: latestData } : s))
              );
              return;
            }
          }
          await updateResume(latestData);
        } catch (err) {
          console.error("Autosave failed:", err);
        }
      }, 800);
    },
    [selectedSourceId]
  );

  const updateResumeData = useCallback(
    (updater: (prev: ResumeData) => ResumeData) => {
      setResume((prev) => {
        const next = updater(prev);
        triggerDebouncedSave(next);
        return next;
      });
    },
    [triggerDebouncedSave]
  );

  // Inline basics field updater
  const updateBasicsField = (field: keyof NonNullable<ResumeData["basics"]>, val: string) => {
    updateResumeData((prev) => ({
      ...prev,
      basics: {
        ...(prev.basics ?? {}),
        [field]: val,
      },
    }));
  };

  // Add / remove experience entry
  const addExperience = () => {
    updateResumeData((prev) => ({
      ...prev,
      experience: [
        {
          role: "Senior Software Engineer",
          company: "Company Name",
          location: "Remote / Hybrid",
          startDate: "2024",
          endDate: "Present",
          bullets: ["Spearheaded development of mission-critical platform."],
        },
        ...(prev.experience ?? []),
      ],
    }));
  };

  const removeExperience = (index: number) => {
    updateResumeData((prev) => ({
      ...prev,
      experience: (prev.experience ?? []).filter((_, i) => i !== index),
    }));
  };

  // Add / remove education entry
  const addEducation = () => {
    updateResumeData((prev) => ({
      ...prev,
      education: [
        ...(prev.education ?? []),
        {
          institution: "University Name",
          degree: "B.S. in Computer Science",
          startDate: "2020",
          endDate: "2024",
        },
      ],
    }));
  };

  const removeEducation = (index: number) => {
    updateResumeData((prev) => ({
      ...prev,
      education: (prev.education ?? []).filter((_, i) => i !== index),
    }));
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(resume, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const basics = resume.basics ?? {};

  if (loading) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-background text-muted-foreground">
        <div className="flex h-12 w-12 items-center justify-center rounded-sm border border-border/60 bg-card shadow-xs">
          <Loader2 className="h-6 w-6 animate-spin text-foreground" />
        </div>
        <p className="mt-3 text-xs font-medium text-foreground">Loading resume studio document…</p>
        <p className="text-[11px] text-muted-foreground">Preparing interactive rich text document</p>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col bg-background text-foreground select-text">
      {/* Top Header: ONLY Print Button and Resume JSON Button */}
      <header className="shrink-0 border-b border-border/60 bg-background/95 backdrop-blur-md px-4 py-2.5 sm:px-6 print:hidden flex items-center justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowJsonModal(true)}
          className="h-8 px-2.5 text-xs border-border/60 text-foreground hover:bg-muted"
          title="Inspect structured resume JSON"
        >
          <Code2 className="h-3.5 w-3.5 mr-1.5 text-custom" />
          <span>Resume JSON</span>
        </Button>

        <Button
          type="button"
          size="sm"
          onClick={() => window.print()}
          className="h-8 px-3 text-xs"
          title="Print or Save as PDF"
        >
          <Printer className="h-3.5 w-3.5 mr-1.5" />
          <span>Print / PDF</span>
        </Button>
      </header>

      {/* Main Workspace Body: Left Sidebar + Canvas */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar: Resume Details & Skeleton View of 3 Templates */}
        <aside className="w-64 sm:w-72 lg:w-80 shrink-0 border-r border-border/60 bg-background/80 overflow-y-auto p-4 sm:p-5 space-y-5 print:hidden">
          {/* Back link */}
          <Link
            href="/dashboard/resumes"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-medium transition-colors"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span>Back to Resumes</span>
          </Link>

          {/* Resume Name & Document Info */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
                Resume Title
              </label>
              <input
                type="text"
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                placeholder="Untitled Resume"
                className="w-full text-xs font-semibold rounded-sm border border-border/60 bg-card px-2.5 py-1.5 text-foreground hover:border-border focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
                title="Rename document"
              />
            </div>

            {/* Candidate & Source Information Card */}
            <div className="rounded-sm border border-border/60 bg-card/50 p-2.5 space-y-2 text-xs">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-[11px]">Candidate:</span>
                <span className="font-semibold text-foreground truncate max-w-[140px]">
                  {basics.fullName || "Candidate"}
                </span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-[11px]">Source:</span>
                {selectedSourceId !== "sample" ? (
                  <Badge variant="outline" className="text-[10px] font-mono gap-1 text-custom border-custom/30 py-0 h-5">
                    <Database className="h-2.5 w-2.5" /> DB Synced
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px] font-mono gap-1 text-muted-foreground py-0 h-5">
                    Sample Data
                  </Badge>
                )}
              </div>

              {sources.length > 1 && (
                <div className="pt-2 border-t border-border/50 space-y-1">
                  <label className="text-[9px] font-mono uppercase text-muted-foreground block">
                    Switch Database Resume
                  </label>
                  <Select value={selectedSourceId} onValueChange={(val) => selectSource(val)}>
                    <SelectTrigger className="h-7 text-xs bg-background border-border/60">
                      <SelectValue placeholder="Select resume" />
                    </SelectTrigger>
                    <SelectContent>
                      {sources.map((s) => (
                        <SelectItem key={s.id} value={s.id} className="text-xs">
                          {s.title}
                        </SelectItem>
                      ))}
                      <SelectItem value="sample" className="text-xs">
                        Sample Template
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>

          <div className="h-px w-full bg-border/60" />

          {/* Skeleton View of 3 Templates */}
          <ResumeTemplateSkeletons
            selectedTemplate={selectedTemplate}
            onSelectTemplate={setSelectedTemplate}
          />
        </aside>

        {/* Center Canvas: Resume Document with Pinned Toolbar Directly Above */}
        <main className="flex-1 overflow-y-auto bg-muted/25 dark:bg-muted/10 p-3 sm:p-6 lg:p-8 flex flex-col items-center print:p-0 print:bg-white print:overflow-visible">
          {/* Main Document Unit: Toolbar + Resume Sheet with exact same width */}
          <div className="w-full max-w-[850px] flex flex-col print:max-w-none">
            {/* Tiptap Toolkit: Directly above resume with exact same width */}
            <div className="sticky top-0 z-20 w-full rounded-t-sm border border-border/70 border-b-border/40 bg-card shadow-xs print:hidden">
              <ResumeTopToolbar editor={activeEditor} activeSectionName={activeSectionName} />
            </div>

            {/* The Resume Document Sheet */}
            <article
              className={`relative min-h-[1080px] w-full rounded-b-sm border-x border-b border-border/70 bg-card px-8 py-10 text-card-foreground shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-2xl sm:px-14 sm:py-14 print:border-none print:shadow-none print:p-0 print:bg-white print:text-black ${
                selectedTemplate === "executive" ? "font-serif" : "font-sans"
              }`}
              aria-label="Resume Document Sheet"
            >
              {/* Header: Candidate Basics */}
              <header
                className={`border-b border-border/80 pb-5 ${
                  selectedTemplate === "executive"
                    ? "text-left border-b-2 border-foreground/30"
                    : "text-center"
                }`}
              >
                {/* Full Name */}
                <input
                  type="text"
                  value={basics.fullName || ""}
                  onChange={(e) => updateBasicsField("fullName", e.target.value)}
                  placeholder="Candidate Full Name"
                  className={`w-full bg-transparent text-3xl font-bold tracking-tight text-foreground outline-none placeholder:text-muted-foreground/30 hover:bg-muted/40 focus:bg-muted/25 rounded px-1 transition-colors ${
                    selectedTemplate === "executive" ? "text-left font-serif" : "text-center"
                  }`}
                />

                {/* Headline */}
                <input
                  type="text"
                  value={basics.headline || ""}
                  onChange={(e) => updateBasicsField("headline", e.target.value)}
                  placeholder="Professional Headline / Title"
                  className={`mt-1 w-full bg-transparent text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground outline-none placeholder:text-muted-foreground/30 hover:bg-muted/40 focus:bg-muted/25 rounded px-1 transition-colors ${
                    selectedTemplate === "executive" ? "text-left" : "text-center"
                  }`}
                />

                {/* Contact Information Bar */}
                <div
                  className={`mt-2.5 flex flex-wrap items-center gap-x-2 text-[11px] text-muted-foreground ${
                    selectedTemplate === "executive" ? "justify-start" : "justify-center"
                  }`}
                >
                  <input
                    type="text"
                    value={basics.email || ""}
                    onChange={(e) => updateBasicsField("email", e.target.value)}
                    placeholder="email@example.com"
                    className="bg-transparent outline-none hover:bg-muted/40 focus:bg-muted/25 rounded px-1 transition-colors"
                    style={{ width: `${Math.max(14, (basics.email || "").length + 2)}ch` }}
                  />
                  <span className="text-border">|</span>
                  <input
                    type="text"
                    value={basics.phone || ""}
                    onChange={(e) => updateBasicsField("phone", e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="bg-transparent outline-none hover:bg-muted/40 focus:bg-muted/25 rounded px-1 transition-colors"
                    style={{ width: `${Math.max(14, (basics.phone || "").length + 2)}ch` }}
                  />
                  <span className="text-border">|</span>
                  <input
                    type="text"
                    value={basics.location || ""}
                    onChange={(e) => updateBasicsField("location", e.target.value)}
                    placeholder="City, State"
                    className="bg-transparent outline-none hover:bg-muted/40 focus:bg-muted/25 rounded px-1 transition-colors"
                    style={{ width: `${Math.max(12, (basics.location || "").length + 2)}ch` }}
                  />

                  {(basics.links ?? []).map((link, idx) => {
                    const label = typeof link === "string" ? link : link.label || link.url;
                    const url = typeof link === "string" ? link : link.url;
                    return (
                      <React.Fragment key={idx}>
                        <span className="text-border">|</span>
                        <a
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-0.5 text-custom hover:underline"
                        >
                          {label}
                          <ExternalLink className="h-2.5 w-2.5 opacity-60" />
                        </a>
                      </React.Fragment>
                    );
                  })}
                </div>
              </header>

              {/* Section 1: Professional Summary (Tiptap Rich Text) */}
              <section className="mt-5">
                <h2
                  className={`mb-2 border-b border-border/80 pb-1 text-[11px] font-bold uppercase tracking-[0.14em] text-foreground ${
                    selectedTemplate === "executive" ? "font-serif text-xs border-foreground/30" : ""
                  }`}
                >
                  Professional Summary
                </h2>
                <ResumeEditableSection
                  content={resume.summary ? `<p>${resume.summary}</p>` : "<p></p>"}
                  onEditorReady={(ed) => {
                    if (!activeEditor) {
                      setActiveEditor(ed);
                      setActiveSectionName("Professional Summary");
                    }
                  }}
                  onFocus={(ed) => {
                    setActiveEditor(ed);
                    setActiveSectionName("Professional Summary");
                  }}
                  onChange={(html) => {
                    updateResumeData((prev) => ({
                      ...prev,
                      summary: html,
                    }));
                  }}
                  placeholder="Write a compelling executive summary…"
                />
              </section>

              {/* Section 2: Experience / Contribution (Tiptap Rich Text) */}
              <section className={selectedTemplate === "compact" ? "mt-4" : "mt-6"}>
                <div className="mb-2 flex items-center justify-between border-b border-border/80 pb-1">
                  <h2
                    className={`text-[11px] font-bold uppercase tracking-[0.14em] text-foreground ${
                      selectedTemplate === "executive" ? "font-serif text-xs border-foreground/30" : ""
                    }`}
                  >
                    Experience & Accomplishments
                  </h2>
                  <button
                    type="button"
                    onClick={addExperience}
                    className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground print:hidden cursor-pointer"
                    title="Add new role"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Add Role</span>
                  </button>
                </div>

                <div className={selectedTemplate === "compact" ? "space-y-3" : "space-y-4"}>
                  {(resume.experience ?? []).map((item, index) => (
                    <div key={index} className="group/item relative">
                      {/* Role Header */}
                      <div className="flex items-baseline justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-baseline gap-1.5">
                            <input
                              type="text"
                              value={item.role || ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                updateResumeData((prev) => {
                                  const list = [...(prev.experience ?? [])];
                                  list[index] = { ...list[index], role: val };
                                  return { ...prev, experience: list };
                                });
                              }}
                              placeholder="Role / Title"
                              className="bg-transparent font-bold text-foreground outline-none hover:bg-muted/40 focus:bg-muted/25 rounded px-0.5 transition-colors"
                              style={{ width: `${Math.max(12, (item.role || "").length + 1)}ch` }}
                            />
                            <span className="text-muted-foreground/50">·</span>
                            <input
                              type="text"
                              value={item.company || ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                updateResumeData((prev) => {
                                  const list = [...(prev.experience ?? [])];
                                  list[index] = { ...list[index], company: val };
                                  return { ...prev, experience: list };
                                });
                              }}
                              placeholder="Company Name"
                              className="bg-transparent font-semibold text-foreground/80 outline-none hover:bg-muted/40 focus:bg-muted/25 rounded px-0.5 transition-colors"
                              style={{ width: `${Math.max(10, (item.company || "").length + 1)}ch` }}
                            />
                            {item.location && (
                              <>
                                <span className="text-muted-foreground/50">·</span>
                                <input
                                  type="text"
                                  value={item.location}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    updateResumeData((prev) => {
                                      const list = [...(prev.experience ?? [])];
                                      list[index] = { ...list[index], location: val };
                                      return { ...prev, experience: list };
                                    });
                                  }}
                                  placeholder="Location"
                                  className="bg-transparent text-xs text-muted-foreground outline-none hover:bg-muted/40 focus:bg-muted/25 rounded px-0.5 transition-colors"
                                  style={{ width: `${Math.max(10, (item.location || "").length + 1)}ch` }}
                                />
                              </>
                            )}
                          </div>
                        </div>

                        {/* Dates & Delete */}
                        <div className="flex items-center gap-2">
                          <div className="text-right text-xs text-muted-foreground">
                            <input
                              type="text"
                              value={item.startDate || ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                updateResumeData((prev) => {
                                  const list = [...(prev.experience ?? [])];
                                  list[index] = { ...list[index], startDate: val };
                                  return { ...prev, experience: list };
                                });
                              }}
                              placeholder="Start"
                              className="w-12 bg-transparent text-right outline-none hover:bg-muted/40 focus:bg-muted/25 rounded px-0.5 transition-colors"
                            />
                            <span> — </span>
                            <input
                              type="text"
                              value={item.endDate || ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                updateResumeData((prev) => {
                                  const list = [...(prev.experience ?? [])];
                                  list[index] = { ...list[index], endDate: val };
                                  return { ...prev, experience: list };
                                });
                              }}
                              placeholder="End"
                              className="w-14 bg-transparent text-left outline-none hover:bg-muted/40 focus:bg-muted/25 rounded px-0.5 transition-colors"
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() => removeExperience(index)}
                            className="opacity-0 transition-opacity group-hover/item:opacity-100 text-muted-foreground hover:text-destructive p-1 rounded hover:bg-destructive/10 print:hidden cursor-pointer"
                            title="Delete role"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Accomplishments Bullets (Tiptap Rich Text Region) */}
                      <div className="mt-1">
                        <ResumeEditableSection
                          content={bulletsToHtml(item.bullets)}
                          onFocus={(ed) => {
                            setActiveEditor(ed);
                            setActiveSectionName(item.company ? `${item.company} bullets` : `Role ${index + 1} bullets`);
                          }}
                          onChange={(html) => {
                            const bullets = htmlToBullets(html);
                            updateResumeData((prev) => {
                              const list = [...(prev.experience ?? [])];
                              list[index] = { ...list[index], bullets };
                              return { ...prev, experience: list };
                            });
                          }}
                          placeholder="Add key accomplishments…"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Section 3: Technical Skills (Tiptap Rich Text) */}
              <section className={selectedTemplate === "compact" ? "mt-4" : "mt-6"}>
                <h2
                  className={`mb-2 border-b border-border/80 pb-1 text-[11px] font-bold uppercase tracking-[0.14em] text-foreground ${
                    selectedTemplate === "executive" ? "font-serif text-xs border-foreground/30" : ""
                  }`}
                >
                  Skills & Technologies
                </h2>
                <div className="space-y-1.5 text-[13px] leading-relaxed">
                  {(resume.skills ?? []).map((skillGroup, idx) => {
                    if (typeof skillGroup === "string") {
                      return (
                        <div key={idx} className="text-foreground/90">
                          {skillGroup}
                        </div>
                      );
                    }
                    return (
                      <div key={idx} className="flex flex-wrap items-baseline gap-1.5">
                        <span className="font-bold text-foreground">{skillGroup.category}:</span>
                        <ResumeEditableSection
                          content={`<p>${skillGroup.skills.join(", ")}</p>`}
                          onFocus={(ed) => {
                            setActiveEditor(ed);
                            setActiveSectionName(`Skills (${skillGroup.category})`);
                          }}
                          onChange={(html) => {
                            const cleanText = html.replace(/<[^>]*>/g, "").trim();
                            const skills = cleanText.split(",").map((s) => s.trim()).filter(Boolean);
                            updateResumeData((prev) => {
                              const list = [...(prev.skills ?? [])];
                              list[idx] = { category: skillGroup.category, skills };
                              return { ...prev, skills: list };
                            });
                          }}
                          className="inline-block"
                        />
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Section 4: Projects (Tiptap Rich Text) */}
              {(resume.projects ?? []).length > 0 && (
                <section className={selectedTemplate === "compact" ? "mt-4" : "mt-6"}>
                  <h2
                    className={`mb-2 border-b border-border/80 pb-1 text-[11px] font-bold uppercase tracking-[0.14em] text-foreground ${
                      selectedTemplate === "executive" ? "font-serif text-xs border-foreground/30" : ""
                    }`}
                  >
                    Projects
                  </h2>
                  <div className="space-y-3">
                    {(resume.projects ?? []).map((project, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex items-baseline justify-between gap-4">
                          <div className="flex items-baseline gap-2">
                            <span className="font-bold text-foreground">{project.name}</span>
                            {project.link && (
                              <a
                                href={project.link}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs text-custom hover:underline inline-flex items-center gap-0.5"
                              >
                                {project.link}
                                <ExternalLink className="h-2.5 w-2.5 opacity-60" />
                              </a>
                            )}
                          </div>
                        </div>

                        {project.description && (
                          <p className="text-[13px] italic text-muted-foreground">{project.description}</p>
                        )}

                        {project.bullets && project.bullets.length > 0 && (
                          <ResumeEditableSection
                            content={bulletsToHtml(project.bullets)}
                            onFocus={(ed) => {
                              setActiveEditor(ed);
                              setActiveSectionName(`Project: ${project.name || index + 1}`);
                            }}
                            onChange={(html) => {
                              const bullets = htmlToBullets(html);
                              updateResumeData((prev) => {
                                const list = [...(prev.projects ?? [])];
                                list[index] = { ...list[index], bullets };
                                return { ...prev, projects: list };
                              });
                            }}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Section 5: Education (Tiptap Rich Text) */}
              <section className={selectedTemplate === "compact" ? "mt-4" : "mt-6"}>
                <div className="mb-2 flex items-center justify-between border-b border-border/80 pb-1">
                  <h2
                    className={`text-[11px] font-bold uppercase tracking-[0.14em] text-foreground ${
                      selectedTemplate === "executive" ? "font-serif text-xs border-foreground/30" : ""
                    }`}
                  >
                    Education
                  </h2>
                  <button
                    type="button"
                    onClick={addEducation}
                    className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground print:hidden cursor-pointer"
                    title="Add education"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Add Education</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {(resume.education ?? []).map((item, index) => (
                    <div key={index} className="group/edu flex items-baseline justify-between gap-4">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={item.institution || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateResumeData((prev) => {
                              const list = [...(prev.education ?? [])];
                              list[index] = { ...list[index], institution: val };
                              return { ...prev, education: list };
                            });
                          }}
                          placeholder="Institution Name"
                          className="bg-transparent font-bold text-foreground outline-none hover:bg-muted/40 focus:bg-muted/25 rounded px-0.5 transition-colors"
                          style={{ width: `${Math.max(16, (item.institution || "").length + 1)}ch` }}
                        />
                        <div className="text-xs text-muted-foreground">
                          <input
                            type="text"
                            value={item.degree || ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              updateResumeData((prev) => {
                                const list = [...(prev.education ?? [])];
                                list[index] = { ...list[index], degree: val };
                                return { ...prev, education: list };
                              });
                            }}
                            placeholder="Degree"
                            className="bg-transparent outline-none hover:bg-muted/40 focus:bg-muted/25 rounded px-0.5 transition-colors"
                            style={{ width: `${Math.max(12, (item.degree || "").length + 1)}ch` }}
                          />
                          {item.field && (
                            <>
                              <span>, </span>
                              <input
                                type="text"
                                value={item.field}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  updateResumeData((prev) => {
                                    const list = [...(prev.education ?? [])];
                                    list[index] = { ...list[index], field: val };
                                    return { ...prev, education: list };
                                  });
                                }}
                                placeholder="Field of study"
                                className="bg-transparent outline-none hover:bg-muted/40 focus:bg-muted/25 rounded px-0.5 transition-colors"
                                style={{ width: `${Math.max(12, (item.field || "").length + 1)}ch` }}
                              />
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="text-right text-xs text-muted-foreground">
                          <span>{item.startDate ? `${item.startDate} — ` : ""}</span>
                          <span>{item.endDate}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeEducation(index)}
                          className="opacity-0 transition-opacity group-hover/edu:opacity-100 text-muted-foreground hover:text-destructive p-1 rounded hover:bg-destructive/10 print:hidden cursor-pointer"
                          title="Delete education"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Section 6: Certifications */}
              {(resume.certifications ?? []).length > 0 && (
                <section className={selectedTemplate === "compact" ? "mt-4" : "mt-6"}>
                  <h2
                    className={`mb-2 border-b border-border/80 pb-1 text-[11px] font-bold uppercase tracking-[0.14em] text-foreground ${
                      selectedTemplate === "executive" ? "font-serif text-xs border-foreground/30" : ""
                    }`}
                  >
                    Certifications
                  </h2>
                  <div className="space-y-1.5">
                    {(resume.certifications ?? []).map((item, index) => (
                      <div key={index} className="flex items-baseline justify-between text-xs">
                        <div>
                          <strong className="text-foreground">{item.name}</strong>
                          {item.issuer ? <span className="text-muted-foreground"> · {item.issuer}</span> : ""}
                        </div>
                        <span className="text-muted-foreground">{item.date}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </article>
          </div>
        </main>
      </div>

      {/* Structured Resume JSON Inspector Dialog */}
      <Dialog open={showJsonModal} onOpenChange={setShowJsonModal}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden border-border bg-card">
          <DialogHeader className="px-5 py-3.5 border-b border-border/60">
            <div className="flex items-center justify-between pr-6">
              <div className="flex items-center gap-2">
                <Code2 className="h-4 w-4 text-custom" />
                <DialogTitle className="text-sm font-semibold text-foreground">Live Resume JSON</DialogTitle>
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleCopyJson}
                className="h-7 text-xs"
              >
                {copiedJson ? (
                  <>
                    <Check className="h-3 w-3 mr-1 text-emerald-500" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3 mr-1" /> Copy JSON
                  </>
                )}
              </Button>
            </div>
            <DialogDescription className="text-xs text-muted-foreground">
              Real-time structured JSON synced directly with PostgreSQL and your in-place edits.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-auto p-4 bg-muted/20">
            <pre className="rounded-sm bg-muted/50 p-4 text-[11.5px] font-mono text-foreground overflow-auto border border-border/60 leading-relaxed max-h-[60vh]">
              {JSON.stringify(resume, null, 2)}
            </pre>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ResumeDocEditor;
