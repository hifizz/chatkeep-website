import { HeadObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { env } from "~/env";
import { ShareError } from "~/server/share/share-errors";
import type { ArtifactMetaDTO } from "~/types/artifact";

/**
 * R2 通过 S3 兼容 API 写入（website 不在 Cloudflare 上,用不了 binding）。
 * Worker 侧用 binding 读同一个桶。桶/凭证按环境从 env 注入。
 */

let cached: { s3: S3Client; bucket: string } | null = null;

const getClient = (): { s3: S3Client; bucket: string } => {
  if (cached) return cached;
  const endpoint =
    env.R2_ENDPOINT ??
    (env.R2_ACCOUNT_ID ? `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com` : undefined);
  if (!endpoint || !env.R2_ACCESS_KEY_ID || !env.R2_SECRET_ACCESS_KEY || !env.R2_BUCKET) {
    throw new ShareError("INTERNAL_ERROR", "R2 storage is not configured", 500);
  }
  cached = {
    s3: new S3Client({
      region: "auto",
      endpoint,
      credentials: {
        accessKeyId: env.R2_ACCESS_KEY_ID,
        secretAccessKey: env.R2_SECRET_ACCESS_KEY,
      },
      forcePathStyle: true,
    }),
    bucket: env.R2_BUCKET,
  };
  return cached;
};

// 对象统一放桶的 `artifacts/` 前缀下（桶可复用于其他功能；与 Worker 读取端一致）。
const KEY_PREFIX = "artifacts";
const rawKey = (hash: string) => `${KEY_PREFIX}/raw/${hash}.html`;
const metaKey = (id: string) => `${KEY_PREFIX}/meta/${id}.json`;

/** 内容寻址写入 HTML blob;已存在则跳过(去重)。 */
export const putRawIfAbsent = async (hash: string, html: string): Promise<void> => {
  const { s3, bucket } = getClient();
  try {
    await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: rawKey(hash) }));
    return; // 已存在 → 去重
  } catch {
    // 不存在(或 head 失败)→ 写入
  }
  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: rawKey(hash),
      Body: html,
      ContentType: "text/html; charset=utf-8",
    }),
  );
};

/** 写入产物元数据(Worker 读取的真相缓存)。 */
export const putMeta = async (meta: ArtifactMetaDTO): Promise<void> => {
  const { s3, bucket } = getClient();
  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: metaKey(meta.id),
      Body: JSON.stringify(meta),
      ContentType: "application/json; charset=utf-8",
    }),
  );
};
