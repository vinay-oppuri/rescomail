"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Check,
  Cloud,
  CloudUpload,
  RotateCcw,
  Code2,
  Printer,
  Plus,
  Trash2,
  ExternalLink,
  ChevronLeft,
  FileText,
  Sparkles,
  Loader2,
  Database,
} from "lucide-react";
import type { Editor } from "@tiptap/react";
import {
  resumeDataFromParsedJson,
  type ResumeData,
  type ResumeExperience,
  type ResumeEducation,
  type ResumeProject,
} from "../../pdf/resume-pdf";
import { getParsedResumesAction, updateResumeParsedJsonAction } from "@/modules/resumes/server/actions";
import { SAMPLE_RESUME_DATA, fetchResume, updateResume } from "./sample-resume";
import { ResumeEditableSection } from "./resume-editable-section";
import { ResumeTopToolbar } from "./resume-top-toolbar";

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
  const [resume, setResume] = useState<ResumeData>(SAMPLE_RESUME_DATA);
  const [docTitle, setDocTitle] = useState("Elena Rostova – Resume");
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");
  const [lastSavedTime, setLastSavedTime] = useState<string>("");
  const [savedDestination, setSavedDestination] = useState<"database" | "cloud">("cloud");
  const [showJsonModal, setShowJsonModal] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);

  // Active Tiptap editor reference for top toolbar controls
  const [activeEditor, setActiveEditor] = useState<Editor | null>(null);
  const [activeSectionName, setActiveSectionName] = useState<string>("Professional Summary");

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. On load, fetch parsed resume JSON from database or sample
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
              setSavedDestination("database");
              setSaveStatus("saved");
              setLastSavedTime("Just now");
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
          setSavedDestination("cloud");
          setSaveStatus("saved");
          setLastSavedTime("Just now");
        }
      } catch (err) {
        console.error("Failed to load resume JSON:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [dbResumes, initialResumeId]);

  // Switch between database resumes or sample
  const selectSource = (sourceId: string) => {
    setSelectedSourceId(sourceId);
    if (sourceId === "sample") {
      setResume(SAMPLE_RESUME_DATA);
      setDocTitle(`${SAMPLE_RESUME_DATA.basics?.fullName} – Resume`);
      setSavedDestination("cloud");
      setSaveStatus("saved");
      setLastSavedTime("Just now");
      return;
    }
    const source = sources.find((item) => item.id === sourceId);
    if (source && source.parsedJson) {
      const parsedData = resumeDataFromParsedJson(source.parsedJson);
      setResume(parsedData);
      const name = parsedData.basics?.fullName || source.title;
      setDocTitle(`${name} – Resume`);
      setSavedDestination("database");
      setSaveStatus("saved");
      setLastSavedTime("Just now");
    }
  };

  // 5. Debounce persistence: save updated content after typing pause
  const triggerDebouncedSave = useCallback((updated: ResumeData) => {
    setSaveStatus("unsaved");
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(async () => {
      setSaveStatus("saving");
      try {
        if (selectedSourceId && selectedSourceId !== "sample") {
          const res = await updateResumeParsedJsonAction(selectedSourceId, updated);
          if (res.success) {
            setSaveStatus("saved");
            setSavedDestination("database");
            setLastSavedTime(
              new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
            );
          } else {
            setSaveStatus("unsaved");
          }
        } else {
          const res = await updateResume(updated);
          setSaveStatus("saved");
          setSavedDestination("cloud");
          setLastSavedTime(res.updatedAt);
        }
      } catch (error) {
        console.error("Failed to persist resume update:", error);
        setSaveStatus("unsaved");
      }
    }, 1000);
  }, [selectedSourceId]);

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

  // Header inline field updater
  const updateBasicsField = (field: keyof NonNullable<ResumeData["basics"]>, value: string) => {
    updateResumeData((prev) => ({
      ...prev,
      basics: {
        ...prev.basics,
        [field]: value,
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
          company: "Acme Corp",
          location: "Remote / Hybrid",
          startDate: "2024",
          endDate: "Present",
          bullets: ["Spearheaded development of mission-critical cloud platform."],
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
          institution: "New University",
          degree: "B.S. in Computer Science",
          startDate: "2018",
          endDate: "2022",
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

  // Reset sample data
  const handleResetSample = () => {
    const clone = JSON.parse(JSON.stringify(SAMPLE_RESUME_DATA));
    setResume(clone);
    setDocTitle(`${clone.basics?.fullName} – Resume`);
    triggerDebouncedSave(clone);
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(resume, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const basics = resume.basics ?? {};

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-100 text-slate-600">
        <Loader2 className="h-8 w-8 animate-spin text-slate-700" />
        <p className="mt-3 text-sm font-medium text-slate-700">Loading formatted resume document…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-100 text-slate-900">
      {/* Google Docs Top Bar */}
      <header className="sticky top-0 z-40 border-b border-slate-200/90 bg-white/95 backdrop-blur-md px-4 py-2.5 sm:px-6">
        <div className="mx-auto flex max-w-[1300px] flex-wrap items-center justify-between gap-3">
          {/* Left: Document info */}
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/resumes"
              className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
              title="Return to resumes"
            >
              <ChevronLeft className="h-4 w-4" />
            </Link>

            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-blue-600 text-white shadow-sm">
              <FileText className="h-5 w-5" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  className="rounded px-1.5 py-0.5 text-sm font-semibold text-slate-900 hover:bg-slate-100 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  title="Rename document"
                />

                {sources.length > 0 && (
                  <div className="flex items-center gap-1 rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs text-slate-700">
                    <Database className="h-3 w-3 text-blue-600" />
                    <select
                      value={selectedSourceId}
                      onChange={(e) => selectSource(e.target.value)}
                      className="bg-transparent text-[11px] font-semibold text-slate-800 outline-none cursor-pointer"
                      title="Select resume from database"
                    >
                      {sources.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.title} (DB)
                        </option>
                      ))}
                      <option value="sample">Sample Resume</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Autosave status indicator */}
              <div className="flex items-center gap-1.5 px-1.5 text-[11px] text-slate-500">
                {saveStatus === "saving" && (
                  <span className="flex items-center gap-1 text-amber-600">
                    <CloudUpload className="h-3 w-3 animate-pulse" />
                    <span>Saving to {savedDestination === "database" ? "database" : "cloud"}…</span>
                  </span>
                )}
                {saveStatus === "saved" && (
                  <span className="flex items-center gap-1 text-emerald-600">
                    <Check className="h-3 w-3 font-bold" />
                    <span>
                      All changes saved to {savedDestination === "database" ? "database" : "cloud"}{" "}
                      {lastSavedTime ? `(${lastSavedTime})` : ""}
                    </span>
                  </span>
                )}
                {saveStatus === "unsaved" && (
                  <span className="flex items-center gap-1 text-slate-400">
                    <Cloud className="h-3 w-3" />
                    <span>Unsaved edits…</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetSample}
              className="flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 shadow-xs transition-colors hover:bg-slate-50 hover:text-slate-900"
              title="Reset to initial sample data"
            >
              <RotateCcw className="h-3.5 w-3.5 text-slate-500" />
              <span className="hidden sm:inline">Reset Sample</span>
            </button>

            <button
              type="button"
              onClick={() => setShowJsonModal(true)}
              className="flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 shadow-xs transition-colors hover:bg-slate-50 hover:text-slate-900"
              title="Inspect structured resume JSON"
            >
              <Code2 className="h-3.5 w-3.5 text-blue-600" />
              <span>Resume JSON</span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="flex h-8 items-center gap-1.5 rounded-md bg-slate-900 px-3 text-xs font-medium text-white shadow-xs transition-colors hover:bg-slate-800"
              title="Print or Save as PDF"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print / PDF</span>
            </button>
          </div>
        </div>
      </header>
      
      {/* Google Docs-style top formatting toolbar (Always visible at top of document) */}
      <ResumeTopToolbar editor={activeEditor} activeSectionName={activeSectionName} />

      {/* Editor Canvas Workspace */}
      <main className="flex-1 overflow-y-auto px-3 py-6 sm:px-6 sm:py-8 lg:py-10">
        <div className="mx-auto max-w-[850px]">
          {/* Subtle Tip Banner */}
          <div className="mb-4 flex items-center justify-between rounded-lg border border-blue-100 bg-blue-50/70 px-4 py-2 text-xs text-blue-800 shadow-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 shrink-0 text-blue-600" />
              <span>
                <strong>Direct Document Editing:</strong> Click into any text or bullet to edit. Highlight any phrase to invoke the floating <strong>Bold, Italic, Underline, Heading & List</strong> menu.
              </span>
            </div>
          </div>

          {/* The Resume Document Sheet */}
          <article
            className="relative min-h-[1080px] w-full rounded-xs border border-slate-200/90 bg-white px-8 py-10 text-slate-800 shadow-[0_10px_35px_rgba(15,23,42,0.08),0_1px_3px_rgba(15,23,42,0.04)] sm:px-14 sm:py-14"
            aria-label="Google Docs Resume Document"
          >
            {/* Header: Candidate Basics */}
            <header className="border-b border-slate-300 pb-5 text-center">
              {/* Full Name */}
              <input
                type="text"
                value={basics.fullName || ""}
                onChange={(e) => updateBasicsField("fullName", e.target.value)}
                placeholder="Candidate Full Name"
                className="w-full bg-transparent text-center text-3xl font-bold tracking-tight text-slate-900 outline-none placeholder:text-slate-300 hover:bg-slate-50/50 focus:bg-transparent"
              />

              {/* Headline */}
              <input
                type="text"
                value={basics.headline || ""}
                onChange={(e) => updateBasicsField("headline", e.target.value)}
                placeholder="Professional Headline / Title"
                className="mt-1 w-full bg-transparent text-center text-xs font-semibold uppercase tracking-[0.16em] text-slate-600 outline-none placeholder:text-slate-300 hover:bg-slate-50/50 focus:bg-transparent"
              />

              {/* Contact Information Bar */}
              <div className="mt-2.5 flex flex-wrap items-center justify-center gap-x-2 text-[11px] text-slate-600">
                <input
                  type="text"
                  value={basics.email || ""}
                  onChange={(e) => updateBasicsField("email", e.target.value)}
                  placeholder="email@example.com"
                  className="bg-transparent text-center outline-none hover:bg-slate-50/50 focus:bg-transparent"
                  style={{ width: `${Math.max(14, (basics.email || "").length + 2)}ch` }}
                />
                <span className="text-slate-300">|</span>
                <input
                  type="text"
                  value={basics.phone || ""}
                  onChange={(e) => updateBasicsField("phone", e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="bg-transparent text-center outline-none hover:bg-slate-50/50 focus:bg-transparent"
                  style={{ width: `${Math.max(14, (basics.phone || "").length + 2)}ch` }}
                />
                <span className="text-slate-300">|</span>
                <input
                  type="text"
                  value={basics.location || ""}
                  onChange={(e) => updateBasicsField("location", e.target.value)}
                  placeholder="City, State"
                  className="bg-transparent text-center outline-none hover:bg-slate-50/50 focus:bg-transparent"
                  style={{ width: `${Math.max(12, (basics.location || "").length + 2)}ch` }}
                />

                {(basics.links ?? []).map((link, idx) => {
                  const label = typeof link === "string" ? link : link.label || link.url;
                  const url = typeof link === "string" ? link : link.url;
                  return (
                    <React.Fragment key={idx}>
                      <span className="text-slate-300">|</span>
                      <a
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-0.5 text-blue-600 hover:underline"
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
              <h2 className="mb-2 border-b border-slate-300 pb-1 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-900">
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
            <section className="mt-6">
              <div className="mb-2 flex items-center justify-between border-b border-slate-300 pb-1">
                <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-900">
                  Experience & Accomplishments
                </h2>
                <button
                  type="button"
                  onClick={addExperience}
                  className="flex items-center gap-1 text-[10px] font-semibold text-blue-600 hover:text-blue-800"
                  title="Add new role"
                >
                  <Plus className="h-3 w-3" />
                  <span>Add Role</span>
                </button>
              </div>

              <div className="space-y-4">
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
                            className="bg-transparent font-bold text-slate-900 outline-none hover:bg-slate-50/50"
                            style={{ width: `${Math.max(12, (item.role || "").length + 1)}ch` }}
                          />
                          <span className="text-slate-400">·</span>
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
                            className="bg-transparent font-semibold text-slate-700 outline-none hover:bg-slate-50/50"
                            style={{ width: `${Math.max(10, (item.company || "").length + 1)}ch` }}
                          />
                          {item.location && (
                            <>
                              <span className="text-slate-400">·</span>
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
                                className="bg-transparent text-xs text-slate-500 outline-none hover:bg-slate-50/50"
                                style={{ width: `${Math.max(10, (item.location || "").length + 1)}ch` }}
                              />
                            </>
                          )}
                        </div>
                      </div>

                      {/* Dates & Delete */}
                      <div className="flex items-center gap-2">
                        <div className="text-right text-xs text-slate-500">
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
                            className="w-12 bg-transparent text-right outline-none hover:bg-slate-50/50"
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
                            className="w-14 bg-transparent text-left outline-none hover:bg-slate-50/50"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => removeExperience(index)}
                          className="opacity-0 transition-opacity group-hover/item:opacity-100 text-slate-400 hover:text-red-600"
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
            <section className="mt-6">
              <h2 className="mb-2 border-b border-slate-300 pb-1 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-900">
                Skills & Technologies
              </h2>
              <div className="space-y-1.5 text-[13px] leading-relaxed">
                {(resume.skills ?? []).map((skillGroup, idx) => {
                  if (typeof skillGroup === "string") {
                    return (
                      <div key={idx} className="text-slate-800">
                        {skillGroup}
                      </div>
                    );
                  }
                  return (
                    <div key={idx} className="flex flex-wrap items-baseline gap-1.5">
                      <span className="font-bold text-slate-900">{skillGroup.category}:</span>
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
              <section className="mt-6">
                <h2 className="mb-2 border-b border-slate-300 pb-1 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-900">
                  Projects
                </h2>
                <div className="space-y-3">
                  {(resume.projects ?? []).map((project, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex items-baseline justify-between gap-4">
                        <div className="flex items-baseline gap-2">
                          <span className="font-bold text-slate-900">{project.name}</span>
                          {project.link && (
                            <a
                              href={project.link}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-blue-600 hover:underline"
                            >
                              {project.link}
                            </a>
                          )}
                        </div>
                      </div>

                      {project.description && (
                        <p className="text-[13px] italic text-slate-600">{project.description}</p>
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
            <section className="mt-6">
              <div className="mb-2 flex items-center justify-between border-b border-slate-300 pb-1">
                <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-900">
                  Education
                </h2>
                <button
                  type="button"
                  onClick={addEducation}
                  className="flex items-center gap-1 text-[10px] font-semibold text-blue-600 hover:text-blue-800"
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
                        className="bg-transparent font-bold text-slate-900 outline-none hover:bg-slate-50/50"
                        style={{ width: `${Math.max(16, (item.institution || "").length + 1)}ch` }}
                      />
                      <div className="text-xs text-slate-600">
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
                          className="bg-transparent outline-none hover:bg-slate-50/50"
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
                              className="bg-transparent outline-none hover:bg-slate-50/50"
                              style={{ width: `${Math.max(12, (item.field || "").length + 1)}ch` }}
                            />
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-right text-xs text-slate-500">
                        <span>{item.startDate ? `${item.startDate} — ` : ""}</span>
                        <span>{item.endDate}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeEducation(index)}
                        className="opacity-0 transition-opacity group-hover/edu:opacity-100 text-slate-400 hover:text-red-600"
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
              <section className="mt-6">
                <h2 className="mb-2 border-b border-slate-300 pb-1 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-900">
                  Certifications
                </h2>
                <div className="space-y-1.5">
                  {(resume.certifications ?? []).map((item, index) => (
                    <div key={index} className="flex items-baseline justify-between text-xs">
                      <div>
                        <strong className="text-slate-900">{item.name}</strong>
                        {item.issuer ? <span className="text-slate-500"> · {item.issuer}</span> : ""}
                      </div>
                      <span className="text-slate-500">{item.date}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </article>
        </div>
      </main>

      {/* Structured Resume JSON Inspector Modal */}
      {showJsonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-xl border border-slate-700 bg-slate-900 text-slate-100 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 px-5 py-3">
              <div className="flex items-center gap-2">
                <Code2 className="h-4 w-4 text-blue-400" />
                <h3 className="text-sm font-semibold">Live Resume JSON Data</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyJson}
                  className="rounded bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-200 hover:bg-slate-700"
                >
                  {copiedJson ? "Copied!" : "Copy JSON"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowJsonModal(false)}
                  className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <pre className="rounded-lg bg-slate-950 p-4 text-[12px] font-mono text-emerald-400">
                {JSON.stringify(resume, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeDocEditor;
