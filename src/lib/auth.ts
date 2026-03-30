import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { creem } from "@creem_io/better-auth";
import { db } from "~/server/db";
import { env } from "~/env";
import { sendEmail } from "./email";
import { syncCreemRefundEvent, syncCreemSubscriptionEvent } from "~/server/billing/creem-sync";
import { getAllowedOrigins, isExtensionOrigin } from "./allowed-origins";

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

function getTrustedOrigins(): string[] {
  const baseOrigin = new URL(env.BETTER_AUTH_URL).origin;
  const allowedOrigins = getAllowedOrigins(env.AUTH_ALLOWED_ORIGINS, env.NODE_ENV);
  return Array.from(new Set([baseOrigin, ...allowedOrigins]));
}

const trustedOrigins = getTrustedOrigins();
const useSecureCookies = env.BETTER_AUTH_URL.startsWith("https://");
const hasExtensionOrigin = trustedOrigins.some(isExtensionOrigin);
const defaultCookieAttributes =
  useSecureCookies && hasExtensionOrigin
    ? {
        sameSite: "none" as const,
        secure: true,
      }
    : undefined;

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
  trustedOrigins,
  advanced: {
    useSecureCookies,
    ...(defaultCookieAttributes ? { defaultCookieAttributes } : {}),
  },
  plugins: creemPlugin ? [creemPlugin] : [],
});
