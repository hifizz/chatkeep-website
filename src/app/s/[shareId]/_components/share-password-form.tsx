"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

type Props = {
  shareId: string;
};

export function SharePasswordForm({ shareId }: Props) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(`/api/share/${shareId}/verify-password`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        setError(payload?.error ?? "Access code verification failed");
        return;
      }

      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Access code verification failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6"
    >
      <div className="space-y-2">
        <p className="text-sm text-neutral-300">This share is protected by an access code.</p>
        <Input
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Enter access code"
          className="border-neutral-700 bg-neutral-950 text-neutral-100"
        />
      </div>

      {error ? (
        <p className="rounded-lg border border-red-900/60 bg-red-950/40 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      ) : null}

      <Button
        type="submit"
        disabled={loading || !password}
        className="bg-white text-neutral-950 hover:bg-neutral-200"
      >
        {loading ? "Verifying..." : "Unlock with access code"}
      </Button>
    </form>
  );
}
