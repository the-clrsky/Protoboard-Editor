import type { NextConfig } from "next";

// Static build when NEXT_PUBLIC_API_URL is not set (see lib/mode.ts).
const STATIC = !process.env.NEXT_PUBLIC_API_URL;

const shared: NextConfig = {
  reactCompiler: true,
  reactStrictMode: false,
};

// Server-only pages (project edit/view, inbox, reset-password, feedback) are named
// page.hosted.tsx. Only the full build lists "hosted.tsx", so the static build skips them.
// Browser-only pages (project/open) are page.static.tsx, the other way round.
const PAGE_EXTENSIONS = ["tsx", "ts", "jsx", "js"];

// basePath also prefixes /_next/static, so assetPrefix is not needed.
// Leave NEXT_PUBLIC_BASE_PATH unset when the site is served at a domain root.
const staticConfig: NextConfig = {
  ...shared,
  pageExtensions: ["static.tsx", ...PAGE_EXTENSIONS],
  output: "export",
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || undefined,
  trailingSlash: true,
  images: { unoptimized: true },
};

const fullConfig: NextConfig = {
  ...shared,
  pageExtensions: ["hosted.tsx", ...PAGE_EXTENSIONS],
  output: "standalone",
  async redirects() {
    return [
      { source: "/guide/auto-layout", destination: "/how-auto-layout-works", permanent: true },
    ];
  },
};

export default STATIC ? staticConfig : fullConfig;
