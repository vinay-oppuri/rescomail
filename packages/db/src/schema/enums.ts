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


export const seniorityEnum = pgEnum("seniority", [
  "intern",
  "new_grad",
  "junior",
  "mid",
  "senior",
  "lead",
]);

export const workModeEnum = pgEnum("work_mode", [
  "remote",
  "hybrid",
  "onsite",
]);

export const employmentTypeEnum = pgEnum("employment_type", [
  "internship",
  "full_time",
  "part_time",
  "contract",
  "freelance",
]);

export const companyStageEnum = pgEnum("company_stage", [
  "startup",
  "scaleup",
  "enterprise",
  "open",
]);