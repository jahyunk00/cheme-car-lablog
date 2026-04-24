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
          Promote trusted teammates to <strong className="text-foreground">Board member</strong> so they can see
          weekly summaries, team attendance, activity feed, and the user directory API. Everyone else stays a{" "}
          <strong className="text-foreground">Lab member</strong> with normal lab access.
        </p>
      </div>
      <AdminUserRolesTable users={users} currentUserId={session.sub} />
    </div>
  );
}
