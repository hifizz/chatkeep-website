import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { db } from "~/server/db";
import {
  extensionRelease,
  extensionReleaseArtifact,
  extensionReleaseLatest,
} from "~/server/db/schema";
import type {
  ExtensionChannelLatestDTO,
  ExtensionReleaseSyncRequestDTO,
  ExtensionReleaseSyncResponseDTO,
  ReleaseChannel,
} from "~/types/release-sync";
import { ExtensionArtifactSchema } from "~/types/release-sync";

const MAX_SIGNATURE_SKEW_SECONDS = 300;

const normalizeHexSignature = (raw: string) => {
  const value = raw.trim();
  if (value.startsWith("sha256=")) {
    return value.slice("sha256=".length);
  }
  return value;
};

const toIsoString = (value: Date | string) => {
  if (value instanceof Date) return value.toISOString();
  return new Date(value).toISOString();
};

const safeEqualSignature = (provided: string, expected: string) => {
  const providedBuf = Buffer.from(provided, "utf8");
  const expectedBuf = Buffer.from(expected, "utf8");
  if (providedBuf.length !== expectedBuf.length) return false;
  return timingSafeEqual(providedBuf, expectedBuf);
};

export const verifyReleaseSignature = ({
  secret,
  timestamp,
  signature,
  rawBody,
  nowMs = Date.now(),
}: {
  secret: string;
  timestamp: string;
  signature: string;
  rawBody: string;
  nowMs?: number;
}) => {
  const ts = Number.parseInt(timestamp, 10);
  if (!Number.isFinite(ts) || ts <= 0) return false;

  const nowSec = Math.floor(nowMs / 1000);
  if (Math.abs(nowSec - ts) > MAX_SIGNATURE_SKEW_SECONDS) return false;

  const expected = createHmac("sha256", secret).update(`${timestamp}.${rawBody}`).digest("hex");
  return safeEqualSignature(normalizeHexSignature(signature), expected);
};

export const syncExtensionRelease = async (
  request: ExtensionReleaseSyncRequestDTO,
): Promise<ExtensionReleaseSyncResponseDTO & { idempotent: boolean }> => {
  const existingRows = await db
    .select()
    .from(extensionRelease)
    .where(eq(extensionRelease.releaseId, request.releaseId))
    .limit(1);

  const existing = existingRows[0];
  if (existing) {
    return {
      accepted: true,
      releaseRecordId: existing.id,
      latest: {
        channel: request.channel,
        version: existing.version,
        releasedAt: existing.releasedAt.toISOString(),
      },
      idempotent: true,
    };
  }

  const now = new Date();
  const releaseRecordId = randomUUID();
  const releasedAt = new Date(request.releasedAt);

  await db.transaction(async (tx) => {
    await tx.insert(extensionRelease).values({
      id: releaseRecordId,
      sourceRepo: request.sourceRepo,
      releaseId: request.releaseId,
      channel: request.channel,
      version: request.version,
      tag: request.tag,
      commitSha: request.commitSha,
      commitRef: request.commitRef,
      releasedAt,
      createdAt: now,
    });

    await tx.insert(extensionReleaseArtifact).values(
      request.artifacts.map((artifact) => ({
        id: randomUUID(),
        releaseRecordId,
        browser: artifact.browser,
        fileName: artifact.fileName,
        downloadUrl: artifact.downloadUrl,
        sha256: artifact.sha256,
        sizeBytes: artifact.sizeBytes,
        contentType: artifact.contentType,
        createdAt: now,
      })),
    );

    await tx
      .insert(extensionReleaseLatest)
      .values({
        channel: request.channel,
        releaseRecordId,
        version: request.version,
        tag: request.tag,
        releasedAt,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: extensionReleaseLatest.channel,
        set: {
          releaseRecordId,
          version: request.version,
          tag: request.tag,
          releasedAt,
          updatedAt: now,
        },
      });
  });

  return {
    accepted: true,
    releaseRecordId,
    latest: {
      channel: request.channel,
      version: request.version,
      releasedAt: releasedAt.toISOString(),
    },
    idempotent: false,
  };
};

export const getChannelLatest = async (
  channel: ReleaseChannel,
): Promise<ExtensionChannelLatestDTO | null> => {
  const latestRows = await db
    .select()
    .from(extensionReleaseLatest)
    .where(eq(extensionReleaseLatest.channel, channel))
    .limit(1);

  const latest = latestRows[0];
  if (!latest) return null;

  const releaseRows = await db
    .select()
    .from(extensionRelease)
    .where(
      and(eq(extensionRelease.id, latest.releaseRecordId), eq(extensionRelease.channel, channel)),
    )
    .limit(1);

  const release = releaseRows[0];
  if (!release) return null;

  const artifactRows = await db
    .select({
      browser: extensionReleaseArtifact.browser,
      fileName: extensionReleaseArtifact.fileName,
      downloadUrl: extensionReleaseArtifact.downloadUrl,
      sha256: extensionReleaseArtifact.sha256,
      sizeBytes: extensionReleaseArtifact.sizeBytes,
      contentType: extensionReleaseArtifact.contentType,
    })
    .from(extensionReleaseArtifact)
    .where(eq(extensionReleaseArtifact.releaseRecordId, release.id));

  const artifacts = artifactRows.map((item) => ExtensionArtifactSchema.parse(item));

  return {
    channel,
    version: release.version,
    tag: release.tag,
    releasedAt: toIsoString(release.releasedAt),
    artifacts,
  };
};

export const __test__ = {
  MAX_SIGNATURE_SKEW_SECONDS,
  normalizeHexSignature,
  safeEqualSignature,
  verifyReleaseSignature,
};
