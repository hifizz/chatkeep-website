CREATE TABLE "chat_aside_sync_records" (
	"user_id" text NOT NULL,
	"record_type" text NOT NULL,
	"record_id" text NOT NULL,
	"payload" text NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "chat_aside_sync_records_user_id_record_type_record_id_pk" PRIMARY KEY("user_id","record_type","record_id")
);
--> statement-breakpoint
ALTER TABLE "chat_aside_sync_records" ADD CONSTRAINT "chat_aside_sync_records_user_id_chat_aside_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."chat_aside_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "sync_record_user_updated_at_idx" ON "chat_aside_sync_records" USING btree ("user_id","updated_at");--> statement-breakpoint
CREATE INDEX "sync_record_user_deleted_at_idx" ON "chat_aside_sync_records" USING btree ("user_id","deleted_at");