/** 可同步记录的业务类型。 */
export type SyncRecordType = "chat" | "note";

/** 一条同步记录的标准结构。 */
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

/** Pull 请求参数。 */
export type SyncPullRequestDTO = {
  since?: string;
  deviceId: string;
};

/** Pull 响应体。 */
export type SyncPullResponseDTO = {
  serverTime: string;
  records: SyncRecordDTO[];
};

/** Push 请求参数。 */
export type SyncPushRequestDTO = {
  deviceId: string;
  records: SyncRecordDTO[];
};

/** Push 响应体（含接收计数）。 */
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
};

/** Clear 请求参数。 */
export type SyncClearRequestDTO = {
  deviceId: string;
};

/** Clear 响应体。 */
export type SyncClearResponseDTO = {
  serverTime: string;
  deleted: number;
};

/** 同步策略更新请求。 */
export type SyncSettingsUpdateRequestDTO = {
  enabled?: boolean;
  consentedAt?: string;
};

/** 同步策略更新响应。 */
export type SyncSettingsUpdateResponseDTO = {
  enabled: boolean;
  consentedAt: string | null;
  updatedAt: string | null;
};
