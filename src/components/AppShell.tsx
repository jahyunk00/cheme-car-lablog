import Link from "next/link";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/calendar", label: "Calendar" },
  { href: "/logs", label: "Logs" },
  { href: "/weekly-summary", label: "Weekly summary" },
];

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
            <Link href="/dashboard" className="text-lg font-semibold text-white tracking-tight">
              LabLog
            </Link>
            <nav className="flex flex-wrap gap-1 text-sm">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="px-3 py-1.5 rounded-md text-slate-300 hover:bg-lab-border/60 hover:text-white"
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-400">
            <span>
              {userName}
              <span className="text-slate-600"> · </span>
              <span className="capitalize">{role}</span>
            </span>
            <form action="/api/auth/logout" method="post">
              <button
                type="submit"
                className="px-3 py-1.5 text-slate-300 border border-lab-border hover:bg-lab-border/50"
              >
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
