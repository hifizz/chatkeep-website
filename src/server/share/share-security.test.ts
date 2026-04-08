import { describe, expect, it } from "vitest";
import { hashPasswordWithSalt, verifyPassword } from "~/server/share/share-security";

describe("share-security", () => {
  it("hashes and verifies password", () => {
    const value = hashPasswordWithSalt("secret123");
    expect(value.hash).toBeTruthy();
    expect(value.salt).toBeTruthy();
    expect(verifyPassword("secret123", value.hash, value.salt)).toBe(true);
  });

  it("rejects wrong password", () => {
    const value = hashPasswordWithSalt("secret123");
    expect(verifyPassword("secret124", value.hash, value.salt)).toBe(false);
  });
});
