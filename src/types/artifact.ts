/**
 * 产物发布契约（服务端）。与扩展仓 `types/artifact.ts` 的 wire DTO 对齐。
 */

export type ArtifactKind = "html" | "react" | "svg" | "code" | "unknown";
export type ArtifactAccessMode = "public" | "password";
export type ArtifactStatus = "active" | "revoked" | "expired";

/** 创建产物请求体（扩展发来）。Phase 1 仅 `kind:'html'`。 */
export interface ArtifactPublishRequestDTO {
  source?: "content" | "sidepanel";
  platform: string;
  title: string;
  kind: ArtifactKind;
  html: string;
}

/** 创建产物响应。 */
export interface ArtifactPublishResponseDTO {
  id: string;
  url: string;
  status?: ArtifactStatus;
  expiresAt?: string;
}

/** R2 `meta/{id}.json` 的形状（Worker 读取）。 */
export interface ArtifactMetaDTO {
  id: string;
  /** R2 `raw/{blobHash}.html` */
  blobHash: string;
  title: string;
  platform: string;
  kind: ArtifactKind;
  accessMode: ArtifactAccessMode;
  status: ArtifactStatus;
  createdAt: string;
  expiresAt?: string;
}
