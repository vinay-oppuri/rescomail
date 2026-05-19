CREATE TABLE "ats_analyses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"organization_id" uuid,
	"resume_id" uuid NOT NULL,
	"job_title" text NOT NULL,
	"company_name" text NOT NULL,
	"job_description" text NOT NULL,
	"target_keywords" jsonb NOT NULL,
	"analysis" jsonb NOT NULL,
	"overall_score" integer NOT NULL,
	"verdict" varchar(50) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ats_analyses" ADD CONSTRAINT "ats_analyses_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ats_analyses" ADD CONSTRAINT "ats_analyses_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ats_analyses" ADD CONSTRAINT "ats_analyses_resume_id_resumes_id_fk" FOREIGN KEY ("resume_id") REFERENCES "public"."resumes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ats_analyses_user_created_at_idx" ON "ats_analyses" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "ats_analyses_resume_created_at_idx" ON "ats_analyses" USING btree ("resume_id","created_at");--> statement-breakpoint
CREATE INDEX "ats_analyses_org_created_at_idx" ON "ats_analyses" USING btree ("organization_id","created_at");--> statement-breakpoint
CREATE INDEX "ats_analyses_score_idx" ON "ats_analyses" USING btree ("overall_score");