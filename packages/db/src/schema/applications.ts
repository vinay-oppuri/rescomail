import {
  index,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { user } from "./auth";
import { organizations } from "./organizations";
import { resumes } from "./resumes";
import { applicationStageEnum } from "./enums";

export const applications = pgTable("applications", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  organizationId: uuid("organization_id").references(() => organizations.id, { onDelete: "set null" }),
  resumeId: uuid("resume_id").references(() => resumes.id, { onDelete: "set null" }),
  jobTitle: text("job_title").notNull(),
  companyName: text("company_name").notNull(),
  jobUrl: text("job_url"),
  stage: applicationStageEnum("stage").default("saved").notNull(),
  notes: text("notes"),
  appliedAt: timestamp("applied_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
},
  (table) => ({
    userCreatedAtIdx: index("applications_user_created_at_idx").on(
      table.userId,
      table.createdAt,
    ),
    userStageIdx: index("applications_user_stage_idx").on(
      table.userId,
      table.stage,
    ),
    organizationCreatedAtIdx: index("applications_org_created_at_idx").on(
      table.organizationId,
      table.createdAt,
    ),
  }),
);
