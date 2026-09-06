"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Download, Loader2, Plus, Trash2 } from "lucide-react";

import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Textarea } from "@repo/ui/components/textarea";

import {
  createResumePdf,
  downloadResumePdf,
  resumeDataFromParsedJson,
  type ResumeData,
  type ResumeEducation,
  type ResumeExperience,
  type ResumeCertification,
  type ResumeProject,
} from "../pdf/resume-pdf";

type ParsedResumeSource = { id: string; title: string; parsedJson: unknown };

const initialResume: ResumeData = {
  basics: {
    fullName: "Avery Patel",
    headline: "Senior Product Designer",
    email: "avery.patel@example.com",
    phone: "+1 555 010 2026",
    location: "New York, NY",
    links: [{ label: "Portfolio", url: "https://averypatel.design" }, { label: "LinkedIn", url: "https://linkedin.com/in/averypatel" }],
  },
  summary: "Product designer with eight years of experience shaping clear, accessible B2B software experiences. I turn complicated workflows into focused, measurable products in close partnership with customers and engineering teams.",
  experience: [
    { company: "Acme", role: "Senior Product Designer", location: "New York, NY", startDate: "2022", endDate: "Present", bullets: ["Led end-to-end design for a workflow used by more than 20,000 customers.", "Partnered with engineering and research to improve activation by 18%." ] },
    { company: "Northstar", role: "Product Designer", location: "Brooklyn, NY", startDate: "2019", endDate: "2022", bullets: ["Built and maintained a cross-platform design system adopted by four product teams."] },
  ],
  education: [{ institution: "State University", degree: "BFA", field: "Interaction Design", startDate: "2012", endDate: "2016" }],
  skills: [{ category: "Design", skills: ["Figma", "Prototyping", "Design systems"] }, { category: "Research", skills: ["Usability testing", "Interviews", "Journey mapping"] }],
  projects: [{ name: "Volunteer onboarding", description: "A self-serve onboarding experience for a community platform.", bullets: ["Reduced time to first contribution by 32%."], link: "https://example.com" }],
  certifications: [{ name: "Certified Accessibility Professional", issuer: "IAAP", date: "2024" }],
};

const text = (value?: string) => value?.trim() ?? "";
const join = (...parts: Array<string | undefined>) => parts.map(text).filter(Boolean).join(" · ");
const dates = (start?: string, end?: string) => join(start, end).replace(" · ", " — ");

type FieldProps = { label: string; value?: string; onChange: (value: string) => void; placeholder?: string };

const Field = ({ label, value, onChange, placeholder }: FieldProps) => (
  <label className="grid gap-1.5">
    <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
    <Input value={value ?? ""} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
  </label>
);

