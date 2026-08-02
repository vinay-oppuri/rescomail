import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { user } from "./auth";
import { resumes } from "./resumes";

export const atsAnalyses = pgTable(
  "ats_analyses",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    resumeId: uuid("resume_id")
      .notNull()
      .references(() => resumes.id, { onDelete: "cascade" }),
    jobTitle: text("job_title").notNull(),
    companyName: text("company_name").notNull(),
    jobDescription: text("job_description").notNull(),
    targetKeywords: jsonb("target_keywords").notNull(),
    analysis: jsonb("analysis"),
    overallScore: integer("overall_score"),
    verdict: varchar("verdict", { length: 50 }),
    status: varchar("status", { length: 50 }).default("processing").notNull(),
    error: text("error"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    userCreatedAtIdx: index("ats_analyses_user_created_at_idx").on(
      table.userId,
      table.createdAt,
    ),
    resumeCreatedAtIdx: index("ats_analyses_resume_created_at_idx").on(
      table.resumeId,
      table.createdAt,
    ),
    scoreIdx: index("ats_analyses_score_idx").on(table.overallScore),
    statusIdx: index("ats_analyses_status_idx").on(table.status),
  }),
);
