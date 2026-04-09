CREATE TABLE "chat_aside_extension_release" (
	"id" text PRIMARY KEY NOT NULL,
	"source_repo" text NOT NULL,
	"release_id" text NOT NULL,
	"channel" text NOT NULL,
	"version" text NOT NULL,
	"tag" text,
	"commit_sha" text NOT NULL,
	"commit_ref" text NOT NULL,
	"released_at" timestamp with time zone NOT NULL,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chat_aside_extension_release_artifact" (
	"id" text PRIMARY KEY NOT NULL,
	"release_record_id" text NOT NULL,
	"browser" text NOT NULL,
	"file_name" text NOT NULL,
	"download_url" text NOT NULL,
	"sha256" text NOT NULL,
	"size_bytes" bigint NOT NULL,
	"content_type" text NOT NULL,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chat_aside_extension_release_latest" (
	"channel" text PRIMARY KEY NOT NULL,
	"release_record_id" text NOT NULL,
	"version" text NOT NULL,
	"tag" text,
	"released_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "chat_aside_extension_release_artifact" ADD CONSTRAINT "chat_aside_extension_release_artifact_release_record_id_chat_aside_extension_release_id_fk" FOREIGN KEY ("release_record_id") REFERENCES "public"."chat_aside_extension_release"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_aside_extension_release_latest" ADD CONSTRAINT "chat_aside_extension_release_latest_release_record_id_chat_aside_extension_release_id_fk" FOREIGN KEY ("release_record_id") REFERENCES "public"."chat_aside_extension_release"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "extension_release_release_id_uidx" ON "chat_aside_extension_release" USING btree ("release_id");--> statement-breakpoint
CREATE INDEX "extension_release_channel_released_at_idx" ON "chat_aside_extension_release" USING btree ("channel","released_at");--> statement-breakpoint
CREATE INDEX "extension_release_created_at_idx" ON "chat_aside_extension_release" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "extension_release_artifact_release_idx" ON "chat_aside_extension_release_artifact" USING btree ("release_record_id");--> statement-breakpoint
CREATE UNIQUE INDEX "extension_release_artifact_release_browser_uidx" ON "chat_aside_extension_release_artifact" USING btree ("release_record_id","browser");--> statement-breakpoint
CREATE INDEX "extension_release_latest_release_idx" ON "chat_aside_extension_release_latest" USING btree ("release_record_id");