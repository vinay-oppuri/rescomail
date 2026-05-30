import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Rescomail",
    short_name: "Rescomail",
    description:
      "AI-powered resume optimization, cold email generation, and job application tracking.",
    start_url: "/",
    display: "standalone",
    background_color: "#020617",
    theme_color: "#0f172a",
    categories: ["business", "productivity", "education"],
  };
}
