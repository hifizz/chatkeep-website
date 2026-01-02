CREATE TABLE "chat_aside_billing_webhook_event" (
	"id" text PRIMARY KEY NOT NULL,
	"provider" text NOT NULL,
	"event_type" text NOT NULL,
	"received_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chat_aside_user_subscription" (
	"user_id" text PRIMARY KEY NOT NULL,
	"plan_key" text NOT NULL,
	"provider" text NOT NULL,
	"status" text NOT NULL,
	"current_period_start" timestamp NOT NULL,
	"current_period_end" timestamp NOT NULL,
	"cancel_at_period_end" boolean DEFAULT false NOT NULL,
	"trial_ends_at" timestamp,
	"trial_used" boolean DEFAULT false NOT NULL,
	"past_due_at" timestamp,
	"provider_customer_id" text,
	"provider_subscription_id" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "chat_aside_user_subscription" ADD CONSTRAINT "chat_aside_user_subscription_user_id_chat_aside_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."chat_aside_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "billing_webhook_event_provider_idx" ON "chat_aside_billing_webhook_event" USING btree ("provider");--> statement-breakpoint
CREATE INDEX "user_subscription_user_id_idx" ON "chat_aside_user_subscription" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_subscription_provider_idx" ON "chat_aside_user_subscription" USING btree ("provider","provider_subscription_id");