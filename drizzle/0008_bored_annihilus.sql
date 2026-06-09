CREATE TABLE "chat_aside_published_artifact" (
	"id" text PRIMARY KEY NOT NULL,
	"owner_user_id" text NOT NULL,
	"blob_hash" text NOT NULL,
	"title" text NOT NULL,
	"platform" text NOT NULL,
	"kind" text NOT NULL,
	"access_mode" text NOT NULL,
	"status" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"expires_at" timestamp,
	"revoked_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "chat_aside_published_artifact" ADD CONSTRAINT "chat_aside_published_artifact_owner_user_id_chat_aside_user_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."chat_aside_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "published_artifact_owner_idx" ON "chat_aside_published_artifact" USING btree ("owner_user_id");--> statement-breakpoint
CREATE INDEX "published_artifact_status_idx" ON "chat_aside_published_artifact" USING btree ("status");--> statement-breakpoint
CREATE INDEX "published_artifact_blob_hash_idx" ON "chat_aside_published_artifact" USING btree ("blob_hash");