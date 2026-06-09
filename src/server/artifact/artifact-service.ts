import { createHash } from "node:crypto";
import { nanoid } from "nanoid";
import { env } from "~/env";
import { ShareError } from "~/server/share/share-errors";
import { putMeta, putRawIfAbsent } from "./artifact-r2";
import { insertArtifact } from "./artifact-repo";
import type {
  ArtifactMetaDTO,
  ArtifactPublishRequestDTO,
  ArtifactPublishResponseDTO,
} from "~/types/artifact";

/** 单产物 HTML 体积上限,与扩展端 `artifact-validator` 一致。 */
const MAX_HTML_BYTES = 2 * 1024 * 1024;
/** 免费层默认 TTL（30 天）。 */
const FREE_TTL_MS = 30 * 24 * 60 * 60 * 1000;

const sha256Hex = (value: string) => createHash("sha256").update(value, "utf8").digest("hex");

/**
 * 创建产物:校验 → 随机 id + sha256 去重 → 写 R2(raw+meta)+ Postgres → 返回 {id,url}。
 * Phase 1 仅 `kind:'html'`、access `public`;免费层带 30 天 TTL,Pro 不过期。
 * 配额暂不做(仅路由层限流);撤销留后续。
 */
export const createArtifact = async (
  userId: string,
  isPro: boolean,
  request: ArtifactPublishRequestDTO,
): Promise<ArtifactPublishResponseDTO> => {
  if (request.kind !== "html") {
    throw new ShareError("VALIDATION_ERROR", "Only HTML artifacts can be published", 400);
  }
  const title = request.title?.trim();
  if (!title) {
    throw new ShareError("VALIDATION_ERROR", "Artifact title is required", 400);
  }
  const html = request.html ?? "";
  if (html.trim().length === 0) {
    throw new ShareError("VALIDATION_ERROR", "Artifact HTML is empty", 400);
  }
  if (Buffer.byteLength(html, "utf8") > MAX_HTML_BYTES) {
    throw new ShareError(
      "VALIDATION_ERROR",
      `Artifact too large (max ${MAX_HTML_BYTES} bytes)`,
      400,
    );
  }
  if (!env.ARTIFACT_PAGES_BASE_URL) {
    throw new ShareError("INTERNAL_ERROR", "ARTIFACT_PAGES_BASE_URL is not configured", 500);
  }

  const blobHash = sha256Hex(html);
  const id = nanoid();
  const now = new Date();
  const expiresAt = isPro ? null : new Date(now.getTime() + FREE_TTL_MS);
  const platform = request.platform || "unknown";

  const meta: ArtifactMetaDTO = {
    id,
    blobHash,
    title,
    platform,
    kind: "html",
    accessMode: "public",
    status: "active",
    createdAt: now.toISOString(),
    expiresAt: expiresAt ? expiresAt.toISOString() : undefined,
  };

  // 写存储:先 blob(去重)再 meta,最后入库。
  await putRawIfAbsent(blobHash, html);
  await putMeta(meta);
  await insertArtifact({
    id,
    ownerUserId: userId,
    blobHash,
    title,
    platform,
    kind: "html",
    accessMode: "public",
    status: "active",
    createdAt: now,
    updatedAt: now,
    expiresAt,
  });

  const url = new URL(`/p/${id}`, env.ARTIFACT_PAGES_BASE_URL).toString();
  return { id, url, status: "active", expiresAt: meta.expiresAt };
};
