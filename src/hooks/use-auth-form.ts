import { useState, useCallback } from "react";

interface BetterAuthError {
  message?: string;
  code?: string;
  status?: number;
  statusText?: string;
}

export function useAuthForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const formAction = useCallback(
    async (
      action: () => Promise<{ error: BetterAuthError | null } | { successMessage: string }>,
    ) => {
      setError(null);
      setSuccess(null);
      setLoading(true);

      try {
        const result = await action();
        if ("error" in result && result.error) {
          setError(result.error.message ?? "An unknown error occurred.");
        } else if ("successMessage" in result) {
          setSuccess(result.successMessage);
        }
      } catch (_err) {
        setError("An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { error, success, loading, formAction, setSuccess };
}
