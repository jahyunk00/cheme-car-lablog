import { redirect } from "next/navigation";

import { AdminUserRolesTable } from "@/components/AdminUserRolesTable";
import { listDirectoryUsers } from "@/lib/db";
import { isAdmin } from "@/lib/roles";
import { getSession } from "@/lib/session";

export default async function AdminRolesPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isAdmin(session.role)) redirect("/dashboard");

  const users = await listDirectoryUsers();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Team roles</h1>
        <p className="mt-1 text-sm text-muted-foreground text-pretty">
          <strong className="text-foreground">Board</strong> sees the same team dashboard and feed as admins, plus
          the weekly summary page. <strong className="text-foreground">Treasurer</strong> gets that team visibility too
          and is the role that marks item requests as ordered (admins can as well).{" "}
          <strong className="text-foreground">Lab member</strong> is the default for everyone else.
        </p>
      </div>
      <AdminUserRolesTable users={users} currentUserId={session.sub} />
    </div>
  );
}
