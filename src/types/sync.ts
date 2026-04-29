export type SyncRecordType = "chat" | "note";

export type SyncPolicyErrorCode = "SYNC_DISABLED" | "SYNC_CONSENT_REQUIRED";

export type SyncPolicySettingsDTO = {
  enabled: boolean;
  consentedAt?: string;
  updatedAt?: string;
};

export type SyncSettingsGetRequestDTO = Record<string, never>;
export type SyncSettingsGetResponseDTO = SyncPolicySettingsDTO;

export type SyncSettingsUpdateRequestDTO = {
  enabled?: boolean;
  consentedAt?: string;
};

export type SyncSettingsUpdateResponseDTO = SyncPolicySettingsDTO;

export type SyncRecordDTO = {
  recordId: string;
  recordType: SyncRecordType;
  payload: string;
  updatedAt: string;
  deletedAt?: string;
  /**
   * serverOrder: 服务端统一排序键。
   * - push 请求中可省略（由服务端分配）。
   * - pull 响应中必须返回（用于客户端最终顺序收敛）。
   */
  serverOrder?: number;
};

export type SyncPullRequestDTO = {
  since?: string;
  deviceId: string;
  syncVersion: "sync-v2";
};

export type SyncPullResponseDTO = {
  serverTime: string;
  records: SyncRecordDTO[];
  syncEpoch: string;
};

export type SyncPushRequestDTO = {
  deviceId: string;
  records: SyncRecordDTO[];
  syncVersion: "sync-v2";
};

export type SyncAcceptedRecordDTO = {
  recordId: string;
  recordType: SyncRecordType;
  serverOrder: number;
};

export type SyncPushResponseDTO = {
  serverTime: string;
  /**
   * accepted: 本批次中“成功写入数据库（insert/update）”的记录数。
   * 只统计真正发生状态变更的记录，不包含 no-op。
   */
  accepted: number;
  /**
   * skipped: 本批次中“合法但未写入”的记录数。
   * 当前用于表示幂等 no-op（如 incoming timestamp <= existing timestamp）。
   */
  skipped: number;
  /**
   * rejected: 本批次中“被拒绝处理”的记录数。
   * 这类记录不应写入数据库，通常由单条记录语义无效或不可处理导致。
   */
  rejected: number;
  /**
   * acceptedRecords: 本批次实际写入记录对应的服务端权威序号。
   * 客户端应据此回写本地 serverOrder，确保多端最终顺序一致。
   */
  acceptedRecords: SyncAcceptedRecordDTO[];
};

export type SyncClearRequestDTO = {
  deviceId: string;
  syncVersion: "sync-v2";
};

export type SyncClearResponseDTO = {
  serverTime: string;
  deleted: number;
};
