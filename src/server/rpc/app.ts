import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import type { MiddlewareHandler } from "hono";
import { z } from "zod";
import { auth } from "~/lib/auth";
import type { AuthMeResponseDTO } from "~/types/auth";
import type { SyncClearRequestDTO, SyncPullRequestDTO, SyncPushRequestDTO } from "~/types/sync";
import { getProfileForUser } from "~/server/billing/profile-service";
import { createCheckout } from "~/server/billing/billing-service";
import type { CheckoutRequestDTO } from "~/lib/billing/types";
import { clearSyncRecords, pullSyncRecords, pushSyncRecords } from "~/server/sync/sync-service";

type SessionData = NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>;

type RpcVariables = {
  session: SessionData;
};

async function toAuthMeResponse(session: SessionData): Promise<AuthMeResponseDTO> {
  const profile = await getProfileForUser(session.user.id);

  return {
    user: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name ?? null,
      image: session.user.image ?? null,
      isPro: profile.isPro,
      plan: profile.plan,
    },
    session: {
      id: session.session.id,
      expiresAt: new Date(session.session.expiresAt).toISOString(),
    },
  };
}

const requireSession: MiddlewareHandler<{ Variables: RpcVariables }> = async (c, next) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  c.set("session", session);
  await next();
};

const EchoSchema = z.object({
  message: z.string().min(1),
});

const CheckoutSchema = z.object({
  planKey: z.enum(["free", "monthly", "annual"]),
  provider: z.enum(["stripe", "creem"]).optional(),
  successUrl: z.string().optional(),
  cancelUrl: z.string().optional(),
});

const SyncRecordSchema = z.object({
  recordId: z.string().min(1),
  recordType: z.enum(["chat", "note"]),
  payload: z.string(),
  updatedAt: z.string().datetime(),
  deletedAt: z.string().datetime().optional(),
});

const SyncPullSchema = z.object({
  since: z.string().datetime().optional(),
  deviceId: z.string().min(1),
});

const SyncPushSchema = z.object({
  deviceId: z.string().min(1),
  records: z.array(SyncRecordSchema),
});

const SyncClearSchema = z.object({
  deviceId: z.string().min(1),
});

const app = new Hono<{ Variables: RpcVariables }>().basePath("/api");

const routes = app
  .get("/rpc/health", (c) => {
    return c.json({ ok: true });
  })
  .post("/rpc/echo", zValidator("json", EchoSchema), (c) => {
    const input = c.req.valid("json");
    return c.json({ message: input.message });
  })
  .get("/rpc/me", requireSession, async (c) => {
    const session = c.get("session");
    return c.json(await toAuthMeResponse(session));
  })
  .post("/rpc/billing/checkout", requireSession, zValidator("json", CheckoutSchema), async (c) => {
    const session = c.get("session");
    const input = c.req.valid("json") as CheckoutRequestDTO;

    try {
      const response = await createCheckout(input, {
        id: session.user.id,
        email: session.user.email ?? null,
      });
      return c.json(response);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Checkout failed";
      return c.json({ error: message }, 400);
    }
  })
  .post("/rpc/sync/pull", requireSession, zValidator("json", SyncPullSchema), async (c) => {
    const session = c.get("session");
    const input = c.req.valid("json") as SyncPullRequestDTO;

    const response = await pullSyncRecords({
      userId: session.user.id,
      since: input.since,
    });

    return c.json(response);
  })
  .post("/rpc/sync/push", requireSession, zValidator("json", SyncPushSchema), async (c) => {
    const session = c.get("session");
    const input = c.req.valid("json") as SyncPushRequestDTO;

    const response = await pushSyncRecords({
      userId: session.user.id,
      records: input.records,
    });

    return c.json(response);
  })
  .post("/rpc/sync/clear", requireSession, zValidator("json", SyncClearSchema), async (c) => {
    const session = c.get("session");
    const _input = c.req.valid("json") as SyncClearRequestDTO;

    const response = await clearSyncRecords({
      userId: session.user.id,
    });

    return c.json(response);
  });

export type AppType = typeof routes;
export { routes as app };
