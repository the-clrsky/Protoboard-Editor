import type { MetadataRoute } from "next";
import { LAST_UPDATE_DATE } from "@/data/agentDocs";
import { SITE_URL } from "@/lib/site";
import { STATIC } from "@/lib/mode";

// Built once (needed by output: "export"); nothing here reads the request.
export const dynamic = "force-static";

// Dates are when the page's content last changed, not when it was last built:
// a build-time date tells crawlers every page changed at once on every deploy,
// which makes the signal worthless. Bump the date when you change the page.
const PAGES: [path: string, lastModified: string, changeFrequency: "monthly" | "weekly" | "yearly", priority: number][] = [
  ["", "2026-09-22", "monthly", 1],
  ["/guide", "2026-09-21", "monthly", 0.8],
  ["/how-auto-layout-works", "2026-09-21", "monthly", 0.7],
  ["/updates", LAST_UPDATE_DATE, "weekly", 0.6],
  ["/privacy", "2026-07-23", "yearly", 0.3],
];

export default function sitemap(): MetadataRoute.Sitemap {
  return PAGES.map(([path, lastModified, changeFrequency, priority]) => ({
    // The static build has trailingSlash, so its canonical URLs end in "/"
    url: `${SITE_URL}${path}${STATIC ? "/" : ""}`,
    lastModified,
    changeFrequency,
    priority,
  }));
}
