import { format } from "date-fns";
import { redirect } from "next/navigation";
import { LogForm, type LogPayload } from "@/components/LogForm";
import { getLog, listDirectoryUsers } from "@/lib/db";
import { getSession } from "@/lib/session";

type Props = { searchParams: Promise<{ date?: string; edit?: string }> };

export default async function LogUploadPage({ searchParams }: Props) {
  const session = await getSession();
  if (!session) return null;

  const sp = await searchParams;
  const today = format(new Date(), "yyyy-MM-dd");
  const dateParam =
    sp?.date && /^\d{4}-\d{2}-\d{2}$/.test(sp.date) ? sp.date : today;

  const directory = await listDirectoryUsers();
  const teammates = directory.map((u) => ({ id: u.id, name: u.name }));

  let initial: LogPayload;
  let formKey: string;

  if (sp?.edit) {
    const log = await getLog(sp.edit);
    if (!log) {
      redirect("/logs/upload");
    }
    const canEdit = log.userId === session.sub || session.role === "admin";
    if (!canEdit) {
      redirect("/logs");
    }
    initial = {
      id: log.id,
      authorId: log.userId,
      date: log.date,
      category: log.category,
      title: log.title,
      description: log.description,
      hours: log.hours != null ? String(log.hours) : "",
      participantUserIds: log.participantUserIds,
    };
    formKey = `edit-${log.id}`;
  } else {
    initial = {
      authorId: session.sub,
      date: dateParam,
      category: "Other",
      title: "",
      description: "",
      hours: "",
      participantUserIds: [],
    };
    formKey = `new-${dateParam}`;
  }

  return (
    <div className="mx-auto min-w-0 max-w-2xl space-y-6">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold text-foreground">
          {initial.id ? "Edit log" : "Upload log"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {initial.id ? "Update this entry, then save." : "Add a dated lab entry for your team."}
        </p>
      </div>
      <LogForm key={formKey} initial={initial} isAdmin={session.role === "admin"} teammates={teammates} />
    </div>
  );
}
