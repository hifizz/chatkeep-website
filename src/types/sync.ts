export type SyncRecordType = "chat" | "note";

export type SyncRecordDTO = {
  recordId: string;
  recordType: SyncRecordType;
  payload: string;
  updatedAt: string;
  deletedAt?: string;
};

export type SyncPullRequestDTO = {
  since?: string;
  deviceId: string;
};

export type SyncPullResponseDTO = {
  serverTime: string;
  records: SyncRecordDTO[];
};

export type SyncPushRequestDTO = {
  deviceId: string;
  records: SyncRecordDTO[];
};

export type SyncPushResponseDTO = {
  serverTime: string;
  accepted: number;
};

export type SyncClearRequestDTO = {
  deviceId: string;
};

export type SyncClearResponseDTO = {
  serverTime: string;
  deleted: number;
};
