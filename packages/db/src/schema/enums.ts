import { pgEnum } from "drizzle-orm/pg-core";

export const usageEventType = pgEnum("usage_event_type", [
  "resume_upload",
  "resume_parse",
  "ats_analysis",
  "cold_email_generate",
]);
