import { describe, expect, it } from "vitest";
import { ShareError, asShareError } from "~/server/share/share-errors";

describe("share-errors", () => {
  it("returns original ShareError", () => {
    const input = new ShareError("NOT_FOUND", "Share not found", 404);
    expect(asShareError(input)).toBe(input);
  });

  it("maps unknown runtime error to internal server error", () => {
    const mapped = asShareError(new Error("database offline"));
    expect(mapped.code).toBe("INTERNAL_ERROR");
    expect(mapped.status).toBe(500);
    expect(mapped.message).toBe("Internal server error");
  });
});
