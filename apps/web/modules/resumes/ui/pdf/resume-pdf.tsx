"use client";

import {
  Document,
  Fixed,
  Link,
  Page,
  Text,
  View,
  type Style,
} from "@formepdf/react";
import { renderDocument } from "@formepdf/core/browser";
import type { ReactNode } from "react";

export type ResumePageSize = "A4" | "Letter";

export interface ResumeLink {
  label?: string;
  url: string;
}

export interface ResumeBasics {
  /** `fullName` is preferred; `name` is accepted for conventional resume JSON. */
  fullName?: string;
  name?: string;
  headline?: string;
  title?: string;
  email?: string;
  phone?: string;
  location?: string;
  links?: Array<ResumeLink | string>;
}

export interface ResumeExperience {
  company?: string;
  role?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  bullets?: string[];
}

export interface ResumeEducation {
  institution?: string;
  degree?: string;
  field?: string;
  startDate?: string;
  endDate?: string;
}

export interface ResumeSkillGroup {
  category: string;
  skills: string[];
}

export interface ResumeProject {
  name?: string;
  description?: string;
  bullets?: string[];
  link?: string;
}

export interface ResumeCertification {
  name?: string;
  issuer?: string;
  date?: string;
}

/** A custom section can be rendered by registering a section definition. */
export interface ResumeCustomSection {
  id: string;
  title: string;
  items: unknown[];
}

export interface ResumeData {
  basics?: ResumeBasics;
  summary?: string;
  experience?: ResumeExperience[];
  education?: ResumeEducation[];
  skills?: Array<string | ResumeSkillGroup>;
  projects?: ResumeProject[];
  certifications?: ResumeCertification[];
  customSections?: ResumeCustomSection[];
}

export interface ResumePdfOptions {
  pageSize?: ResumePageSize;
  /** Defaults to the person's name, with a safe fallback. */
  fileName?: string;
  /** Controls the standard sections while preserving one shared input schema. */
  sectionOrder?: string[];
  /** Add renderers for future section types without changing this template's layout. */
  sectionDefinitions?: ResumeSectionDefinition[];
}

export interface ResumeSectionDefinition {
  id: string;
  title: string;
  hasContent: (resume: ResumeData) => boolean;
  render: (resume: ResumeData) => ReactNode;
}

const colors = {
  ink: "#172033",
  muted: "#566275",
  accent: "#1E3A5F",
  rule: "#CBD5E1",
};

const styles: Record<string, Style> = {
  name: { color: colors.ink, fontSize: 24, fontWeight: 700, lineHeight: 1.1 },
  headline: { color: colors.accent, fontSize: 10.5, fontWeight: 700, marginTop: 5 },
  contact: { color: colors.muted, fontSize: 8.5, lineHeight: 1.35, marginTop: 7 },
  section: { marginTop: 15 },
  sectionTitle: {
    borderBottomColor: colors.rule,
    borderBottomWidth: 0.75,
    color: colors.accent,
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: 0.8,
    paddingBottom: 3,
    textTransform: "uppercase",
  },
  body: { color: colors.ink, fontSize: 9.25, lineHeight: 1.42 },
  muted: { color: colors.muted, fontSize: 8.75, lineHeight: 1.35 },
  entry: { marginTop: 8 },
  entryHeader: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  entryTitle: { color: colors.ink, fontSize: 10, fontWeight: 700, lineHeight: 1.25 },
  dates: { color: colors.muted, fontSize: 8.5, lineHeight: 1.25, textAlign: "right" },
  subline: { color: colors.muted, fontSize: 8.75, lineHeight: 1.3, marginTop: 1 },
  bullets: { marginTop: 3, gap: 2 },
  bulletRow: { flexDirection: "row", gap: 5 },
  bulletMarker: { color: colors.accent, fontSize: 9.25, lineHeight: 1.42 },
  bulletText: { color: colors.ink, flex: 1, fontSize: 9.25, lineHeight: 1.42 },
  skillLine: { color: colors.ink, fontSize: 9.25, lineHeight: 1.45, marginTop: 5 },
  skillCategory: { color: colors.ink, fontWeight: 700 },
  footer: { color: colors.muted, fontSize: 7.5, textAlign: "center" },
};

const clean = (value?: string) => value?.trim() ?? "";
const nonEmpty = (values: Array<string | undefined>) => values.map(clean).filter(Boolean);

