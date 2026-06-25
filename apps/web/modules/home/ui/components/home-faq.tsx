"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQS = [
  {
    q: "How accurate is the ATS analysis?",
    a: "Rescomail's core analysis is completely LLM-based, allowing our models to read your resume like a human recruiter for deep reasoning. We also pair this with advanced embedding models (the same tech powering modern search engines) to rapidly filter semantics, providing highly accurate and realistic ATS scoring.",
  },
  {
    q: "Can I generate cold emails automatically?",
    a: "Absolutely. Once your resume is parsed, you can input a target job or company URL. Our AI fetches the company context and drafts a personalized email referencing your exact relevant experience.",
  },
  {
    q: "Is my data secure and private?",
    a: "Yes. Resumes are stored securely and parsed data is private to your account. We don't train public models on your personal data.",
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-sm border border-foreground/5 bg-muted/30 overflow-hidden transition-all duration-300 hover:border-border">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3.5 md:px-6 md:py-5 text-left"
      >
        <span className="text-[11px] md:text-sm font-semibold text-foreground">{q}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 md:h-4 md:w-4 text-muted-foreground shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${open ? "max-h-96" : "max-h-0"}`}
      >
        <div className="px-4 pb-4 md:px-6 md:pb-6">
          <div className="w-full h-px bg-border/50 mb-3 md:mb-4" />
          <p className="text-[10px] md:text-sm text-muted-foreground leading-relaxed">{a}</p>
        </div>
      </div>
    </div>
  );
}

export function HomeFaq() {
  return (
    <section id="faq" className="py-10 md:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-6 md:mb-12">
          <p className="text-[9px] md:text-xs font-bold uppercase tracking-widest text-primary mb-1.5 md:mb-3">FAQ</p>
          <h2 className="text-lg md:text-3xl font-extrabold tracking-tight text-foreground mb-2 md:mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-[11px] md:text-sm text-muted-foreground">
            Got questions? We&apos;ve got answers.
          </p>
        </div>

        {/* Accordion */}
        <div className="space-y-2">
          {FAQS.map((faq) => (
            <FaqItem key={faq.q} q={faq.q} a={faq.a} />
          ))}
        </div>

      </div>
    </section>
  );
}
