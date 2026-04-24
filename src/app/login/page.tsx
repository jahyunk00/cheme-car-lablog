import { LoginForm } from "@/components/LoginForm";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export default async function LoginPage() {
  const session = await getSession();
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-lab-bg to-slate-950">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-lab-border bg-lab-surface p-8 shadow-xl">
        <div>
          <h1 className="text-2xl font-semibold text-white">LabLog</h1>
          <p className="mt-2 text-sm text-slate-400">
            Sign in to log activity, view the team calendar, and weekly summaries.
          </p>
        </div>
        <Suspense fallback={<p className="text-sm text-slate-500">Loading…</p>}>
          <LoginForm />
        </Suspense>
        <p className="text-xs text-slate-500 leading-relaxed">
          Demo accounts (after first visit seeds the store):{" "}
          <span className="text-slate-400">admin@lablog.local</span> /{" "}
          <span className="text-slate-400">admin123</span>
          {" · "}
          <span className="text-slate-400">member@lablog.local</span> /{" "}
          <span className="text-slate-400">member123</span>
        </p>
      </div>
    </div>
  );
}