function dateRange(startDate?: string, endDate?: string) {
  const dates = nonEmpty([startDate, endDate]);
  return dates.length === 2 ? dates.join(" — ") : dates[0] ?? "";
}

function linkLabel(link: ResumeLink | string) {
  if (typeof link === "string") return link;
  return clean(link.label) || clean(link.url);
}

function linkUrl(link: ResumeLink | string) {
  return typeof link === "string" ? link : clean(link.url);
}

function ContactLine({ basics }: { basics?: ResumeBasics }) {
  const plainContacts = nonEmpty([basics?.email, basics?.phone, basics?.location]);
  const links = (basics?.links ?? []).filter((item) => Boolean(linkUrl(item)));

  if (!plainContacts.length && !links.length) return null;

  return (
    <Text style={styles.contact}>
      {plainContacts.join("  |  ")}
      {plainContacts.length && links.length ? "  |  " : ""}
      {links.map((item, index) => (
        <Text key={`${linkUrl(item)}-${index}`}>
          {index > 0 ? "  |  " : ""}
          <Link href={linkUrl(item)} style={{ color: colors.muted }}>
            {linkLabel(item)}
          </Link>
        </Text>
      ))}
    </Text>
  );
}

function BulletList({ bullets }: { bullets?: string[] }) {
  const items = (bullets ?? []).map(clean).filter(Boolean);
  if (!items.length) return null;

  return (
    <View style={styles.bullets}>
      {items.map((bullet, index) => (
        <View key={`${bullet}-${index}`} style={styles.bulletRow} wrap={false}>
          <Text style={styles.bulletMarker}>•</Text>
          <Text style={styles.bulletText}>{bullet}</Text>
        </View>
      ))}
    </View>
  );
}

