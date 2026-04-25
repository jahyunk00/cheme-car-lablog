import { format } from "date-fns";
import { redirect } from "next/navigation";

import { ItemRequestForm } from "@/components/ItemRequestForm";
import { ITEM_REQUEST_PURPOSE_LABEL } from "@/lib/item-request-purpose";
import { listDirectoryUsers, listRecentItemRequests } from "@/lib/db";
import { getSession } from "@/lib/session";

export default async function ItemRequestsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [requests, directory] = await Promise.all([listRecentItemRequests(100), listDirectoryUsers()]);
  const nameById = Object.fromEntries(directory.map((u) => [u.id, u.name]));

  return (
    <div className="mx-auto min-w-0 max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Item requests</h1>
        <p className="mt-1 text-sm text-muted-foreground text-pretty max-w-prose">
          Request parts or supplies: name, quantity, price, where to buy, and what it is for. Recent requests appear
          here; admins see the same window in the weekly narrative report.
        </p>
      </div>

      <ItemRequestForm />

      <section className="space-y-3">
        <h2 className="text-lg font-medium text-foreground">Recent requests</h2>
        {requests.length === 0 ? (
          <p className="text-sm text-muted-foreground">No requests yet.</p>
        ) : (
          <ul className="space-y-3">
            {requests.map((r) => (
              <li key={r.id} className="rounded-lg border border-border bg-card/50 px-4 py-3 text-sm">
                <p className="font-medium text-foreground">
                  {r.name}{" "}
                  <span className="font-normal text-muted-foreground">
                    × {r.quantity} · {ITEM_REQUEST_PURPOSE_LABEL[r.purpose]}
                  </span>
                </p>
                <p className="mt-1 text-muted-foreground">
                  {r.price ? r.price : "—"} ·{" "}
                  {r.link ? (
                    <a
                      href={r.link}
                      className="text-primary underline break-all"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {r.link}
                    </a>
                  ) : (
                    "—"
                  )}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {format(new Date(r.createdAt), "yyyy-MM-dd HH:mm")} · {nameById[r.userId] ?? "Member"}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
