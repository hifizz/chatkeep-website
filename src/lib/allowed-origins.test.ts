import { describe, expect, it } from "vitest";
import { getAllowedOrigins, isOriginAllowed } from "./allowed-origins";

describe("getAllowedOrigins", () => {
  it("filters localhost in production", () => {
    const origins = getAllowedOrigins(
      "https://chatkeep.dev,http://localhost:3030,chrome-extension://abc",
      "production",
    );

    expect(origins).toEqual(["https://chatkeep.dev", "chrome-extension://abc"]);
  });

  it("keeps localhost outside production", () => {
    const origins = getAllowedOrigins(
      "https://chatkeep.dev,http://localhost:3030,chrome-extension://abc",
      "development",
    );

    expect(origins).toEqual([
      "https://chatkeep.dev",
      "http://localhost:3030",
      "chrome-extension://abc",
    ]);
  });
});

describe("isOriginAllowed", () => {
  it("matches exact origin", () => {
    const allowed = ["chrome-extension://idlamgiieejhfmhgnpppdekpbdkfappe"];
    expect(isOriginAllowed("chrome-extension://idlamgiieejhfmhgnpppdekpbdkfappe", allowed)).toBe(
      true,
    );
  });

  it("matches wildcard extension origin", () => {
    const allowed = ["chrome-extension://*"];
    expect(isOriginAllowed("chrome-extension://randomextensionid", allowed)).toBe(true);
  });

  it("does not match different scheme for wildcard", () => {
    const allowed = ["chrome-extension://*"];
    expect(isOriginAllowed("moz-extension://randomextensionid", allowed)).toBe(false);
  });
});
