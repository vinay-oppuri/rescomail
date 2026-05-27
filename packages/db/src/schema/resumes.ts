import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { user } from "./auth";
import { organizations } from "./organizations";

export const resumes = pgTable("resumes", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  organizationId: uuid("organization_id").references(() => organizations.id, { onDelete: "set null", }),
  title: text("title").notNull(),
  fileUrl: text("file_url").notNull(),
  fileKey: text("file_key").notNull(),
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size").notNull(),
  mimeType: text("mime_type").notNull(),
  storageProvider: varchar("storage_provider", { length: 50 }).default("uploadthing").notNull(),
  parsedText: text("parsed_text"),
  parsedJson: jsonb("parsed_json"),
  status: varchar("status", { length: 50 }).default("uploaded").notNull(),
  parsingError: text("parsing_error"),
  parsedAt: timestamp("parsed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
},
  (table) => ({
    userIdIdx: index("resume_user_id_idx").on(table.userId),
    organizationIdIdx: index("resume_organization_id_idx").on(
      table.organizationId,
    ),
    statusIdx: index("resume_status_idx").on(table.status),
    fileKeyIdx: uniqueIndex("resume_file_key_idx").on(table.fileKey),
  }),
);
