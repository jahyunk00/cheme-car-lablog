"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { UserAvatar } from "@/components/UserAvatar";
import type { UserRole } from "@/lib/types";

export type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarId: number;
};

export function AdminUserRolesTable({
  users,
  currentUserId,
}: {
  users: AdminUserRow[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function setRole(userId: string, role: "member" | "board" | "treasurer") {
    setError(null);
    setPendingId(userId);
    try {
      const res = await fetch(`/api/users/${encodeURIComponent(userId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ role }),
      });
      const raw = await res.text();
      let data: { error?: string } = {};
      try {
        data = raw ? (JSON.parse(raw) as typeof data) : {};
      } catch {
        /* ignore */
      }
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : `Request failed (${res.status}).`);
        return;
      }
      router.refresh();
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="space-y-4">
      {error ? (
        <p className="text-sm text-red-400 rounded-lg border border-red-900/40 bg-red-950/30 px-3 py-2 whitespace-pre-wrap break-words">
          {error}
        </p>
      ) : null}
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead className="border-b border-border bg-muted/40">
            <tr>
              <th className="px-3 py-2 font-medium text-muted-foreground sm:px-4">User</th>
              <th className="px-3 py-2 font-medium text-muted-foreground sm:px-4">Email</th>
              <th className="px-3 py-2 font-medium text-muted-foreground sm:px-4">Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const isAdmin = u.role === "admin";
              const isSelf = u.id === currentUserId;
              return (
                <tr key={u.id} className="border-b border-border/60 last:border-0">
                  <td className="px-3 py-3 sm:px-4">
                    <span className="inline-flex items-center gap-2">
                      <UserAvatar avatarId={u.avatarId} size={28} title={u.name} />
                      <span className="font-medium text-foreground">
                        {u.name}
                        {isSelf ? (
                          <span className="ml-1 text-xs font-normal text-muted-foreground">(you)</span>
                        ) : null}
                      </span>
                    </span>
                  </td>
                  <td className="px-3 py-3 text-muted-foreground sm:px-4">{u.email}</td>
                  <td className="px-3 py-3 sm:px-4">
                    {isAdmin ? (
                      <span className="rounded-md border border-border bg-muted/60 px-2 py-1 text-xs text-foreground">
                        Admin
                      </span>
                    ) : (
                      <select
                        className="w-full max-w-[11rem] rounded-md border border-border bg-background px-2 py-1.5 text-foreground"
                        value={u.role}
                        disabled={pendingId === u.id}
                        aria-label={`Role for ${u.name}`}
                        onChange={(e) => {
                          const v = e.target.value;
                          if (v !== "member" && v !== "board" && v !== "treasurer") return;
                          if (v === u.role) return;
                          void setRole(u.id, v);
                        }}
                      >
                        <option value="member">Lab member</option>
                        <option value="board">Board member</option>
                        <option value="treasurer">Treasurer</option>
                      </select>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">
        New accounts start as lab members. After you change someone’s role, they should log out and back in to pick
        up permissions (board and treasurer see team metrics; only treasurer and admin can mark item requests ordered).
        Admin accounts cannot be edited here.
      </p>
    </div>
  );
}
