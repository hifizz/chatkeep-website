import { NextResponse, type NextRequest } from "next/server";
import { getAllowedOrigins, isOriginAllowed, normalizeOrigin } from "~/lib/allowed-origins";

const CORS_HEADERS = {
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export function proxy(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return NextResponse.next();

  const allowedOrigins = getAllowedOrigins(
    process.env.AUTH_ALLOWED_ORIGINS,
    process.env.NODE_ENV ?? "development",
  );
  const normalizedOrigin = normalizeOrigin(origin);

  if (!isOriginAllowed(normalizedOrigin, allowedOrigins)) {
    return NextResponse.next();
  }

  if (request.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers: {
        ...CORS_HEADERS,
        "Access-Control-Allow-Origin": normalizedOrigin,
        Vary: "Origin",
      },
    });
  }

  const response = NextResponse.next();
  response.headers.set("Access-Control-Allow-Origin", normalizedOrigin);
  response.headers.set("Access-Control-Allow-Credentials", "true");
  response.headers.set(
    "Access-Control-Allow-Methods",
    CORS_HEADERS["Access-Control-Allow-Methods"],
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    CORS_HEADERS["Access-Control-Allow-Headers"],
  );
  response.headers.set("Vary", "Origin");
  return response;
}

export const config = {
  matcher: ["/api/auth/:path*", "/api/rpc/:path*"],
};
