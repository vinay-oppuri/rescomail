-- Product-scope cleanup. This beta has no production data; removed feature data is intentionally dropped.
DROP TABLE IF EXISTS "job_notifications" CASCADE;--> statement-breakpoint
DROP TABLE IF EXISTS "applications" CASCADE;--> statement-breakpoint
DROP TABLE IF EXISTS "subscriptions" CASCADE;--> statement-breakpoint
DROP TABLE IF EXISTS "organization_members" CASCADE;--> statement-breakpoint
DROP TABLE IF EXISTS "organizations" CASCADE;--> statement-breakpoint

ALTER TABLE "resumes" DROP COLUMN IF EXISTS "organization_id";--> statement-breakpoint
ALTER TABLE "ats_analyses" DROP COLUMN IF EXISTS "organization_id";--> statement-breakpoint
ALTER TABLE "cold_emails" DROP COLUMN IF EXISTS "organization_id";--> statement-breakpoint
ALTER TABLE "usage_events" DROP COLUMN IF EXISTS "organization_id";--> statement-breakpoint

ALTER TABLE "user_preferences"
  DROP COLUMN IF EXISTS "target_roles",
  DROP COLUMN IF EXISTS "target_seniority",
  DROP COLUMN IF EXISTS "industry_preferences",
  DROP COLUMN IF EXISTS "salary_expectation",
  DROP COLUMN IF EXISTS "preferred_locations",
  DROP COLUMN IF EXISTS "work_modes",
  DROP COLUMN IF EXISTS "employment_types",
  DROP COLUMN IF EXISTS "company_preferences",
  DROP COLUMN IF EXISTS "excluded_companies";--> statement-breakpoint

CREATE UNIQUE INDEX IF NOT EXISTS "user_preferences_user_id_unique"
  ON "user_preferences" ("user_id");--> statement-breakpoint

ALTER TABLE "usage_events" ADD COLUMN "operation_id" uuid;--> statement-breakpoint
ALTER TABLE "usage_events" ADD COLUMN "status" text DEFAULT 'consumed' NOT NULL;--> statement-breakpoint
ALTER TABLE "usage_events" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "usage_events" ADD COLUMN "expires_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
UPDATE "usage_events" SET "operation_id" = gen_random_uuid() WHERE "operation_id" IS NULL;--> statement-breakpoint
ALTER TABLE "usage_events" ALTER COLUMN "operation_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "usage_events" ALTER COLUMN "status" SET DEFAULT 'reserved';--> statement-breakpoint
CREATE UNIQUE INDEX "usage_events_operation_id_idx" ON "usage_events" ("operation_id");--> statement-breakpoint

ALTER TABLE "usage_events" ALTER COLUMN "type" TYPE text USING "type"::text;--> statement-breakpoint
DROP TYPE IF EXISTS "usage_event_type";--> statement-breakpoint
CREATE TYPE "usage_event_type" AS ENUM ('resume_upload', 'resume_parse', 'ats_analysis', 'cold_email_generate');--> statement-breakpoint
ALTER TABLE "usage_events" ALTER COLUMN "type" TYPE "usage_event_type" USING "type"::"usage_event_type";--> statement-breakpoint

DROP TYPE IF EXISTS "application_stage";--> statement-breakpoint
DROP TYPE IF EXISTS "subscription_status";--> statement-breakpoint
DROP TYPE IF EXISTS "organization_role";--> statement-breakpoint
DROP TYPE IF EXISTS "seniority";--> statement-breakpoint
DROP TYPE IF EXISTS "work_mode";--> statement-breakpoint
DROP TYPE IF EXISTS "employment_type";--> statement-breakpoint
DROP TYPE IF EXISTS "company_stage";
