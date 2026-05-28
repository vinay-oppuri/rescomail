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

export const coldEmails = pgTable(
  "cold_emails",
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
    companyWebsiteUrl: text("company_website_url").notNull(),
    recipientName: text("recipient_name").notNull(),
    recipientRole: text("recipient_role").notNull(),
    jobDescription: text("job_description").notNull(),
    companyContext: text("company_context").notNull(),
    personalNote: text("personal_note").notNull(),
    tone: varchar("tone", { length: 50 }).notNull(),
    length: varchar("length", { length: 50 }).notNull(),
    callToAction: varchar("call_to_action", { length: 50 }).notNull(),
    draft: jsonb("draft"),
    subject: text("subject"),
    previewText: text("preview_text"),
    body: text("body"),
    qualityScore: integer("quality_score"),
    status: varchar("status", { length: 50 }).default("processing").notNull(),
    error: text("error"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    userCreatedAtIdx: index("cold_emails_user_created_at_idx").on(
      table.userId,
      table.createdAt,
    ),
    resumeCreatedAtIdx: index("cold_emails_resume_created_at_idx").on(
      table.resumeId,
      table.createdAt,
    ),
    organizationCreatedAtIdx: index("cold_emails_org_created_at_idx").on(
      table.organizationId,
      table.createdAt,
    ),
    qualityScoreIdx: index("cold_emails_quality_score_idx").on(
      table.qualityScore,
    ),
    statusIdx: index("cold_emails_status_idx").on(table.status),
  }),
);
