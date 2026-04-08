import { describe, expect, it } from "vitest";
import {
  createShareAccessCookieValue,
  getShareAccessCookieName,
  verifyShareAccessCookieValue,
} from "~/server/share/share-access";

describe("share-access", () => {
  it("creates and verifies signed cookie value", () => {
    const shareId = "share-123";
    const cookieValue = createShareAccessCookieValue(shareId);
    expect(verifyShareAccessCookieValue(shareId, cookieValue)).toBe(true);
  });

  it("rejects forged plain-text cookie value", () => {
    expect(verifyShareAccessCookieValue("share-123", "1")).toBe(false);
  });

  it("scopes cookie name by share id", () => {
    expect(getShareAccessCookieName("share-123")).toBe("chatkeep_share_access_share-123");
  });
});
