import type { ResumeData } from "../../pdf/resume-pdf";

export const SAMPLE_RESUME_DATA: ResumeData = {
  basics: {
    fullName: "Elena Rostova",
    headline: "Staff Software Engineer & Distributed Systems Lead",
    email: "elena.rostova@example.com",
    phone: "+1 (415) 890-2341",
    location: "San Francisco, CA",
    links: [
      { label: "Portfolio", url: "https://elenarostova.dev" },
      { label: "GitHub", url: "https://github.com/erostova" },
      { label: "LinkedIn", url: "https://linkedin.com/in/elena-rostova" },
    ],
  },
  summary:
    "Staff Software Engineer with 9+ years of experience designing fault-tolerant distributed backends, edge delivery architectures, and high-throughput real-time pipelines. Passionate about developer ergonomics, zero-downtime database migrations, and mentoring high-velocity engineering teams.",
  experience: [
    {
      company: "Vanguard Cloud Platforms",
      role: "Staff Infrastructure Engineer",
      location: "San Francisco, CA",
      startDate: "2022",
      endDate: "Present",
      bullets: [
        "Architected multi-region event streaming fabric processing <strong>140,000+ RPS</strong> with sub-15ms p99 latency across AWS and GCP.",
        "Spearheaded company-wide migration from legacy monorepo to modular micro-frontends and gRPC services, reducing deploy cycle times by <strong>42%</strong>.",
        "Formed the internal Architecture Review Board and mentored 14 senior engineers across distributed systems best practices.",
      ],
    },
    {
      company: "Aetherial Labs",
      role: "Senior Backend Engineer",
      location: "San Jose, CA",
      startDate: "2019",
      endDate: "2022",
      bullets: [
        "Engineered real-time collaboration engine using CRDTs and WebSockets, supporting up to 50 concurrent editors per document canvas.",
        "Optimized Postgres database query planners and index strategies, shaving database CPU usage by <strong>35%</strong> during peak load.",
        "Built automated ATS parsing and indexing engine with semantic embeddings, improving match accuracy by 28%.",
      ],
    },
    {
      company: "Helios Dynamics",
      role: "Software Engineer",
      location: "Seattle, WA",
      startDate: "2016",
      endDate: "2019",
      bullets: [
        "Delivered customer telemetry ingestion pipeline handling 5B+ daily telemetry events.",
        "Implemented resilient retry queues with exponential backoff and dead-letter queue routing using Kafka.",
      ],
    },
  ],
  education: [
    {
      institution: "University of Washington",
      degree: "B.S. in Computer Science & Applied Mathematics",
      field: "Distributed Systems & Machine Learning",
      startDate: "2012",
      endDate: "2016",
    },
  ],
  skills: [
    {
      category: "Languages & Frameworks",
      skills: ["TypeScript", "Go", "Rust", "Python", "React", "Next.js", "Node.js"],
    },
    {
      category: "Infrastructure & Data",
      skills: ["PostgreSQL", "Redis", "Apache Kafka", "Kubernetes", "Docker", "AWS (EKS, S3, RDS)", "Terraform"],
    },
    {
      category: "Architecture",
      skills: ["Event-Driven Architecture", "Microservices", "CRDTs", "Real-Time Systems", "Zero-Downtime Deployments"],
    },
  ],
  projects: [
    {
      name: "ChronoSync — Realtime Document Synchronization",
      link: "https://github.com/erostova/chronosync",
      description: "Open-source state-based CRDT library designed for concurrent rich-text editing with automatic conflict resolution.",
      bullets: [
        "Adopted by 1,200+ open-source developers with 2,400+ GitHub stars.",
        "Achieved 99.98% convergence test coverage over 10M randomized peer network simulations.",
      ],
    },
  ],
  certifications: [
    {
      name: "AWS Certified Solutions Architect – Professional",
      issuer: "Amazon Web Services",
      date: "2024",
    },
    {
      name: "Certified Kubernetes Administrator (CKA)",
      issuer: "Cloud Native Computing Foundation",
      date: "2023",
    },
  ],
};

/**
 * Simulated API call: fetches the structured resume JSON.
 * Returns the candidate's resume data.
 */
export async function fetchResume(): Promise<ResumeData> {
  // Simulate network roundtrip
  await new Promise((resolve) => setTimeout(resolve, 350));
  return JSON.parse(JSON.stringify(SAMPLE_RESUME_DATA));
}

/**
 * Stubbed persistence function for debounced autosave.
 * In a production setup, this would dispatch a PATCH/PUT request or server action.
 */
export async function updateResume(
  updatedResume: ResumeData
): Promise<{ success: boolean; updatedAt: string }> {
  console.log("[ResumeEditor API] Persisting resume data:", {
    fullName: updatedResume.basics?.fullName,
    experienceCount: updatedResume.experience?.length,
    skillsCount: updatedResume.skills?.length,
    timestamp: new Date().toISOString(),
  });

  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 400));

  return {
    success: true,
    updatedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
  };
}
