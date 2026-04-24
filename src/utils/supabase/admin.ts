import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { describeServiceRoleLineOnDisk, ensureSupabaseEnvFromDisk } from "@/lib/env-local";

/** Server-only client; bypasses RLS. Never import in client components. */
export function createAdminClient(): SupabaseClient {
  ensureSupabaseEnvFromDisk();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL. Add it to lablog/.env.local (next to package.json), then stop and restart `npm run dev`."
    );
  }
  if (!serviceKey) {
    const hint = describeServiceRoleLineOnDisk();
    throw new Error(
      hint ??
        "Missing SUPABASE_SERVICE_ROLE_KEY. In Supabase: Project Settings → API → copy service_role (secret). Put it in .env.local as one line: SUPABASE_SERVICE_ROLE_KEY=eyJ... Save the file, then restart `npm run dev`."
    );
  }

  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
