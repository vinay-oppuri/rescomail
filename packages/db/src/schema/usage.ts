import { index, integer, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { user } from "./auth";
import { usageEventType } from "./enums";
import { organizations } from "./organizations";

export const usageEvents = pgTable("usage_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").references(() => organizations.id, { onDelete: "cascade", }),
  userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
  type: usageEventType("type").notNull(),
  quantity: integer("quantity").default(1).notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
},
  (table) => ({
    organizationCreatedAtIdx: index("usage_events_org_created_at_idx").on(
      table.organizationId,
      table.createdAt,
    ),
    userCreatedAtIdx: index("usage_events_user_created_at_idx").on(
      table.userId,
      table.createdAt,
    ),
  }),
);
