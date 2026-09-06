"use client";

import { createResumePdf, downloadResumePdf, type ResumeData } from "./resume-pdf";

const sampleResume: ResumeData = {
  basics: {
    fullName: "Avery Patel",
    headline: "Senior Product Designer",
    email: "avery.patel@example.com",
    phone: "+1 555 010 2026",
    location: "New York, NY",
    links: [{ label: "Portfolio", url: "https://example.com" }, { label: "LinkedIn", url: "https://linkedin.com" }],
  },
  summary: "Product designer with eight years of experience shaping clear, accessible B2B software experiences.",
  experience: [{ company: "Acme", role: "Senior Product Designer", location: "New York, NY", startDate: "2022", endDate: "Present", bullets: ["Led the end-to-end design of a workflow used by 20,000 customers.", "Partnered with engineering and research to improve activation by 18%." ] }],
  education: [{ institution: "State University", degree: "BFA", field: "Interaction Design", startDate: "2012", endDate: "2016" }],
  skills: [{ category: "Design", skills: ["Figma", "Prototyping", "Design systems"] }, { category: "Research", skills: ["Usability testing", "Interviews"] }],
};

/** Use from any client-side click handler. */
export async function downloadSampleResume() {
  const pdf = await createResumePdf(sampleResume, { pageSize: "Letter" });
  downloadResumePdf(pdf, "avery-patel-resume.pdf");
}
