import { pgEnum } from "drizzle-orm/pg-core";

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
