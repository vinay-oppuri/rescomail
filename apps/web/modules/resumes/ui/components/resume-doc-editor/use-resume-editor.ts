"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { Editor } from "@tiptap/react";
import {
  resumeDataFromParsedJson,
  type ResumeData,
} from "../../pdf/resume-pdf";
import {
  getParsedResumesAction,
  updateResumeParsedJsonAction,
} from "@/modules/resumes/server/actions";
import { SAMPLE_RESUME_DATA, fetchResume, updateResume } from "./sample-resume";
import type { DbResumeSource, ResumeTemplateId } from "./types";

interface UseResumeEditorProps {
  dbResumes?: DbResumeSource[];
  initialResumeId?: string;
}

export function useResumeEditor({
  dbResumes = [],
  initialResumeId,
}: UseResumeEditorProps) {
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

  const [activeEditor, setActiveEditor] = useState<Editor | null>(null);
  const [activeSectionName, setActiveSectionName] = useState<string>("Professional Summary");

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Fetch initial resume from DB or sample
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

  // 2. Switch between DB resume or sample
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

  // 3. Debounced auto-save
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

  const updateBasicsField = (field: keyof NonNullable<ResumeData["basics"]>, val: string) => {
    updateResumeData((prev) => ({
      ...prev,
      basics: {
        ...(prev.basics ?? {}),
        [field]: val,
      },
    }));
  };

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

  return {
    loading,
    sources,
    selectedSourceId,
    selectSource,
    selectedTemplate,
    setSelectedTemplate,
    resume,
    setResume,
    docTitle,
    setDocTitle,
    activeEditor,
    setActiveEditor,
    activeSectionName,
    setActiveSectionName,
    updateResumeData,
    updateBasicsField,
    addExperience,
    removeExperience,
    addEducation,
    removeEducation,
  };
}
