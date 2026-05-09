CREATE TABLE "chat_aside_quota_idempotency" (
	"user_id" text NOT NULL,
	"idempotency_key" text NOT NULL,
	"result_ok" boolean NOT NULL,
	"result_remaining" integer NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	CONSTRAINT "chat_aside_quota_idempotency_user_id_idempotency_key_pk" PRIMARY KEY("user_id","idempotency_key")
);
--> statement-breakpoint
CREATE TABLE "chat_aside_user_daily_quota" (
	"user_id" text NOT NULL,
	"date" date NOT NULL,
	"premium_export_count" integer DEFAULT 0 NOT NULL,
	"prompt_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "chat_aside_user_daily_quota_user_id_date_pk" PRIMARY KEY("user_id","date")
);
--> statement-breakpoint
ALTER TABLE "chat_aside_quota_idempotency" ADD CONSTRAINT "chat_aside_quota_idempotency_user_id_chat_aside_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."chat_aside_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_aside_user_daily_quota" ADD CONSTRAINT "chat_aside_user_daily_quota_user_id_chat_aside_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."chat_aside_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "quota_idempotency_created_at_idx" ON "chat_aside_quota_idempotency" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "share_link_owner_status_idx" ON "chat_aside_share_link" USING btree ("owner_user_id","status");