import { loadEnvConfig } from "@next/env";
import type { NextConfig } from "next";

// Ensure `.env.local` is merged into `process.env` for this app root (fixes some setups
// where the dev server was started from an unexpected cwd or env was not picked up).
loadEnvConfig(process.cwd());

const nextConfig: NextConfig = {
  // Next 15.5+ can throw RSC / "React Client Manifest" errors in dev when this is on
  // (segment-explorer-node). Turn it off for a stable local dev experience.
  experimental: {
    devtoolSegmentExplorer: false,
  },
};

export default nextConfig;
