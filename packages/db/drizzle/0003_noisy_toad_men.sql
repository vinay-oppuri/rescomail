ALTER TABLE "cold_emails" ADD COLUMN "company_website_url" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "cold_emails" ALTER COLUMN "company_website_url" DROP DEFAULT;
