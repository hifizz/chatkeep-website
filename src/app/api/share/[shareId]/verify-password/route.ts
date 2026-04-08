import { NextResponse } from "next/server";
import { z } from "zod";
import { asShareError } from "~/server/share/share-errors";
import { takeRateLimit } from "~/server/share/share-rate-limit";
import { verifySharePassword } from "~/server/share/share-service";
import {
  createShareAccessCookieValue,
  getShareAccessCookieName,
  SHARE_ACCESS_COOKIE_MAX_AGE,
} from "~/server/share/share-access";

const BodySchema = z.object({
  password: z.string().min(1),
});

export async function POST(request: Request, context: { params: Promise<{ shareId: string }> }) {
  const { shareId } = await context.params;
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  const limit = takeRateLimit(`share:verify:${shareId}:${ip}`, 8, 60_000);
  if (!limit.allowed) {
    return NextResponse.json(
      {
        error: "Too many password attempts, please retry later",
        code: "RATE_LIMITED",
      },
      { status: 429 },
    );
  }

  try {
    const payload = BodySchema.parse(await request.json());
    await verifySharePassword(shareId, payload.password);

    const response = NextResponse.json({ ok: true });
    response.cookies.set({
      name: getShareAccessCookieName(shareId),
      value: createShareAccessCookieValue(shareId),
      maxAge: SHARE_ACCESS_COOKIE_MAX_AGE,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: `/s/${shareId}`,
    });
    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validation failed",
          code: "VALIDATION_ERROR",
          details: error.issues,
        },
        { status: 400 },
      );
    }
    const normalized = asShareError(error);
    const isInternal = normalized.status >= 500 || normalized.code === "INTERNAL_ERROR";
    return NextResponse.json(
      {
        error: isInternal ? "Internal server error" : normalized.message,
        code: isInternal ? "INTERNAL_ERROR" : normalized.code,
        details: isInternal ? undefined : normalized.details,
      },
      { status: normalized.status },
    );
  }
}
