// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { sql } from "drizzle-orm";
import {
  index,
  primaryKey,
  pgTableCreator,
  text,
  timestamp,
  boolean,
  // integer,
  // pgTable,
} from "drizzle-orm/pg-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `chat_aside_${name}`);

export const posts = createTable(
  "post",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    name: d.varchar({ length: 256 }),
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [index("name_idx").on(t.name)],
);

export const user = createTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified")
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

export const session = createTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = createTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = createTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").$defaultFn(() => new Date()),
  updatedAt: timestamp("updated_at").$defaultFn(() => new Date()),
});

export const userSubscription = createTable(
  "user_subscription",
  () => ({
    userId: text("user_id")
      .primaryKey()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    planKey: text("plan_key").notNull(),
    provider: text("provider").notNull(),
    status: text("status").notNull(),
    currentPeriodStart: timestamp("current_period_start").notNull(),
    currentPeriodEnd: timestamp("current_period_end").notNull(),
    cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false).notNull(),
    trialEndsAt: timestamp("trial_ends_at"),
    trialUsed: boolean("trial_used").default(false).notNull(),
    pastDueAt: timestamp("past_due_at"),
    providerCustomerId: text("provider_customer_id"),
    providerSubscriptionId: text("provider_subscription_id"),
    createdAt: timestamp("created_at")
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestamp("updated_at")
      .$defaultFn(() => new Date())
      .notNull(),
  }),
  (t) => [
    index("user_subscription_user_id_idx").on(t.userId),
    index("user_subscription_provider_idx").on(t.provider, t.providerSubscriptionId),
  ],
);

export const syncRecord = createTable(
  "sync_records",
  (d) => ({
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    recordType: text("record_type").notNull(),
    recordId: text("record_id").notNull(),
    payload: text("payload").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  }),
  (t) => [
    primaryKey({ columns: [t.userId, t.recordType, t.recordId] }),
    index("sync_record_user_updated_at_idx").on(t.userId, t.updatedAt),
    index("sync_record_user_deleted_at_idx").on(t.userId, t.deletedAt),
  ],
);

export const billingWebhookEvent = createTable(
  "billing_webhook_event",
  () => ({
    id: text("id").primaryKey(),
    provider: text("provider").notNull(),
    eventType: text("event_type").notNull(),
    receivedAt: timestamp("received_at")
      .$defaultFn(() => new Date())
      .notNull(),
  }),
  (t) => [index("billing_webhook_event_provider_idx").on(t.provider)],
);
