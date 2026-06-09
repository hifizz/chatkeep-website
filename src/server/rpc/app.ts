import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import type { MiddlewareHandler } from "hono";
import { z } from "zod";
import { auth } from "~/lib/auth";
import type { AuthMeResponseDTO } from "~/types/auth";
import type {
  SyncClearRequestDTO,
  SyncPolicyErrorCode,
  SyncPullRequestDTO,
  SyncPushRequestDTO,
  SyncSettingsUpdateRequestDTO,
} from "~/types/sync";
import { getProfileForUser } from "~/server/billing/profile-service";
import { createCheckout } from "~/server/billing/billing-service";
import type { CheckoutRequestDTO } from "~/lib/billing/types";
import { clearSyncRecords, pullSyncRecords, pushSyncRecords } from "~/server/sync/sync-service";
import {
  getSyncSettingsForUser,
  updateSyncSettingsForUser,
} from "~/server/sync/sync-settings-service";
import {
  createShare,
  deleteShareByOwner,
  listShares,
  revokeShareByOwner,
} from "~/server/share/share-service";
import type {
  ShareActionResponseDTO,
  ShareCreateRequestDTO,
  ShareCreateResponseDTO,
  ShareListResponseDTO,
} from "~/types/share";
import { asShareError } from "~/server/share/share-errors";
import { takeRateLimit } from "~/server/share/share-rate-limit";
import { createArtifact } from "~/server/artifact/artifact-service";
import type { ArtifactPublishRequestDTO, ArtifactPublishResponseDTO } from "~/types/artifact";

type SessionData = NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>;

type RpcVariables = {
  session: SessionData;
};

type RpcErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "EXPIRED_OR_REVOKED"
  | "RATE_LIMITED"
  | "VALIDATION_ERROR"
  | "INTERNAL_ERROR"
  | SyncPolicyErrorCode;

type RpcErrorPayload = {
  error: string;
  code?: RpcErrorCode;
  details?: unknown;
};

type RpcStatus = 400 | 401 | 403 | 404 | 410 | 429 | 500;

const rpcError = (
  c: Parameters<MiddlewareHandler>[0],
  payload: RpcErrorPayload,
  status: RpcStatus,
) => c.json(payload, status);

const mapShareError = (error: unknown) => {
  const normalized = asShareError(error);
  const isInternal = normalized.status >= 500 || normalized.code === "INTERNAL_ERROR";
  return {
    status: normalized.status as RpcStatus,
    payload: {
      error: isInternal ? "Internal server error" : normalized.message,
      code: isInternal ? "INTERNAL_ERROR" : normalized.code,
      details: isInternal ? undefined : normalized.details,
    } satisfies RpcErrorPayload,
  };
};

async function rejectDisallowedSyncPolicy(c: Parameters<MiddlewareHandler>[0], userId: string) {
  const settings = await getSyncSettingsForUser(userId);

  if (!settings.enabled) {
    return rpcError(
      c,
      {
        error: "Cloud sync is disabled",
        code: "SYNC_DISABLED",
      },
      403,
    );
  }

  if (!settings.consentedAt) {
    return rpcError(
      c,
      {
        error: "Cloud sync consent is required",
        code: "SYNC_CONSENT_REQUIRED",
      },
      403,
    );
  }

  return null;
}

async function toAuthMeResponse(session: SessionData): Promise<AuthMeResponseDTO> {
  const [profile, syncSettings] = await Promise.all([
    getProfileForUser(session.user.id),
    getSyncSettingsForUser(session.user.id),
  ]);

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
    settings: {
      sync: syncSettings,
    },
  };
}

const requireSession: MiddlewareHandler<{ Variables: RpcVariables }> = async (c, next) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session) {
    return rpcError(c, { error: "Unauthorized", code: "UNAUTHORIZED" }, 401);
  }

  c.set("session", session);
  await next();
};

