import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

import { user } from "./auth";

export const jobNotifications = pgTable("job_notifications", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  company: text("company").notNull(),
  location: text("location").notNull(),
  matchScore: integer("match_score").notNull(),
  timeAgo: text("time_ago").notNull(),
  url: text("url"),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
},
  (table) => ({
    userCreatedAtIdx: index("job_notifications_user_created_at_idx").on(
      table.userId,
      table.createdAt,
    ),
    userIsReadIdx: index("job_notifications_user_is_read_idx").on(
      table.userId,
      table.isRead,
    ),
  }),
);
