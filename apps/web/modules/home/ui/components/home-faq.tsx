"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@repo/ui/lib/utils";

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

function FaqItem({ q, a, index, isLast }: { q: string; a: string; index: number; isLast: boolean }) {
  const [open, setOpen] = useState(false);
  const panelId = `faq-panel-${index}`;

  return (
    <div className={cn("overflow-hidden mx-4", !isLast && "border-b border-foreground/5")}>
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls={panelId}
        className="w-full flex items-center justify-between gap-4 p-2 md:p-4 text-left select-none group/faq-btn transition-colors duration-200"
      >
        <span className="text-xs md:text-sm font-semibold text-foreground group-hover/faq-btn:text-blue-500 transition-colors duration-200">
          {q}
        </span>
        <div className="flex h-7 w-7 md:h-8 md:w-8 items-center justify-center rounded-full bg-foreground/3 group-hover/faq-btn:bg-foreground/8 transition-colors duration-200 shrink-0">
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 md:h-4 md:w-4 text-muted-foreground transition-transform duration-300 ease-out",
              open && "rotate-180 text-foreground"
            )}
          />
        </div>
      </button>
      <motion.div
        id={panelId}
        role="region"
        initial={false}
        animate={{ height: open ? "auto" : 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="overflow-hidden"
      >
        <div className="pb-4 md:pb-6 px-2 md:px-4 text-xs md:text-sm text-muted-foreground leading-relaxed pr-8">
          {a}
        </div>
      </motion.div>
    </div>
  );
}

export function HomeFaq() {
  return (
    <section id="faq" className="py-16 md:py-28 relative z-10">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-6 md:mb-12">
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1.5 md:mb-3">FAQ</p>
          <h2 className="text-lg md:text-3xl font-extrabold tracking-tight text-foreground mb-2 md:mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-sm md:text-base text-muted-foreground max-w-md mx-auto">
            Got questions about Rescomail? We&apos;ve got answers.
          </p>
        </div>

        {/* Accordion */}
        <div className="border border-foreground/5 rounded-2xl bg-muted/20 backdrop-blur-xs py-2 ">
          {FAQS.map((faq, index) => (
            <FaqItem
              key={faq.q}
              q={faq.q}
              a={faq.a}
              index={index}
              isLast={index === FAQS.length - 1}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
