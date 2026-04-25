"use client";

import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";

type Props = {
  id: string;
  orderedAt: string | null;
  /** When false, status is read-only (treasurer/admin only may change). */
  canManageOrders: boolean;
};

export function ItemRequestOrderedControl({ id, orderedAt, canManageOrders }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function setOrdered(ordered: boolean) {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/item-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ ordered }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? "Could not update.");
        return;
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-2 flex flex-wrap items-center gap-2">
      {orderedAt ? (
        <span className="inline-flex items-center rounded-md border border-border bg-muted/50 px-2 py-0.5 text-xs font-medium text-foreground">
          Ordered
          <span className="ml-1 font-normal text-muted-foreground">({format(new Date(orderedAt), "yyyy-MM-dd")})</span>
        </span>
      ) : (
        <span className="text-xs text-muted-foreground">Not ordered yet</span>
      )}
      {canManageOrders ? (
        <div className="flex items-center gap-1">
          {orderedAt ? (
            <Button type="button" variant="outline" size="sm" className="h-7 text-xs" disabled={loading} onClick={() => setOrdered(false)}>
              Clear ordered
            </Button>
          ) : (
            <Button type="button" size="sm" className="h-7 text-xs" disabled={loading} onClick={() => setOrdered(true)}>
              Mark as ordered
            </Button>
          )}
        </div>
      ) : (
        <p className="w-full text-xs text-muted-foreground">Order status is updated by treasurer or admin.</p>
      )}
      {error && <p className="w-full text-xs text-destructive">{error}</p>}
    </div>
  );
}
