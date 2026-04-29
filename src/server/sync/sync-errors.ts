import type { SyncPolicyErrorCode } from "~/types/sync";

const SYNC_POLICY_MESSAGES: Record<SyncPolicyErrorCode, string> = {
  SYNC_DISABLED: "Sync is disabled for this account",
  SYNC_CONSENT_REQUIRED: "Sync consent is required for this account",
};

export class SyncPolicyError extends Error {
  readonly code: SyncPolicyErrorCode;

  constructor(code: SyncPolicyErrorCode, message: string = SYNC_POLICY_MESSAGES[code]) {
    super(message);
    this.name = "SyncPolicyError";
    this.code = code;
  }
}

export function isSyncPolicyError(error: unknown): error is SyncPolicyError {
  return error instanceof SyncPolicyError;
}
