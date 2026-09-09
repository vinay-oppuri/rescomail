"use client";

import React from "react";
import type { ResumeData } from "../../../pdf/resume-pdf";
import type { ResumeTemplateId } from "../types";

interface ResumeCertificationsSectionProps {
  certifications?: ResumeData["certifications"];
  selectedTemplate: ResumeTemplateId;
}

export const ResumeCertificationsSection: React.FC<ResumeCertificationsSectionProps> = ({
  certifications = [],
  selectedTemplate,
}) => {
  if (!certifications || certifications.length === 0) return null;

  const isExecutive = selectedTemplate === "executive";
  const isCompact = selectedTemplate === "compact";

  return (
    <section className={isCompact ? "mt-4" : "mt-6"}>
      <h2
        className={`mb-2 border-b border-border/80 pb-1 text-[11px] font-bold uppercase tracking-[0.14em] text-foreground ${
          isExecutive ? "font-serif text-xs border-foreground/30" : ""
        }`}
      >
        Certifications
      </h2>
      <div className="space-y-1.5">
        {certifications.map((item, index) => (
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
  );
};
