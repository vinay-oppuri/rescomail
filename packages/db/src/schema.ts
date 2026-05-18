import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const organizationRole = pgEnum("organization_role", [
  "owner",
  "admin",
  "member",
]);

export const subscriptionStatus = pgEnum("subscription_status", [
  "trialing",
  "active",
  "past_due",
  "canceled",
  "unpaid",
]);

export const usageEventType = pgEnum("usage_event_type", [
  "resume_upload",
  "resume_parse",
  "ats_analysis",
  "cold_email_generate",
  "application_create",
]);

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

export const organizations = pgTable(
  "organizations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    slug: varchar("slug", { length: 120 }).notNull(),
    ownerId: text("owner_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    ownerIdIdx: index("organizations_owner_id_idx").on(table.ownerId),
    slugIdx: uniqueIndex("organizations_slug_idx").on(table.slug),
  }),
);

export const organizationMembers = pgTable(
  "organization_members",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: organizationRole("role").default("member").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    organizationIdIdx: index("organization_members_org_id_idx").on(
      table.organizationId,
    ),
    userIdIdx: index("organization_members_user_id_idx").on(table.userId),
    membershipIdx: uniqueIndex("organization_membership_idx").on(
      table.organizationId,
      table.userId,
    ),
  }),
);

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

export const usageEvents = pgTable(
  "usage_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id").references(() => organizations.id, {
      onDelete: "cascade",
    }),
    userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
    type: usageEventType("type").notNull(),
    quantity: integer("quantity").default(1).notNull(),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
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

export const resumes = pgTable(
  "resumes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    organizationId: uuid("organization_id").references(() => organizations.id, {
      onDelete: "set null",
    }),
    title: text("title").notNull(),
    fileUrl: text("file_url").notNull(),
    fileKey: text("file_key").notNull(),
    fileName: text("file_name").notNull(),
    fileSize: integer("file_size").notNull(),
    mimeType: text("mime_type").notNull(),
    storageProvider: varchar("storage_provider", { length: 50 })
      .default("uploadthing")
      .notNull(),
    parsedText: text("parsed_text"),
    parsedJson: jsonb("parsed_json"),
    status: varchar("status", { length: 50 }).default("uploaded").notNull(),
    parsingError: text("parsing_error"),
    parsedAt: timestamp("parsed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
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

export const organizationsRelations = relations(
  organizations,
  ({ many, one }) => ({
    owner: one(user, {
      fields: [organizations.ownerId],
      references: [user.id],
    }),
    members: many(organizationMembers),
    resumes: many(resumes),
    usageEvents: many(usageEvents),
    subscriptions: many(subscriptions),
  }),
);

export const organizationMembersRelations = relations(
  organizationMembers,
  ({ one }) => ({
    organization: one(organizations, {
      fields: [organizationMembers.organizationId],
      references: [organizations.id],
    }),
    user: one(user, {
      fields: [organizationMembers.userId],
      references: [user.id],
    }),
  }),
);

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  organization: one(organizations, {
    fields: [subscriptions.organizationId],
    references: [organizations.id],
  }),
}));

export const usageEventsRelations = relations(usageEvents, ({ one }) => ({
  organization: one(organizations, {
    fields: [usageEvents.organizationId],
    references: [organizations.id],
  }),
  user: one(user, {
    fields: [usageEvents.userId],
    references: [user.id],
  }),
}));

export const resumesRelations = relations(resumes, ({ one }) => ({
  user: one(user, {
    fields: [resumes.userId],
    references: [user.id],
  }),
  organization: one(organizations, {
    fields: [resumes.organizationId],
    references: [organizations.id],
  }),
}));
