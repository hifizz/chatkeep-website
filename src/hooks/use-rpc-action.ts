import { useCallback, useState } from "react";
import type { RpcError } from "~/lib/rpc-client";
import { parseRpcResponse } from "~/lib/rpc-client";

export function useRpcAction<T>() {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<RpcError | null>(null);
  const [loading, setLoading] = useState(false);

  const run = useCallback(async (action: () => Promise<Response>) => {
    setLoading(true);
    setError(null);

    try {
      const response = await action();
      const result = await parseRpcResponse<T>(response);

      if (result.error) {
        setData(null);
        setError(result.error);
        return null;
      }

      setData(result.data);
      return result.data;
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, error, loading, run, setData };
}
