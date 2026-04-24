import { existsSync, readFileSync } from "fs";
import { dirname, join } from "path";

/** Walk up until we find `package.json` + `.env.local` (handles odd `process.cwd()`). */
function resolveEnvLocalPath(): string | null {
  let dir = process.cwd();
  for (let i = 0; i < 12; i++) {
    const envPath = join(dir, ".env.local");
    const pkgPath = join(dir, "package.json");
    if (existsSync(envPath) && existsSync(pkgPath)) {
      return envPath;
    }
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  const fallback = join(process.cwd(), ".env.local");
  return existsSync(fallback) ? fallback : null;
}

/** Parse KEY=VALUE lines (no multiline values). */
function parseDotEnv(contents: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line of contents.split(/\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (!key) continue;
    if (!value.startsWith('"') && !value.startsWith("'")) {
      const ci = value.search(/\s+#/);
      if (ci !== -1) value = value.slice(0, ci).trim();
    }
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1).replace(/\\"/g, '"');
    } else if (value.startsWith("'") && value.endsWith("'")) {
      value = value.slice(1, -1).replace(/\\'/g, "'");
    }
    out[key] = value;
  }
  return out;
}

const CRITICAL_KEYS = [
  "SUPABASE_SERVICE_ROLE_KEY",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "LABLOG_SECRET",
] as const;

/**
 * Next.js will not override `process.env` keys that are already set (even to "").
 * This reads `.env.local` next to `package.json` and applies values from disk.
 * For critical keys, values in the file always win when non-empty (fixes shell `export KEY=`).
 */
export function ensureSupabaseEnvFromDisk(): void {
  const path = resolveEnvLocalPath();
  if (!path) return;

  let parsed: Record<string, string>;
  try {
    parsed = parseDotEnv(readFileSync(path, "utf8"));
  } catch {
    return;
  }

  for (const key of CRITICAL_KEYS) {
    const v = parsed[key]?.trim();
    if (v) {
      process.env[key] = v;
    }
  }

  for (const [key, value] of Object.entries(parsed)) {
    if (CRITICAL_KEYS.includes(key as (typeof CRITICAL_KEYS)[number])) continue;
    if (!(process.env[key] ?? "").trim() && value) {
      process.env[key] = value;
    }
  }
}

/** For error messages only (no secrets returned). */
export function describeServiceRoleLineOnDisk(): string | null {
  const path = resolveEnvLocalPath();
  if (!path) return "No .env.local found next to package.json.";
  try {
    const raw = readFileSync(path, "utf8");
    const line = raw.split(/\n/).find((l) => /^\s*SUPABASE_SERVICE_ROLE_KEY\s*=/.test(l));
    if (!line) return "No SUPABASE_SERVICE_ROLE_KEY line in .env.local.";
    const after = line.replace(/^\s*SUPABASE_SERVICE_ROLE_KEY\s*=\s*/, "").trim();
    if (!after) {
      return "SUPABASE_SERVICE_ROLE_KEY is empty on disk after the '='. If you see the key in the editor, press Cmd+S (Save), then restart `npm run dev`.";
    }
    return null;
  } catch {
    return "Could not read .env.local.";
  }
}
