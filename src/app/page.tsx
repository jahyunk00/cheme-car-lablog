import { HomeOrbit } from "@/components/HomeOrbit";
import { getSession } from "@/lib/session";

export default async function HomePage() {
  const session = await getSession();
  return <HomeOrbit isAuthed={!!session} userName={session?.name ?? null} />;
}
