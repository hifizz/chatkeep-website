import type { BillingProvider, PlanKey, SubscriptionStatus } from "~/lib/billing/types";

/** 认证用户信息（服务端返回的最小视图）。 */
export type AuthUserDTO = {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  isPro?: boolean;
  plan?: {
    key: PlanKey;
    status: SubscriptionStatus | null;
    currentPeriodEnd?: string | null;
    cancelAtPeriodEnd?: boolean;
    provider?: BillingProvider | null;
  } | null;
};

/** 登录会话信息。 */
export type AuthSessionDTO = {
  id: string;
  expiresAt: string;
};

/** 账号级同步策略快照。 */
export type AuthSyncSettingsDTO = {
  enabled: boolean;
  consentedAt: string | null;
  updatedAt: string | null;
};

/** `/api/rpc/me` 响应契约。 */
export type AuthMeResponseDTO = {
  user: AuthUserDTO;
  session: AuthSessionDTO;
  settings: {
    sync: AuthSyncSettingsDTO;
  };
};

/** 认证接口错误结构。 */
export type AuthErrorDTO = {
  status: number;
  message: string;
};
