import { jsonb, uuid } from "drizzle-orm/pg-core";
import { boolean, text, timestamp, pgTable, integer, bigint } from "drizzle-orm/pg-core";
import { companyStageEnum, employmentTypeEnum, seniorityEnum, workModeEnum } from "./enums";

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
  userId: text("user_id").notNull().references(() => user.id),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id").notNull().references(() => user.id),
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



export const userPreferences = pgTable("user_preferences", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  targetRoles: text("target_roles").array().notNull().default([]),
  targetSeniority: seniorityEnum("target_seniority"),
  industryPreferences: text("industry_preferences").array().default([]),
  salaryExpectation: jsonb("salary_expectation").$type<{
    min?: number;
    ideal?: number;
    currency: string;
  }>(),
  preferredLocations: jsonb("preferred_locations").$type<{
    country?: string;
    state?: string;
    city?: string;
    remote?: boolean;
  }[]>(),
  workModes: workModeEnum("work_modes").array().default(["remote"]),
  employmentTypes: employmentTypeEnum("employment_types").array().default(["full_time"]),
  companyPreferences: companyStageEnum("company_preferences").array().default(["open"]),
  excludedCompanies: text("excluded_companies").array().default([]),
  geminiApiKey: text("gemini_api_key"),
  groqApiKey: text("groq_api_key"),
  primaryProvider: text("primary_provider").default("gemini"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const rateLimit = pgTable("rate_limit", {
  id: text("id").primaryKey(),
  key: text("key"),
  count: integer("count"),
  lastRequest: bigint("last_request", { mode: "number" }),
});

export const userProfile = pgTable("user_profile", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),
  fullName: text("full_name"),
  email: text("email"),
  phone: text("phone"),
  location: text("location"),
  portfolioUrl: text("portfolio_url"),
  githubUrl: text("github_url"),
  linkedinUrl: text("linkedin_url"),
  extraLinks: jsonb("extra_links").$type<{ label: string; url: string }[]>(),
  isComplete: boolean("is_complete").default(false).notNull(),
  lastPromptedAt: timestamp("last_prompted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});