const requirePro: MiddlewareHandler<{ Variables: RpcVariables }> = async (c, next) => {
  const session = c.get("session");
  const profile = await getProfileForUser(session.user.id);
  if (!profile.isPro) {
    return rpcError(
      c,
      {
        error: "Share links are available for Pro users only",
        code: "FORBIDDEN",
        details: { upgradeUrl: "/pricing" },
      },
      403,
    );
  }

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
  payload: z.string().max(5_000_000),
  updatedAt: z.string().datetime(),
  deletedAt: z.string().datetime().optional(),
  // push 可选透传，服务端以自身分配为准。
  serverOrder: z.number().int().nonnegative().optional(),
});

const SyncPullSchema = z.object({
  since: z.string().datetime().optional(),
  deviceId: z.string().min(1),
});

const SyncPushSchema = z.object({
  deviceId: z.string().min(1),
  records: z.array(SyncRecordSchema).max(200),
});

const SyncClearSchema = z.object({
  deviceId: z.string().min(1),
});

const SyncSettingsUpdateSchema = z
  .object({
    enabled: z.boolean().optional(),
    consentedAt: z.string().datetime().optional(),
  })
  .refine((value) => typeof value.enabled === "boolean" || typeof value.consentedAt === "string", {
    message: "enabled or consentedAt is required",
  });

const ShareMessageSchema = z.object({
  id: z.string().min(1),
  role: z.enum(["user", "assistant", "system"]),
  content: z.string(),
});

const ShareSnapshotSchema = z.object({
  schemaVersion: z.literal(1),
  title: z.string().min(1),
  sourceUrl: z.string().url(),
  platform: z.string().min(1),
  exportedAt: z.string().datetime(),
  messages: z.array(ShareMessageSchema),
});

const ShareCreateSchema = z
  .object({
    source: z.enum(["sidepanel", "content"]),
    chatUrl: z.string().url(),
    accessMode: z.enum(["password", "public"]).optional(),
    expiryMode: z.enum(["permanent", "expires_at"]),
    expiresAt: z.string().datetime().optional(),
    password: z.string().min(6).max(64).optional(),
    disclosureConfirmed: z.literal(true),
    snapshot: ShareSnapshotSchema,
  })
  .superRefine((value, ctx) => {
    if (value.expiryMode === "expires_at" && !value.expiresAt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "expiresAt is required when expiryMode=expires_at",
        path: ["expiresAt"],
      });
    }
    const mode = value.accessMode ?? "password";
    if (mode === "password" && !value.password) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "password is required when accessMode=password",
        path: ["password"],
      });
    }
  });

const ShareListSchema = z.object({});

const ShareActionSchema = z.object({
  shareId: z.string().uuid(),
});

