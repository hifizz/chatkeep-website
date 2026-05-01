/** 分享访问模式。 */
export type ShareAccessMode = "password" | "public";
export type ShareExpiryMode = "permanent" | "expires_at";
export type ShareStatus = "active" | "revoked" | "expired";
export type ShareSource = "sidepanel" | "content";

export type ShareSnapshotMessageRole = "user" | "assistant" | "system";

/** 分享快照中的单条消息。 */
export type ShareSnapshotMessageDTO = {
  id: string;
  role: ShareSnapshotMessageRole;
  content: string;
};

/** 分享页渲染使用的聊天快照。 */
export type ShareChatSnapshotDTO = {
  schemaVersion: 1;
  title: string;
  sourceUrl: string;
  platform: string;
  exportedAt: string;
  messages: ShareSnapshotMessageDTO[];
};

/** 创建分享请求体。 */
export type ShareCreateRequestDTO = {
  source: ShareSource;
  chatUrl: string;
  accessMode?: ShareAccessMode;
  expiryMode: ShareExpiryMode;
  expiresAt?: string;
  password?: string;
  disclosureConfirmed: true;
  snapshot: ShareChatSnapshotDTO;
};

/** 创建分享响应体。 */
export type ShareCreateResponseDTO = {
  shareId: string;
  shareUrl: string;
  accessMode: ShareAccessMode;
  expiresAt: string | null;
  status: ShareStatus;
};

/** 分享列表单项。 */
export type ShareListItemDTO = {
  shareId: string;
  title: string;
  sourceChatUrl: string;
  sourcePlatform: string;
  accessMode: ShareAccessMode;
  expiryMode: ShareExpiryMode;
  expiresAt: string | null;
  status: ShareStatus;
  createdAt: string;
  revokedAt: string | null;
};

/** 分享列表响应。 */
export type ShareListResponseDTO = {
  items: ShareListItemDTO[];
};

export type ShareRevokeRequestDTO = {
  shareId: string;
};

export type ShareDeleteRequestDTO = {
  shareId: string;
};

/** 分享管理动作响应（撤销或删除）。 */
export type ShareActionResponseDTO = {
  shareId: string;
  status: ShareStatus | "deleted";
};

/** 公共分享页作者信息。 */
export type SharePublicAuthorDTO = {
  name: string | null;
  image: string | null;
};

/** 公共分享页完整视图 DTO。 */
export type SharePublicViewDTO = {
  shareId: string;
  title: string;
  accessMode: ShareAccessMode;
  author: SharePublicAuthorDTO;
  snapshot: ShareChatSnapshotDTO;
  expiresAt: string | null;
};
