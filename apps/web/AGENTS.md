# Rescomail Web Application Architecture (`apps/web`)

This document serves as the comprehensive agentic/developer guide for the Next.js `apps/web` application within the Rescomail workspace.

## 1. High-Level Overview
`apps/web` is a full-stack Next.js 15 (App Router) application that serves as the primary user interface and API gateway for Rescomail. It allows users to upload PDF resumes, parse them, generate ATS compatibility analyses against Job Descriptions (JDs), and draft highly personalized cold emails.

### Key Technologies
*   **Framework**: Next.js (App Router)
*   **Styling**: Tailwind CSS + Radix UI primitives (`@repo/ui`)
*   **State Management**: Zustand (for complex flows) + React State
*   **Background Jobs**: Trigger.dev (v3)
*   **File Uploads**: UploadThing
*   **Database**: Drizzle ORM (`@repo/db`)
*   **Authentication**: BetterAuth (`@repo/auth`)

---

## 🧠 Hybrid AI Architecture (Web to AI Service)

While the `apps/web` handles the user experience, all AI workloads are offloaded to `apps/ai-service`. The web application interacts with a **Hybrid Architecture** on the backend:
*   **Local Embeddings** are used for high-volume filtering (e.g., matching a resume against hundreds of job descriptions or filtering large scraped website contexts). This ensures the web app receives fast responses for search queries without incurring massive LLM token costs.
*   **LLMs (Gemini)** are reserved strictly for deep reasoning (e.g., generating ATS gap analysis, rewriting bullet points, or drafting cold emails).

When polling for background jobs, remember that the AI Service utilizes this funneling technique to keep background processing times (and your polling cycles) as short as possible.

---

## 2. Directory Structure & Architecture Philosophy

The application strictly follows a **domain-driven modular architecture** rather than a technical-concern architecture. Most business logic, UI components, and server actions are grouped inside the `modules/` directory by feature domain.

### `app/` (Next.js App Router)
Handles routing, layouts, and API endpoints.
*   **`(auth)/`**: Login and registration pages.
*   **`(home)/`**: Public landing pages and marketing.
*   **`dashboard/`**: Authenticated area containing sub-routes for `resumes`, `ats`, `coldmail`, etc.
*   **`api/`**: Route handlers.
    *   `/api/uploadthing`: Endpoints for direct-to-S3 file uploads.
    *   `/api/auth`: BetterAuth handler.
    *   `/api/resumes/[id]/file`: Secure proxy endpoint ensuring only authenticated users can access their uploaded PDF assets.
    *   `/api/ats` & `/api/coldmail`: Proxies/triggers for AI generation.

### `modules/` (Domain Logic)
Contains the actual implementation details.
*   **`ats/`**: Applicant Tracking System analysis features.
    *   `store/ats-store.ts`: Zustand store managing the complex state of selecting resumes, JDs, polling background tasks, and displaying results.
    *   `ui/`: Components like `AtsAnalysisForm` and `AtsAnalysisView`.
    *   `server/`: Server actions and queries for ATS history and resumes.
*   **`resumes/`**: Resume library and PDF uploads.
    *   `ui/components/resume-upload-panel.tsx`: Handles UploadThing integration with rich UX (gradient loaders, drag-and-drop). On success, it triggers a background parse job.
    *   `ui/views/resumes-view.tsx`: Client-side polling view that updates in real-time as resumes transition from `uploaded` -> `processing` -> `parsed`.
*   **`coldmail/`**: Generating personalized emails based on the parsed resume and JD.
*   **`auth/`**: Custom auth UI components.
*   **`dashboard/`**: The main shell, sidebars, and navigation for authenticated users.

### `trigger/` (Background Jobs)
Contains long-running background tasks orchestrated by Trigger.dev. Because LLM operations take time, they are offloaded here rather than running in standard Next.js API routes.
*   **`parse-resume.ts`**: Triggered upon PDF upload. Extracts text, normalizes it, and saves structured resume data to the DB.
*   **`ats-analysis.ts`**: Runs the scoring algorithms and AI feedback generation.
*   **`coldmail-generation.ts`**: Drafts emails.

---

## 3. Core Workflows (How Things Work)

### Workflow A: Resume Upload & Parsing
1.  **User Action**: User drops a PDF into `ResumeUploadPanel`.
2.  **Upload**: File is uploaded securely via UploadThing direct-to-storage.
3.  **Completion**: `onClientUploadComplete` triggers in the browser, showing a success state for 300ms, and calls `router.refresh()`.
4.  **Background Processing**: UploadThing webhook or server action creates a DB record with status `uploaded` and triggers the Trigger.dev `parse-resume` task.
5.  **Polling**: The `ResumesView` component detects pending resumes and polls the server every 3 seconds.
6.  **Resolution**: `parse-resume` finishes, updates the DB status to `parsed`. The UI updates automatically, revealing the "Analyse" button.

### Workflow B: ATS Analysis
1.  **User Action**: User navigates to `/dashboard/ats?resumeId=...` and fills out the target Job Description in `AtsAnalysisForm`.
2.  **Validation**: The "Analyse Match" button is only enabled if the selected resume has fully completed parsing (`status === "parsed"`).
3.  **Trigger**: Submitting the form calls a server action that launches the `ats-analysis` Trigger.dev task and updates the `zustand` store.
4.  **Polling**: The `AtsStore` polls for the completion of the background task and hydrates the UI with scores, keyword matches, and rewrite suggestions upon completion.

---

## 4. Key Developer Guidelines

1.  **Security**: Never expose user assets on public URLs. Always route file access through authenticated proxies (e.g., `/api/resumes/[id]/file`).
2.  **UX / Micro-interactions**: The application prioritizes high-quality aesthetics. Use `lucide-react` for icons, smooth Tailwind transitions (`transition-all duration-300`), and real-time feedback (loaders, pulse animations) for all async actions.
3.  **State Management Rule**: Use standard React state (`useState`) for isolated component interactions (like drag-and-drop). Use `zustand` *only* for complex, multi-component global states (like the ATS analysis flow).
4.  **Asynchronous Architecture**: Never await long-running AI tasks directly in Next.js API routes (to prevent Vercel timeouts). Always delegate to Trigger.dev and poll from the client.
