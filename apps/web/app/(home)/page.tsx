import type { Metadata } from "next";

import HomeView from "@/modules/home/ui/views/home-view";

const siteUrl = (
  process.env.NEXT_PUBLIC_APP_URL || "https://rescomail.vinayweb.in"
).replace(/\/$/, "");

const faqItems = [
  {
    question: "How accurate is the ATS analysis?",
    answer:
      "Rescomail uses advanced embedding models and cross-encoders to understand semantics, not just exact keyword matches. This provides highly accurate and realistic ATS scoring.",
  },
  {
    question: "Can I generate cold emails automatically?",
    answer:
      "Absolutely. Once your resume is parsed, you can input a target job or company URL. Our AI fetches the company context and drafts a personalized email referencing your exact relevant experience.",
  },
  {
    question: "Is my resume data private?",
    answer:
      "Yes. Resumes are stored securely and parsed data is private to your account. We don't train public models on your personal data.",
  },
];

export const metadata: Metadata = {
  title: "AI Resume Optimizer & Cold Email Generator",
  description:
    "Analyze resumes for ATS compatibility and generate personalized cold emails with Rescomail's focused AI workspace.",
  alternates: {
    canonical: "/",
  },
};

const Home = () => {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqItems.map((item) => ({
              "@type": "Question",
              name: item.question,
              acceptedAnswer: {
                "@type": "Answer",
                text: item.answer,
              },
            })),
            url: siteUrl,
          }),
        }}
      />
      <HomeView />
    </>
  );
};
export default Home;
