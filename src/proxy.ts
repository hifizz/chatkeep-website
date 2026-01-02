import { NextResponse, type NextRequest } from "next/server";

const DEFAULT_ALLOWED_ORIGINS = [
  "https://chat-aside.zilin.im",
  "https://dev-chat-aside.zilin.im",
  "https://chatkeep.dev",
  "https://dev.chatkeep.dev",
  "chrome-extension://ajmlmkmckibkifaofppjellodbfmhkkb",
  "http://localhost:3030",
  "http://localhost:3000",
  "http://localhost:3040",
];

const CORS_HEADERS = {
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function normalizeOrigin(origin: string): string {
  return origin.replace(/\/+$/, "");
}

function getAllowedOrigins(): string[] {
  const raw = process.env.AUTH_ALLOWED_ORIGINS;
  const list = raw
    ? raw
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    : DEFAULT_ALLOWED_ORIGINS;

  const normalized = list.map(normalizeOrigin);

  if (process.env.NODE_ENV === "production") {
    return normalized.filter((origin) => !origin.startsWith("http://localhost"));
  }

  return normalized;
}

export function proxy(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return NextResponse.next();

  const allowedOrigins = getAllowedOrigins();
  const normalizedOrigin = normalizeOrigin(origin);

  if (!allowedOrigins.includes(normalizedOrigin)) {
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
