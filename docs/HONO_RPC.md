# Hono RPC API

This project exposes a Hono-based RPC API under the `/api` base path using Next.js App Router Route Handlers.

## Routes

- `GET /api/rpc/health` - public health check
- `POST /api/rpc/echo` - public echo endpoint with Zod validation
- `GET /api/rpc/me` - protected endpoint that requires a better-auth session

## Client Usage (hc)

```ts
import { rpcClient } from "~/lib/rpc-client";

const health = await rpcClient.rpc.health.$get();

const echo = await rpcClient.rpc.echo.$post({
  json: { message: "hello" },
});

const me = await rpcClient.rpc.me.$get();
```

## Error Handling Template

Use the shared helpers to normalize 400/401 and validation errors.

```ts
import { rpcClient, parseRpcResponse } from "~/lib/rpc-client";

const response = await rpcClient.rpc.echo.$post({
  json: { message: "hello" },
});

const result = await parseRpcResponse<{ message: string }>(response);

if (result.error) {
  if (result.error.status === 401) {
    // handle unauthorized
  }

  if (result.error.status === 400) {
    // handle bad request or validation issues
  }
}
```

## React Example (Client Component)

```tsx
"use client";

import { useState } from "react";
import { rpcClient } from "~/lib/rpc-client";
import { useRpcAction } from "~/hooks/use-rpc-action";

export function RpcEchoExample() {
  const [message, setMessage] = useState("hello");
  const { data, error, loading, run } = useRpcAction<{ message: string }>();

  const onEcho = () => {
    return run(() =>
      rpcClient.rpc.echo.$post({
        json: { message },
      })
    );
  };

  return (
    <div>
      <input
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        placeholder="message"
      />
      <button type="button" onClick={onEcho} disabled={loading}>
        Echo
      </button>
      {error && <p>{error.message}</p>}
      {data && <p>Result: {data.message}</p>}
    </div>
  );
}
```

## Validation

`/api/rpc/echo` validates request payloads with Zod. Invalid input returns a 400 response with validation details.

## Authentication

`/api/rpc/me` requires a valid better-auth session. Requests without a session return 401.

## Migration to `/api/rpc`

The current base path is `/api`. If you decide to move all RPC routes under `/api/rpc`:

1. Update the Hono base path to `/api/rpc`.
2. Update the hc client base URL to `/api/rpc`.
3. Optionally keep a temporary redirect or proxy from `/api/*` to `/api/rpc/*` for backward compatibility.

## Demo Page

You can visit the demo page at `/rpc-demo` to try the echo flow in the browser.
