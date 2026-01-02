import Link from "next/link";

export default function DemoEntryPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-12">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Demos</h1>
        <p className="text-muted-foreground">Feature demos and internal examples.</p>
      </div>
      <div className="rounded-lg border bg-background p-6 shadow-sm">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">RPC Demo</h2>
          <p className="text-sm text-muted-foreground">
            Typed Hono RPC calls with validation and auth-aware error handling.
          </p>
        </div>
        <Link
          className="mt-4 inline-flex items-center text-sm font-medium text-primary"
          href="/rpc-demo"
        >
          Open RPC Demo →
        </Link>
      </div>
    </div>
  );
}
