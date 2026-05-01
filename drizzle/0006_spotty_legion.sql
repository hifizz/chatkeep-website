ALTER TABLE "chat_aside_user" ADD COLUMN "sync_enabled" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "chat_aside_user" ADD COLUMN "sync_consented_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "chat_aside_user" ADD COLUMN "sync_updated_at" timestamp with time zone DEFAULT now() NOT NULL;