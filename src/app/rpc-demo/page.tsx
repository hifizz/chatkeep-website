import { RpcEchoExample } from "./_components/rpc-echo-example";

export default function RpcDemoPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-12">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">RPC Demo</h1>
        <p className="text-muted-foreground">
          Example client component calling Hono RPC endpoints with typed responses and standardized
          error handling.
        </p>
      </div>
      <RpcEchoExample />
    </div>
  );
}