const ArtifactCreateSchema = z.object({
  source: z.enum(["content", "sidepanel"]).optional(),
  platform: z.string().min(1),
  title: z.string().min(1),
  kind: z.literal("html"),
  html: z.string().min(1),
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

    try {
      const policyError = await rejectDisallowedSyncPolicy(c, session.user.id);
      if (policyError) return policyError;

      const response = await pullSyncRecords({
        userId: session.user.id,
        since: input.since,
      });
      return c.json(response);
    } catch {
      return rpcError(c, { error: "Internal server error", code: "INTERNAL_ERROR" }, 500);
    }
  })
  .post("/rpc/sync/push", requireSession, zValidator("json", SyncPushSchema), async (c) => {
    const session = c.get("session");
    const input = c.req.valid("json") as SyncPushRequestDTO;

    // push 语义约定：
    // - accepted: 实际写入条数
    // - skipped: 合法 no-op 条数（幂等冲突）
    // - rejected: 被拒绝处理条数
    // 强约束：accepted + skipped + rejected === input.records.length
    try {
      const policyError = await rejectDisallowedSyncPolicy(c, session.user.id);
      if (policyError) return policyError;

      const response = await pushSyncRecords({
        userId: session.user.id,
        records: input.records,
      });
      return c.json(response);
    } catch {
      return rpcError(c, { error: "Internal server error", code: "INTERNAL_ERROR" }, 500);
    }
  })
  .post("/rpc/sync/clear", requireSession, zValidator("json", SyncClearSchema), async (c) => {
    const session = c.get("session");
    const _input = c.req.valid("json") as SyncClearRequestDTO;

    try {
      const response = await clearSyncRecords({
        userId: session.user.id,
      });
      return c.json(response);
    } catch {
      return rpcError(c, { error: "Internal server error", code: "INTERNAL_ERROR" }, 500);
    }
  })
  .post(
    "/rpc/settings/sync/update",
    requireSession,
    zValidator("json", SyncSettingsUpdateSchema),
    async (c) => {
      const session = c.get("session");
      const input = c.req.valid("json") as SyncSettingsUpdateRequestDTO;

      try {
        const response = await updateSyncSettingsForUser(session.user.id, input);
        return c.json(response);
      } catch {
        return rpcError(c, { error: "Internal server error", code: "INTERNAL_ERROR" }, 500);
      }
    },
  )
  .post(
    "/rpc/share/create",
    requireSession,
    requirePro,
    zValidator("json", ShareCreateSchema),
    async (c) => {
      const session = c.get("session");
      const input = c.req.valid("json") as ShareCreateRequestDTO;
      const limit = takeRateLimit(`share:create:${session.user.id}`, 10, 60_000);
      if (!limit.allowed) {
        return rpcError(
          c,
          {
            error: "Too many requests, please retry later",
            code: "RATE_LIMITED",
            details: { retryAfterMs: limit.retryAfterMs },
          },
          429,
        );
      }

      try {
        const response = await createShare(session.user.id, input);
        return c.json(response as ShareCreateResponseDTO);
      } catch (error) {
        const mapped = mapShareError(error);
        return rpcError(c, mapped.payload, mapped.status);
      }
    },
  )
  .post(
    "/rpc/artifact/create",
    requireSession,
    zValidator("json", ArtifactCreateSchema),
    async (c) => {
      const session = c.get("session");
      const input = c.req.valid("json") as ArtifactPublishRequestDTO;
      const limit = takeRateLimit(`artifact:create:${session.user.id}`, 20, 60_000);
      if (!limit.allowed) {
        return rpcError(
          c,
          {
            error: "Too many requests, please retry later",
            code: "RATE_LIMITED",
            details: { retryAfterMs: limit.retryAfterMs },
          },
          429,
        );
      }

      try {
        const profile = await getProfileForUser(session.user.id);
        const response = await createArtifact(session.user.id, profile.isPro, input);
        return c.json(response as ArtifactPublishResponseDTO);
      } catch (error) {
        const mapped = mapShareError(error);
        return rpcError(c, mapped.payload, mapped.status);
      }
    },
  )
  .post(
    "/rpc/share/list",
    requireSession,
    requirePro,
    zValidator("json", ShareListSchema),
    async (c) => {
      const session = c.get("session");

      try {
        const response = await listShares(session.user.id);
        return c.json(response as ShareListResponseDTO);
      } catch (error) {
        const mapped = mapShareError(error);
        return rpcError(c, mapped.payload, mapped.status);
      }
    },
  )
  .post(
    "/rpc/share/revoke",
    requireSession,
    requirePro,
    zValidator("json", ShareActionSchema),
    async (c) => {
      const session = c.get("session");
      const { shareId } = c.req.valid("json");

      try {
        const response = await revokeShareByOwner(session.user.id, shareId);
        return c.json(response as ShareActionResponseDTO);
      } catch (error) {
        const mapped = mapShareError(error);
        return rpcError(c, mapped.payload, mapped.status);
      }
    },
  )
  .post(
    "/rpc/share/delete",
    requireSession,
    requirePro,
    zValidator("json", ShareActionSchema),
    async (c) => {
      const session = c.get("session");
      const { shareId } = c.req.valid("json");

      try {
        const response = await deleteShareByOwner(session.user.id, shareId);
        return c.json(response as ShareActionResponseDTO);
      } catch (error) {
        const mapped = mapShareError(error);
        return rpcError(c, mapped.payload, mapped.status);
      }
    },
  );

export type AppType = typeof routes;
export { routes as app };
