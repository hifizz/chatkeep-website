import { z } from "zod";

export const releaseChannelValues = ["dev", "rc", "stable"] as const;
export const browserTargetValues = ["chrome", "firefox", "edge", "safari"] as const;

export const ReleaseChannelSchema = z.enum(releaseChannelValues);
export const BrowserTargetSchema = z.enum(browserTargetValues);

export type ReleaseChannel = z.infer<typeof ReleaseChannelSchema>;
export type BrowserTarget = z.infer<typeof BrowserTargetSchema>;

export const ExtensionArtifactSchema = z.object({
  browser: BrowserTargetSchema,
  fileName: z.string().min(1),
  downloadUrl: z.string().url(),
  sha256: z.string().regex(/^[a-f0-9]{64}$/i),
  sizeBytes: z.number().int().nonnegative(),
  contentType: z.literal("application/zip"),
});

export type ExtensionArtifactDTO = z.infer<typeof ExtensionArtifactSchema>;

export const ExtensionReleaseSyncRequestSchema = z.object({
  schemaVersion: z.literal(1),
  sourceRepo: z.string().min(1),
  releaseId: z.string().min(1),
  channel: ReleaseChannelSchema,
  version: z.string().min(1),
  tag: z.string().min(1).nullable(),
  commitSha: z.string().min(1),
  commitRef: z.string().min(1),
  releasedAt: z.string().datetime(),
  artifacts: z.array(ExtensionArtifactSchema).min(1),
});

export type ExtensionReleaseSyncRequestDTO = z.infer<typeof ExtensionReleaseSyncRequestSchema>;

export const ExtensionReleaseSyncResponseSchema = z.object({
  accepted: z.boolean(),
  releaseRecordId: z.string().min(1),
  latest: z.object({
    channel: ReleaseChannelSchema,
    version: z.string().min(1),
    releasedAt: z.string().datetime(),
  }),
});

export type ExtensionReleaseSyncResponseDTO = z.infer<typeof ExtensionReleaseSyncResponseSchema>;

export type ExtensionChannelLatestDTO = {
  channel: ReleaseChannel;
  version: string;
  tag: string | null;
  releasedAt: string;
  artifacts: ExtensionArtifactDTO[];
};
