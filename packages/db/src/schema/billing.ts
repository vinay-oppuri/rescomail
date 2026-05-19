import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { subscriptionStatus } from "./enums";
import { organizations } from "./organizations";

export const subscriptions = pgTable(
  "subscriptions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    provider: varchar("provider", { length: 50 }).default("stripe").notNull(),
    providerCustomerId: text("provider_customer_id"),
    providerSubscriptionId: text("provider_subscription_id"),
    planKey: varchar("plan_key", { length: 80 }).default("free").notNull(),
    status: subscriptionStatus("status").default("trialing").notNull(),
    currentPeriodStart: timestamp("current_period_start", {
      withTimezone: true,
    }),
    currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
    cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    organizationIdIdx: uniqueIndex("subscriptions_org_id_idx").on(
      table.organizationId,
    ),
    providerCustomerIdIdx: index("subscriptions_provider_customer_id_idx").on(
      table.providerCustomerId,
    ),
    providerSubscriptionIdIdx: uniqueIndex(
      "subscriptions_provider_subscription_id_idx",
    ).on(table.providerSubscriptionId),
  }),
);
