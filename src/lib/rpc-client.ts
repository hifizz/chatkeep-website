import { hc } from "hono/client";
import type { AppType } from "~/server/rpc/app";

const createRpcClient = () => hc<AppType>("/").api;

export type RpcClient = ReturnType<typeof createRpcClient>;

export const rpcClient: RpcClient = createRpcClient();

export type RpcError = {
  status: number;
  message: string;
  details?: unknown;
};

const getFallbackMessage = (status: number) => {
  if (status === 400) return "Bad Request";
  if (status === 401) return "Unauthorized";
  if (status >= 500) return "Server Error";
  return "Request failed";
};

const readJson = async (response: Response) => {
  try {
    return await response.clone().json();
  } catch {
    return null;
  }
};

export const parseRpcResponse = async <T>(response: Response) => {
  if (response.ok) {
    return { data: (await response.json()) as T, error: null };
  }

  const payload = await readJson(response);
  let message = response.statusText || getFallbackMessage(response.status);
  let details: unknown = undefined;

  if (payload && typeof payload === "object") {
    const payloadRecord = payload as Record<string, unknown>;
    if (typeof payloadRecord.error === "string") {
      message = payloadRecord.error;
    } else if (typeof payloadRecord.message === "string") {
      message = payloadRecord.message;
    }

    if (payloadRecord.issues || payloadRecord.errors) {
      message = "Validation failed";
      details = payloadRecord.issues ?? payloadRecord.errors;
    } else {
      details = payload;
    }
  }

  if (response.status === 401) {
    message = "Unauthorized";
  }

  return {
    data: null,
    error: {
      status: response.status,
      message,
      details,
    } satisfies RpcError,
  };
};
