import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Rescomail AI job search workspace";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        alignItems: "center",
        background:
          "radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.35), transparent 32%), radial-gradient(circle at 82% 18%, rgba(99, 102, 241, 0.28), transparent 30%), linear-gradient(135deg, #020617 0%, #0f172a 52%, #111827 100%)",
        color: "#f8fafc",
        display: "flex",
        flexDirection: "column",
        fontFamily: "Inter, Arial, sans-serif",
        height: "100%",
        justifyContent: "center",
        letterSpacing: "-0.03em",
        padding: "72px",
        width: "100%",
      }}
    >
      <div
        style={{
          border: "1px solid rgba(148, 163, 184, 0.24)",
          display: "flex",
          flexDirection: "column",
          gap: "28px",
          padding: "56px",
          width: "100%",
        }}
      >
        <div
          style={{
            color: "#93c5fd",
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}
        >
          Rescomail
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: 76,
            fontWeight: 800,
            lineHeight: 0.95,
            maxWidth: 900,
          }}
        >
          <span>AI resume optimization</span>
          <span style={{ color: "#bfdbfe" }}>and cold emails.</span>
        </div>
        <div
          style={{
            color: "#cbd5e1",
            display: "flex",
            fontSize: 30,
            gap: "18px",
            letterSpacing: "-0.01em",
          }}
        >
          <span>ATS analysis</span>
          <span>•</span>
          <span>Outreach drafts</span>
          <span>•</span>
          <span>Job tracking</span>
        </div>
      </div>
    </div>,
    size,
  );
}
