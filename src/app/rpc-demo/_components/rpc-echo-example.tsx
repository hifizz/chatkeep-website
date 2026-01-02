"use client";

import { useState } from "react";
import { rpcClient } from "~/lib/rpc-client";
import { useRpcAction } from "~/hooks/use-rpc-action";

type MeResponse = {
  user: unknown;
  session: unknown;
};

export function RpcEchoExample() {
  const [message, setMessage] = useState("hello");
  const { data, error, loading, run } = useRpcAction<{ message: string }>();
  const {
    data: meData,
    error: meError,
    loading: meLoading,
    run: runMe,
  } = useRpcAction<MeResponse>();

  const onEcho = () => {
    return run(() =>
      rpcClient.rpc.echo.$post({
        json: { message },
      }),
    );
  };

  const onMe = () => {
    return runMe(() => rpcClient.rpc.me.$get());
  };

  return (
    <div className="rounded-lg border bg-background p-6 shadow-sm">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">Echo</h2>
        <p className="text-sm text-muted-foreground">
          Sends a message to <span className="font-mono">/api/rpc/echo</span> and returns the
          response.
        </p>
      </div>
      <div className="mt-4 flex flex-col gap-3">
        <input
          className="w-full rounded-md border px-3 py-2"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="message"
        />
        <div className="flex flex-wrap items-center gap-3">
          <button
            className="rounded-md bg-primary px-4 py-2 text-primary-foreground disabled:opacity-60"
            type="button"
            onClick={onEcho}
            disabled={loading}
          >
            {loading ? "Sending..." : "Echo"}
          </button>
          <button
            className="rounded-md border px-4 py-2 text-sm font-medium disabled:opacity-60"
            type="button"
            onClick={onMe}
            disabled={meLoading}
          >
            {meLoading ? "Checking..." : "Check Session"}
          </button>
          {data && <span className="text-sm">Result: {data.message}</span>}
        </div>
        {error && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error.message}
          </div>
        )}
        {meError && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {meError.message}
          </div>
        )}
        {meData && (
          <div className="rounded-md border bg-muted/30 px-3 py-2 text-xs">
            <pre className="whitespace-pre-wrap">{JSON.stringify(meData, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
