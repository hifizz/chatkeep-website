import { describe, expect, it } from "vitest";
import { createArtifact } from "./artifact-service";
import type { ArtifactPublishRequestDTO } from "~/types/artifact";

const base: ArtifactPublishRequestDTO = {
  platform: "claude",
  title: "My App",
  kind: "html",
  html: "<!DOCTYPE html><html></html>" + "x".repeat(300),
};

// 这些校验在写 R2 / 数据库 / 读 env 之前抛出，故无需 mock 外部依赖。
describe("createArtifact validation", () => {
  it("rejects non-html kind", async () => {
    await expect(createArtifact("u1", false, { ...base, kind: "react" })).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
    });
  });

  it("rejects empty title", async () => {
    await expect(createArtifact("u1", false, { ...base, title: "   " })).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
    });
  });

  it("rejects empty html", async () => {
    await expect(createArtifact("u1", false, { ...base, html: "   " })).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
    });
  });

  it("rejects oversize html", async () => {
    await expect(
      createArtifact("u1", false, { ...base, html: "a".repeat(2 * 1024 * 1024 + 1) }),
    ).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
  });
});
