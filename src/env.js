import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    DATABASE_URL: z.string().url(),
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    BETTER_AUTH_SECRET: z.string().min(1),
    BETTER_AUTH_URL: z.string().url(),
    RESEND_API_KEY: z.string().min(1),
    AUTH_ALLOWED_ORIGINS: z.string().optional(),
    STRIPE_SECRET_KEY: z.string().optional(),
    STRIPE_WEBHOOK_SECRET: z.string().optional(),
    CREEM_API_KEY: z.string().optional(),
    CREEM_WEBHOOK_SECRET: z.string().optional(),
    CREEM_PRODUCT_ID_MONTHLY: z.string().optional(),
    CREEM_PRODUCT_ID_ANNUAL: z.string().optional(),
    SUBSCRIPTION_TRIAL_DAYS: z.coerce.number().int().min(0).optional(),
    PAST_DUE_GRACE_DAYS: z.coerce.number().int().min(0).optional(),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    NEXT_PUBLIC_GA_ID: z.string().optional(),
    NEXT_PUBLIC_CLARITY_ID: z.string().optional(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    AUTH_ALLOWED_ORIGINS: process.env.AUTH_ALLOWED_ORIGINS,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    CREEM_API_KEY: process.env.CREEM_API_KEY,
    CREEM_WEBHOOK_SECRET: process.env.CREEM_WEBHOOK_SECRET,
    CREEM_PRODUCT_ID_MONTHLY: process.env.CREEM_PRODUCT_ID_MONTHLY,
    CREEM_PRODUCT_ID_ANNUAL: process.env.CREEM_PRODUCT_ID_ANNUAL,
    SUBSCRIPTION_TRIAL_DAYS: process.env.SUBSCRIPTION_TRIAL_DAYS,
    PAST_DUE_GRACE_DAYS: process.env.PAST_DUE_GRACE_DAYS,
    NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID,
    NEXT_PUBLIC_CLARITY_ID: process.env.NEXT_PUBLIC_CLARITY_ID,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
