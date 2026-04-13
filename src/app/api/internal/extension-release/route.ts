import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { env } from "~/env";
import { syncExtensionRelease, verifyReleaseSignature } from "~/server/release/release-service";
import { ExtensionReleaseSyncRequestSchema } from "~/types/release-sync";

const badRequest = (message: string) => NextResponse.json({ error: message }, { status: 400 });
const unauthorized = (message: string) => NextResponse.json({ error: message }, { status: 401 });
const forbidden = (message: string) => NextResponse.json({ error: message }, { status: 403 });

export async function POST(request: NextRequest) {
  if (!env.RELEASE_SYNC_SECRET) {
    return NextResponse.json({ error: "RELEASE_SYNC_SECRET is not configured" }, { status: 500 });
  }

  const timestamp = request.headers.get("x-release-timestamp");
  const signature = request.headers.get("x-release-signature");

  if (!timestamp || !signature) {
    return unauthorized("Missing release signature headers");
  }

  const rawBody = await request.text();
  const signatureValid = verifyReleaseSignature({
    secret: env.RELEASE_SYNC_SECRET,
    timestamp,
    signature,
    rawBody,
  });

  if (!signatureValid) {
    return unauthorized("Invalid release signature");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawBody);
  } catch {
    return badRequest("Invalid JSON payload");
  }

  const result = ExtensionReleaseSyncRequestSchema.safeParse(parsed);
  if (!result.success) {
    return badRequest("Invalid release payload");
  }

  const payload = result.data;

  if (env.RELEASE_SYNC_ALLOWED_REPO && payload.sourceRepo !== env.RELEASE_SYNC_ALLOWED_REPO) {
    return forbidden("Source repository is not allowed");
  }

  try {
    const synced = await syncExtensionRelease(payload);

    revalidatePath("/");
    revalidatePath("/install");
    revalidatePath("/install/beta");
    revalidatePath("/changelog");

    console.info("[release-sync] accepted", {
      channel: payload.channel,
      version: payload.version,
      releaseId: payload.releaseId,
      status: synced.idempotent ? "idempotent" : "created",
    });

    return NextResponse.json({
      accepted: true,
      releaseRecordId: synced.releaseRecordId,
      latest: synced.latest,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    console.error("[release-sync] failed", {
      releaseId: payload.releaseId,
      channel: payload.channel,
      version: payload.version,
      message,
    });

    return NextResponse.json({ error: "Failed to sync extension release" }, { status: 500 });
  }
}
