CREATE TYPE "public"."application_stage" AS ENUM('saved', 'applied', 'phone_screen', 'interview', 'offer', 'rejected');--> statement-breakpoint
CREATE TABLE "applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"organization_id" uuid,
	"resume_id" uuid,
	"job_title" text NOT NULL,
	"company_name" text NOT NULL,
	"job_url" text,
	"stage" "application_stage" DEFAULT 'saved' NOT NULL,
	"notes" text,
	"applied_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ats_analyses" ALTER COLUMN "analysis" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "ats_analyses" ALTER COLUMN "overall_score" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "ats_analyses" ALTER COLUMN "verdict" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "cold_emails" ALTER COLUMN "draft" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "cold_emails" ALTER COLUMN "subject" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "cold_emails" ALTER COLUMN "preview_text" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "cold_emails" ALTER COLUMN "body" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "cold_emails" ALTER COLUMN "quality_score" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "ats_analyses" ADD COLUMN "status" varchar(50) DEFAULT 'processing' NOT NULL;--> statement-breakpoint
ALTER TABLE "ats_analyses" ADD COLUMN "error" text;--> statement-breakpoint
ALTER TABLE "cold_emails" ADD COLUMN "status" varchar(50) DEFAULT 'processing' NOT NULL;--> statement-breakpoint
ALTER TABLE "cold_emails" ADD COLUMN "error" text;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_resume_id_resumes_id_fk" FOREIGN KEY ("resume_id") REFERENCES "public"."resumes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "applications_user_created_at_idx" ON "applications" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "applications_user_stage_idx" ON "applications" USING btree ("user_id","stage");--> statement-breakpoint
CREATE INDEX "applications_org_created_at_idx" ON "applications" USING btree ("organization_id","created_at");--> statement-breakpoint
CREATE INDEX "ats_analyses_status_idx" ON "ats_analyses" USING btree ("status");--> statement-breakpoint
CREATE INDEX "cold_emails_status_idx" ON "cold_emails" USING btree ("status");