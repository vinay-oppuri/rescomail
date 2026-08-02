import { index, integer, jsonb, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

import { user } from "./auth";
import { usageEventType } from "./enums";

export const usageEvents = pgTable("usage_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
  type: usageEventType("type").notNull(),
  operationId: uuid("operation_id").notNull(),
  status: text("status").default("reserved").notNull(),
  quantity: integer("quantity").default(1).notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
},
  (table) => ({
    userCreatedAtIdx: index("usage_events_user_created_at_idx").on(
      table.userId,
      table.createdAt,
    ),
    operationIdx: uniqueIndex("usage_events_operation_id_idx").on(table.operationId),
  }),
);
