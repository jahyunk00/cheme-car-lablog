import type { ReactNode } from "react";

export function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-gradient-to-b from-lab-bg via-[#0c1016] to-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(59,130,246,0.12),transparent)] pointer-events-none" />
      <div className="relative w-full max-w-md space-y-8 rounded-2xl border border-lab-border/80 bg-lab-surface/95 p-8 shadow-2xl shadow-black/40 backdrop-blur-sm">
        <div className="space-y-1 text-center sm:text-left">
          <p className="text-xs font-medium uppercase tracking-widest text-blue-400/90">LabLog</p>
          <h1 className="text-2xl font-semibold tracking-tight text-white">{title}</h1>
          <p className="text-sm text-slate-400 leading-relaxed">{subtitle}</p>
        </div>
        {children}
        {footer ? <div className="pt-2 border-t border-lab-border/60">{footer}</div> : null}
      </div>
    </div>
  );
}