const EditorSection = ({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) => (
  <section className="border-b border-border/60 px-4 py-5 last:border-b-0">
    <div className="mb-4">
      <h2 className="text-sm font-semibold">{title}</h2>
      {description ? <p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p> : null}
    </div>
    <div className="space-y-3">{children}</div>
  </section>
);

const ResumePreview = ({ resume }: { resume: ResumeData }) => {
  const basics = resume.basics ?? {};
  const links = (basics.links ?? []).map((link) => typeof link === "string" ? link : link.label || link.url).filter(Boolean);
  const skills = resume.skills ?? [];

  return (
    <article className="min-h-[800px] w-full bg-white px-8 py-9 text-slate-800 shadow-[0_16px_50px_rgba(15,23,42,0.12)] sm:px-12 sm:py-12" aria-label="Resume preview">
      <header className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{basics.fullName || basics.name || "Your name"}</h1>
        {(basics.headline || basics.title) ? <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-700">{basics.headline || basics.title}</p> : null}
        <p className="mt-3 text-[10px] leading-5 text-slate-500">{[basics.email, basics.phone, basics.location, ...links].filter(Boolean).join("  |  ")}</p>
      </header>
      <PreviewSection title="Professional Summary" visible={Boolean(text(resume.summary))}><p>{resume.summary}</p></PreviewSection>
      <PreviewSection title="Experience" visible={Boolean(resume.experience?.length)}>
        {(resume.experience ?? []).map((item, index) => <PreviewExperience key={index} item={item} />)}
      </PreviewSection>
      <PreviewSection title="Education" visible={Boolean(resume.education?.length)}>
        {(resume.education ?? []).map((item, index) => <PreviewEducation key={index} item={item} />)}
      </PreviewSection>
      <PreviewSection title="Skills" visible={Boolean(skills.length)}>
        {skills.map((skill, index) => typeof skill === "string" ? <p key={index}>{skill}</p> : <p key={index}><strong>{skill.category}:</strong> {skill.skills.join(", ")}</p>)}
      </PreviewSection>
      <PreviewSection title="Projects" visible={Boolean(resume.projects?.length)}>
        {(resume.projects ?? []).map((item, index) => <PreviewProject key={index} item={item} />)}
      </PreviewSection>
      <PreviewSection title="Certifications" visible={Boolean(resume.certifications?.length)}>
        {(resume.certifications ?? []).map((item, index) => <div className="flex justify-between gap-4" key={index}><p><strong>{item.name}</strong>{item.issuer ? ` · ${item.issuer}` : ""}</p><span className="shrink-0 text-slate-500">{item.date}</span></div>)}
      </PreviewSection>
    </article>
  );
};

const PreviewSection = ({ title, visible, children }: { title: string; visible: boolean; children: React.ReactNode }) => !visible ? null : (
  <section className="mt-6 text-[10px] leading-[1.65] text-slate-700">
    <h2 className="mb-2 border-b border-slate-200 pb-1 text-[10px] font-bold uppercase tracking-[0.13em] text-slate-900">{title}</h2>
    <div className="space-y-2">{children}</div>
  </section>
);

const PreviewExperience = ({ item }: { item: ResumeExperience }) => (
  <div className="break-inside-avoid pt-1">
    <div className="flex items-start justify-between gap-4"><div><p className="font-bold text-slate-900">{join(item.role, item.company)}</p><p className="text-slate-500">{join(item.company && item.role ? item.company : undefined, item.location)}</p></div><p className="shrink-0 text-right text-slate-500">{dates(item.startDate, item.endDate)}</p></div>
    {(item.bullets ?? []).filter(text).length ? <ul className="mt-1 list-disc space-y-0.5 pl-4">{item.bullets?.filter(text).map((bullet, index) => <li key={index}>{bullet}</li>)}</ul> : null}
  </div>
);

const PreviewEducation = ({ item }: { item: ResumeEducation }) => <div className="flex justify-between gap-4 break-inside-avoid"><div><p className="font-bold text-slate-900">{item.institution}</p><p className="text-slate-500">{join(item.degree, item.field).replace(" · ", ", ")}</p></div><p className="shrink-0 text-slate-500">{dates(item.startDate, item.endDate)}</p></div>;
const PreviewProject = ({ item }: { item: ResumeProject }) => <div className="break-inside-avoid"><p className="font-bold text-slate-900">{item.name}</p>{item.description ? <p>{item.description}</p> : null}{(item.bullets ?? []).filter(text).length ? <ul className="list-disc pl-4">{item.bullets?.filter(text).map((bullet, index) => <li key={index}>{bullet}</li>)}</ul> : null}</div>;

const ResumeGeneratorView = ({ sourceResumes }: { sourceResumes: ParsedResumeSource[] }) => {
  const [selectedSourceId, setSelectedSourceId] = useState(sourceResumes[0]?.id ?? "sample");
  const [resume, setResume] = useState<ResumeData>(() => sourceResumes[0] ? resumeDataFromParsedJson(sourceResumes[0].parsedJson) : initialResume);
  const [isGenerating, setIsGenerating] = useState(false);
  const basics = resume.basics ?? {};

  const updateBasics = (key: keyof NonNullable<ResumeData["basics"]>, value: string) => setResume((current) => ({ ...current, basics: { ...current.basics, [key]: value } }));
  const updateList = <T,>(key: "experience" | "education" | "projects", index: number, field: keyof T, value: string) => setResume((current) => {
    const items = [...((current[key] ?? []) as T[])];
    items[index] = { ...items[index], [field]: value } as T;
    return { ...current, [key]: items };
  });
  const removeList = (key: "experience" | "education" | "projects", index: number) => setResume((current) => ({ ...current, [key]: (current[key] ?? []).filter((_, itemIndex) => itemIndex !== index) }));
  const addExperience = () => setResume((current) => ({ ...current, experience: [...(current.experience ?? []), { company: "", role: "", bullets: [] }] }));
  const addEducation = () => setResume((current) => ({ ...current, education: [...(current.education ?? []), { institution: "", degree: "" }] }));
  const addProject = () => setResume((current) => ({ ...current, projects: [...(current.projects ?? []), { name: "", description: "", bullets: [] }] }));
  const updateCertification = (index: number, field: keyof ResumeCertification, value: string) => setResume((current) => {
    const items = [...(current.certifications ?? [])];
    items[index] = { ...items[index], [field]: value };
    return { ...current, certifications: items };
  });
  const addCertification = () => setResume((current) => ({ ...current, certifications: [...(current.certifications ?? []), { name: "", issuer: "", date: "" }] }));
  const removeCertification = (index: number) => setResume((current) => ({ ...current, certifications: (current.certifications ?? []).filter((_, itemIndex) => itemIndex !== index) }));
  const updateBullets = (key: "experience" | "projects", index: number, value: string) => setResume((current) => {
    const bullets = value.split("\n").map(text).filter(Boolean);
    if (key === "experience") {
      const items = [...(current.experience ?? [])];
      items[index] = { ...items[index], bullets };
      return { ...current, experience: items };
    }
    const items = [...(current.projects ?? [])];
    items[index] = { ...items[index], bullets };
    return { ...current, projects: items };
  });

  const generate = async () => {
    setIsGenerating(true);
    try {
      const bytes = await createResumePdf(resume);
      const name = (basics.fullName || basics.name || "resume").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      downloadResumePdf(bytes, `${name || "resume"}.pdf`);
    } finally {
      setIsGenerating(false);
    }
  };

  const selectSource = (sourceId: string) => {
    setSelectedSourceId(sourceId);
    if (sourceId === "sample") {
      setResume(initialResume);
      return;
    }
    const source = sourceResumes.find((item) => item.id === sourceId);
    if (source) setResume(resumeDataFromParsedJson(source.parsedJson));
  };

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-5">
      <header className="flex flex-col gap-4 border-b border-border/60 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div><Button variant="ghost" size="sm" asChild className="-ml-2 mb-2 text-muted-foreground"><Link href="/dashboard/resumes"><ChevronLeft /> Resumes</Link></Button><h1 className="text-xl font-bold tracking-tight md:text-2xl">Generate resume</h1><p className="mt-1 text-xs leading-6 text-muted-foreground">Edit structured content on the left. Your resume preview updates as you work.</p></div>
        <Button onClick={() => void generate()} disabled={isGenerating} className="shrink-0">{isGenerating ? <Loader2 className="animate-spin" /> : <Download />} {isGenerating ? "Generating…" : "Generate PDF"}</Button>
      </header>

      <div className="grid min-h-[calc(100vh-13rem)] gap-5 xl:grid-cols-[minmax(360px,0.82fr)_minmax(500px,1.18fr)]">
        <div className="overflow-hidden rounded-sm border border-border/70 bg-card xl:max-h-[calc(100vh-13rem)] xl:overflow-y-auto">
          <div className="sticky top-0 z-10 border-b border-border/60 bg-card px-4 py-3"><p className="text-xs font-semibold">Resume content</p><p className="text-[11px] text-muted-foreground">Changes stay in this editor until you generate.</p><label className="mt-3 grid gap-1"><span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Load parsed resume</span><select value={selectedSourceId} onChange={(event) => selectSource(event.target.value)} className="h-8 w-full rounded-sm border border-border bg-background px-2 text-xs outline-none focus-visible:ring-1 focus-visible:ring-ring"><option value="sample">Sample resume</option>{sourceResumes.map((source) => <option value={source.id} key={source.id}>{source.title}</option>)}</select>{sourceResumes.length === 0 ? <span className="text-[10px] text-muted-foreground">No parsed resumes found. Showing the sample.</span> : null}</label></div>
          <EditorSection title="Basics" description="The information at the top of your resume."><div className="grid gap-3 sm:grid-cols-2"><Field label="Full name" value={basics.fullName} onChange={(value) => updateBasics("fullName", value)} /><Field label="Headline" value={basics.headline} onChange={(value) => updateBasics("headline", value)} /><Field label="Email" value={basics.email} onChange={(value) => updateBasics("email", value)} /><Field label="Phone" value={basics.phone} onChange={(value) => updateBasics("phone", value)} /><Field label="Location" value={basics.location} onChange={(value) => updateBasics("location", value)} /></div><label className="grid gap-1.5"><span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Links</span><Textarea value={(basics.links ?? []).map((link) => typeof link === "string" ? link : `${link.label ?? ""} | ${link.url}`).join("\n")} onChange={(event) => setResume((current) => ({ ...current, basics: { ...current.basics, links: event.target.value.split("\n").map((line) => { const [label, ...url] = line.split("|"); const href = url.join("|").trim(); const display = (label ?? "").trim(); return href ? { label: display, url: href } : display; }).filter(Boolean) } }))} placeholder="Portfolio | https://example.com&#10;LinkedIn | https://linkedin.com/in/you" /></label></EditorSection>
          <EditorSection title="Professional summary"><Textarea value={resume.summary ?? ""} onChange={(event) => setResume((current) => ({ ...current, summary: event.target.value }))} placeholder="A concise introduction…" /></EditorSection>
          <EditorSection title="Experience" description="Use one bullet per line.">{(resume.experience ?? []).map((item, index) => <div className="space-y-3 rounded-sm border border-border/70 bg-muted/15 p-3" key={index}><div className="flex items-center justify-between"><span className="text-xs font-semibold">Role {index + 1}</span><Button variant="ghost" size="icon-xs" onClick={() => removeList("experience", index)} aria-label="Remove experience"><Trash2 className="text-muted-foreground" /></Button></div><div className="grid gap-3 sm:grid-cols-2"><Field label="Role" value={item.role} onChange={(value) => updateList<ResumeExperience>("experience", index, "role", value)} /><Field label="Company" value={item.company} onChange={(value) => updateList<ResumeExperience>("experience", index, "company", value)} /><Field label="Location" value={item.location} onChange={(value) => updateList<ResumeExperience>("experience", index, "location", value)} /><Field label="Start date" value={item.startDate} onChange={(value) => updateList<ResumeExperience>("experience", index, "startDate", value)} /><Field label="End date" value={item.endDate} onChange={(value) => updateList<ResumeExperience>("experience", index, "endDate", value)} /></div><label className="grid gap-1.5"><span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Accomplishments</span><Textarea value={(item.bullets ?? []).join("\n")} onChange={(event) => updateBullets("experience", index, event.target.value)} placeholder="One accomplishment per line" /></label></div>)}<Button variant="outline" size="sm" onClick={addExperience}><Plus /> Add experience</Button></EditorSection>
          <EditorSection title="Education">{(resume.education ?? []).map((item, index) => <div className="space-y-3 rounded-sm border border-border/70 bg-muted/15 p-3" key={index}><div className="flex items-center justify-between"><span className="text-xs font-semibold">Education {index + 1}</span><Button variant="ghost" size="icon-xs" onClick={() => removeList("education", index)} aria-label="Remove education"><Trash2 className="text-muted-foreground" /></Button></div><div className="grid gap-3 sm:grid-cols-2"><Field label="Institution" value={item.institution} onChange={(value) => updateList<ResumeEducation>("education", index, "institution", value)} /><Field label="Degree" value={item.degree} onChange={(value) => updateList<ResumeEducation>("education", index, "degree", value)} /><Field label="Field" value={item.field} onChange={(value) => updateList<ResumeEducation>("education", index, "field", value)} /><Field label="Start date" value={item.startDate} onChange={(value) => updateList<ResumeEducation>("education", index, "startDate", value)} /><Field label="End date" value={item.endDate} onChange={(value) => updateList<ResumeEducation>("education", index, "endDate", value)} /></div></div>)}<Button variant="outline" size="sm" onClick={addEducation}><Plus /> Add education</Button></EditorSection>
          <EditorSection title="Skills" description="One group per line: Category: Skill, Skill"><Textarea value={(resume.skills ?? []).map((skill) => typeof skill === "string" ? skill : `${skill.category}: ${skill.skills.join(", ")}`).join("\n")} onChange={(event) => setResume((current) => ({ ...current, skills: event.target.value.split("\n").map((line) => { const [category, ...values] = line.split(":"); return values.length ? { category: text(category), skills: values.join(":").split(",").map(text).filter(Boolean) } : text(category); }).filter((skill) => typeof skill === "string" ? Boolean(skill) : Boolean(skill.category || skill.skills.length)) }))} /></EditorSection>
          <EditorSection title="Projects" description="Optional"><>{(resume.projects ?? []).map((item, index) => <div className="space-y-3 rounded-sm border border-border/70 bg-muted/15 p-3" key={index}><div className="flex items-center justify-between"><span className="text-xs font-semibold">Project {index + 1}</span><Button variant="ghost" size="icon-xs" onClick={() => removeList("projects", index)} aria-label="Remove project"><Trash2 className="text-muted-foreground" /></Button></div><div className="grid gap-3 sm:grid-cols-2"><Field label="Name" value={item.name} onChange={(value) => updateList<ResumeProject>("projects", index, "name", value)} /><Field label="Link" value={item.link} onChange={(value) => updateList<ResumeProject>("projects", index, "link", value)} /></div><label className="grid gap-1.5"><span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Description</span><Textarea value={item.description ?? ""} onChange={(event) => updateList<ResumeProject>("projects", index, "description", event.target.value)} /></label><label className="grid gap-1.5"><span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Bullets</span><Textarea value={(item.bullets ?? []).join("\n")} onChange={(event) => updateBullets("projects", index, event.target.value)} /></label></div>)}<Button variant="outline" size="sm" onClick={addProject}><Plus /> Add project</Button></></EditorSection>
          <EditorSection title="Certifications" description="Optional">{(resume.certifications ?? []).map((item, index) => <div className="grid gap-3 rounded-sm border border-border/70 bg-muted/15 p-3 sm:grid-cols-[1fr_1fr_7rem_auto]" key={index}><Field label="Certification" value={item.name} onChange={(value) => updateCertification(index, "name", value)} /><Field label="Issuer" value={item.issuer} onChange={(value) => updateCertification(index, "issuer", value)} /><Field label="Date" value={item.date} onChange={(value) => updateCertification(index, "date", value)} /><div className="flex items-end"><Button variant="ghost" size="icon-sm" onClick={() => removeCertification(index)} aria-label="Remove certification"><Trash2 className="text-muted-foreground" /></Button></div></div>)}<Button variant="outline" size="sm" onClick={addCertification}><Plus /> Add certification</Button></EditorSection>
        </div>
        <div className="rounded-sm border border-border/70 bg-muted/30 p-3 sm:p-5 xl:overflow-y-auto"><div className="mb-3 flex items-center justify-between"><p className="text-xs font-semibold">Live preview</p><span className="text-[10px] text-muted-foreground">A4 / Letter-ready layout</span></div><div className="mx-auto max-w-[760px]"><ResumePreview resume={resume} /></div></div>
      </div>
    </div>
  );
};

export default ResumeGeneratorView;
