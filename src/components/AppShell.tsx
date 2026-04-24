import Link from "next/link";
import { AppNav } from "@/components/AppNav";

export function AppShell({
  userName,
  role,
  children,
}: {
  userName: string;
  role: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-lab-border bg-lab-surface/80 backdrop-blur sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-lg font-semibold text-white tracking-tight hover:text-blue-200">
              LabLog
            </Link>
            <AppNav />
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-400">
            <span>
              {userName}
              <span className="text-slate-600"> · </span>
              <span className="capitalize">{role}</span>
            </span>
            <form action="/api/auth/logout" method="post">
              <button type="submit" className="btn-ghost text-sm">
                Log out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
