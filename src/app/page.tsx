import { ClubIntroHome } from "@/components/ClubIntroHome";
import { getSession } from "@/lib/session";

export default async function HomePage() {
  const session = await getSession();
  return <ClubIntroHome isAuthed={!!session} userName={session?.name ?? null} />;
}
