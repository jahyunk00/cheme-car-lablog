import type { ReactNode } from "react";
import Image from "next/image";

import { clubBrandLogo } from "@/lib/club-intro";
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
    <div className="relative flex min-h-dvh min-h-screen flex-col items-center justify-center overflow-hidden bg-lab-bg px-3 py-10 pb-[max(2.5rem,env(safe-area-inset-bottom,0px))] pt-[max(2.5rem,env(safe-area-inset-top,0px))] sm:px-4 sm:py-12">
      <DottedSurface />
      <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-lab-bg/85 via-[#0c1016]/75 to-slate-950/90" />
      <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(59,130,246,0.14),transparent)]" />
      <div className="relative z-10 w-full max-w-md space-y-6 rounded-2xl border border-lab-border/80 bg-lab-surface/95 p-5 shadow-2xl shadow-black/40 backdrop-blur-sm sm:space-y-8 sm:p-8">
        <div className="space-y-3 text-center sm:text-left">
          <div className="flex justify-center sm:justify-start">
            <Image
              src={clubBrandLogo.src}
              alt={clubBrandLogo.alt}
              width={72}
              height={72}
              className="h-16 w-16 rounded-lg border border-lab-border/80 bg-lab-bg object-contain"
            />
          </div>
          <p className="text-xs font-medium uppercase tracking-widest text-primary">LabLog</p>
          <h1 className="text-2xl font-semibold tracking-tight text-white">{title}</h1>
          <p className="text-sm text-slate-400 leading-relaxed">{subtitle}</p>
        </div>
        {children}
        {footer ? <div className="pt-2 border-t border-lab-border/60">{footer}</div> : null}
      </div>
    </div>
  );
}
