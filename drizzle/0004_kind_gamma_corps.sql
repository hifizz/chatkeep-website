CREATE TABLE "chat_aside_share_link" (
	"id" text PRIMARY KEY NOT NULL,
	"owner_user_id" text NOT NULL,
	"title" text NOT NULL,
	"source_chat_url" text NOT NULL,
	"source_platform" text NOT NULL,
	"access_mode" text NOT NULL,
	"expiry_mode" text NOT NULL,
	"expires_at" timestamp,
	"password_hash" text,
	"password_salt" text,
	"status" text NOT NULL,
	"snapshot_json" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"revoked_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "chat_aside_share_link" ADD CONSTRAINT "chat_aside_share_link_owner_user_id_chat_aside_user_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."chat_aside_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "share_link_owner_idx" ON "chat_aside_share_link" USING btree ("owner_user_id");--> statement-breakpoint
CREATE INDEX "share_link_status_idx" ON "chat_aside_share_link" USING btree ("status");--> statement-breakpoint
CREATE INDEX "share_link_expires_at_idx" ON "chat_aside_share_link" USING btree ("expires_at");