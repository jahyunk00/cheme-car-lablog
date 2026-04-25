"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { ITEM_REQUEST_PURPOSE_LABEL, ITEM_REQUEST_PURPOSES, type ItemRequestPurpose } from "@/lib/item-request-purpose";

export function ItemRequestForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [price, setPrice] = useState("");
  const [link, setLink] = useState("");
  const [purpose, setPurpose] = useState<ItemRequestPurpose>("other");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const q = Number(quantity);
    if (!Number.isFinite(q) || q < 1 || !Number.isInteger(q)) {
      setError("Quantity must be a whole number of at least 1.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/item-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ name: name.trim(), quantity: q, price, link, purpose }),
      });
      const raw = await res.text();
      let data: { error?: string } = {};
      try {
        data = raw ? (JSON.parse(raw) as typeof data) : {};
      } catch {
        /* ignore */
      }
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : `Request failed (${res.status}).`);
        return;
      }
      setName("");
      setQuantity("1");
      setPrice("");
      setLink("");
      setPurpose("other");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-xl border border-border bg-card/60 p-4 sm:p-5">
      <h2 className="text-lg font-medium text-foreground">New request</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1 sm:col-span-2">
          <label className="field-label" htmlFor="ir-name">
            Item name
          </label>
          <input
            id="ir-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full"
            placeholder="e.g. Motor bracket"
          />
        </div>
        <div className="space-y-1">
          <label className="field-label" htmlFor="ir-qty">
            How many
          </label>
          <input
            id="ir-qty"
            type="number"
            min={1}
            step={1}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
            className="w-full"
          />
        </div>
        <div className="space-y-1">
          <label className="field-label" htmlFor="ir-price">
            Price (estimate)
          </label>
          <input
            id="ir-price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full"
            placeholder="e.g. $24.99 or TBD"
          />
        </div>
        <div className="space-y-1 sm:col-span-2">
          <label className="field-label" htmlFor="ir-link">
            Link to buy
          </label>
          <input
            id="ir-link"
            type="url"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            className="w-full"
            placeholder="https://…"
          />
        </div>
        <div className="space-y-1 sm:col-span-2">
          <label className="field-label" htmlFor="ir-purpose">
            Used for
          </label>
          <select
            id="ir-purpose"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value as ItemRequestPurpose)}
            className="w-full max-w-md rounded-lg border border-input bg-background px-3 py-2.5 text-sm"
          >
            {ITEM_REQUEST_PURPOSES.map((p) => (
              <option key={p} value={p}>
                {ITEM_REQUEST_PURPOSE_LABEL[p]}
              </option>
            ))}
          </select>
        </div>
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" disabled={loading}>
        {loading ? "Submitting…" : "Submit request"}
      </Button>
    </form>
  );
}
