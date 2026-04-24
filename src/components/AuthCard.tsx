import type { ReactNode } from "react";
import { DottedSurface } from "@/components/ui/dotted-surface";

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
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-4 py-12 bg-lab-bg">
      <DottedSurface />
      <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-lab-bg/85 via-[#0c1016]/75 to-slate-950/90" />
      <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(59,130,246,0.14),transparent)]" />
      <div className="relative z-10 w-full max-w-md space-y-8 rounded-2xl border border-lab-border/80 bg-lab-surface/95 p-8 shadow-2xl shadow-black/40 backdrop-blur-sm">
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
