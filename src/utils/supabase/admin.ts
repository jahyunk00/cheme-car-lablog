import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { describeServiceRoleLineOnDisk, ensureSupabaseEnvFromDisk } from "@/lib/env-local";

/** Server-only client; bypasses RLS. Never import in client components. */
export function createAdminClient(): SupabaseClient {
  ensureSupabaseEnvFromDisk();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL. For local dev: add it to `.env.local`. For Vercel: Project Settings → Environment Variables (all environments), then redeploy."
    );
  }
  if (!serviceKey) {
    const hint = describeServiceRoleLineOnDisk();
    throw new Error(
      hint ??
        "Missing SUPABASE_SERVICE_ROLE_KEY. For local dev: add it to `.env.local`. For Vercel: paste the Supabase service_role key in Environment Variables, then redeploy."
    );
  }

  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
