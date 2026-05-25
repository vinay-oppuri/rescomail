CREATE TYPE "public"."company_stage" AS ENUM('startup', 'scaleup', 'enterprise', 'open');--> statement-breakpoint
CREATE TYPE "public"."employment_type" AS ENUM('internship', 'full_time', 'part_time', 'contract', 'freelance');--> statement-breakpoint
CREATE TYPE "public"."seniority" AS ENUM('intern', 'new_grad', 'junior', 'mid', 'senior', 'lead');--> statement-breakpoint
CREATE TYPE "public"."work_mode" AS ENUM('remote', 'hybrid', 'onsite');--> statement-breakpoint
CREATE TABLE "user_preferences" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"target_roles" text[] DEFAULT '{}' NOT NULL,
	"target_seniority" "seniority",
	"industry_preferences" text[] DEFAULT '{}',
	"salary_expectation" jsonb,
	"preferred_locations" jsonb,
	"work_modes" "work_mode"[] DEFAULT '{"remote"}',
	"employment_types" "employment_type"[] DEFAULT '{"full_time"}',
	"company_preferences" "company_stage"[] DEFAULT '{"open"}',
	"excluded_companies" text[] DEFAULT '{}',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cold_emails" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"organization_id" uuid,
	"resume_id" uuid NOT NULL,
	"job_title" text NOT NULL,
	"company_name" text NOT NULL,
	"recipient_name" text NOT NULL,
	"recipient_role" text NOT NULL,
	"job_description" text NOT NULL,
	"company_context" text NOT NULL,
	"personal_note" text NOT NULL,
	"tone" varchar(50) NOT NULL,
	"length" varchar(50) NOT NULL,
	"call_to_action" varchar(50) NOT NULL,
	"draft" jsonb NOT NULL,
	"subject" text NOT NULL,
	"preview_text" text NOT NULL,
	"body" text NOT NULL,
	"quality_score" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cold_emails" ADD CONSTRAINT "cold_emails_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cold_emails" ADD CONSTRAINT "cold_emails_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cold_emails" ADD CONSTRAINT "cold_emails_resume_id_resumes_id_fk" FOREIGN KEY ("resume_id") REFERENCES "public"."resumes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "cold_emails_user_created_at_idx" ON "cold_emails" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "cold_emails_resume_created_at_idx" ON "cold_emails" USING btree ("resume_id","created_at");--> statement-breakpoint
CREATE INDEX "cold_emails_org_created_at_idx" ON "cold_emails" USING btree ("organization_id","created_at");--> statement-breakpoint
CREATE INDEX "cold_emails_quality_score_idx" ON "cold_emails" USING btree ("quality_score");