"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Copy, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { rpcClient, parseRpcResponse } from "~/lib/rpc-client";
import type { ShareListItemDTO, ShareListResponseDTO } from "~/types/share";

type Props = {
  isPro: boolean;
};

const buildShareUrl = (shareId: string) => `${window.location.origin}/s/${shareId}`;

const statusLabel: Record<ShareListItemDTO["status"], string> = {
  active: "Active",
  revoked: "Revoked",
  expired: "Expired",
};

export function ShareManagementPanel({ isPro }: Props) {
  const [items, setItems] = useState<ShareListItemDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pendingShareId, setPendingShareId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!isPro) return;
    setLoading(true);
    setError(null);
    try {
      const response = await rpcClient.rpc.share.list.$post({ json: {} });
      const result = await parseRpcResponse<ShareListResponseDTO>(response);
      if (result.error) {
        setError(result.error.message);
        return;
      }
      setItems(result.data?.items ?? []);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load shares";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [isPro]);

  useEffect(() => {
    void load();
  }, [load]);

  const onCopy = async (shareId: string) => {
    try {
      await navigator.clipboard.writeText(buildShareUrl(shareId));
      setNotice("Share link copied.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to copy share link";
      setError(message);
    }
  };

  const onRevoke = async (shareId: string) => {
    setPendingShareId(shareId);
    setError(null);
    setNotice(null);
    try {
      const response = await rpcClient.rpc.share.revoke.$post({ json: { shareId } });
      const result = await parseRpcResponse<{ shareId: string }>(response);
      if (result.error) {
        setError(result.error.message);
        return;
      }
      setNotice("Share revoked. This link is no longer accessible.");
      await load();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to revoke share";
      setError(message);
    } finally {
      setPendingShareId(null);
    }
  };

  const onDelete = async (shareId: string) => {
    setPendingShareId(shareId);
    setError(null);
    setNotice(null);
    try {
      const response = await rpcClient.rpc.share.delete.$post({ json: { shareId } });
      const result = await parseRpcResponse<{ shareId: string }>(response);
      if (result.error) {
        setError(result.error.message);
        return;
      }
      setNotice("Share deleted.");
      await load();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete share";
      setError(message);
    } finally {
      setPendingShareId(null);
    }
  };

  if (!isPro) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-neutral-400">
          Share links are available for Pro plan. Upgrade to manage and distribute chat snapshots.
        </p>
        <Button asChild className="bg-white text-neutral-950 hover:bg-neutral-200">
          <Link href="/pricing">Upgrade to Pro</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-400">
          Shared snapshots are immutable. Revoke and create a new link to update content.
        </p>
        <Button
          type="button"
          variant="outline"
          className="border-neutral-700 text-neutral-200 hover:bg-neutral-800 hover:text-white"
          onClick={() => void load()}
          disabled={loading}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {error ? (
        <p className="rounded-lg border border-red-900/60 bg-red-950/40 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      ) : null}
      {notice ? (
        <p className="rounded-lg border border-emerald-900/60 bg-emerald-950/40 px-3 py-2 text-sm text-emerald-200">
          {notice}
        </p>
      ) : null}

      {items.length === 0 ? (
        <p className="text-sm text-neutral-500">No shares yet.</p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.shareId}
              className="rounded-xl border border-neutral-800 bg-neutral-950/50 p-4 text-sm text-neutral-300"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="font-medium text-white">{item.title}</p>
                  <p className="text-xs text-neutral-500">
                    {item.sourcePlatform} · {item.accessMode} · {statusLabel[item.status]}
                  </p>
                  <p className="text-xs text-neutral-500">
                    Expires: {item.expiresAt ? new Date(item.expiresAt).toLocaleString() : "Never"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="border-neutral-700 text-neutral-200 hover:bg-neutral-800 hover:text-white"
                    onClick={() => void onCopy(item.shareId)}
                  >
                    <Copy className="mr-1 h-4 w-4" />
                    Copy
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="border-neutral-700 text-neutral-200 hover:bg-neutral-800 hover:text-white"
                    onClick={() => void onRevoke(item.shareId)}
                    disabled={item.status !== "active" || pendingShareId === item.shareId}
                  >
                    {pendingShareId === item.shareId ? "Revoking..." : "Revoke"}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="border-red-900/60 text-red-200 hover:bg-red-950/40 hover:text-red-100"
                    onClick={() => void onDelete(item.shareId)}
                    disabled={pendingShareId === item.shareId}
                  >
                    <Trash2 className="mr-1 h-4 w-4" />
                    {pendingShareId === item.shareId ? "Deleting..." : "Delete"}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