function SectionHeader({ children }: { children: string }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

function ExperienceEntry({ item }: { item: ResumeExperience }) {
  const title = nonEmpty([item.role, item.company]).join(" · ");
  const details = nonEmpty([item.company && item.role ? item.company : undefined, item.location]).join(" · ");
  const dates = dateRange(item.startDate, item.endDate);

  return (
    <View style={styles.entry}>
      <View style={styles.entryHeader} wrap={false}>
        <View style={{ flex: 1 }}>
          {title ? <Text style={styles.entryTitle}>{title}</Text> : null}
          {details ? <Text style={styles.subline}>{details}</Text> : null}
        </View>
        {dates ? <Text style={styles.dates}>{dates}</Text> : null}
      </View>
      <BulletList bullets={item.bullets} />
    </View>
  );
}

function EducationEntry({ item }: { item: ResumeEducation }) {
  const degree = nonEmpty([item.degree, item.field]).join(", ");
  const dates = dateRange(item.startDate, item.endDate);

  return (
    <View style={styles.entry} wrap={false}>
      <View style={styles.entryHeader}>
        <View style={{ flex: 1 }}>
          {clean(item.institution) ? <Text style={styles.entryTitle}>{clean(item.institution)}</Text> : null}
          {degree ? <Text style={styles.subline}>{degree}</Text> : null}
        </View>
        {dates ? <Text style={styles.dates}>{dates}</Text> : null}
      </View>
    </View>
  );
}

function ProjectEntry({ item }: { item: ResumeProject }) {
  return (
    <View style={styles.entry}>
      <View style={styles.entryHeader} wrap={false}>
        <View style={{ flex: 1, flexDirection: "row", gap: 5 }}>
          {clean(item.name) ? <Text style={styles.entryTitle}>{clean(item.name)}</Text> : null}
          {clean(item.link) ? (
            <Link href={clean(item.link)} style={{ color: colors.accent, fontSize: 8.75 }}>
              {clean(item.link)}
            </Link>
          ) : null}
        </View>
      </View>
      {clean(item.description) ? <Text style={{ ...styles.body, marginTop: 2 }}>{clean(item.description)}</Text> : null}
      <BulletList bullets={item.bullets} />
    </View>
  );
}

const standardSections: ResumeSectionDefinition[] = [
  {
    id: "summary",
    title: "Professional Summary",
    hasContent: (resume) => Boolean(clean(resume.summary)),
    render: (resume) => <Text style={{ ...styles.body, marginTop: 7 }}>{clean(resume.summary)}</Text>,
  },
  {
    id: "experience",
    title: "Experience",
    hasContent: (resume) => Boolean(resume.experience?.length),
    render: (resume) => (
      <>
        {(resume.experience ?? []).map((item, index) => <ExperienceEntry item={item} key={index} />)}
      </>
    ),
  },
  {
    id: "education",
    title: "Education",
    hasContent: (resume) => Boolean(resume.education?.length),
    render: (resume) => (
      <>{(resume.education ?? []).map((item, index) => <EducationEntry item={item} key={index} />)}</>
    ),
  },
  {
    id: "skills",
    title: "Skills",
    hasContent: (resume) => Boolean(resume.skills?.length),
    render: (resume) => (
      <>
        {(resume.skills ?? []).map((skill, index) =>
          typeof skill === "string" ? (
            <Text style={styles.skillLine} key={`${skill}-${index}`}>{clean(skill)}</Text>
          ) : (
            <Text style={styles.skillLine} key={`${skill.category}-${index}`}>
              <Text style={styles.skillCategory}>{clean(skill.category)}: </Text>
              {nonEmpty(skill.skills).join(", ")}
            </Text>
          ),
        )}
      </>
    ),
  },
  {
    id: "projects",
    title: "Projects",
    hasContent: (resume) => Boolean(resume.projects?.length),
    render: (resume) => <>{(resume.projects ?? []).map((item, index) => <ProjectEntry item={item} key={index} />)}</>,
  },
  {
    id: "certifications",
    title: "Certifications",
    hasContent: (resume) => Boolean(resume.certifications?.length),
    render: (resume) => (
      <>
        {(resume.certifications ?? []).map((item, index) => (
          <View key={index} style={styles.entry} wrap={false}>
            <View style={styles.entryHeader}>
              <View style={{ flex: 1 }}>
                {clean(item.name) ? <Text style={styles.entryTitle}>{clean(item.name)}</Text> : null}
                {clean(item.issuer) ? <Text style={styles.subline}>{clean(item.issuer)}</Text> : null}
              </View>
              {clean(item.date) ? <Text style={styles.dates}>{clean(item.date)}</Text> : null}
            </View>
          </View>
        ))}
      </>
    ),
  },
];

/**
 * The default, ATS-friendly Forme template. It is deliberately separate from
 * `createResumePdf`, so another visual template can share the same data and API.
 */
export function ResumePdfDocument({ resume, options = {} }: { resume: ResumeData; options?: ResumePdfOptions }) {
  const sectionOrder = options.sectionOrder ?? standardSections.map((section) => section.id);
  const definitions = [...standardSections, ...(options.sectionDefinitions ?? [])];
  const sections = sectionOrder
    .map((id) => definitions.find((section) => section.id === id))
    .filter((section): section is ResumeSectionDefinition => Boolean(section?.hasContent(resume)));
  const name = clean(resume.basics?.fullName) || clean(resume.basics?.name);
  const headline = clean(resume.basics?.headline) || clean(resume.basics?.title);

  return (
    <Document title={name ? `${name} Resume` : "Resume"} author={name || undefined} lang="en-US">
      <Page size={options.pageSize ?? "Letter"} margin={{ top: 43, right: 47, bottom: 42, left: 47 }}>
        <Fixed position="footer" style={{ paddingTop: 8 }}>
          <Text style={styles.footer}>Page {"{{pageNumber}}"} of {"{{totalPages}}"}</Text>
        </Fixed>
        {(name || headline || resume.basics) ? (
          <View wrap={false}>
            {name ? <Text style={styles.name}>{name}</Text> : null}
            {headline ? <Text style={styles.headline}>{headline}</Text> : null}
            <ContactLine basics={resume.basics} />
          </View>
        ) : null}
        {sections.map((section) => (
          <View style={styles.section} key={section.id}>
            <View wrap={false}>
              <SectionHeader>{section.title}</SectionHeader>
            </View>
            {section.render(resume)}
          </View>
        ))}
      </Page>
    </Document>
  );
}

/** Renders client-side only and returns searchable/selectable PDF bytes. */
export async function createResumePdf(resume: ResumeData, options: ResumePdfOptions = {}): Promise<Uint8Array> {
  return renderDocument(<ResumePdfDocument resume={resume} options={options} />);
}

/** Triggers a browser download and promptly releases the temporary object URL. */
export function downloadResumePdf(bytes: Uint8Array, fileName = "resume.pdf") {
  const safeName = fileName.toLowerCase().endsWith(".pdf") ? fileName : `${fileName}.pdf`;
  const url = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = safeName;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}
