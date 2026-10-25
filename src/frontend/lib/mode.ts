// Build mode, fixed at build time (see "Tech stack" in README.md).
// NEXT_PUBLIC_API_URL set: full build with the Django backend.
// Not set: static, browser-only build (GitHub Pages).
export const STATIC = !process.env.NEXT_PUBLIC_API_URL;

// Sub-path the static build is served under, e.g. "/Protoboard-Editor". Empty for the full build.
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

// A root path ("/demo.png", "/") with the base path in front. Next adds it to
// <Link>, router and metadata itself; plain <img src> and <a href> need this.
export function withBase(path: string): string {
  return `${BASE_PATH}${path}`;
}

// The author's personal site (Astro, separate repo). The editor header and footer link back to it.
export const SITE_URL = "https://sadmanbishal.com";

const REPO_URL ="https://github.com/the-clrsky/Protoboard-Editor";

// The feedback page needs the backend; the static build sends people to GitHub Issues.
export const FEEDBACK_HREF = STATIC ? `${REPO_URL}/issues` : "/feedback";

// README section on running the full version (accounts, share links, parts library).
export const SELF_HOST_URL = `${REPO_URL}#self-hosting`;
