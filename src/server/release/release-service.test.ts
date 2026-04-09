import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { __test__ as releaseTest } from "~/server/release/release-service";

const secret = "release-sync-test-secret";
const timestamp = "1712620800";
const rawBody = JSON.stringify({ schemaVersion: 1, releaseId: "test" });

const makeSignature = (body: string, ts: string) =>
  `sha256=${createHmac("sha256", secret).update(`${ts}.${body}`).digest("hex")}`;

describe("release signature verification", () => {
  it("accepts valid signature and timestamp", () => {
    const signature = makeSignature(rawBody, timestamp);
    const nowMs = Number.parseInt(timestamp, 10) * 1000;

    const valid = releaseTest.verifyReleaseSignature({
      secret,
      timestamp,
      signature,
      rawBody,
      nowMs,
    });

    expect(valid).toBe(true);
  });

  it("rejects stale timestamp", () => {
    const signature = makeSignature(rawBody, timestamp);
    const nowMs =
      (Number.parseInt(timestamp, 10) + releaseTest.MAX_SIGNATURE_SKEW_SECONDS + 30) * 1000;

    const valid = releaseTest.verifyReleaseSignature({
      secret,
      timestamp,
      signature,
      rawBody,
      nowMs,
    });

    expect(valid).toBe(false);
  });

  it("rejects invalid signature", () => {
    const nowMs = Number.parseInt(timestamp, 10) * 1000;

    const valid = releaseTest.verifyReleaseSignature({
      secret,
      timestamp,
      signature: "sha256=invalid",
      rawBody,
      nowMs,
    });

    expect(valid).toBe(false);
  });
});
