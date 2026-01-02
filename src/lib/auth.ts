import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { creem } from "@creem_io/better-auth";
import { db } from "~/server/db";
import { env } from "~/env";
import { sendEmail } from "./email";
import { syncCreemRefundEvent, syncCreemSubscriptionEvent } from "~/server/billing/creem-sync";

const ResetPasswordTemplate = ({ url }: { url: string }) => `
  <div>
    <h1>Reset Your Password</h1>
    <p>Click the link below to reset your password.</p>
    <a href="${url}">Reset Password</a>
  </div>
`;

const creemPlugin = env.CREEM_API_KEY
  ? creem({
      apiKey: env.CREEM_API_KEY,
      webhookSecret: env.CREEM_WEBHOOK_SECRET,
      testMode: env.NODE_ENV !== "production",
      defaultSuccessUrl: "/billing/success",
      persistSubscriptions: false,
      onSubscriptionActive: syncCreemSubscriptionEvent,
      onSubscriptionTrialing: syncCreemSubscriptionEvent,
      onSubscriptionCanceled: syncCreemSubscriptionEvent,
      onSubscriptionPaid: syncCreemSubscriptionEvent,
      onSubscriptionExpired: syncCreemSubscriptionEvent,
      onSubscriptionUnpaid: syncCreemSubscriptionEvent,
      onSubscriptionUpdate: syncCreemSubscriptionEvent,
      onSubscriptionPastDue: syncCreemSubscriptionEvent,
      onSubscriptionPaused: syncCreemSubscriptionEvent,
      onRefundCreated: syncCreemRefundEvent,
    })
  : null;

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Reset your password",
        html: ResetPasswordTemplate({ url }),
      });
    },
  },
  secret: env.BETTER_AUTH_SECRET,
  baseUrl: env.BETTER_AUTH_URL,
  plugins: creemPlugin ? [creemPlugin] : [],
});
