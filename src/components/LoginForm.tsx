"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      let res: Response;
      try {
        res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
      } catch (e) {
        const isNetwork =
          e instanceof TypeError ||
          (e instanceof Error &&
            (e.message === "Failed to fetch" || e.message.includes("NetworkError")));
        setError(
          isNetwork
            ? "Could not reach the app (Failed to fetch). Start `npm run dev` in the lablog folder, wait until it says Ready, then open the exact URL it prints (same host and port, e.g. http://localhost:3000). Stop any old dev server or other app using that port."
            : e instanceof Error
              ? e.message
              : "Could not reach the server."
        );
        return;
      }

      const raw = await res.text();
      let data: { error?: string; message?: string } = {};
      try {
        data = raw ? (JSON.parse(raw) as typeof data) : {};
      } catch {
        data = {};
      }

      if (!res.ok) {
        const fromApi =
          typeof data.error === "string"
            ? data.error
            : typeof data.message === "string"
              ? data.message
              : null;

        const portHint =
          typeof window !== "undefined" && res.status === 404
            ? " Wrong URL/port? Use the same port shown in the terminal where you ran `npm run dev` (e.g. if it says 3001, open http://localhost:3001)."
            : "";

        setError(
          fromApi ??
            `Sign-in failed (HTTP ${res.status}).${portHint} Check the terminal running the dev server for errors.`
        );
        return;
      }
      const from = searchParams.get("from");
      router.push(from && from.startsWith("/") && !from.startsWith("//") ? from : "/dashboard");
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
        <label className="field-label" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full"
        />
      </div>
      <div className="space-y-1.5">
        <label className="field-label" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full"
        />
      </div>
      {error ? (
        <p className="text-sm text-red-400 rounded-lg bg-red-950/30 border border-red-900/40 px-3 py-2">{error}</p>
      ) : null}
      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? "Signing in…" : "Sign in"}
      </button>
      <p className="text-center text-sm text-slate-500">
        New to LabLog?{" "}
        <Link href="/register" className="text-blue-400 hover:text-blue-300 font-medium">
          Create an account
        </Link>
      </p>
    </form>
  );
}
