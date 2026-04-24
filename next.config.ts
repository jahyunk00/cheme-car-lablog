import { loadEnvConfig } from "@next/env";
import type { NextConfig } from "next";

// Ensure `.env.local` is merged into `process.env` for this app root (fixes some setups
// where the dev server was started from an unexpected cwd or env was not picked up).
loadEnvConfig(process.cwd());

const nextConfig: NextConfig = {};

export default nextConfig;
