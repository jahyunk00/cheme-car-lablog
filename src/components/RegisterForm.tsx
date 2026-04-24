"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import type { LablogAvatarId } from "@/lib/avatar-ids";
import { DEFAULT_AVATAR_ID } from "@/lib/avatar-ids";
import { AvatarPicker } from "@/components/ui/avatar-picker";

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [avatarId, setAvatarId] = useState<LablogAvatarId>(DEFAULT_AVATAR_ID);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ name, email, password, avatarId }),
      });
      const raw = await res.text();
      let data: { error?: string } = {};
      try {
        data = raw ? (JSON.parse(raw) as typeof data) : {};
      } catch {
        /* ignore */
      }
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : `Could not register (HTTP ${res.status}).`);
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <label className="field-label" htmlFor="reg-name">
          Name
        </label>
        <input
          id="reg-name"
          name="name"
          type="text"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          maxLength={120}
          placeholder="Your name"
          className="w-full"
        />
      </div>
      <div className="space-y-1.5">
        <label className="field-label" htmlFor="reg-email">
          Email
        </label>
        <input
          id="reg-email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="you@example.com"
          className="w-full"
        />
      </div>
      <div className="space-y-1.5">
        <label className="field-label" htmlFor="reg-password">
          Password
        </label>
        <input
          id="reg-password"
          name="password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          placeholder="At least 8 characters"
          className="w-full"
        />
        <p className="text-xs text-slate-500">Minimum 8 characters.</p>
      </div>
      <div className="space-y-2">
        <p className="field-label">Avatar</p>
        <AvatarPicker value={avatarId} onChange={setAvatarId} displayName={name} />
      </div>
      {error ? (
        <p className="text-sm text-red-400 rounded-lg bg-red-950/30 border border-red-900/40 px-3 py-2">{error}</p>
      ) : null}
      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? "Creating account…" : "Create account"}
      </button>
      <p className="text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
