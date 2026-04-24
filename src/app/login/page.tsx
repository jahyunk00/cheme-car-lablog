import { AuthCard } from "@/components/AuthCard";
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
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to log activity, view the team calendar, and weekly summaries."
      footer={
        <details className="text-xs text-slate-500">
          <summary className="cursor-pointer text-slate-400 hover:text-slate-300 select-none">
            Demo accounts (local / first-time seed)
          </summary>
          <p className="mt-2 leading-relaxed pl-1 border-l border-lab-border">
            Seeded on first sign-in attempt when the database has no users:{" "}
            <span className="text-slate-400">admin@lablog.local</span> /{" "}
            <span className="text-slate-400">admin123</span>
            {" · "}
            <span className="text-slate-400">member@lablog.local</span> /{" "}
            <span className="text-slate-400">member123</span>
          </p>
        </details>
      }
    >
      <Suspense fallback={<p className="text-sm text-slate-500">Loading…</p>}>
        <LoginForm />
      </Suspense>
    </AuthCard>
  );
}
