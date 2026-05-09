export type ShareErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "EXPIRED_OR_REVOKED"
  | "RATE_LIMITED"
  | "QUOTA_EXCEEDED"
  | "VALIDATION_ERROR"
  | "INTERNAL_ERROR";

export class ShareError extends Error {
  code: ShareErrorCode;
  status: number;
  details?: unknown;

  constructor(code: ShareErrorCode, message: string, status: number, details?: unknown) {
    super(message);
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export const asShareError = (error: unknown): ShareError => {
  if (error instanceof ShareError) return error;
  if (error instanceof Error) return new ShareError("INTERNAL_ERROR", "Internal server error", 500);

  return new ShareError("INTERNAL_ERROR", "Internal server error", 500);
};
