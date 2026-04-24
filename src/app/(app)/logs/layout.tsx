import { LogsSectionTabs } from "@/components/LogsSectionTabs";

export default function LogsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-w-0 space-y-6">
      <LogsSectionTabs />
      {children}
    </div>
  );
}
