import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { ensureSeedUsers } from "@/lib/seed";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await ensureSeedUsers();
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  return (
    <AppShell userName={session.name} role={session.role} avatarId={session.avatarId}>
      {children}
    </AppShell>
  );
}
