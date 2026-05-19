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
import { organizations } from "./organizations";
import { resumes } from "./resumes";

export const atsAnalyses = pgTable(
  "ats_analyses",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    organizationId: uuid("organization_id").references(() => organizations.id, {
      onDelete: "set null",
    }),
    resumeId: uuid("resume_id")
      .notNull()
      .references(() => resumes.id, { onDelete: "cascade" }),
    jobTitle: text("job_title").notNull(),
    companyName: text("company_name").notNull(),
    jobDescription: text("job_description").notNull(),
    targetKeywords: jsonb("target_keywords").notNull(),
    analysis: jsonb("analysis").notNull(),
    overallScore: integer("overall_score").notNull(),
    verdict: varchar("verdict", { length: 50 }).notNull(),
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
    organizationCreatedAtIdx: index("ats_analyses_org_created_at_idx").on(
      table.organizationId,
      table.createdAt,
    ),
    scoreIdx: index("ats_analyses_score_idx").on(table.overallScore),
  }),
);
