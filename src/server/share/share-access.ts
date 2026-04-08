import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "~/env";

const ACCESS_COOKIE_PREFIX = "chatkeep_share_access_";
const ACCESS_TOKEN_VERSION = "v1";

const signPayload = (payload: string) =>
  createHmac("sha256", env.BETTER_AUTH_SECRET).update(payload).digest("base64url");

export const getShareAccessCookieName = (shareId: string) => `${ACCESS_COOKIE_PREFIX}${shareId}`;

export const SHARE_ACCESS_COOKIE_MAX_AGE = 60 * 60 * 12;

export const createShareAccessCookieValue = (shareId: string) => {
  const payload = `${ACCESS_TOKEN_VERSION}:${shareId}`;
  const signature = signPayload(payload);
  return `${payload}.${signature}`;
};

export const verifyShareAccessCookieValue = (shareId: string, cookieValue: string | undefined) => {
  if (!cookieValue) return false;

  const splitIndex = cookieValue.lastIndexOf(".");
  if (splitIndex <= 0) return false;

  const payload = cookieValue.slice(0, splitIndex);
  const signature = cookieValue.slice(splitIndex + 1);
  const expectedPayload = `${ACCESS_TOKEN_VERSION}:${shareId}`;
  if (payload !== expectedPayload) return false;

  const expectedSignature = signPayload(payload);
  const signatureBuffer = Buffer.from(signature, "utf8");
  const expectedBuffer = Buffer.from(expectedSignature, "utf8");
  if (signatureBuffer.length !== expectedBuffer.length) return false;

  return timingSafeEqual(signatureBuffer, expectedBuffer);
};
