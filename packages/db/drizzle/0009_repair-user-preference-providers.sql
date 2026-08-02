ALTER TABLE "user_preferences"
  ADD COLUMN IF NOT EXISTS "groq_api_key" text;--> statement-breakpoint
ALTER TABLE "user_preferences"
  ADD COLUMN IF NOT EXISTS "primary_provider" text;--> statement-breakpoint
ALTER TABLE "user_preferences"
  ALTER COLUMN "primary_provider" SET DEFAULT 'gemini';
