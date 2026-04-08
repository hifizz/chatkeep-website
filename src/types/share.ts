export type ShareAccessMode = "password" | "public";
export type ShareExpiryMode = "permanent" | "expires_at";
export type ShareStatus = "active" | "revoked" | "expired";
export type ShareSource = "sidepanel" | "content";

export type ShareSnapshotMessageRole = "user" | "assistant" | "system";

export type ShareSnapshotMessageDTO = {
  id: string;
  role: ShareSnapshotMessageRole;
  content: string;
};

export type ShareChatSnapshotDTO = {
  schemaVersion: 1;
  title: string;
  sourceUrl: string;
  platform: string;
  exportedAt: string;
  messages: ShareSnapshotMessageDTO[];
};

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

export type ShareCreateResponseDTO = {
  shareId: string;
  shareUrl: string;
  accessMode: ShareAccessMode;
  expiresAt: string | null;
  status: ShareStatus;
};

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

export type ShareListResponseDTO = {
  items: ShareListItemDTO[];
};

export type ShareRevokeRequestDTO = {
  shareId: string;
};

export type ShareDeleteRequestDTO = {
  shareId: string;
};

export type ShareActionResponseDTO = {
  shareId: string;
  status: ShareStatus | "deleted";
};

export type SharePublicAuthorDTO = {
  name: string | null;
  image: string | null;
};

export type SharePublicViewDTO = {
  shareId: string;
  title: string;
  accessMode: ShareAccessMode;
  author: SharePublicAuthorDTO;
  snapshot: ShareChatSnapshotDTO;
  expiresAt: string | null;
};
